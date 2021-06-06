/**
 *
 *
 *
 *
 */
import { AssetSymbol } from '/@common/models'
import { sleep } from '/@common/utils'
import * as dayjs from 'dayjs'

import * as weekOfYear from 'dayjs/plugin/weekOfYear'
import { EOD } from './EOD'
import { FMP } from './FMP'
import * as Types from './types'


dayjs.extend(weekOfYear)


export interface ProviderConfigInterface {
  name : string,
  apiKey : string | null
}


const providers : Array<Types.DataProviderInterface> = []

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
for (const provider : ProviderConfigInterface of global.weHateGlobals_dataProviders) {

  if (provider.name.toLowerCase() === 'fmp') {
    providers.push(new FMP(provider.apiKey))
  }
  if (provider.name.toLowerCase() === 'eod') {
    providers.push(
      new EOD(provider.apiKey))
  }
}


export type ProviderSymbols = { [key : string] : Types.AssetSymbol[] }
export type ProviderExchanges = { [key : string] : Types.Exchange[] }


class GlobalProvider {

  static retryTimeoutMs = 2000
  name : 'GlobalProvider'

  // constructor () {
  //
  // }

  static async handleThrottle<T> (provider : Types.DataProviderInterface, fn : () => Promise<T>) : Promise<T> {
    const THROTTLE_COOLDOWN = 30 * 1000

    if ((THROTTLE_COOLDOWN + provider.throttleRequestQuotaMs) > dayjs().valueOf()) {
      console.debug('THROTTLING : ON')
      return await provider.mutex.runExclusive<T>(async () => {
        return GlobalProvider.handleRetries<T>(provider, fn)
      })
    }

    return GlobalProvider.handleRetries<T>(provider, fn)
  }

  static async handleRetries<T> (provider : Types.DataProviderInterface, fn : () => Promise<T>) : Promise<T> {
    const timeoutMs = dayjs().valueOf() + GlobalProvider.retryTimeoutMs

    while (provider.throttleRequestQuotaMs < timeoutMs) {
      try {

        const throttleMs = Math.max(0, provider.throttleRequestQuotaMs - dayjs().valueOf())
        if (throttleMs > 0) {
          console.warn(`Quota exceeded, retrying in ${throttleMs} ms`)

          await sleep(throttleMs)
        }

        return await fn()

      } catch (error) {
        if (!(error instanceof Types.APIError) || error.type !== Types.APIErrorType.QUOTA_ERROR) {
          throw error
        }

        provider.throttleRequestQuotaMs = Math.max(
          provider.throttleRequestQuotaMs,
          dayjs().valueOf() + (error.retryAfterSeconds * 1000),
        )
      }
    }

    throw new Types.APIError(Types.APIErrorType.TIMEOUT_ERROR)
  }

  private static getProviderFor (assetSymbol : AssetSymbol) : Types.DataProviderInterface {

    return providers.find(provider => provider.name() === assetSymbol.get('dataProviderName'))
  }

  private static getProvider (providerName : string) : Types.DataProviderInterface {

    return providers.find(provider => provider.name() === providerName)
  }


  private static async callOne (method : string, ...args : any[]) {

    for (const provider of providers) {

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (provider[method] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await provider[method](...args)
      }

    }

    throw `DataProvider method "${method as string} is not supported by any providers ...`
  }

  private static async callAll (method : string, ...args : any[]) {

    const data = {}
    for (const provider of providers) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (provider[method] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore @todo figure out the proper way
        data[provider.name()] = await provider[method](...args)
      }
    }

    return data
  }

  private static adjustResolution (
    desiredResolution : Types.SymbolDataResolution,
    currentResolution : Types.SymbolDataResolution,
    data : Types.EndOfDayData[],
  ) : Types.EndOfDayData[] {

    if (desiredResolution === currentResolution) {
      return data
    }
    const getDateId = (resolution : Types.SymbolDataResolution, date : dayjs.Dayjs) : string => {
      switch (resolution) {
        case '1minute':
        case '5minutes':
        case '15minutes':
        case '30minutes':
          return date.format('YYYY-MM-DD HH:mm')
        case 'hour':
        case '4hours':
          return date.format('YYYY-MM-DD HH')
        case 'day':
          return date.format('YYYY-MM-DD')
        case 'week':
          return `${date.year()}-WK${date.week()}`
        case 'month':
          return date.format('YYYY-MM')
      }

      throw `Invalid resolution ${resolution}`
    }

    const merge = (a : Types.EndOfDayData | null, e : Types.EndOfDayData) : Types.EndOfDayData => {
      if (!a) {
        return e
      }
      const isOlder = dayjs(a.date).diff(dayjs(e.date)) > 0

      const data : Types.EndOfDayData = {
        date   : isOlder ? e.date : a.date,
        close  : isOlder ? e.close : a.close,
        open   : isOlder ? a.open : e.open,
        high   : Math.max(a.high, e.high),
        low    : Math.min(a.low, e.low),
        volume : a.volume + e.volume,
      }

      return data
    }

    const output : { [key : string] : Types.EndOfDayData } = {}
    for (const elem of data) {
      const k = getDateId(desiredResolution, dayjs(elem.date))

      output[k] = merge(output[k] || null, elem)
    }

    return Object.values(output)
  }


  async searchSymbols (query : string) : Promise<ProviderSymbols> {
    return await GlobalProvider.callAll('searchSymbols', query)
  }


  async fetchSupportedSymbols () : Promise<ProviderSymbols> {

    return await GlobalProvider.callAll('fetchSupportedSymbols')
  }

  async fetchSupportedExchanges () : Promise<ProviderExchanges> {

    return await GlobalProvider.callAll('fetchSupportedExchanges')
  }

  async getSymbolTimeSeriesData (
    assetSymbol : AssetSymbol,
    from : dayjs.Dayjs,
    to : dayjs.Dayjs,
    resolution : Types.SymbolDataResolution,
  ) : Promise<Types.EndOfDayData[]> {

    const result = await GlobalProvider
      .getProviderFor(assetSymbol)
      .fetchSymbolTimeSeriesData(
        assetSymbol.get('symbol'),
        from,
        to,
        resolution,
      )

    // Filter the extra data we received
    result.data = result.data.filter(elem => {
      const dt = dayjs(elem.date)
      // noinspection RedundantIfStatementJS
      if (dt.isBefore(from) || dt.isAfter(to)) {
        return false
      }
      return true
    })

    return GlobalProvider.adjustResolution(
      resolution,
      result.resolution,
      result.data,
    )
  }

  async getCompanyProfile (
    assetSymbol : AssetSymbol,
  ) : Promise<Types.CompanyProfile> {

    const provider = GlobalProvider.getProviderFor(assetSymbol)
    return GlobalProvider.handleThrottle(provider, async () => {
      return await provider.getCompanyProfile(
        assetSymbol.tickerName,
      )

    })

  }

  async getCompanyQuote (
    assetSymbol : AssetSymbol,
  ) : Promise<Types.CompanyQuote> {

    const result = await GlobalProvider
      .getProviderFor(assetSymbol)
      .getCompanyQuote(
        assetSymbol.get('symbol'),
      )

    return result
  }

  async getCompanyQuotes (
    providerName : string,
    assetSymbols : AssetSymbol[],
  ) : Promise<Types.CompanyQuote[]> {

    const tickers = assetSymbols.map(assetSymbol => assetSymbol.symbol)

    const result = await GlobalProvider
      .getProvider(providerName)
      .getCompanyQuotes(
        tickers,
      )

    return result
  }


}


export const DataProvider = new GlobalProvider()


/**
 *
 *
 *
 */
import { StringKeys } from '/@common/utils'
import { Mutex } from 'async-mutex'
import { AxiosError } from 'axios'

import * as dayjs from 'dayjs'

import * as FMPApi from 'financialmodelingprep-openapi'
import * as Types from '../types'


// // Simple Examples
//
// // API route: /quote/AAPL
// fmp.stock('aapl').quote().then(response => console.log(response));
// //API route: /quote/AAPL,MSFT
// fmp.stock(['AAPL', 'MSFT']).quote().then(response => console.log(response));
//
// // API route: /stock/sectors-performance
// fmp.market.sector_performance().then(response => console.log(response));
//
// // API route: /quote/USDEUR
// fmp.forex('USD', 'EUR').rate().then(response => console.log(response));


export class FMP implements Types.DataProviderInterface {

  private readonly config : FMPApi.Configuration

  constructor (apiKey : string) {
    this.config = new FMPApi.Configuration({
      apiKey,
    })
  }

  searchSymbols (query: string): Promise<Types.AssetSymbol[]> {
    throw new Error('Method not implemented.')
  }

  fetchSupportedExchanges () : Promise<Types.Exchange[]> {
    throw new Error('Method not implemented.')
  }

  private static handleError (error : AxiosError) : void {
    const response = error.response

    if (response.status === 429) {
      const s  = response.data['X-Rate-Limit-Retry-After-Seconds'] || 0
      const ms = response.data['X-Rate-Limit-Retry-After-Milliseconds'] || 0

      const err             = new Types.APIError(Types.APIErrorType.QUOTA_ERROR)
      err.retryAfterSeconds = s + (ms / 1000.0)
      throw err
    }

    throw new Types.APIError(Types.APIErrorType.UNKNOWN_ERROR, response)
  }

  async fetchSupportedSymbols () : Promise<Array<Types.AssetSymbol>> {

    const listApi = new FMPApi.ListApi(this.config)

    const response = await listApi.listSymbols('available-traded')
    return response.data
  }

  async fetchSymbolTimeSeriesData (
    symbol : string,
    from : dayjs.Dayjs,
    to : dayjs.Dayjs,
    resolution : Types.SymbolDataResolution,
  ) : Promise<Types.TimeSeriesData> {


    const historyApi = new FMPApi.HistoryApi(this.config)

    const query = async (
      out : Types.SymbolDataResolution,
      res : '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour',
    ) : Promise<Types.TimeSeriesData> => {
      const response = await historyApi.intraDayPrices(symbol, res)
      return {resolution: out, data: response.data.reverse()}
    }

    // The day values here are purely from observation of what the API returns. For long term historical data,
    // we will probably need to fetch from a different source, or cache data.

    switch (resolution) {
      case '1minute':
        if (dayjs().diff(from, 'days') < 2) {
          return await query('1minute', '1min')
        }
      // eslint-disable-next-line no-fallthrough
      case '5minutes':
        if (dayjs().diff(from, 'days') < 11) {
          return await query('5minutes', '5min')
        }
      // eslint-disable-next-line no-fallthrough
      case '15minutes':
        if (dayjs().diff(from, 'days') < 18) {
          return await query('15minutes', '15min')
        }
      // eslint-disable-next-line no-fallthrough
      case '30minutes':
        if (dayjs().isAfter(from.subtract(42, 'days'))) {
          return await query('30minutes', '30min')
        }
      // eslint-disable-next-line no-fallthrough
      case 'hour':
        if (dayjs().diff(from, 'days') < 48) {
          return await query('hour', '1hour')
        }
      // eslint-disable-next-line no-fallthrough
      case            '4hours'            :
        if (dayjs().diff(from, 'days') < 85) {
          return await query('4hours', '4hour')
        }
      // eslint-disable-next-line no-fallthrough
      case            'day'   :
      case            'month' :
      case            'week'  : {
        const eod = await historyApi.dailyPrices(symbol, from.toISOString(), to.toISOString())
        return {resolution: 'day', data: eod.data.historical.reverse()}
      }
      default:
        throw `Resolution ${resolution} not implemented`
    }
  }

  async getCompanyProfile (symbol : string) : Promise<Types.CompanyProfile> {

    try {
      const data = await this.getCompanyProfiles([
        symbol,
      ])

      return data.pop()

    } catch (error) {
      FMP.handleError(error)
    }

  }

  async getCompanyQuote (symbol : string) : Promise<Types.CompanyQuote> {

    const data = await this.getCompanyQuotes([
      symbol,
    ])

    return data.pop()
  }

  mutex = new Mutex()

  public name () : string {
    return 'FMP'
  }

  throttleRequestQuotaMs = 0

  async getCompanyProfiles (symbol : string[]) : Promise<Types.CompanyProfile[]> {

    throw 'to be updated'
    const api = new FMPApi.CompanyValuationApi(this.config)

    const response = await api.profile(symbol.join(','))

    // return response.data.map(profile => {
    //
    //   profile.fullTimeEmployees = typeof profile.fullTimeEmployees === 'string' ? Number.parseInt(profile.fullTimeEmployees) : null
    //
    //   const maybeNull = (value : StringKeys<Types.CompanyProfile>) => {
    //     const val = profile[value] && String(profile[value]).length ? profile[value] as string : null
    //
    //     eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     @ts-ignore
    // profile[value] = val
    // }
    //
    // maybeNull('companyName')
    // maybeNull('ceo')
    // maybeNull('currency')
    // maybeNull('description')
    // maybeNull('website')
    // maybeNull('ipoDate')
    // maybeNull('image')
    // maybeNull('zip')
    // maybeNull('industry')
    // maybeNull('sector')
    // maybeNull('phone')
    // maybeNull('address')
    // maybeNull('country')
    // maybeNull('state')
    // maybeNull('city')
    //
    //
    // return profile
    // })
  }

  async getCompanyQuotes (symbol : string[]) : Promise<Types.CompanyQuote[]> {

    const api = new FMPApi.CompanyValuationApi(this.config)

    const response = await api.quote(symbol.join(','))

    return response.data
  }

}


/**
 *
 *
 *
 */
import { processBatch } from '/@common/utils'
import { Mutex } from 'async-mutex'
import { AxiosError } from 'axios'

import * as dayjs from 'dayjs'
import * as EODApi from 'eodhistoricaldata-openapi'
import * as Types from '../types'


export class EOD implements Types.DataProviderInterface {

  private readonly config : EODApi.Configuration
  mutex                  = new Mutex()
  throttleRequestQuotaMs = 0

  constructor (apiKey : string) {
    this.config = new EODApi.Configuration({
      apiKey,
    })
  }

  private static handleError (error : AxiosError) : void {
    const response = error.response

    if (response.status === 429) {
      // X-RateLimit-Limit: 2000
      // X-RateLimit-Remaining: 1994

      // const s  = response.data['X-Rate-Limit-Retry-After-Seconds'] || 0
      // const ms = response.data['X-Rate-Limit-Retry-After-Milliseconds'] || 0
      // const err             = new Types.APIError(Types.APIErrorType.QUOTA_ERROR)
      // err.retryAfterSeconds = s + (ms / 1000.0)
      // throw err
    }

    throw new Types.APIError(Types.APIErrorType.UNKNOWN_ERROR, response)
  }


  async fetchSupportedExchanges () : Promise<Array<Types.Exchange>> {

    const listApi = new EODApi.ExchangesApi(this.config)

    const response = await listApi.listExchanges()

    const assets : Types.Exchange[] = []

    for (const asset of response.data) {

      assets.push({
        currency : asset.Currency,
        code     : asset.Code,
        country  : asset.Country,
        name     : asset.Name,
      })
    }

    return assets
  }


  async fetchSupportedSymbols () : Promise<Array<Types.AssetSymbol>> {

    const listApi                           = new EODApi.ExchangesApi(this.config)
    const assets : Array<Types.AssetSymbol> = []


    const exchanges = await this.fetchSupportedExchanges()

    console.log(`Found ${exchanges.length} exchanges`)
    await processBatch(exchanges, async (exchange : Types.Exchange) => {

      console.log(`Getting symbols for  ${exchange.code}`)
      const response = await listApi.listSymbols(exchange.code)

      for (const asset of response.data) {
        assets.push({
          currency : asset.Currency,
          symbol   : asset.Code,
          exchange : asset.Exchange,
          name     : asset.Name,
          type     : asset.Type,
          ISIN     : asset.Isin,
        })

      }

    }, null, 4)

    return assets
  }


  async searchSymbols (query : string) : Promise<Array<Types.AssetSymbol>> {

    const listApi = new EODApi.AssetsApi(this.config)

    const response = await listApi.searchAsset(query)

    const assets : Array<Types.AssetSymbol> = []

    for (const asset of response.data) {

      assets.push({
        currency : asset.Currency,
        symbol   : asset.Code,
        exchange : asset.Exchange,
        name     : asset.Name,
        type     : asset.Type,
        ISIN     : asset.ISIN,
      })
    }

    return assets
  }

  async fetchSymbolTimeSeriesData (
    symbol : string,
    from : dayjs.Dayjs,
    to : dayjs.Dayjs,
    resolution : Types.SymbolDataResolution,
  ) : Promise<Types.TimeSeriesData> {

    return null
    /*
    const historyApi = new EODApi.HistoryApi(this.config)

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

 */
  }

  async getCompanyProfile (tickerName : string) : Promise<Types.CompanyProfile> {

    try {

      const assetApi = new EODApi.AssetsApi(this.config)

      const response = await assetApi.assetFundamentalsGeneralSection(tickerName)
      const general  = response.data

      return {
        symbol            : general.Code,
        companyName       : general.Name,
        currency          : general.CurrencyCode,
        isin              : general.ISIN,
        cusip             : general.CUSIP,
        exchangeCode      : general.Exchange,
        industry          : general.Industry,
        website           : general.WebURL,
        description       : general.Description,
        sector            : general.Sector,
        country           : general.CountryISO,
        fullTimeEmployees : general.FullTimeEmployees,
        phone             : general.Phone,
        address           : general.AddressData?.Street,
        city              : general.AddressData?.City,
        state             : general.AddressData?.State,
        zip               : general.AddressData?.ZIP,
        image             : general.LogoURL && general.LogoURL.toLowerCase()
          .startsWith('http') ? general.LogoURL : `https://eodhistoricaldata.com/${general.LogoURL}`,
        ipoDate: general.IPODate,
      }

    } catch (error) {
      EOD.handleError(error)
    }
  }

  async getCompanyQuote (symbol : string) : Promise<Types.CompanyQuote> {

    const data = await this.getCompanyQuotes([
      symbol,
    ])

    return data.pop()
  }


  public name () : string {
    return 'EOD'
  }


  async getCompanyProfiles (symbols : string[]) : Promise<Types.CompanyProfile[]> {

    const promises = await Object.values(symbols).map(async symbol => await this.getCompanyProfile(symbol))

    return await Promise.all(promises)
  }

  async getCompanyQuotes (symbol : string[]) : Promise<Types.CompanyQuote[]> {

    throw 'tbd'

    // const api = new EODApi.CompanyValuationApi(this.config)
    //
    // const response = await api.quote(symbol.join(','))
    //
    // return response.data
  }

}


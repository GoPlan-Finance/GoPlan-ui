/**
 *
 *
 *
 *
 */
import { Mutex } from 'async-mutex'
import { Dayjs } from 'dayjs'


export interface Exchange {
  code : string;
  name : string;
  country : string;
  currency : string;
}


export interface AssetSymbol {
  name : string,
  symbol : string,
  exchange : string,
  currency? : string,
  ISIN? : string,
  type? : string,
}


export type SymbolDataResolution =
  '1minute'
  | '5minutes'
  | '30minutes'
  | '15minutes'
  | 'hour'
  | '4hours'
  | 'day'
  | 'week'
  | 'month'


export enum APIErrorType {
  QUOTA_ERROR = 1,
  TIMEOUT_ERROR,
  UNKNOWN_ERROR,
}


export class APIError {

  type : APIErrorType
  error : unknown
  retryAfterSeconds : number


  constructor (type : APIErrorType, error : unknown = null) {
    this.type  = type
    this.error = error
  }

}


export interface EndOfDayData {
  date : string,
  open : number,
  high : number,
  low : number,
  close : number,
  volume : number,
  // "unadjustedVolume" : number,
  // "change" : number,
  // "changePercent" : number,
  // "vwap" : number,
  // "label" : string,
  // "changeOverTime" :number
}


/**
 *
 * @export
 * @interface CompanyProfile
 */
export interface CompanyProfile {
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  symbol : string;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // price : number;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // beta? : number;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // volAvg? : number;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // mktCap? : number;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // lastDiv? : number;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  // range? : string;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // changes? : number;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  companyName : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  currency : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  isin? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  cusip? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  exchangeCode : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  // exchangeShortName : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  industry : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  website? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  description : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  // ceo? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  sector : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  country? : string;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  fullTimeEmployees? : number;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  phone? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  address? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  city? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  state? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  zip? : string;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // dcfDiff? : number;
  /**
   *
   * @type {number}
   * @memberof CompanyProfile
   */
  // dcf? : number;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  image? : string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  ipoDate? : string;
}


/**
 *
 * @export
 * @interface CompanyQuote
 */
export interface CompanyQuote {
  /**
   *
   * @type {string}
   * @memberof CompanyQuote
   */
  symbol : string;
  /**
   *
   * @type {string}
   * @memberof CompanyQuote
   */
  name : string;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  price : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  changesPercentage : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  change : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  dayLow : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  dayHigh : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  yearHigh : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  yearLow : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  marketCap : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  priceAvg50 : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  priceAvg200 : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  volume : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  avgVolume : number;
  /**
   *
   * @type {string}
   * @memberof CompanyQuote
   */
  exchange : string;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  open : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  previousClose : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  eps : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  pe : number;
  /**
   *
   * @type {string}
   * @memberof CompanyQuote
   */
  earningsAnnouncement : string;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  sharesOutstanding? : number;
  /**
   *
   * @type {number}
   * @memberof CompanyQuote
   */
  timestamp : number;
}


/**
 *
 * @export
 * @interface EndOfDayPrice
 */
export interface EndOfDayPrice {
  /**
   *
   * @type {string}
   * @memberof EndOfDayPrice
   */
  date : string;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  open : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  high : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  low : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  close : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  adjClose? : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  volume : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  unadjustedVolume? : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  change? : number;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  vwap? : number;
  /**
   *
   * @type {string}
   * @memberof EndOfDayPrice
   */
  label? : string;
  /**
   *
   * @type {number}
   * @memberof EndOfDayPrice
   */
  changeOverTime? : number;
}


export interface TimeSeriesData {
  resolution : SymbolDataResolution
  data : EndOfDayData[]
}


export interface DataProviderInterface {

  throttleRequestQuotaMs : number
  mutex : Mutex


  name () : string

  fetchSupportedExchanges () : Promise<Array<Exchange>>

  fetchSupportedSymbols (exchangeCode ? : string) : Promise<Array<AssetSymbol>>

  searchSymbols (query : string) : Promise<Array<AssetSymbol>>

  fetchSymbolTimeSeriesData? (
    symbol : string,
    from : Dayjs,
    to : Dayjs,
    resolution : SymbolDataResolution,
  ) : Promise<TimeSeriesData>


  getCompanyProfile? (
    symbol : string,
  ) : Promise<CompanyProfile>


  getCompanyQuote (
    symbol : string,
  ) : Promise<CompanyQuote>


  getCompanyQuotes (
    symbols : string[],
  ) : Promise<CompanyQuote[]>


}



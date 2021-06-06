import { BaseObject } from '/@common/models/base/BaseObject'
import { CacheableQuery } from '/@common/Query/CacheableQuery'
import { StockExchange } from './StockExchange'


export class AssetSymbol extends BaseObject {

  static className = 'AssetSymbol'


  constructor () {
    super(AssetSymbol.className)
  }

  get tickerName () : string {

    const exchangeCode = this.exchangeCode && this.exchangeCode !== 'US' ? `.${this.exchangeCode}` : ''

    return `${this.symbol}${exchangeCode}`
  }

  static parseTicker (formattedName: string) : {symbol : string, exchangeCode : string} {

    const [
      symbol, exchangeCode
    ] = formattedName.split('.')

    return {
      symbol       : symbol.toUpperCase(),
      exchangeCode : exchangeCode ? exchangeCode.toUpperCase() : 'US'
    }
  }

  get symbol () : string {
    return this.get('symbol')
  }

  get exchangeCode () : string {
    return this.get('exchangeCode')
  }

  set exchangeCode (value : string) {
    this.set('exchangeCode', value)
  }

  get name () : string {
    return this.get('name')
  }

  get dataProviderName () : string {
    return this.get('dataProviderName')
  }

  get exchange () : StockExchange {
    return this.get('exchange')
  }

  get currency () : string {
    return this.get('currency')
  }

  get ISIN () : string {
    return this.get('ISIN')
  }

  set ISIN (value : string) {
    this.set('ISIN', value)
  }

  get type () : string {
    return this.get('type')
  }

  set type (value : string) {
    this.set('type', value)
  }


  static async fetchSymbolByTicker (
    ticker : string,
    useMasterKey = false,
  ) : Promise<AssetSymbol | null> {

    const {symbol, exchangeCode } = AssetSymbol.parseTicker(ticker)

    const query = CacheableQuery.create(AssetSymbol)
    query.equalTo('symbol', symbol)
    query.equalTo('exchangeCode', exchangeCode)

    query.include('exchange')

    return query.first(AssetSymbol.useMasterKey(useMasterKey))
  }


}


AssetSymbol.register()

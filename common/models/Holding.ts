import { Query } from '/@common/Query'
import { Mutex } from 'async-mutex'
import { AssetPrice, AssetSymbol, Transaction, User } from '.'
import { SecureObject } from './base/SecureObject'


const createMutex = new Mutex()


export class Holding extends SecureObject {

  static className = 'Holding'

  private _lastPrice : AssetPrice = null

  constructor () {
    super(Holding.className, [
      'firstBuyAt',
      'firstSellAt',
      'lastBuyAt',
      'lastSellAt',

      'buyQty',
      'buyAvgPrice',
      'buyTotalPrice',

      'openQty',
      'openAvgPrice',
      'openTotalPrice',

      'closedQty',
      'closedAvgPrice',
      'closedTotalPrice',
    ])
  }

  get symbol () : AssetSymbol {
    return this.get('symbol')
  }

  set symbol (value : AssetSymbol) {
    this.set('symbol', value)
  }

  get symbolName () : string {

    if (this.symbol && this.symbol.tickerName) {
      return this.symbol.tickerName
    }

    return this.get('symbolName')
  }

  set symbolName (value : string) {
    this.set('symbolName', value)
  }

  get createdBy () : User {
    return this.get('createdBy')
  }

  set createdBy (value : User) {
    this.set('createdBy', value)
  }

  get isOutdated () : boolean {
    return this.get('isOutdated')
  }

  set isOutdated (value : boolean) {
    this.set('isOutdated', value)
  }

  get lastPrice () : AssetPrice {
    return this._lastPrice
  }

  set lastPrice (value : AssetPrice) {
    this._lastPrice = value
  }

  get firstBuyAt () : Date {
    return this.get('firstBuyAt')
  }

  set firstBuyAt (value : Date) {
    this.set('firstBuyAt', value)
  }

  get firstSellAt () : Date {
    return this.get('firstSellAt')
  }

  set firstSellAt (value : Date) {
    this.set('firstSellAt', value)
  }

  get lastBuyAt () : Date {
    return this.get('lastBuyAt')
  }

  set lastBuyAt (value : Date) {
    this.set('lastBuyAt', value)
  }

  get lastSellAt () : Date {
    return this.get('lastSellAt')
  }

  set lastSellAt (value : Date) {
    this.set('lastSellAt', value)
  }

  get currency () : string {
    return this.get('currency')
  }

  set currency (value : string) {
    this.set('currency', value ? value.toUpperCase() : null)
  }

  get openQty () : number {
    return this.get('openQty')
  }

  set openQty (value : number) {
    this.set('openQty', value)
  }

  get openAvgPrice () : number {
    return this.get('openAvgPrice')
  }

  set openAvgPrice (value : number) {
    this.set('openAvgPrice', value)
  }


  get openTotalPrice () : number {
    return this.get('openTotalPrice')
  }

  set openTotalPrice (value : number) {
    this.set('openTotalPrice', value)
  }

  get buyQty () : number {
    return this.get('buyQty')
  }

  set buyQty (value : number) {
    this.set('buyQty', value)
  }

  get buyAvgPrice () : number {
    return this.get('buyAvgPrice')
  }

  set buyAvgPrice (value : number) {
    this.set('buyAvgPrice', value)
  }

  get buyTotalPrice () : number {
    return this.get('buyTotalPrice')
  }

  set buyTotalPrice (value : number) {
    this.set('buyTotalPrice', value)
  }

  get closedQty () : number {
    return this.get('closedQty')
  }

  set closedQty (value : number) {
    this.set('closedQty', value)
  }

  get closedAvgPrice () : number {
    return this.get('closedAvgPrice')
  }

  set closedAvgPrice (value : number) {
    this.set('closedAvgPrice', value)
  }


  get closedTotalPrice () : number {
    return this.get('closedTotalPrice')
  }

  set closedTotalPrice (value : number) {
    this.set('closedTotalPrice', value)
  }

  //
  // get  () : number {
  //   return this.get('')
  // }
  //
  // set (value :number ){
  //   this.set('' , value)
  // }

  static async findOrCreateFromTransaction (
    transaction : Transaction,
    useMasterKey   = false,
    save  = true,
  ) : Promise<Holding | null> {


    return createMutex.runExclusive(async () => {
      let holding = null
      if (transaction.symbol) {
        holding = await Query.create(Holding).findOrCreate({symbol: transaction.symbol}, useMasterKey, save)
      }

      if (!holding && transaction.symbolName) {
        holding = await Query.create(Holding).findOrCreate({symbolName: transaction.symbolName}, useMasterKey, save)
      }


      if (holding && !holding.currency) {
        holding.currency = transaction.currency

        if (save) {
          await holding.save(null, Holding.useMasterKey(useMasterKey))
        }
      }

      return holding
    })


  }


}


Holding.register()

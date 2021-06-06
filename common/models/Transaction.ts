import { Account, AssetSymbol, Holding, User } from '.'
import { SecureObject } from './base/SecureObject'


export type TransactionType = 'transfer' | 'buy' | 'sell' | 'dividends' | 'fees'


export class Transaction extends SecureObject {

  static className = 'Transaction'

  constructor () {
    super(Transaction.className, [
      'quantity',
      'price',
      'type',
      'fees',
      'totalExcludingFees',
      'importRawData',
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

  get account () : Account {
    return this.get('account')
  }

  set account (value : Account) {
    this.set('account', value)
  }

  get createdBy () : User {
    return this.get('createdBy')
  }

  set createdBy (value : User) {
    this.set('createdBy', value)
  }

  get holding () : Holding {
    return this.get('holding')
  }

  set holding (value : Holding) {
    this.set('holding', value)
  }

  get executedAt () : Date {
    return this.get('executedAt')
  }

  set executedAt (value : Date) {
    this.set('executedAt', value)
  }

  get price () : number {
    return this.get('price')
  }

  set price (value : number) {
    this.set('price', value)
  }

  get quantity () : number {
    return Number(this.get('quantity'))
  }

  set quantity (value : number) {
    this.set('quantity', value)
  }

  get type () : TransactionType {
    return this.get('type')
  }

  set type (value : TransactionType) {
    this.set('type', value.toUpperCase())
  }

  get currency () : string {
    return this.get('currency')
  }

  set currency (value : string) {
    this.set('currency', value.toUpperCase())
  }

  get fees () : number {
    return this.get('fees')
  }

  set fees (value : number) {
    this.set('fees', value)
  }

  get totalExcludingFees () : number {
    return this.get('totalExcludingFees')
  }

  set totalExcludingFees (value : number) {
    this.set('totalExcludingFees', value)
  }

  get importStatus () : unknown {
    return this.get('importStatus')
  }

  set importStatus (value : unknown) {
    this.set('importStatus', value)
  }

  get importRawData () : unknown {
    return this.get('importRawData')
  }

  set importRawData (value : unknown) {
    this.set('importRawData', value)
  }

}


Transaction.register()

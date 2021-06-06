import { BaseObject } from '/@common/models/base/BaseObject'


export class StockExchange extends BaseObject {

  static className = 'StockExchange'

  constructor () {
    super(StockExchange.className)
  }

  get code () : string {
    return this.get('code')
  }

  set code (value : string) {
    this.set('code', value.toUpperCase())
  }

  get name () : string {
    return this.get('name')
  }

  set name (value : string) {
    this.set('name', value)
  }

  get country () : string {
    return this.get('country')
  }

  set country (value : string) {
    this.set('country', value)
  }

  get currency () : string {
    return this.get('currency')
  }

  set currency (value : string) {
    this.set('currency', value.toUpperCase())
  }


  get dataProviderName () : string {
    return this.get('dataProviderName')
  }

  set dataProviderName (value : string) {
    this.set('dataProviderName', value.toUpperCase())
  }


}


StockExchange.register()


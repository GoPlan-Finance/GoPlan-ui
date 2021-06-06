import { AssetSymbol, Holding } from '.'
import { SecureObject } from './base/SecureObject'


export class HoldingTimeSeries extends SecureObject {

  static className = 'HoldingTimeSeries'


  constructor () {
    super(HoldingTimeSeries.className, [
      'low',
      'high',
      'open',
      'close',

      'openQty',
    ])
  }

  get holding () : Holding {
    return this.get('holding')
  }

  set holding (value : Holding) {
    this.set('holding', value)
  }

  get currency () : string {
    return this.get('currency')
  }

  set currency (value : string) {
    this.set('currency', value ? value.toUpperCase() : null)
  }

  get isOutdated () : boolean {
    return this.get('isOutdated')
  }

  set isOutdated (value : boolean) {
    this.set('isOutdated', value)
  }

  get startAt () : Date {
    return this.get('startAt')
  }

  set startAt (value : Date) {
    this.set('startAt', value)
  }

  get period () : string {
    return this.get('period')
  }

  set period (value : string) {
    this.set('period', value)
  }

  get openQty () : number {
    return this.get('openQty')
  }

  set openQty (value : number) {
    this.set('openQty', value)
  }

  get low () : number {
    return this.get('low')
  }

  set low (value : number) {
    this.set('low', value)
  }

  get high () : number {
    return this.get('high')
  }

  set high (value : number) {
    this.set('high', value)
  }

  get open () : number {
    return this.get('open')
  }

  set open (value : number) {
    this.set('open', value)
  }

  get close () : number {
    return this.get('close')
  }

  set close (value : number) {
    this.set('close', value)
  }


  //
  // get  () : number {
  //   return this.get('')
  // }
  //
  // set (value :number ){
  //   this.set('' , value)
  // }


}


HoldingTimeSeries.register()

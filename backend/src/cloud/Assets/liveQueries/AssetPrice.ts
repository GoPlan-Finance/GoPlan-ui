// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { AssetPrice, AssetSymbol } from '/common/models'
import { CacheableQuery } from '/common/Query/CacheableQuery'
import { ArrayUtils } from '/common/utils'
import * as dayjs from 'dayjs'
import { DataProvider } from '../../DataProviders/providers'


interface SubscriptionInterface {
  symbol : AssetSymbol
  registeredAt : dayjs.Dayjs
  registrations : number[]
}


type SubscriptionsType = SubscriptionInterface[]


class SubscriptionsHandler<T> {

  subscriptions : SubscriptionsType = []
  delay : number
  interval : any
  classType : T

  constructor (classType : T, delay : number) {
    this.delay     = delay
    this.classType = classType
  }

  stop () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  start () {
    // noinspection JSIgnoredPromiseFromCall
    this.runOnce()

    if (this.interval) {
      return
    }

    this.interval = setInterval(async () => {
      await this.runOnce()
    }, this.delay * 1000)

  }

  private removeExpired () {

    this.subscriptions = this.subscriptions.filter(subscription => {
      return true // subscription.registeredAt
    })
  }

  private async runOnce () {
    this.removeExpired()

    console.log(`Got ${this.subscriptions.length} to update`)
    const providers = ArrayUtils.groupBy(this.subscriptions, value => {
      return value.symbol.dataProviderName || 'NO_PROVIDER'
    })

    for (const [
      providerName, subscriptions
    ] of Object.entries(providers)) {

      const batches = ArrayUtils.batches(subscriptions, 100)

      for (const batch of batches) {

        const tickers      = batch.map(subscription => subscription.symbol)
        const tickersNames = tickers.map(ticker => ticker.symbol)


        console.log(`Updating quotes for ${providerName} -> ${tickersNames.join(', ')} to update`)
        const results = await DataProvider.getCompanyQuotes(providerName, tickers)
        for (const result of results) {
          const assetPrice = new AssetPrice()

          assetPrice.symbol = await AssetSymbol.fetchSymbolByTicker(result.symbol, true)

          // recordedAt: {type: 'Date'},
          assetPrice.recordedAt        = dayjs.unix(result.timestamp).toDate()
          assetPrice.price             = result.price
          assetPrice.changesPercentage = result.changesPercentage
          assetPrice.change            = result.change
          assetPrice.dayLow            = result.dayLow
          assetPrice.dayHigh           = result.dayHigh
          assetPrice.yearHigh          = result.yearHigh
          assetPrice.yearLow           = result.yearLow
          assetPrice.marketCap         = result.marketCap
          assetPrice.priceAvg50        = result.priceAvg50
          assetPrice.priceAvg200       = result.priceAvg200
          assetPrice.volume            = result.volume
          assetPrice.avgVolume         = result.avgVolume
          assetPrice.open              = result.open
          assetPrice.previousClose     = result.previousClose
          assetPrice.eps               = result.eps
          assetPrice.pe                = result.pe
          assetPrice.sharesOutstanding = result.sharesOutstanding


          await assetPrice.save(null, AssetPrice.useMasterKey(true))
        }

      }

    }

  }

  subscribe (requestId :number, symbol : AssetSymbol) {

    const existing = this.subscriptions.find(subscription => subscription.symbol.id === symbol.id)

    if (existing) {
      existing.registeredAt = dayjs()

      if (!existing.registrations.includes(requestId)) {
        existing.registrations.push(requestId)
      }

      return
    }

    this.subscriptions.push({
      registrations: [
        requestId
      ],
      symbol,
      registeredAt: dayjs(),
    })

    this.start()
  }


  unsubscribe (requestId :number) {

    const index = this.subscriptions.findIndex(subscription => {
      return !!subscription.registrations.find(reqId  => reqId === requestId)
    })

    if (index === -1) {
      return
    }

    const existing = this.subscriptions[index]

    existing.registrations = existing.registrations.filter(reqId => reqId !== requestId)

    if (existing.registrations.length > 0) {
      return
    }

    this.subscriptions.splice(index, 1)

    if (this.subscriptions.length > 0) {
      return
    }

    this.stop()
  }


}


const handler = new SubscriptionsHandler(AssetSymbol, 60)


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Parse.Cloud.beforeSubscribe(AssetPrice, async (request) => {

  const query : Parse.Query = request.query

  const symbol = query.toJSON().where.symbol

  if (!symbol) {
    throw 'Query must include \'equalsTo("symbol" , symbol)'
  }

  const assetSymbol = await CacheableQuery.create(AssetSymbol).getObjectById(symbol.objectId, true)

  console.log('sub', request.requestId)
  handler.subscribe(request.requestId, assetSymbol)
},
)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Parse.Cloud.beforeUnsubscribe(AssetPrice, async (request) => {


  console.log('unsub', request.requestId)
  handler.unsubscribe(request.requestId)
})
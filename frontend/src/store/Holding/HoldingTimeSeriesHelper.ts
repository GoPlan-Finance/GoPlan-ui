import { Holding, HoldingTimeSeries, Transaction } from '/@common/models'
import { Query } from '/@common/Query'
import { CandleData } from '/@components/Charts/CandlestickChart'
import { Mutex } from 'async-mutex'
import * as dayjs from 'dayjs'


const holdingMutex = new Mutex()


export class HoldingTimeSeriesHelper {


  private static dateGenerator (holding : Holding, transactions : Transaction[]) {

    if (transactions.length === 0) {
      return
    }

    const start = dayjs(transactions[0].executedAt).startOf('day')
    const end   = dayjs(transactions[transactions.length - 1].executedAt).endOf('day')

    const now = dayjs().endOf('day')

    if (start.isAfter(end)) {
      throw `start date "${start}" must be before the end date "${end}"`
    }

    const deltas = []
    for (const transaction of transactions) {

      if (![
        'buy', 'sell',
      ].includes(transaction.type.toLowerCase())) {
        continue
      }
      const op   = ((transaction.type.toLowerCase() === 'sell') ? -1 : 1)
      const qty  = transaction.quantity * op
      const last = deltas.length ? deltas[deltas.length - 1].openQty : 0

      deltas.push({
        executedAt : dayjs(transaction.executedAt).startOf('day'),
        transaction,
        openQty    : last + qty,
        avgPrice   : qty !== 0 ? (transaction.totalExcludingFees / transaction.quantity) : 0,
      })
    }

    const results = []
    let current   = deltas[0]
    for (let i = 1; i < deltas.length; ++i) {
      current   = deltas[i - 1]
      const end = deltas[i]

      while (current.executedAt.isBefore(end.executedAt.endOf('day'))) {
        results.push({...current})

        current.executedAt = current.executedAt.add(1, 'day')
      }
    }

    if (!current || current.openQty === 0) {
      return results
    }

    current = deltas[deltas.length - 1]
    while (current.executedAt.isBefore(now)) {
      results.push({...current})

      current.executedAt = current.executedAt.add(1, 'day')
    }

    return results
  }

  private static getOrCreate (
    holding : Holding,
    existingPrices : HoldingTimeSeries [],
    start : dayjs.Dayjs,
  ) : HoldingTimeSeries {
    const existing = existingPrices.find(price => dayjs(price.startAt).format('YYYY-MM-DD') === dayjs(start)
      .format('YYYY-MM-DD'))

    if (existing) {
      return existing
    }

    const price = new HoldingTimeSeries()

    price.startAt = dayjs(start).startOf('day').toDate()
    price.period  = 'day'

    price.holding  = holding
    price.currency = holding.currency

    return price
  }

  public static async updateHistory (holding : Holding, transactions : Transaction[]) : Promise<void> {

    transactions.sort((a, b) => a.executedAt.getTime() - b.executedAt.getTime())

    const dates = HoldingTimeSeriesHelper.dateGenerator(holding, transactions)

    if (dates.length === 0) {
      return
    }

    const eodFormatted = await this.getEOD(dates, holding)

    const existingPrices = await Query.create(HoldingTimeSeries).findBy({
      period: 'day',
      holding,
    })

    const prices = []
    let lastElem = null
    for (const date of dates) {
      const dateKey = date.executedAt.format('YYYY-MM-DD')
      const openQty = date.openQty

      const elem  = eodFormatted[dateKey] ? eodFormatted[dateKey] : lastElem
      lastElem    = elem
      const price = HoldingTimeSeriesHelper.getOrCreate(holding, existingPrices, date.executedAt)

      price.openQty = openQty

      if (elem) { // @todo currency
        price.low   = openQty * elem.low
        price.high  = openQty * elem.high
        price.open  = openQty * elem.open
        price.close = openQty * elem.close
      } else {
        price.low   = openQty * date.avgPrice
        price.high  = openQty * date.avgPrice
        price.open  = openQty * date.avgPrice
        price.close = openQty * date.avgPrice
      }

      prices.push(price)
    }

    await HoldingTimeSeries.saveAll(prices)

  }

  private static async getEOD (dates : any[], holding : Holding) : Promise<{[key: string] : CandleData}> {
    if (!holding.symbol) {
      return null
    }


    const eodData : CandleData[] = await Parse.Cloud.run('Assets--GetEndOfDay', {
      resolution    : 'day',
      from          : dates[0].executedAt.toISOString(),
      to            : dates[dates.length - 1].executedAt.toISOString(),
      assetSymbolId : holding.symbol.id,
    })

    const eodFormatted = {}
    for (const elem of eodData) {
      eodFormatted[dayjs(elem.date).format('YYYY-MM-DD')] = elem
    }
    return eodFormatted
  }

}

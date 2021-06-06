import { Holding, Transaction } from '/@common/models'
import { Query } from '/@common/Query'
import { HoldingTimeSeriesHelper } from '/@store/Holding/HoldingTimeSeriesHelper'
import { Mutex } from 'async-mutex'
import * as dayjs from 'dayjs'
import { useTransactionStore } from '../'


const holdingMutex = new Mutex()


export class HoldingHelper {


  private static async updateHolding (holding : Holding) {
    const transactionsStore = useTransactionStore()
    await transactionsStore.subscribe()

    console.log(`Updating holding "${holding.symbolName}"`)

    const transactions = transactionsStore.transactions.filter(transaction => {

      if (!transaction.symbolName || !holding.symbolName
          || transaction.symbolName !== holding.symbolName
      ) {
        return false
      }

      if (!transaction.type) {
        return false
      }

      return [
        'buy', 'sell',
      ].includes(transaction.type.toLowerCase())
    })

    holding.firstBuyAt = null
    holding.lastBuyAt  = null

    holding.firstSellAt = null
    holding.lastSellAt  = null

    holding.buyQty        = 0
    holding.buyAvgPrice   = 0
    holding.buyTotalPrice = 0

    holding.openQty        = 0
    holding.openAvgPrice   = 0
    holding.openTotalPrice = 0

    holding.closedQty        = 0
    holding.closedAvgPrice   = 0
    holding.closedTotalPrice = 0

    const minMax = (holding : Holding, executedAt : Date, op : 'Buy' | 'Sell') => {
      const first = `first${op}At`
      const last  = `last${op}At`

      if (!holding[first] || dayjs(holding[first]).unix() > dayjs(executedAt).unix()) {
        holding[first] = executedAt
      }

      if (!holding[last] || dayjs(holding[last]).unix() < dayjs(executedAt).unix()) {
        holding[last] = executedAt
      }
    }

    const avg = (holding : Holding, op : 'buy' | 'open' | 'closed') => {
      const total = `${op}TotalPrice`
      const qty   = `${op}Qty`

      if (holding[qty] === 0) {
        return null
      }

      return holding[total] / holding[qty]
    }

    transactions.forEach(transaction => {

      if (transaction.type.toLowerCase() === 'buy') {

        holding.buyQty        += transaction.quantity
        holding.buyTotalPrice += transaction.totalExcludingFees

        minMax(holding, transaction.executedAt, 'Buy')
      }

      if (transaction.type.toLowerCase() === 'sell') {

        holding.closedQty        += transaction.quantity
        holding.closedTotalPrice += transaction.totalExcludingFees

        minMax(holding, transaction.executedAt, 'Sell')
      }
    })

    holding.openQty        = holding.buyQty - holding.closedQty
    holding.openTotalPrice = holding.buyTotalPrice - holding.closedTotalPrice

    holding.buyAvgPrice    = avg(holding, 'buy')
    holding.openAvgPrice   = avg(holding, 'open')
    holding.closedAvgPrice = avg(holding, 'closed')

    console.log(`Updated "${holding.symbolName}" : BUY ${holding.buyQty}  , OPEN ${holding.openQty},  CLOSE ${holding.closedQty}`)
    holding.isOutdated = false


    await holding.save()

    await HoldingTimeSeriesHelper.updateHistory(holding, transactions)

  }


  public static async createMissingHoldings () {

    const missingQuery = async () : Promise<Transaction[]> => {

      // ( symbol || symbolName ) && ! holding
      return Query.and(
        Query.or(
          Query.create(Transaction).exists('symbol'),
          Query.create(Transaction).exists('symbolName'),
        ),
        Query.create(Transaction).doesNotExist('holding'),
      )
        .include('symbol')
        .findAll()
    }

    const transactions = await missingQuery()
    console.log(`Holdings->createMissingHoldings: Found ${transactions.length} to update`)
    for (const transaction of transactions) {

      const holding = await Holding.findOrCreateFromTransaction(transaction, false, true)

      if (!holding) {
        continue
      }

      transaction.holding = holding
      await transaction.save()
    }
  }

  public static async

  public static async findOutdatedHoldings () {

    const isOutdatedQuery = () : Query<Holding> => {
      return Query.or(
        Query.create(Holding).notEqualTo('isOutdated', false),
        Query.create(Holding).doesNotExist('isOutdated'),
      ).include('symbol')

    }

    const holdings = await isOutdatedQuery().findAll()
    console.log(`Holdings->findOutdatedHoldings: Found ${holdings.length} to update`)
    for (const holding of holdings) {
      await HoldingHelper.maybeUpdateOutdated(holding)
    }
  }


  public static async maybeUpdateOutdated (holding : Holding) : Promise<void> {
    if (holding.isOutdated) {
      try {
        await HoldingHelper.updateHolding(holding)

      } catch (e) {
        console.error(`maybeUpdateOutdated(${holding.symbolName}) : ${e}`)
      }
    }
  }

}

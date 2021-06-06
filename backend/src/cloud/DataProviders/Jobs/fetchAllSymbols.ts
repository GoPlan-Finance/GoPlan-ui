/**
 *
 *
 *
 */
import { AssetSymbol, StockExchange } from '/@common/models'
import { CacheableQuery } from '/@common/Query/CacheableQuery'
// noinspection ES6PreferShortImport
import { processBatch } from '/@common/utils'
import { DataProvider, ProviderSymbols } from '../providers'

import * as DataProviderInterfaces from '../providers/types'


Parse.Cloud.job('DataProviders--FetchAllSymbols', async (request) => {

  // params: passed in the job call
  // headers: from the request that triggered the job
  // log: the ParseServer logger passed in the request
  // message: a function to update the status message of the job object

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const {/*params, headers,*/ log, message} = request

  message('Deprecated. You no longer need to run this manually')

  return

  const saveSymbols = async (symbols : AssetSymbol[]) : Promise<void> => {
    log.info(`Saving ${symbols.length} symbols`)
    AssetSymbol.saveAll(symbols, AssetSymbol.useMasterKey(true))
  }

  const symbolsProviders = await DataProvider.fetchSupportedSymbols() as ProviderSymbols


  for (const [
    providerName, symbols
  ] of Object.entries(symbolsProviders)) {
    log.info(`Processing ${symbols.length} symbols for ${providerName}`)

    let saveQueue : AssetSymbol[] = []

    await processBatch(symbols, async (apiSymbol : DataProviderInterfaces.AssetSymbol) => {

      const exchange = !apiSymbol.exchange ? null : await CacheableQuery.create(StockExchange).findOrCreate({
        code             : apiSymbol.exchange,
        dataProviderName : providerName,
      }, true)

      const symbol = await CacheableQuery.create(AssetSymbol).findOrCreate({
        symbol           : apiSymbol.symbol,
        dataProviderName : providerName,
        exchange,
      }, true)

      symbol.set({
        currency : apiSymbol.currency ? apiSymbol.currency.toUpperCase() : null,
        name     : apiSymbol.name,
      })

      saveQueue.push(symbol)

    }, async (i, total) => {
      log.info(`Processing ${i}/${total}: ${symbols[i].symbol} for ${providerName}`)

      if (saveQueue.length >= 100) {
        await saveSymbols(saveQueue)
        saveQueue = []
      }


      return true
    })

    await saveSymbols(saveQueue)

  }

})

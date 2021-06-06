/**
 *
 *
 *
 */
// noinspection ES6PreferShortImport
import { AssetSymbol, StockExchange } from '/@common/models'
import { CacheableQuery } from '/@common/Query/CacheableQuery'
import { processBatch } from '/@common/utils'

import { assertUser } from '../../Auth'


import { DataProvider } from '../../DataProviders/providers'
import * as Types from '../../DataProviders/providers/types'


Parse.Cloud.define('Assets--Search', async (request) => {
  assertUser(request)

  const {query} = request.params

  const results = await DataProvider.searchSymbols(query)

  const assetSymbols : AssetSymbol[] = []
  for (const [
    providerName, symbols
  ] of Object.entries(results)) {

    const MAX_SYMBOLS = 15

    await processBatch(symbols.slice(0, MAX_SYMBOLS), async (symbol : Types.AssetSymbol) : Promise<void> => {

      const exchange = await CacheableQuery.create(StockExchange).findOrCreate({
        code             : symbol.exchange,
        dataProviderName : providerName,
      }, true, true, {})

      assetSymbols.push(await CacheableQuery.create(AssetSymbol).findOrCreate({
        symbol           : symbol.symbol,
        exchange,
        dataProviderName : providerName,
      }, true, true, {
        name         : symbol.name,
        currency     : symbol.currency,
        exchangeCode : exchange.code,
        ISIN         : symbol.ISIN,
        type         : symbol.type,
      }))
    })
  }

  return assetSymbols
})

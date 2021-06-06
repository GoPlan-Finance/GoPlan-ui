/**
 *
 *
 *
 */
import { StockExchange } from '/@common/models'
import { CacheableQuery } from '/@common/Query/CacheableQuery'
// noinspection ES6PreferShortImport
import { processBatch } from '/@common/utils'
import { DataProvider } from '../providers'

import * as DataProviderInterfaces from '../providers/types'


Parse.Cloud.job('DataProviders--FetchAllExchanges', async (request) => {

  // params: passed in the job call
  // headers: from the request that triggered the job
  // log: the ParseServer logger passed in the request
  // message: a function to update the status message of the job object

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const {/*params, headers,*/ log, message} = request


  const exchangesProviders = await DataProvider.fetchSupportedExchanges()

  for (const [
    providerName, exchanges
  ] of Object.entries(exchangesProviders)) {

    log.info(`Processing ${exchanges.length} symbols for ${providerName}`)

    await processBatch(exchanges, async (apiExchange : DataProviderInterfaces.Exchange) => {

      const exchange = await CacheableQuery.create(StockExchange).findOrCreate({
        code             : apiExchange.code,
        dataProviderName : providerName,
      }, true, true, {
        country  : apiExchange.country.toUpperCase(),
        currency : apiExchange.currency.toUpperCase(),
        name     : apiExchange.name,
      })

      await exchange.save(null, StockExchange.useMasterKey(true))

    }, async (i, total) => {
      log.info(`Processing ${i}/${total}: ${exchanges[i].code} for ${providerName}`)

      return true
    })

  }

})

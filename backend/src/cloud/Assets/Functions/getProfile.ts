/**
 *
 *
 *
 */
// noinspection ES6PreferShortImport
import { AssetAddressRegion, AssetIndustry, AssetProfile, AssetSector, AssetSymbol } from '/@common/models'
import { CacheableQuery } from '/@common/Query/CacheableQuery'
import * as dayjs from 'dayjs'


import { assertUser } from '../../Auth'

import { DataProvider } from '../../DataProviders/providers'


Parse.Cloud.define('Assets--GetProfile', async (request) => {
  assertUser(request)

  const {assetSymbolId} = request.params

  const assetSymbol = await CacheableQuery.create(AssetSymbol).getObjectById(assetSymbolId, true)

  if (!assetSymbol) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `Symbol ${assetSymbolId} not found`)
  }

  let profile = await CacheableQuery.create(AssetProfile).findOneBy({
    symbol: assetSymbol,
  }, true)

  if (profile) {
    return profile
  }

  profile = new AssetProfile()

  const apiProfile = await DataProvider.getCompanyProfile(assetSymbol)

  const industry = !apiProfile.industry ? null : await CacheableQuery.create(AssetIndustry).findOrCreate({
    name: apiProfile.industry,
  }, true)

  const sector = !apiProfile.sector ? null : await CacheableQuery.create(AssetSector).findOrCreate({
    name: apiProfile.sector,
  }, true)

  const addressRegion = !apiProfile.country ? null : await
  CacheableQuery.create(AssetAddressRegion).findOrCreate({
    state   : apiProfile.state,
    country : apiProfile.country,
  }, true)


  const ipoDate = dayjs(apiProfile.ipoDate)

  profile.set({
    symbol            : assetSymbol,
    exchange          : assetSymbol.exchange,
    industry,
    sector,
    addressRegion,
    name              : apiProfile.companyName,
    currency          : apiProfile.currency,
    phone             : apiProfile.phone,
    address           : apiProfile.address,
    country           : apiProfile.country,
    state             : apiProfile.state,
    city              : apiProfile.city,
    zip               : apiProfile.zip,
    image             : apiProfile.image,
    ipoDate           : ipoDate.isValid() ? ipoDate.toDate() : null,
    website           : apiProfile.website,
    fullTimeEmployees : apiProfile.fullTimeEmployees,
    description       : apiProfile.description,
  })

  await profile.save(null, AssetProfile.useMasterKey(true))

  return profile.toPointer()
})

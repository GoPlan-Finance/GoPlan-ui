import AssetPriceSchema from './AssetPriceSchema'
import AccountSchema from './AccountSchema'
import AssetAddressRegionSchema from './AssetAddressRegionSchema'
import AssetIndustrySchema from './AssetIndustrySchema'
import AssetProfileSchema from './AssetProfileSchema'
import AssetSectorSchema from './AssetSectorSchema'
import AssetSymbolSchema from './AssetSymbolSchema'
import StockExchangeSchema from './StockExchangeSchema'
import TransactionSchema from './TransactionSchema'
import HoldingSchema from './HoldingSchema'
import HoldingTimeSeriesSchema from './HoldingTimeSeriesSchema'
import UserSchema from './UserSchema'
import WatchlistSchema from './WatchlistSchema'
import WatchlistItemSchema from './WatchlistItemSchema'


export const schemas = [
  UserSchema,

  // no dependencies
  AssetSymbolSchema,
  AssetSectorSchema,
  AssetIndustrySchema,
  AssetAddressRegionSchema,
  StockExchangeSchema,

  // has dependencies
  AssetProfileSchema,
  AssetPriceSchema,
  AccountSchema,
  WatchlistSchema,
  WatchlistItemSchema,
  TransactionSchema,
  HoldingSchema,
  HoldingTimeSeriesSchema,
]

import { Migrations } from 'parse-server'


export default Migrations.makeSchema('WatchlistItem', {
  fields: {
    createdBy : {type: 'Pointer', targetClass: '_User'},
    symbol    : {type: 'Pointer', targetClass: 'AssetSymbol', required: true},
    watchlist : {type: 'Pointer', targetClass: 'Watchlist', required: true},
  },
  indexes: {
    watchlist : {watchlist: 1},
    symbol    : {symbol: 1},
  },
  classLevelPermissions: {
    ...Migrations.requiresAuthentication([
      'find', 'get', 'update', 'create', 'delete', 'count',
    ]),
  },
})

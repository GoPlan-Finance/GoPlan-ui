import { Migrations } from 'parse-server'


export default Migrations.makeSchema('AssetSymbol', {
  fields: {
    name             : {type: 'String'},
    symbol           : {type: 'String'},
    exchangeCode     : {type: 'String'},
    dataProviderName : {type: 'String'},
    currency         : {type: 'String'},
    ISIN             : {type: 'String'},
    type             : {type: 'String'},
    exchange         : {type: 'Pointer', targetClass: 'StockExchange'},
  },
  indexes: {
    symbol       : {symbol: 1},
    exchangeCode : {exchangeCode: 1},
    ISIN         : {ISIN: 1},
  },
  classLevelPermissions: {
    ...Migrations.requiresAuthentication([
      'find', 'get', 'count',
    ]),
  },
})

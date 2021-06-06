import { Migrations } from 'parse-server'


export default Migrations.makeSchema('Holding', {
  fields: {
    createdBy  : {type: 'Pointer', targetClass: '_User'},
    symbol     : {type: 'Pointer', targetClass: 'AssetSymbol', required: false},
    symbolName : {type: 'String'},
    currency   : {type: 'String'},

    isOutdated: {type: 'Boolean', defaultValue: true},

    firstBuyAt  : {type: 'Object'},
    firstSellAt : {type: 'Object'},
    lastBuyAt   : {type: 'Object'},
    lastSellAt  : {type: 'Object'},

    buyQty        : {type: 'Object'},
    buyAvgPrice   : {type: 'Object'},
    buyTotalPrice : {type: 'Object'},

    openQty        : {type: 'Object'},
    openAvgPrice   : {type: 'Object'},
    openTotalPrice : {type: 'Object'},

    closedQty        : {type: 'Object'},
    closedAvgPrice   : {type: 'Object'},
    closedTotalPrice : {type: 'Object'},
  },
  indexes: {
    isOutdated : {isOutdated: 1},
    symbol     : {symbol: 1},
  },
  classLevelPermissions: {
    ...Migrations.requiresAuthentication([
      'find', 'get', 'count', 'update', 'create', 'delete',
    ]),

    protectedFields: {
      // '*': [
      //     'symbol',
      // ],
    },
  },
})

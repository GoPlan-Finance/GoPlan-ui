import { Migrations } from 'parse-server'


export default Migrations.makeSchema('Transaction', {
  fields: {
    createdBy  : {type: 'Pointer', targetClass: '_User'},
    account    : {type: 'Pointer', targetClass: 'Account', required: true},
    symbol     : {type: 'Pointer', targetClass: 'AssetSymbol', required: false},
    symbolName : {type: 'String'},
    holding    : {type: 'Pointer', targetClass: 'Holding', required: false},
    type       : {type: 'Object', required: true},

    importStatus : {type: 'Object'},
    currency     : {type: 'String'},
    executedAt   : {type: 'Date', required: true},

    // Encrypted
    price              : {type: 'Object'},
    quantity           : {type: 'Object'},
    fees               : {type: 'Object'},
    totalExcludingFees : {type: 'Object'},
    importRawData      : {type: 'Object'},
  },
  indexes: {
    executedAt : {executedAt: 1},
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

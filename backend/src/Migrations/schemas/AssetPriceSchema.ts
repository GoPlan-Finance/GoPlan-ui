import { Migrations } from 'parse-server'

export default Migrations.makeSchema('AssetPrice', {
  fields: {
    symbol: {type: 'Pointer', targetClass: 'AssetSymbol', required: true},

    recordedAt: {type: 'Date'},

    price             : {type: 'Number'},
    changesPercentage : {type: 'Number'},
    change            : {type: 'Number'},
    dayLow            : {type: 'Number'},
    dayHigh           : {type: 'Number'},
    yearHigh          : {type: 'Number'},
    yearLow           : {type: 'Number'},
    marketCap         : {type: 'Number'},
    priceAvg50        : {type: 'Number'},
    priceAvg200       : {type: 'Number'},
    volume            : {type: 'Number'},
    avgVolume         : {type: 'Number'},

    open          : {type: 'Number'},
    previousClose : {type: 'Number'},
    eps           : {type: 'Number'},
    pe            : {type: 'Number'},

    sharesOutstanding: {type: 'Number'},

    // exchange
    // earningsAnnouncement
    // name


  },
  indexes: {
    symbol: {symbol: 1},

  },
  classLevelPermissions: {
    ...Migrations.requiresAuthentication([
      'find', 'get',
    ]),

    protectedFields: {
      // '*': [
      //     'symbol',
      // ],
    },
  },
})

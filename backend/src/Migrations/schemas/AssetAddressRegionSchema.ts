import { Migrations } from 'parse-server'


export default Migrations.makeSchema('AssetAddressRegion', {
  fields: {
    // parentRegion: {type: 'Pointer', targetClass: 'AssetAddressRegion', required: false},

    country : {type: 'String'},
    state   : {type: 'String'},
  },
  indexes: {
    country : {country: 1},
    state   : {state: 1},
  },
  classLevelPermissions: {
    ...Migrations.requiresAuthentication([
      'find', 'get', 'count',
    ]),
  },
})

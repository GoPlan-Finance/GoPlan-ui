import { Migrations } from 'parse-server'


export default Migrations.makeSchema('AssetIndustry', {
  fields: {
    name: {type: 'String'},
  },
  indexes: {
    name: {name: 1},
  },
  classLevelPermissions: {
    ...Migrations.requiresAuthentication([
      'find', 'get', 'count',
    ]),
  },
})

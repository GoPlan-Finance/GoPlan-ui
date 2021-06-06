import { Migrations } from 'parse-server'


export default Migrations.makeSchema('Watchlist', {
  fields: {
    name      : {type: 'String'},
    createdBy : {type: 'Pointer', targetClass: '_User'},
  },
  indexes: {
    name: {name: 1},
  },
  classLevelPermissions: {
    ...Migrations.requiresAuthentication([
      'find', 'get', 'update', 'create', 'delete',
    ]),
  },
})

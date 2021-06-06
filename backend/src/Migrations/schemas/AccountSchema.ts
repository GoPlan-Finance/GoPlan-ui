import { Migrations } from 'parse-server'


export default Migrations.makeSchema('Account', {
  fields: {
    createdBy : {type: 'Pointer', targetClass: '_User'},
    name      : {type: 'Object'},
    currency  : {type: 'String'},
  },
  indexes: {
    name: {name: 1},
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

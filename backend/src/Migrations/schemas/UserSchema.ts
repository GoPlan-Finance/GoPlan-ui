import { Migrations } from 'parse-server'


export default Migrations.makeSchema('_User', {
  fields: {
    email         : {type: 'String'},
    authData      : {type: 'Object'},
    emailVerified : {type: 'Boolean'},
    password      : {type: 'String'},
    username      : {type: 'String'},
    // firstname: {type: 'String'},
    // lastname: {type: 'String'},
    profileInfo   : {type: 'Object'},
    clientKey     : {type: 'Object'},
  },
  indexes               : {},
  classLevelPermissions : {
    ...Migrations.requiresAuthentication([
      'update',
    ]),

    ...Migrations.requiresAnonymous([
      'create',
    ]),

    protectedFields: {
      '*': [
        'authData',
        'emailVerified',
        'password',
        'username',
        // 'lastname',
        // 'firstname',
      ],
    },
  },
})

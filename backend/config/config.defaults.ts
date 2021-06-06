/**
 *
 *
 *
 *
 */
export default {
  env    : 'development',
  server : {
    http: {
      enabled : true,
      port    : 1337,
    },
  },

  parse: {
    masterKey   : '',
    databaseUri : ''
  },

  dataProviders: [
    {
      name   : 'eod',
      apiKey : '',
    },
    // {
    //   name   : 'yahoo',
    //   apiKey : '',
    // }

  ]
}

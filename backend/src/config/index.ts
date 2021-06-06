import * as convict from 'convict'


convict.addFormat({
  name: 'data-provider-array',
  validate (sources : unknown, schema : unknown) {
    if (!Array.isArray(sources)) {
      throw new Error('must be of type Array')
    }

    for (const source of sources) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      convict(schema.children).load(source).validate()
    }
  },
})


// Define a schema .. see https://www.npmjs.com/package/convict
const config = convict({

  env: {
    doc    : 'The application environment.',
    format : [
      'production', 'development', 'test',
    ],
    default : 'development',
    env     : 'NODE_ENV',
  },

  server: {
    http: {
      enabled: {
        format  : 'Boolean',
        default : false,
      },
      mountPath: {
        doc     : 'Parse Mount Path',
        format  : '*',
        default : '/parse',
      },
      port: {
        doc     : 'The port to bind.',
        format  : 'port',
        default : 80,
        env     : 'HTTP_PORT',
        arg     : 'httpPort',
      },
    },
  },
  parse: {
    databaseUri: {
      doc     : 'Database URI',
      format  : '*',
      default : 'mongodb://localhost:27017/dev',
      env     : 'MONGODB_URI',
    },
    appId: {
      doc     : 'Parse AppId',
      format  : '*',
      default : 'goplan-finance',
    },
    masterKey: {
      doc     : 'Parse Master Key',
      format  : '*',
      default : null,
    },
    serverUrl: {
      doc     : 'Parse Server URL. This is the URL where the backend will attempt to connect to.',
      format  : '*',
      default : 'http://local.goplan.finance:1337/parse',
    },
    auth: {
      google: {
        clientId: {
          doc     : 'Parse AppId',
          format  : '*',
          default : null,
        },
      },
    },
  },
  dataProviders: {
    doc      : 'The list of Data Providers for the various APIs',
    format   : 'data-provider-array',
    default  : [],
    children : {
      name: {
        doc    : 'Provider Name',
        format : [
          'eod', /* 'fmp','finhub', 'tiingo', 'twelveData', 'alphaVantage', 'yahoo'*/
        ],
        default: null,
      },
      apiKey: {
        doc     : 'Your API Key',
        format  : '*',
        default : null,
      },
    },

  },

})


export default config

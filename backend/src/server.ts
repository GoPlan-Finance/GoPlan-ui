/**
 *
 *
 *
 *
 */

import * as express from 'express'
import * as http from 'http'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Migrations, ParseServer } from 'parse-server'
import userConfig from '../config/config'

// Load environment dependent configuration
//const env = config.get('env');
import defaultConfig from '../config/config.defaults'
import { ProviderConfigInterface } from './cloud/DataProviders/providers'
import config from './config'
import { schemas } from './Migrations/schemas'


config.load({
  ...defaultConfig,
  ...userConfig,
})

// Perform validation
config.validate({allowed: 'strict'})

// @todo, ok ok :)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.weHateGlobals_dataProviders = config.get('dataProviders') as ProviderConfigInterface[]


process.env.TZ = 'America/New_York' // here is the magical line


if (!config.get('parse.masterKey')) {
  console.error('parse.masterKey not specified')
  process.exit(-1)
}

const parseConfig = {
  auth: {
    google: {
      clientId: config.get('parse.auth.google.clientId') as string,
    },
  },
  allowClientClassCreation : false,
  databaseURI              : config.get('parse.databaseUri'),
  cloud                    : `${__dirname}/cloud/main.ts`,
  appId                    : config.get('parse.appId'),
  masterKey                : config.get('parse.masterKey') as string,
  serverURL                : config.get('parse.serverUrl'), // Don't forget to change to https if needed
  liveQuery                : {
    classNames: [ // List of classes to support for query subscriptions
      'Watchlist',
      'WatchlistItem',
      'AssetSymbol',
      'AssetProfile',
      'Transaction',
      'Holding',
      'AssetPrice',
      // '',
      // '',
    ],
  },
  serverStartComplete: async () => {
    console.log('Running Migrations')
    await Migrations.runMigrations(schemas)
    console.log('Running Migrations ... Done')
  },
}

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express()

// Serve static assets from the /public folder
// app.use('/public', express.static(path.join(__dirname, '/public')))

const api = new ParseServer(parseConfig)

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the GoPlan-Finance repo on GitHub!')
})

function runParse (api : ParseServer, server : http.Server, port : number, mountPath : string) : void {

  const httpServer = http.createServer(app)

  app.use(mountPath, api)

  httpServer.listen(port, function () {
    console.log(`GoPlan running on port ${port}.`)
  })

  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer)
}


const isHTTP = config.get('server.http.enabled')


if (isHTTP) {
  runParse(
    api,
    http.createServer(app),
    config.get('server.http.port'),
    config.get('server.http.mountPath'),
  )
}


module.exports = {
  app,
  config,
}

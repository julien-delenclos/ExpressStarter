const ExpressApp = require('../index')

let expressConfig = {
  title: 'Titre',
  version: '1.0.0',
  port: 3001,
  logger: {...console, write: console.log},
  routesDirectory: './routes',
  routes: require('./routes')
}

let expressApp = new ExpressApp(expressConfig)
expressApp.start()
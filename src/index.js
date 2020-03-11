
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cluster from 'cluster'
import os from 'os'

/** ExpressApp Class to create and start an Express Application */
class ExpressApp {
  config = {
    title: 'ExpressApp',
    version: '',
    port: 3000,
    logger: {...console, write: console.log},
    routes: undefined,
    publicDirectory: 'public'
  }

  /**
   * Constructor
   * @param {{
   *     title: string,
   *     version: string,
   *     port: number,
   *     logger: {
   *         write: (message?: any, ...optionalParams: any[]): void,
   *         info: (message?: any, ...optionalParams: any[]): void,
   *         error: (message?: any, ...optionalParams: any[]): void,
   *         debug: (message?: any, ...optionalParams: any[]): void,
   *         warn: (message?: any, ...optionalParams: any[]): void
   *     };
   *     routes: (app: express): void,
   *     publicDirectory: string
   * }} config 
   */
  constructor(config){
    Object.assign(this.config, config)
  }

  start = () => {
    if(process.env.NODE_ENV === 'development'){
      this.workerTask()
      this.masterTask()
    }
    else {
      if (cluster.isMaster) {
        let started = 0
        Array(os.cpus().length).fill().forEach(() => cluster.fork())
        cluster.on('exit', worker => this.config.logger.info(`Module #${worker.id} has exitted.`))
        cluster.on('online', worker => this.config.logger.info(`Start module #${worker.id}`))
        cluster.on('listening', (worker, address) => {
          this.config.logger.info(`Module #${worker.id} started and listening on port ${address.port}`)
          if(++started == os.cpus().length){
            this.masterTask()
          }
        })
      } else {
        this.workerTask()
      }
    }
  }

  masterTask = () => {
    this.config.logger.info(`${this.config.title} ${this.config.version} started`)
    this.config.logger.info(`URL : http://localhost:${this.config.port}`)
  }

  workerTask = () => {
    var app = express()
    app.use(
      express.json(),
      express.urlencoded({ extended: false }),
      express.static(path.join(__dirname, this.config.publicDirectory)),
      cookieParser(),
      morgan('tiny', {stream: this.config.logger}),
      (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', '*')
        next()
      }
    )
    this.config.routes(app)
    let server = app.listen(process.env.PORT || this.config.port)
    server.setTimeout(500000)
  }
}

module.exports = ExpressApp
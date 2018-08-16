import { Spool } from '@fabrix/fabrix/dist/common'
const assert = require('assert')
import * as TileliveModule from 'tilelive'
import { Tilelive } from './Tilelive'
import { Mapnik } from './Mapnik'
import * as MapnikModule from '@langa/mapnik'

const aws = require('aws-sdk')

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api  from './api/index'

// support runtime override of MAPNIK_INPUT_PLUGINS and MAPNIK_FONTS paths
if (process.env.MAPNIK_INPUT_PLUGINS) {
  MapnikModule.settings.paths.input_plugins = process.env.MAPNIK_INPUT_PLUGINS
}
if (process.env.MAPNIK_FONTS) {
  MapnikModule.settings.paths.fonts = process.env.MAPNIK_FONTS
}

export class MapnikSpool extends Spool {
  constructor (app) {
    super(app, {
      config: config,
      api: api,
      pkg: pkg
    })
  }
  /**
   * Check that the configured mapnik XML files exist, and appear valid.
   */
  validate () {
    assert(this.app.config.get('mapnik'))
    assert(this.app.config.get('mapnik.maps'))
    assert(this.app.config.get('mapnik.modules'))
    //return Tilelive.validateTileSources(this.app.config.mapnik.maps)
  }

  /**
   * Register tilelive modules
   */
  configure () {
    this.sources = { }
    this.aws = { }
    aws.config = this.app.config.get('aws.config')

    MapnikModule.register_default_fonts()
    MapnikModule.register_default_input_plugins()
  }

  /**
   * Setup tilelive, connect to datasources.
   */
  initialize () {
    const awsServices = this.app.config.aws.services
    this.log.info('Instantiating AWS Services', awsServices, '...')

    awsServices.forEach(service => {
      this.app.services.AWSService[service] = new aws[service]()
    })

    this.log.debug('Registering tilelive modules...')
    this.app.config.get('mapnik.modules').forEach(plugin => plugin.registerProtocols(TileliveModule))

    return TileliveModule.loadTileSources(this.app.config.get('mapnik.maps'), this)
  }

  /**
   * Close down the tilelive sources. clears tilecache and destroys the pool.
   */
  unload () {
    return Promise.all(
      Object.keys(this.sources).map(sourceName => {
        return new Promise((resolve, reject) => {
          this.log.debug('trailpack-tilelive: closing tilelive source', sourceName)
          const source = this.sources[sourceName]
          source.close(resolve)
        })
      }))
  }

  get tl () {
    return TileliveModule
  }
}

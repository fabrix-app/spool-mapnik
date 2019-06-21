import { Spool } from '@fabrix/fabrix/dist/common'
const assert = require('assert')

import { Tilelive } from './Tilelive'
const MapnikModule = require('mapnik')
const TileliveModule = require('@mapbox/tilelive')
import aws from 'aws-sdk'

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

if (MapnikModule.register_default_fonts) {
  MapnikModule.register_default_fonts()
}
if (MapnikModule.register_system_fonts) {
  MapnikModule.register_system_fonts()
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
  async validate () {
    assert(this.app.config.get('mapnik'))
    assert(this.app.config.get('mapnik.maps'))
    assert(this.app.config.get('mapnik.modules'))
    // return Tilelive.validateTileSources(TileliveModule, this.app.config.get('mapnik.maps'))
    return Promise.resolve()
  }

  /**
   * Register tilelive modules
   */
  async configure () {
    this.sources = { }
    this.aws = { }
    aws.config = this.app.config.get('aws.config')

    // if (MapnikModule.register_default_fonts) {
    //   MapnikModule.register_default_fonts()
    // }
    // if (MapnikModule.register_default_input_plugins) {
    //   MapnikModule.register_default_input_plugins()
    // }

    return Promise.resolve()
  }

  /**
   * Setup tilelive, connect to datasources.
   */
  async initialize () {
    const awsServices = this.app.config.get('aws.services')
    this.app.log.info('Instantiating AWS Services', awsServices, '...')

    awsServices.forEach(service => {
      if (service) {
        this.app.services.AWSService[service] = new aws[service]()
      }
    })

    this.app.log.debug('Registering tilelive modules...')

    const mods = this.app.config.get('mapnik.modules') || []

    mods.forEach(plugin => {
        if (plugin && plugin.registerProtocols) {
          plugin.registerProtocols(TileliveModule)
        }
        else {
          this.app.log.warn(`${plugin} does not have method registerProtocols`)
        }
      })

    return Tilelive.loadTileSources(TileliveModule, this.app.config.get('mapnik.maps'), this)
  }

  /**
   * Close down the tilelive sources. clears tilecache and destroys the pool.
   */
  async unload () {
    return Promise.all(
      Object.keys(this.sources || {}).map(sourceName => {
        return new Promise((resolve, reject) => {
          this.app.log.debug('spool-tilelive: closing tilelive source', sourceName)
          const source = this.sources[sourceName]
          try {
            source.close(resolve)
          }
          catch (err) {
            return reject(err)
          }
        })
      }))
  }

  get tl () {
    return TileliveModule
  }
}

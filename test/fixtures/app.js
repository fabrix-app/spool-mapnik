'use strict'

const path = require('path')
const _ = require('lodash')
const smokesignals = require('smokesignals')

module.exports = _.defaultsDeep({
  pkg: {
    name: require('../../package').name + '-test'
  },
  api: {
    models: { },
    controllers: { },
    services: { }
  },
  config: {
    main: {
      spools: [
        require('../../dist').MapnikSpool  // spool-mapnik
      ]
    },
    mapnik: {
      maps: {
        testmap: {
          protocol: 'mapnik:',
          pathname: path.resolve(__dirname, 'xml/hybrid_basemap.xml'),
          query: {
            tileSize: 512,
            minzoom: 2,
            maxzoom: 18,
            internal_cache: false
          }
        }
      },
      modules: [
        require('@mapbox/tilelive-mapnik')
      ]
    }

  }
}, smokesignals.FailsafeConfig)



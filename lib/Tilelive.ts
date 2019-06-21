import { cloneDeep } from 'lodash'

export const Tilelive = {
  validateTileSources (mod, sources) {
    return Promise.all(Object.keys(sources).map(name => {
      const protocol = sources[name]

      if (!protocol.protocol) {
        return
      }

      return new Promise((resolve, reject) => {
        mod.info(protocol, (err, info) => {
          const errors = mod.verify(info)

          if (err) {
            return reject(err)
          }
          if (errors && errors.length) {
            return reject(new Error(`Tile source [${name}] invalid: ${errors}`))
          }

          resolve(info)
        })
      })
    }))
  },

  loadTileSources (mod, sources: {[key: string]: any} = {}, spool) {
    const _map = Object.keys(sources) || []

    if (_map.length === 0) {
      return Promise.all([])
    }

    return Promise.all(_map.map(name => {
      const protocol = sources[name]

      if (!protocol.protocol) {
        return Promise.resolve({})
      }

      return new Promise((resolve, reject) => {
        spool.log.debug('Loading TileliveModule map source', name, '...')

        if (!mod.load) {
          return resolve({})
        }

        mod.load(cloneDeep(protocol), (err, source) => {
          if (err) {
            return reject(err)
          }

          // source.xml = fs.readFileSync(protocol.pathname).toString()
          // source.options = protocol.query || { }
          spool.sources[name] = source
          resolve({})
        })
      })
    }))
  }
}

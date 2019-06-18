import { dirname } from 'path'
import { readFileSync } from 'fs'

export const Mapnik = {
  loadXml (sources, pack) {
    return Object.keys(sources).map(name => {
      const config = sources[name]

      if (config.protocol) {
        return
      }

      const xml = readFileSync(config.pathname).toString()
      const options = {
        base: dirname(config.pathname)
      }
      pack.sources[name] = { xml, options }
    })
  }
}


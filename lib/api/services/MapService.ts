// tslint:disable:no-shadowed-variable

import { FabrixService as Service } from '@fabrix/fabrix/dist/common'
const mapnik = require('mapnik')

mapnik.Logger.setSeverity(mapnik.Logger.DEBUG)

/**
 * @module MapService
 * @description TODO document Service
 */
export class MapService extends Service {

  /**
   * @param source String mapnik source
   * @param map.bbox Array The bounding box of the map (w, s, e, n)
   * @param map.width Number The width of the output image in pixels
   * @param map.height Number The height of the output image in pixels
   */
  getMap(source, { bbox: [ w, s, e, n], width, height, options = {} }) {
    const configFile = this.app.config.get(`mapnik.maps.${source}.pathname`)
    const map = new mapnik.Map(parseInt(width, 10), parseInt(height, 10))

    return new Promise((resolve, reject) => {
      map.load(configFile, (err, map) => {
        if (err) {
          this.app.log.warn(err)
          return reject(err)
        }

        map.extent = [ w, s, e, n ]

        const image = new mapnik.Image(parseInt(width, 10), parseInt(height, 10))

        this.app.log.debug(`MapService.getMap RENDERING src=${source} w=${width} h=${height}`)
        map.render(image, { scale: 1, buffer_size: 1, options: options }, (err, image) => {
          if (err) {
            return reject(err)
          }

          this.app.log.debug(`MapService.getMap ENCODING IMAGE src=${source} w=${width} h=${height}`)
          image.encode('png', (err, buffer) => {
            if (err) {
              return reject(err)
            }

            resolve({ buffer, headers: { 'Content-Type': 'image/png' } })
          })
        })
      })
    })
  }

  getTile (source, { x, y, z }) {
    return this.validateTileParameters(source, {x, y, z})
      .then(({x, y, z}) => {
        return this.downloadTile(source, {x, y, z})
      })
      .then(({tile, headers}) => {
        if (tile && headers) {
          return { tile, headers }
        }

        return this.renderTile(source, {x, y, z})
          .then(({ tile, headers }) => {
            // async. do not wait for tile upload. return immediately
            process.nextTick(() => this.uploadTile(source, {x, y, z}, { tile, headers }))

            return { tile, headers }
          })
      })
  }

  downloadTile (source, {x, y, z}) {
    const s3cache = this.app.config.get(`mapnik.s3cache.${source}`)
    const AWSService = this.app.services.AWSService
    const t0 = Date.now()

    return new Promise((resolve, reject) => {
      AWSService.S3.getObject({
        Bucket: s3cache.Bucket,
        Key: s3cache.getKey({ x, y, z })
      }, (err, data) => {
        if (err && err.name === 'NoSuchKey') {
          this.app.log.info(`Tile cache miss: ${source}/${z}/${x}/${y}`)
          resolve()
        }
        else if (err) {
          this.app.log.warn('S3 Error:', err)
          resolve()
        }
        else if (Buffer.isBuffer(data.Body)) {
          this.app.log.info(`Retrieved tile ${source}/${z}/${x}/${y} from s3 in ${(Date.now() - t0)}ms`)
          resolve({
            tile: data.Body,
            headers: {
              'Content-Type': data.ContentType
            }
          })
        }
        else {
          this.app.log.warn(`Tile from S3 ${source}/${z}/${x}/${y} is not a buffer.`)
          resolve()
        }
      })
    })
  }

  uploadTile (source, {x, y, z}, { tile, headers }) {
    const AWSService = this.app.services.AWSService
    const s3cache = this.app.config.get(`mapnik.s3cache.${source}`)

    this.app.log.debug(`Caching tile ${source}/${z}/${x}/${y} in bucket ${s3cache.Bucket}...`)

    const t1 = Date.now()
    AWSService.S3.putObject({
      Bucket: s3cache.Bucket,
      ContentType: headers['Content-Type'],
      Key: s3cache.getKey({ x, y, z }),
      Body: tile
    }, (err, data) => {
      if (err) {
        this.app.log.warn('S3 Cache failed on tile [', z, x, y, ']:', err)
      }
      else {
        this.app.log.info(`Cached tile ${source}/${z}/${x}/${y} in ${(Date.now() - t1)}ms`)
      }
    })
  }

  renderTile (source, {x, y, z}) {
    const t0 = Date.now()

    return new Promise((resolve, reject) => {
      this.app.spools.mapnik.sources[source].getTile(z, x, y, (err, tile, headers) => {
        if (err) {
          return reject(err)
        }

        this.app.log.debug(`Tile rendered: ${source}/${z}/${x}/${y},`,
          `size=${Math.round(tile.length / 1024)}kb`,
          `elapsed=${(Date.now() - t0)}ms`)

        resolve({ tile, headers })
      })
    })
  }

  validateTileParameters (source, {x, y, z}) {
    const Source = this.app.spools.mapnik.sources[source]
    x = parseInt(x, 10)
    y = parseInt(y, 10)
    z = parseInt(z, 10)

    if (!Source) {
      return Promise.reject(new Error(`Tile source "${source}" is not available.`))
    }

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return Promise.reject(new Error(`Tile coordinates [z=${z}, x=${x}, y=${y}] invalid.`))
    }

    return Promise.resolve({x, y, z})
  }
}


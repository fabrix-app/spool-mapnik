# spool-mapnik

[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Follow @FabrixApp on Twitter][twitter-image]][twitter-url]

Setup a Map Server using [Fabrix](https://fabrix.app), [Mapnik](http://mapnik.org/),
and [Tilelive](https://github.com/mapbox/tilelive). Supports tile caching with [S3](https://aws.amazon.com/s3/).

## Compatibility
- Node 6 or higher
- Mapnik 3.0.9 or higher (tested on 3.0.9)
- OSX or Linux (binaries pre-built for `linux` and `darwin` platforms)

## Install

```sh
$ npm install --save spool-mapnik
```

## Configure

```js
// config/main.ts
import { MapnikSpool } from '@fabrix/spool-mapnik'
export const main = {
  spools: [
    // ... other spools
    MapnikSpool
  ]
}
```

```js
// config/mapnik.ts
const path = require('path')
export const mapnik = {
  /**
   * Define paths to mapnik map configs
   */
  maps: {
    basemap: {
      pathname: path.resolve(__dirname, 'basemap.xml')
    },
    someOverlay: {
      pathname: path.resolve(__dirname, 'vector_overlay.xml')
    }
  },
  /**
   * Additional Tilelive protocols (e.g. vector)
   */
  protocols: [
    require('tilelive-additionalplugin')
  ]
}
```

## License
MIT

[npm-image]: https://img.shields.io/npm/v/@fabrix/spool-mapnik.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@fabrix/spool-mapnik
[ci-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-mapnik/master.svg
[ci-url]: https://circleci.com/gh/fabrix-app/spool-mapnik/tree/master
[daviddm-image]: http://img.shields.io/david/fabrix-app/spool-mapnik.svg?style=flat-square
[daviddm-url]: https://david-dm.org/fabrix-app/spool-mapnik
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/fabrix-app/fabrix
[twitter-image]: https://img.shields.io/twitter/follow/FabrixApp.svg?style=social
[twitter-url]: https://twitter.com/FabrixApp
[coverage-image]: https://img.shields.io/codeclimate/coverage/github/fabrix-app/spool-mapnik.svg?style=flat-square
[coverage-url]: https://codeclimate.com/github/fabrix-app/spool-mapnik/coverage

'use strict'

const assert = require('assert')

describe('Spool', () => {
  let spool
  before(() => {
    spool = global.app.spools.mapnik
  })
  it.skip('TODO should be loaded into the app.spools collection', () => {
    assert(spool)
  })
  describe('#validate', () => {
    it.skip('TODO test')
  })
  describe('#initialize', () => {
    it('should register default tilelive protocols (mapnik)', () => {
      assert(spool.tl.protocols['mapnik:'])
    })
  })
  describe('#initialize', () => {
    it.skip('TODO test')
  })
})

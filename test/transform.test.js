const { strictEqual, rejects } = require('assert')
const { createReadStream } = require('fs')
const { readFile } = require('fs/promises')
const { join } = require('path')
const getStream = require('get-stream')
const { isReadable, isWritable } = require('isstream')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const ns = require('./namespaces.js')
const transform = require('../transform.js')

const simpleXmlFile = join(__dirname, 'support/simple.xml')
const simpleMappingFile = join(__dirname, 'support/simple.carml.ttl')

describe('transform', () => {
  it('should be a factory', () => {
    strictEqual(typeof transform, 'function')
  })

  it('should return a duplex stream', async () => {
    const stream = await transform({ mappingFile: simpleMappingFile })

    strictEqual(isReadable(stream), true)
    strictEqual(isWritable(stream), true)

    stream.destroy()
  })

  it('should transform the given XML stream to a QuadStream', async () => {
    const input = createReadStream(simpleXmlFile)
    const stream = await transform({ mappingFile: simpleMappingFile })

    input.pipe(stream)
    const result = await getStream.array(stream)

    strictEqual(result.length > 0, true)
    strictEqual(result[0].termType, 'Quad')
  })

  it('should transform the given XML stream according to the given mappingFile', async () => {
    const input = createReadStream(simpleXmlFile)
    const stream = await transform({ mappingFile: simpleMappingFile })

    input.pipe(stream)
    const result = await getStream.array(stream)

    strictEqual(result.length, 1)
    strictEqual(result[0].equals(rdf.quad(ns.ex('subject/1234'), ns.ex.value, rdf.literal('1234'))), true)
  })

  it('should transform the given XML stream according to the given mapping Buffer', async () => {
    const input = createReadStream(simpleXmlFile)
    const stream = await transform({ mapping: await readFile(simpleMappingFile) })

    input.pipe(stream)
    const result = await getStream.array(stream)

    strictEqual(result.length, 1)
    strictEqual(result[0].equals(rdf.quad(ns.ex('subject/1234'), ns.ex.value, rdf.literal('1234'))), true)
  })

  it('should transform the given XML stream according to the given mapping String', async () => {
    const input = createReadStream(simpleXmlFile)
    const stream = await transform({ mapping: (await readFile(simpleMappingFile)).toString() })

    input.pipe(stream)
    const result = await getStream.array(stream)

    strictEqual(result.length, 1)
    strictEqual(result[0].equals(rdf.quad(ns.ex('subject/1234'), ns.ex.value, rdf.literal('1234'))), true)
  })

  it('should transform the given XML stream according to the given mapping stream', async () => {
    const input = createReadStream(simpleXmlFile)
    const stream = await transform({ mapping: createReadStream(simpleMappingFile) })

    input.pipe(stream)
    const result = await getStream.array(stream)

    strictEqual(result.length, 1)
    strictEqual(result[0].equals(rdf.quad(ns.ex('subject/1234'), ns.ex.value, rdf.literal('1234'))), true)
  })

  it('should handle transform errors', async () => {
    const input = createReadStream(simpleXmlFile)
    const stream = await transform({ mapping: 'test' })

    input.pipe(stream)

    await rejects(async () => {
      await getStream.array(stream)
    }, err => {
      strictEqual(err.message.includes('carml'), true)
      strictEqual(err.message.includes('code'), true)
      strictEqual(err.message.includes('Exception in'), true)

      return true
    })
  })
})

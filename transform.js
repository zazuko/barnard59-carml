const { spawn } = require('child_process')
const { resolve } = require('path')
const N3Parser = require('@rdfjs/parser-n3')
const duplexify = require('duplexify')
const getStream = require('get-stream')
const rdf = require('rdf-ext')
const { finished } = require('readable-stream')
const temp = require('./lib/temp.js')

function carmlCli ({ mappingFile, onError }) {
  const carml = spawn('java', [
    '-jar', transform.jar,
    'map',
    '--format=ttl',
    '-m', mappingFile,
    '-of', 'nt'
  ])

  carml.on('exit', async code => {
    if (code !== 0) {
      const message = await getStream(carml.stderr)

      onError(new Error(`carml exit with code ${code}:\n${message}`))
    }
  })

  return carml
}

async function transform ({ mapping, mappingFile }) {
  const onFinished = []

  if (mapping) {
    const { cleanup, path } = await temp(mapping)

    onFinished.push(cleanup)
    mappingFile = path
  }

  const carml = carmlCli({ mappingFile, onError: err => stream.destroy(err) })
  const parser = new N3Parser({ factory: rdf })
  const quadStream = parser.import(carml.stdout)
  const stream = duplexify.obj(carml.stdin, quadStream)

  finished(quadStream, () => {
    onFinished.forEach(callback => callback())
  })

  return stream
}

transform.jarUrl = new URL('http://ktk.netlabs.org/misc/rdf/carml-jar-1.0.0-SNAPSHOT-0.4.4.jar')
transform.jar = resolve(__dirname, './carml-cli.jar')

module.exports = transform

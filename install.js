const { createWriteStream } = require('fs')
const { promisify } = require('util')
const fetch = require('node-fetch')
const { finished } = require('readable-stream')
const { jar, jarUrl } = require('./transform.js')

async function download (url, filename) {
  const output = createWriteStream(filename)
  const res = await fetch(url)

  res.body.pipe(output)

  return promisify(finished)(output)
}

async function install () {
  await download(jarUrl, jar)
}

install()

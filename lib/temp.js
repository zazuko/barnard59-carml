const { createWriteStream, writeFile } = require('fs')
const { promisify } = require('util')
const { finished } = require('readable-stream')
const { file } = require('tmp-promise')

async function streamToFile (input, path) {
  const output = createWriteStream(path)

  input.pipe(output)

  await promisify(finished)(output)
}

async function temp (content) {
  const result = await file({ prefix: 'carml-' })

  if (typeof content === 'string' || Buffer.isBuffer(content) || content.name === 'Uint8Array') {
    await promisify(writeFile)(result.path, content)
  } else {
    await streamToFile(content, result.path)
  }

  return result
}

module.exports = temp

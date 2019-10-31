const fs = require('fs')
const path = require('path')

const helpers = {
  resolve(relativePath) {
    return path.resolve(__dirname, '..', relativePath)
  },
  deleteFile(filePath) {
    if (filePath) {
      const existed = fs.existsSync(filePath)

      existed && fs.unlink(filePath, error => {
        error && console.log(error)
      })
    }
  },
  accessLogStream() {
    return fs.createWriteStream(helpers.resolve('access.log'), {
      flags: 'a'
    })
  }
}

module.exports = helpers



const fs = require('fs')
const path = require('path')

module.exports.resolve = (relativePath) => path.resolve(__dirname, '..', relativePath)

module.exports.deleteFile = (filePath) => {
  if (filePath) {
    const existed = fs.existsSync(filePath)

    existed && fs.unlink(filePath, error => {
      error && console.log(error)
    })
  }
}

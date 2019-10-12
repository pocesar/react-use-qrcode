const path = require('path')
const fs = require('fs')

const indexPath = path.join(__dirname, 'lib', 'index.js')

fs.writeFileSync(
  indexPath,
  fs
    .readFileSync(indexPath, { encoding: 'utf8' })
    .replace('./qrcode.worker.ts', './qrcode.worker.js'),
  { encoding: 'utf8' }
)
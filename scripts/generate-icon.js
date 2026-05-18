const { Resvg } = require('@resvg/resvg-js')
const pngToIco = require('png-to-ico')
const fs = require('fs')
const path = require('path')

const SIZES = [16, 32, 48, 64, 128, 256]
const SVG_PATH = path.join(__dirname, '../assets/icon.svg')
const BUILD_DIR = path.join(__dirname, '../build')

async function main() {
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true })

  const svgContent = fs.readFileSync(SVG_PATH, 'utf-8')
  const pngPaths = []

  for (const size of SIZES) {
    const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: size } })
    const buffer = resvg.render().asPng()
    const pngPath = path.join(BUILD_DIR, `icon-${size}.png`)
    fs.writeFileSync(pngPath, buffer)
    pngPaths.push(pngPath)
    console.log(`  ✓ ${size}x${size}`)
  }

  // Save 256x256 as the main PNG (used by electron-builder for Linux/Mac)
  const resvg256 = new Resvg(svgContent, { fitTo: { mode: 'width', value: 256 } })
  fs.writeFileSync(path.join(BUILD_DIR, 'icon.png'), resvg256.render().asPng())
  console.log('  ✓ icon.png (256x256)')

  // Combine all sizes into a single .ico file
  const icoBuffer = await pngToIco(pngPaths)
  fs.writeFileSync(path.join(BUILD_DIR, 'icon.ico'), icoBuffer)
  console.log('  ✓ icon.ico (multi-size)')

  // Clean up individual size PNGs
  pngPaths.forEach((p) => fs.unlinkSync(p))

  console.log('\nIcon generation complete!')
}

main().catch((err) => { console.error(err); process.exit(1) })

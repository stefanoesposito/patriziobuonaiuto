// Compose the real painting photograph and editable typography. No generated artwork.
const sharp = require('sharp');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const source = process.argv[2];
  if (!source) throw new Error('Pass the corrected portrait photograph as the first argument.');
  const output = path.resolve(__dirname, '../web/public/og');
  await mkdir(output, { recursive: true });
  const photo = await sharp(source)
    .extract({ left: 0, top: 65, width: 1536, height: 1810 })
    .resize(590, 630, { fit: 'cover', position: 'right top' })
    .png().toBuffer();
  const fade = Buffer.from(`<svg width="1200" height="630"><defs><linearGradient id="fade"><stop stop-color="#14120f"/><stop offset="1" stop-color="#14120f" stop-opacity="0"/></linearGradient></defs><rect x="610" width="140" height="630" fill="url(#fade)"/></svg>`);
  for (const lang of ['it', 'en']) {
    const it = lang === 'it';
    const type = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <path d="M72 97H122" stroke="#c6a873" stroke-width="2"/>
      <text x="72" y="140" fill="#c6b18f" font-family="Arial" font-size="13" letter-spacing="3">${it ? 'L’ARTE ATTRAVERSA IL TEMPO' : 'ART TRANSCENDS TIME'}</text>
      <g fill="#f2e8d8" font-family="Georgia,serif" font-size="73">
        <text x="68" y="247">Patrizio</text><text x="68" y="332">Buonaiuto</text>
      </g>
      <g fill="#d3c8b8" font-family="Arial" font-size="24">
        <text x="72" y="402">${it ? 'Copie d’autore e' : 'Art replicas and'}</text>
        <text x="72" y="437">${it ? 'dipinti personalizzati' : 'personalised paintings'}</text>
      </g>
      <text x="72" y="553" fill="#b8a58a" font-family="Arial" font-size="16">patriziobuonaiuto.vercel.app</text>
    </svg>`);
    const file = path.join(output, `patrizio-buonaiuto-${lang}.jpg`);
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#14120f' } })
      .composite([{ input: photo, left: 610, top: 0 }, { input: fade, left: 0, top: 0 }, { input: type, left: 0, top: 0 }])
      .withIccProfile('srgb').jpeg({ quality: 90, mozjpeg: true }).toFile(file);
    console.log(file);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pngPath = path.join(__dirname, '../public/logo.png');
const icoPath = path.join(__dirname, '../public/logo.ico');

if (!fs.existsSync(pngPath)) {
  console.error("PNG logo not found!");
  process.exit(1);
}

const pngBuffer = fs.readFileSync(pngPath);
const size = pngBuffer.length;

const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);     // Reserved
header.writeUInt16LE(1, 2);     // Type: Icon
header.writeUInt16LE(1, 4);     // Count: 1 image

header.writeUInt8(0, 6);        // Width: 256 (0 is used for 256)
header.writeUInt8(0, 7);        // Height: 256 (0 is used for 256)
header.writeUInt8(0, 8);        // Color count: 0
header.writeUInt8(0, 9);        // Reserved

header.writeUInt16LE(1, 10);    // Planes: 1
header.writeUInt16LE(32, 12);   // Bit count: 32

header.writeUInt32LE(size, 14); // Image size in bytes
header.writeUInt32LE(22, 18);   // Offset: 22 (header size)

const icoBuffer = Buffer.concat([header, pngBuffer]);
fs.writeFileSync(icoPath, icoBuffer);
console.log("Successfully created ICO file at public/logo.ico!");

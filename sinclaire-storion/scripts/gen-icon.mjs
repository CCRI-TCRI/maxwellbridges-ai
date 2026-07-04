// Generates a 1024x1024 app icon PNG (no external deps) for `tauri icon`.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const S = 1024;
const buf = Buffer.alloc(S * S * 4);

// CRC table
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const lerp = (a, b, t) => a + (b - a) * t;
function mix(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

const sky = [14, 165, 233];
const indigo = [79, 70, 229];
const cx = S / 2;
const cy = S / 2;
const radius = 168; // corner radius
const lensOuter = 360;
const lensRing = 300;
const lensInner = 250;

function roundedAlpha(x, y) {
  // distance outside rounded rect -> alpha
  const rx = Math.max(0, Math.abs(x - cx) - (S / 2 - radius));
  const ry = Math.max(0, Math.abs(y - cy) - (S / 2 - radius));
  const d = Math.hypot(rx, ry) - radius;
  if (d <= 0) return 1;
  if (d >= 1.5) return 0;
  return 1 - d / 1.5;
}

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    const tg = (x + y) / (2 * S); // diagonal gradient
    let [r, g, b] = mix(sky, indigo, tg);

    const dl = Math.hypot(x - cx, y - cy);
    // lens rings
    if (dl < lensOuter && dl >= lensRing) {
      // white ring
      [r, g, b] = [244, 246, 250];
    } else if (dl < lensRing && dl >= lensInner) {
      [r, g, b] = mix([20, 24, 34], [40, 48, 70], (dl - lensInner) / (lensRing - lensInner));
    } else if (dl < lensInner) {
      // dark lens glass with radial highlight toward top-left
      const hx = cx - 90;
      const hy = cy - 90;
      const hd = Math.hypot(x - hx, y - hy);
      const hl = Math.max(0, 1 - hd / 260);
      const base = mix([17, 19, 26], [35, 45, 70], hl * 0.9);
      [r, g, b] = base;
      // small specular dot
      const sd = Math.hypot(x - (cx - 120), y - (cy - 120));
      if (sd < 34) {
        const t = 1 - sd / 34;
        [r, g, b] = mix(base, [230, 240, 255], t);
      }
    }

    const a = roundedAlpha(x, y);
    buf[i] = Math.round(r);
    buf[i + 1] = Math.round(g);
    buf[i + 2] = Math.round(b);
    buf[i + 3] = Math.round(a * 255);
  }
}

// Build raw scanlines with filter byte 0
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const idat = deflateSync(raw, { level: 9 });

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync(new URL("../app-icon.png", import.meta.url), png);
console.log("wrote app-icon.png", png.length, "bytes");

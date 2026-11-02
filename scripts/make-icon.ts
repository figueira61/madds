// Generates public/icon.svg from Madds' happy portrait (run: npx vite-node scripts/make-icon.ts).
import { writeFileSync } from 'node:fs';
import { PORTRAITS_SHEET, PORTRAIT_FRAME } from '../src/art/sprites/portraits';
import { PALETTE } from '../src/art/palette';

const rows = PORTRAITS_SHEET.frames[PORTRAIT_FRAME['madds-happy']];
const rects: string[] = [];
rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETTE[ch]}"/>`)));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 56 56" shape-rendering="crispEdges"><rect x="-4" y="-4" width="56" height="56" rx="10" fill="#2457c9"/>${rects.join('')}</svg>\n`;
writeFileSync('public/icon.svg', svg);
console.log('public/icon.svg', rects.length, 'pixels');

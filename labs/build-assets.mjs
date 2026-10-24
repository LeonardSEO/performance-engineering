import sharp from 'sharp';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const dir=fileURLToPath(new URL('./generated/',import.meta.url));fs.mkdirSync(dir,{recursive:true});
const shapes=Array.from({length:80},(_,i)=>`<circle cx="${(i*137)%2400}" cy="${(i*97)%1350}" r="${40+i%7*12}" fill="hsl(${i*31%360},60%,55%)"/>`).join('');
const source=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1350"><defs><linearGradient id="g"><stop stop-color="#11251b"/><stop offset="1" stop-color="#649c42"/></linearGradient></defs><rect width="2400" height="1350" fill="url(#g)"/>${shapes}</svg>`);
await sharp(source).png().toFile(dir+'hero-original.png');
for(const width of [800,1600])await sharp(source).resize(width).webp({quality:78}).toFile(dir+`hero-${width}.webp`);
console.log('Built original and responsive images from the same synthetic artwork.');

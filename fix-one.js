import https from 'https';
import fs from 'fs';
function dl(url, file) {
  return new Promise((res, rej) => {
    const ws = fs.createWriteStream(file);
    https.get(url, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        dl(r.headers.location.startsWith('http') ? r.headers.location : 'https://images.unsplash.com' + r.headers.location, file).then(res).catch(rej);
        return;
      }
      r.pipe(ws);
      ws.on('finish', () => ws.close(res));
    }).on('error', rej);
  });
}
dl('https://images.unsplash.com/photo-1589310263683-5858cf099496?auto=format&fit=crop&w=1200&q=80', 'public/images/products/photo-1589310263683-5858cf099496.jpg').then(() => { const s=fs.statSync('public/images/products/photo-1589310263683-5858cf099496.jpg').size; console.log('OK size=', s); if(s<100){ console.log('STILL BAD');} }).catch(e => console.log('ERR', e.message));

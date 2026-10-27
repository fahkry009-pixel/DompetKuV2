// Ubah v1 -> v2 setiap kali kamu mengganti file aplikasi, supaya HP memuat versi terbaru. Data IndexedDB tidak tersentuh.
const C='dompetku-v2',F=['./','index.html','style.css','db.js','app.js'],X='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(async c=>{await c.addAll(F.map(u=>new Request(u,{cache:'reload'})));try{await c.add(new Request(X,{mode:'cors'}))}catch(_){}}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&(e.request.url.startsWith(self.location.origin)||e.request.url===X)){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl))}return res})).catch(()=>caches.match('index.html')))});

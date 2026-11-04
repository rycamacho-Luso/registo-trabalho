/* Registo de Trabalho — funcionamento sem internet.
   A app procura sempre primeiro a versão mais recente na internet; sem rede, abre a última guardada. */
const CACHE='registo-trabalho-v1';
const BASE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon.png'];
const EXTERNOS=['www.gstatic.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);const meu=u.origin===location.origin;
  if(!meu&&!EXTERNOS.includes(u.hostname))return;           // Firebase/Firestore e outros: sempre direto à internet
  e.respondWith(fetch(r).then(resp=>{
    if(resp&&(resp.ok||resp.type==='opaque')){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
    return resp;
  }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined))));
});

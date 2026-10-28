// Footsteps offline cache. Change VERSION whenever any file here changes, so phones pick up the new copy.
const VERSION='footsteps-2026-10-28-10';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET') return;const u=new URL(r.url);
  // the two Google fonts: kept after the first online start, then served from the phone
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(VERSION+'-fonts').then(async c=>{const hit=await c.match(r);if(hit) return hit;
      try{const res=await fetch(r);if(res.ok||res.type==='opaque') c.put(r,res.clone());return res}catch(err){return new Response('',{status:504})}}));return}
  if(u.origin!==location.origin) return;
  // the app itself: from the phone first, refreshed in the background when there is a connection
  e.respondWith(caches.open(VERSION).then(async c=>{const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('index.html'):null);
    const net=fetch(r).then(res=>{if(res.ok) c.put(r,res.clone());return res}).catch(()=>null);
    return hit||(await net)||new Response('Offline and not cached yet',{status:503})}))});

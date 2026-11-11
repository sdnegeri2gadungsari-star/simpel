#!/usr/bin/env node
/* Membuat halaman statis tiap berita/pengumuman: /berita/<judul>/index.html, daftar di /berita/, dan sitemap.xml.
   Dijalankan otomatis oleh .github/workflows/berita.yml (tiap hari + bisa dijalankan manual). Butuh Node 18+. Tanpa paket tambahan.
   Uji lokal:  node tools/buat-berita.js   (alamat /exec dibaca dari index.html; bisa ditimpa dengan variabel EXEC) */
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),SITE='https://sdn2gadungsari.sch.id',MARK='<!--SIMPEL-BERITA-->';
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const tgl=t=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(t||'');return m?`${+m[3]} ${BLN[+m[2]-1]} ${m[1]}`:''};
function slug(it,pakai){
  let s=String(it.judul).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60).replace(/-+$/,'')||'berita';
  s=(it.tanggal?it.tanggal+'-':'')+s;let k=s,n=2;while(pakai.has(k))k=s+'-'+n++;pakai.add(k);return k;
}
function ringkas(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,'')+'…':s}
const CSS=`*{box-sizing:border-box}body{margin:0;font:16px/1.7 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#17263d;background:#f4f7fc}
header{background:#0a2f66;color:#fff}header .w,main,footer .w{max-width:860px;margin:0 auto;padding:0 18px}
header .w{display:flex;align-items:center;gap:12px;padding-top:12px;padding-bottom:12px;flex-wrap:wrap}header a{color:#fff;text-decoration:none}
header img{width:40px;height:40px;border-radius:10px;background:#fff}header b{font-size:16px}header nav{margin-left:auto;display:flex;gap:14px;flex-wrap:wrap;font-size:14px}
header nav a{opacity:.9}main{padding:22px 18px 40px}.crumb{font-size:13px;color:#61738c;margin-bottom:10px}.crumb a{color:#1479dc}
article{background:#fff;border:1px solid #dce7f3;border-radius:18px;padding:24px 26px;box-shadow:0 8px 24px rgba(28,67,106,.06)}
.tag{display:inline-block;font-size:12px;font-weight:700;color:#0e4b9a;background:#e6f2ff;border-radius:999px;padding:3px 11px}
h1{margin:10px 0 4px;font-size:clamp(24px,4vw,32px);line-height:1.25;color:#0e2a52}.tg{color:#61738c;font-size:14px;margin-bottom:16px}
article img.h{width:100%;height:auto;border-radius:14px;margin:6px 0 16px;display:block}article p{margin:0 0 14px;overflow-wrap:anywhere}article p.lead{font-weight:600;color:#0e2a52;font-size:17px}
.bt{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.bt a{display:inline-block;padding:10px 18px;border-radius:12px;font-weight:700;text-decoration:none;font-size:14px;background:#1479dc;color:#fff}.bt a.s{background:#e6f2ff;color:#0e4b9a}
h2{font-size:18px;margin:28px 0 8px;color:#0e2a52}ul.l{list-style:none;margin:0;padding:0}ul.l li{padding:10px 0;border-bottom:1px solid #e3ebf5}ul.l a{color:#0e4b9a;font-weight:600;text-decoration:none}ul.l small{display:block;color:#61738c}
footer{background:#0a2f66;color:#cfe0f7;font-size:13px;padding:18px 0}footer a{color:#9cc7ff}`;
function kepala(judul,desc,url,og,extra){
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${MARK}
<title>${E(judul)}</title>
<meta name="description" content="${E(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta name="theme-color" content="#0a2f66">
<meta property="og:type" content="article">
<meta property="og:site_name" content="SD Negeri 2 Gadungsari">
<meta property="og:locale" content="id_ID">
<meta property="og:title" content="${E(judul)}">
<meta property="og:description" content="${E(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${E(og)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${extra||''}<style>${CSS}</style>
</head>
<body>
<header><div class="w"><a href="/" style="display:flex;align-items:center;gap:10px"><img src="/favicon-192.png" alt="Logo SDN 2 Gadungsari"><b>SD Negeri 2 Gadungsari</b></a>
<nav aria-label="Menu utama"><a href="/">Beranda</a><a href="/profil/">Profil</a><a href="/berita/">Berita</a><a href="/agenda/">Agenda</a><a href="/galeri/">Galeri</a><a href="/kontak/">Kontak</a></nav></div></header>
`;
}
const kaki=`<footer><div class="w">© SD Negeri 2 Gadungsari, Tirtoyudo, Kabupaten Malang · <a href="/">Buka aplikasi SIMPEL</a></div></footer>
</body>
</html>
`;
function halaman(it,s,lain){
  const url=`${SITE}/berita/${s}/`,desc=ringkas(it.ringkasan||it.judul,158),og=it.gambar||SITE+'/favicon-512.png',jn=it.jenis==='PENGUMUMAN'?'Pengumuman':'Berita';
  const ld={'@context':'https://schema.org','@type':'NewsArticle',headline:it.judul.slice(0,110),description:desc,inLanguage:'id',mainEntityOfPage:url,
    author:{'@type':'Organization',name:'SD Negeri 2 Gadungsari'},publisher:{'@type':'Organization',name:'SD Negeri 2 Gadungsari',logo:{'@type':'ImageObject',url:SITE+'/favicon-512.png'}}};
  if(it.isi)ld.articleBody=it.isi.slice(0,5000);
  if(it.tanggal){ld.datePublished=it.tanggal;ld.dateModified=it.tanggal}if(it.gambar)ld.image=[it.gambar];
  const para=s=>String(s||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${E(x)}</p>`).join('\n');
  const isi=(it.isi?(it.ringkasan?`<p class="lead">${E(it.ringkasan.replace(/\s*\n+\s*/g,' '))}</p>\n`:'')+para(it.isi):para(it.ringkasan))||`<p>${E(it.judul)}</p>`;
  const rel=lain.filter(x=>x.s!==s).slice(0,6).map(x=>`<li><a href="/berita/${x.s}/">${E(x.it.judul)}</a>${x.it.tanggal?`<small>${tgl(x.it.tanggal)}</small>`:''}</li>`).join('');
  return kepala(`${it.judul} — SD Negeri 2 Gadungsari`,desc,url,og,`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,'\\u003c')}</script>\n`)
  +`<main><div class="crumb"><a href="/">Beranda</a> › <a href="/berita/">Berita</a> › ${E(jn)}</div>
<article><span class="tag">${E(jn)}</span><h1>${E(it.judul)}</h1><div class="tg">${tgl(it.tanggal)}</div>
${it.gambar?`<img class="h" src="${E(it.gambar)}" alt="${E(it.judul)}" loading="lazy" referrerpolicy="no-referrer">\n`:''}${isi}
<div class="bt">${it.link?`<a href="${E(it.link)}" target="_blank" rel="noopener">Baca selengkapnya</a>`:''}<a class="s" href="/berita/">Berita lainnya</a></div></article>
${rel?`<h2>Berita lainnya</h2><ul class="l">${rel}</ul>`:''}</main>
`+kaki;
}
(async()=>{
  const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const exec=process.env.EXEC||((/var EXEC='([^']+)'/.exec(idx)||[])[1]);
  if(!/^https:\/\/script\.google\.com\//.test(exec||'')){console.error('Alamat /exec tidak ditemukan di index.html');process.exit(1)}
  const res=await fetch(exec+(exec.includes('?')?'&':'?')+'api=berita',{redirect:'follow'});
  const tx=await res.text();let j;try{j=JSON.parse(tx)}catch(e){console.error('Balasan bukan JSON. Pastikan BeritaStatik_Backend.gs sudah dipasang + baris doGet + Versi baru. Awal balasan:',tx.slice(0,120));process.exit(1)}
  if(!j||!Array.isArray(j.item)){console.error('Format feed tidak dikenali.');process.exit(1)}
  const dir=path.join(ROOT,'berita'),pakai=new Set(),daftar=[];
  /* slug lama dipertahankan agar alamat tidak berubah: dipetakan lewat id konten */
  let peta={};try{peta=JSON.parse(fs.readFileSync(path.join(dir,'_peta.json'),'utf8'))}catch(e){}
  Object.values(peta).forEach(v=>pakai.add(v));
  const baru={};
  j.item.forEach(it=>{
    let s=peta[it.id];if(!s){const tmp=new Set(pakai);s=slug(it,tmp);pakai.add(s)}
    baru[it.id]=s;daftar.push({it,s});
  });
  Object.assign(peta,baru);
  daftar.forEach(({it,s})=>{fs.mkdirSync(path.join(dir,s),{recursive:true});fs.writeFileSync(path.join(dir,s,'index.html'),halaman(it,s,daftar))});
  fs.writeFileSync(path.join(dir,'_peta.json'),JSON.stringify(peta,null,1)+'\n');
  /* daftar tautan statis di /berita/ (terbaca Google, disembunyikan secara visual karena aplikasi menutupi halaman) */
  const f=path.join(dir,'index.html');
  if(!fs.existsSync(f)){console.warn('PERINGATAN: berita/index.html tidak ada di repositori — daftar tautan dilewati. Unggah folder berita/ dari paket.')}else{
  let h=fs.readFileSync(f,'utf8');
  const blok=`<!--BL--><section id="bl" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden"><h2>Berita dan Pengumuman Terbaru</h2><ul>${daftar.slice(0,60).map(({it,s})=>`<li><a href="/berita/${s}/">${E(it.judul)}</a>${it.tanggal?' — '+tgl(it.tanggal):''}</li>`).join('')}</ul></section><!--/BL-->`;
  h=/<!--BL-->[\s\S]*?<!--\/BL-->/.test(h)?h.replace(/<!--BL-->[\s\S]*?<!--\/BL-->/,()=>blok):h.replace(/<script>\s*\/\* ====== GANTI/,()=>blok+'\n<script>\n/* ====== GANTI');
  if(!h.includes('<!--BL-->'))console.warn('PERINGATAN: gagal menyisipkan daftar ke berita/index.html');else fs.writeFileSync(f,h);
  }
  /* sitemap: pertahankan halaman tetap, ganti entri berita */
  const sf=path.join(ROOT,'sitemap.xml');if(!fs.existsSync(sf)){console.warn('PERINGATAN: sitemap.xml tidak ada — dilewati.');console.log('Selesai:',daftar.length,'halaman berita dibuat/diperbarui.');return}
  let sm=fs.readFileSync(sf,'utf8').split('\n').filter(l=>!/\/berita\/[^/<]+\/<\/loc>/.test(l)).join('\n');
  const ent=daftar.map(({it,s})=>`  <url><loc>${SITE}/berita/${s}/</loc>${it.tanggal?`<lastmod>${it.tanggal}</lastmod>`:''}<changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n');
  sm=sm.replace('</urlset>',ent+'\n</urlset>').replace(/\n{2,}/g,'\n');
  fs.writeFileSync(sf,sm);
  console.log('Selesai:',daftar.length,'halaman berita dibuat/diperbarui.');
})().catch(e=>{console.error(e);process.exit(1)});

/* SIMPEL — pembungkus domain sdn2gadungsari.sch.id. Dipakai oleh /login/, /guru/, /kepsek/, /admin/, /ortu/ */
(function(){
  var EXEC='https://script.google.com/macros/s/AKfycbwThmaNVSxqqtge8L6V9g6kFZl_pSS-JQSQrAUP4t-N2yb5Bq70rpoYI01clU04EuVwvQ/exec';
  var MODE=window.SIMPEL_MODE||'';
  var st=document.createElement('style');
  st.textContent='html,body{margin:0;height:100%;background:#0a2f66;overflow:hidden}'
   +'iframe{position:fixed;inset:0;width:100%;height:100%;border:0;background:#f4f7fc}'
   +'#ld{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#fff;font:600 15px system-ui,sans-serif;background:#0a2f66;transition:opacity .4s}'
   +'#ld i{width:34px;height:34px;border-radius:50%;border:4px solid rgba(255,255,255,.25);border-top-color:#fff;animation:s .9s linear infinite}'
   +'#ld a{color:#9cc7ff;font-size:13px;font-weight:500;display:none}@keyframes s{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
  var ld=document.createElement('div');ld.id='ld';ld.innerHTML='<i></i><span>Memuat SIMPEL…</span><a id="dr" href="#">Tidak tampil? Buka langsung</a>';
  document.body.appendChild(ld);
  var url=EXEC+(MODE?('?mode='+MODE+(location.search?'&'+location.search.slice(1):'')):(location.search||''));
  var f=document.createElement('iframe');
  f.src=url;f.title='SIMPEL SDN 2 Gadungsari';
  f.setAttribute('allow','geolocation; camera; microphone; clipboard-write; fullscreen; autoplay');
  f.setAttribute('allowfullscreen','');
  f.onload=function(){ld.style.opacity=0;setTimeout(function(){ld.style.display='none'},450)};
  document.body.appendChild(f);
  var d=document.getElementById('dr');d.href=url;setTimeout(function(){d.style.display='block'},8000);
})();

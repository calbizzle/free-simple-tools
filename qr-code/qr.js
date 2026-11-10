// Free Simple Tools: QR code page logic
function escWifi(s){return String(s).replace(/([\\;,:"])/g,'\\$1');}
function payload(t,v){
  if(t==='wifi'){ if(!v.ssid) return '';
    return 'WIFI:T:'+v.sec+';S:'+escWifi(v.ssid)+';'+(v.sec==='nopass'?'':'P:'+escWifi(v.pw)+';')+(v.hid?'H:true;':'')+';'; }
  if(t==='tel'){ const n=String(v.tel||'').replace(/[^\d+]/g,''); return n?'tel:'+n:''; }
  return String(v.txt||'');
}
function makeQR(text,ecl){ qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8']; const q=qrcode(0,ecl); q.addData(text,'Byte'); q.make(); return q; }
if(typeof module!=='undefined'){module.exports={escWifi,payload,makeQR};}
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id);
let cur=null;
function val(){return {txt:$('txt').value,ssid:$('ssid').value,pw:$('pw').value,sec:$('sec').value,hid:$('hid').checked,tel:$('tel').value};}
function draw(){
  const t=$('type').value; ['text','wifi','tel'].forEach(k=>$('f-'+k).hidden=(k!==t));
  const p=payload(t,val()); const cv=$('cv'),ctx=cv.getContext('2d'); ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);
  cur=null; if(!p){$('msg').textContent='Enter something to encode.';return;}
  try{cur=makeQR(p,$('ecl').value);}catch(e){$('msg').textContent='Too much data for a QR code. Shorten it or lower error correction.';return;}
  paint(cv,cur,256); $('msg').textContent=cur.getModuleCount()+'×'+cur.getModuleCount()+' modules · '+p.length+' characters';
}
function paint(cv,q,px){const n=q.getModuleCount(),m=4,s=Math.floor(px/(n+2*m))||1,w=s*(n+2*m);cv.width=cv.height=w;const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,w,w);c.fillStyle='#000';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))c.fillRect((k+m)*s,(r+m)*s,s,s);}
function dl(name,url){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();}
$('png').onclick=()=>{if(!cur)return;const c=document.createElement('canvas');paint(c,cur,+$('size').value);dl('qr-code.png',c.toDataURL('image/png'));};
$('svg').onclick=()=>{if(!cur)return;const n=cur.getModuleCount(),m=4,w=n+2*m;let d='';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(cur.isDark(r,k))d+='M'+(k+m)+' '+(r+m)+'h1v1h-1z';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+w+'" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>';
  dl('qr-code.svg',URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})));};
['type','txt','ssid','pw','sec','hid','tel','ecl'].forEach(id=>$(id).addEventListener('input',draw));
draw();
}

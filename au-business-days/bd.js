/* Business-day logic. Shared by the page and node tests. */
function isPart(h){return !!(h.note&&/^Part-day/.test(h.note));}
function isLocal(h){return !!(h.note&&/(only|Certain areas|Areas that)/.test(h.note));}
function parse(iso){var p=iso.split('-').map(Number);return Date.UTC(p[0],p[1]-1,p[2]);}
function iso(t){return new Date(t).toISOString().slice(0,10);}
function holidayMap(H,state,includeLocal){
  var m={};
  Object.keys(H).forEach(function(y){(H[y][state]||[]).forEach(function(h){
    if(isPart(h))return; if(isLocal(h)&&!includeLocal)return;
    (m[h.d]=m[h.d]||[]).push(h.n);});});
  return m;
}
/* Count business days from start to end. includeStart: count start date itself. End is always included. */
function countBusinessDays(H,state,start,end,opts){
  opts=opts||{};var m=holidayMap(H,state,opts.includeLocal);
  var a=parse(start),b=parse(end),sign=1;
  if(b<a){var t=a;a=b;b=t;sign=-1;}
  if(!opts.includeStart)a+=864e5;
  var n=0,weekend=0,hol=[],years={};
  for(var t2=a;t2<=b;t2+=864e5){
    var d=iso(t2),dow=new Date(t2).getUTCDay();years[d.slice(0,4)]=1;
    if(dow===0||dow===6){weekend++;continue;}
    if(m[d]){hol.push({d:d,n:m[d].join(' / ')});continue;}
    n++;
  }
  var missing=Object.keys(years).filter(function(y){return !H[y];});
  return {days:n*sign,weekend:weekend,holidays:hol,missingYears:missing};
}
/* Add N business days to a start date (N>=0 forwards, N<0 backwards). */
function addBusinessDays(H,state,start,N,opts){
  opts=opts||{};var m=holidayMap(H,state,opts.includeLocal);
  var t=parse(start),step=N<0?-1:1,left=Math.abs(N),guard=0;
  while(left>0&&guard++<5000){t+=step*864e5;var d=iso(t),dow=new Date(t).getUTCDay();
    if(dow===0||dow===6||m[d])continue;left--;}
  var y=iso(t).slice(0,4);
  return {date:iso(t),missingYear:!H[y]||!H[start.slice(0,4)]};
}
if(typeof module!=='undefined')module.exports={countBusinessDays:countBusinessDays,addBusinessDays:addBusinessDays,isPart:isPart,isLocal:isLocal};

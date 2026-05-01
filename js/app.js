// ── DB Helper ──────────────────────────────────────────────────────────────────
const DB = {
  get:(k)=>JSON.parse(localStorage.getItem('sab_'+k)||'null'),
  set:(k,v)=>localStorage.setItem('sab_'+k,JSON.stringify(v)),
  list:(k)=>JSON.parse(localStorage.getItem('sab_'+k)||'[]'),
  push(k,item){const a=this.list(k);a.push(item);this.set(k,a);return item;},
  update(k,id,patch){const a=this.list(k);const i=a.findIndex(x=>x.id===id);if(i>-1){a[i]={...a[i],...patch};this.set(k,a);}return a[i];}
};
const genId=(p='id')=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

// ── Session ────────────────────────────────────────────────────────────────────
const Session={
  get:()=>DB.get('session'),
  set:(s)=>DB.set('session',s),
  clear:()=>localStorage.removeItem('sab_session')
};

// ── Urgency ────────────────────────────────────────────────────────────────────
function calcUrgency(expiry){
  const days=Math.ceil((new Date(expiry)-new Date())/86400000);
  if(days<=2)return{label:'critical',days,emoji:'🔴',cls:'badge-critical'};
  if(days<=5)return{label:'warning',days,emoji:'🟠',cls:'badge-warning'};
  return{label:'safe',days,emoji:'🟢',cls:'badge-safe'};
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function toast(msg,type='success'){
  const icons={success:'✅',error:'❌',warn:'⚠️'};
  const el=document.createElement('div');
  el.className=`toast toast-${type}`;
  el.innerHTML=`<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(()=>el.classList.add('show'),10);
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),350);},3500);
}

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtDate=d=>new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const fmtTime=d=>new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
function animCount(el,target,dur=1800){
  let n=0;const step=target/(dur/16);
  const t=setInterval(()=>{n=Math.min(n+step,target);el.textContent=Math.floor(n).toLocaleString();if(n>=target)clearInterval(t);},16);
}

// ── Haversine distance (km) ────────────────────────────────────────────────────
function haversine(a,b){
  const R=6371,toRad=x=>x*Math.PI/180;
  const dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng);
  const x=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

// ── Smart Match ────────────────────────────────────────────────────────────────
function matchScore(donation,entity){
  let s=0;
  const dist=haversine(donation.location,entity.location);
  s+=Math.max(0,40-dist*8);
  const days=calcUrgency(donation.expiry).days;
  s+=days<=2?35:days<=5?18:5;
  s+=(entity.rating||4)/5*15;
  if(entity.capacity>=donation.quantity)s+=10;
  return Math.round(s);
}
function smartMatch(donations,ngos){
  return donations.filter(d=>d.status==='pending').map(d=>{
    const ranked=ngos.map(n=>({ngo:n,score:matchScore(d,n)})).sort((a,b)=>b.score-a.score);
    return{donation:d,best:ranked[0]?.ngo,score:ranked[0]?.score||0};
  }).sort((a,b)=>calcUrgency(a.donation.expiry).days-calcUrgency(b.donation.expiry).days);
}

// ── Mock seed data ─────────────────────────────────────────────────────────────
function seedData(){
  if(DB.list('donations').length>0)return;

  const donors=[
    {id:'d1',name:'Hotel Saravana',type:'donor',email:'hotel@sav.com',phone:'9876543210',location:{lat:12.935,lng:77.624,address:'Koramangala, Bangalore'},rating:4.5,registered:new Date().toISOString()},
    {id:'d2',name:'Ravi\'s Kitchen',type:'donor',email:'ravi@sav.com',phone:'9876543211',location:{lat:12.978,lng:77.641,address:'Indiranagar, Bangalore'},rating:4.2,registered:new Date().toISOString()},
    {id:'d3',name:'FreshMart Superstore',type:'donor',email:'fresh@sav.com',phone:'9876543212',location:{lat:12.912,lng:77.637,address:'HSR Layout, Bangalore'},rating:4.8,registered:new Date().toISOString()},
  ];
  const ngos=[
    {id:'n1',name:'Akshaya Patra',type:'ngo',email:'akshaya@sav.com',phone:'9123456780',location:{lat:12.916,lng:77.610,address:'BTM Layout, Bangalore'},rating:4.9,capacity:500,registered:new Date().toISOString()},
    {id:'n2',name:'Robin Hood Army',type:'ngo',email:'robin@sav.com',phone:'9123456781',location:{lat:12.897,lng:77.585,address:'JP Nagar, Bangalore'},rating:4.7,capacity:300,registered:new Date().toISOString()},
    {id:'n3',name:'No Food Waste',type:'ngo',email:'nfw@sav.com',phone:'9123456782',location:{lat:12.956,lng:77.701,address:'Marathahalli, Bangalore'},rating:4.6,capacity:200,registered:new Date().toISOString()},
  ];
  const volunteers=[
    {id:'v1',name:'Arjun Kumar',type:'volunteer',email:'arjun@sav.com',phone:'9555000001',location:{lat:12.930,lng:77.620,address:'Koramangala, Bangalore'},rating:4.8,points:1240,deliveries:28,registered:new Date().toISOString()},
    {id:'v2',name:'Priya Sharma',type:'volunteer',email:'priya@sav.com',phone:'9555000002',location:{lat:12.975,lng:77.645,address:'Indiranagar, Bangalore'},rating:4.9,points:1580,deliveries:35,registered:new Date().toISOString()},
    {id:'v3',name:'Mohammed Rafi',type:'volunteer',email:'rafi@sav.com',phone:'9555000003',location:{lat:12.908,lng:77.630,address:'BTM Layout, Bangalore'},rating:4.6,points:980,deliveries:21,registered:new Date().toISOString()},
    {id:'v4',name:'Sneha Gupta',type:'volunteer',email:'sneha@sav.com',phone:'9555000004',location:{lat:12.950,lng:77.615,address:'Jayanagar, Bangalore'},rating:4.7,points:820,deliveries:18,registered:new Date().toISOString()},
    {id:'v5',name:'Kiran Bhat',type:'volunteer',email:'kiran@sav.com',phone:'9555000005',location:{lat:12.920,lng:77.660,address:'HSR Layout, Bangalore'},rating:4.5,points:650,deliveries:14,registered:new Date().toISOString()},
  ];

  const now=new Date();
  const add=(d,h)=>new Date(now.getTime()+h*3600000).toISOString();
  const donations=[
    {id:'don1',donorId:'d1',donorName:'Hotel Saravana',foodName:'Biryani & Dal',quantity:40,unit:'meals',foodType:'cooked',expiry:add(now,18),location:{lat:12.935,lng:77.624,address:'Koramangala, Bangalore'},deliveryOption:'pickup',status:'pending',emoji:'🍛',ngoId:null,volunteerId:null,created:add(now,-2)},
    {id:'don2',donorId:'d2',donorName:"Ravi's Kitchen",foodName:'Chapati & Sabzi',quantity:25,unit:'meals',foodType:'cooked',expiry:add(now,36),location:{lat:12.978,lng:77.641,address:'Indiranagar, Bangalore'},deliveryOption:'self',status:'accepted',emoji:'🫓',ngoId:'n1',volunteerId:null,created:add(now,-5)},
    {id:'don3',donorId:'d3',donorName:'FreshMart',foodName:'Rice Sacks (Raw)',quantity:80,unit:'kg',foodType:'raw',expiry:add(now,120),location:{lat:12.912,lng:77.637,address:'HSR Layout, Bangalore'},deliveryOption:'pickup',status:'pending',emoji:'🌾',ngoId:null,volunteerId:null,created:add(now,-1)},
    {id:'don4',donorId:'d1',donorName:'Hotel Saravana',foodName:'Sambar Rice',quantity:60,unit:'meals',foodType:'cooked',expiry:add(now,8),location:{lat:12.935,lng:77.624,address:'Koramangala'},deliveryOption:'pickup',status:'picked',emoji:'🍚',ngoId:'n2',volunteerId:'v1',created:add(now,-10)},
    {id:'don5',donorId:'d2',donorName:"Ravi's Kitchen",foodName:'Packaged Biscuits',quantity:200,unit:'kg',foodType:'packaged',expiry:add(now,240),location:{lat:12.978,lng:77.641,address:'Indiranagar'},deliveryOption:'self',status:'delivered',emoji:'🍪',ngoId:'n3',volunteerId:'v2',created:add(now,-48)},
  ];

  DB.set('donors',donors);
  DB.set('ngos',ngos);
  DB.set('volunteers',volunteers);
  DB.set('donations',donations);
  DB.set('seeded',true);
}

// ── Urgency badge HTML ─────────────────────────────────────────────────────────
function urgencyBadge(expiry){
  const u=calcUrgency(expiry);
  const pulse=u.label==='critical'?' pulse-critical':'';
  return`<span class="badge ${u.cls}${pulse}">${u.emoji} ${u.label==='critical'?'Critical':u.label==='warning'?'Warning':'Safe'} (${u.days}d)</span>`;
}

// ── Status badge ───────────────────────────────────────────────────────────────
function statusBadge(status){
  const map={pending:['badge-neutral','⏳ Pending'],accepted:['badge-info','✅ Accepted'],picked:['badge-warning','🚴 In Transit'],delivered:['badge-safe','📦 Delivered']};
  const [cls,label]=map[status]||['badge-neutral',status];
  return`<span class="badge ${cls}">${label}</span>`;
}

// ── Navbar active link ─────────────────────────────────────────────────────────
function setNavActive(){
  const page=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    if(a.getAttribute('href')===page)a.classList.add('active');
  });
}

// ── Mobile nav toggle ──────────────────────────────────────────────────────────
function initMobileNav(){
  const toggle=document.getElementById('navToggle');
  const links=document.getElementById('navLinks');
  if(toggle&&links){
    toggle.addEventListener('click',()=>links.classList.toggle('nav-open'));
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  seedData();
  setNavActive();
  initMobileNav();
});

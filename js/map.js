class SABMap {
  constructor(canvasId){
    this.c=document.getElementById(canvasId);
    if(!this.c)return;
    this.ctx=this.c.getContext('2d');
    this.bounds={minLat:12.88,maxLat:13.00,minLng:77.55,maxLng:77.72};
    this.markers=[];this.routes=[];this.tick=0;this.raf=null;
    this.resize();
    window.addEventListener('resize',()=>this.resize());
  }
  resize(){
    if(!this.c)return;
    const w=this.c.parentElement.clientWidth;
    this.c.width=w;this.c.height=Math.min(420,w*0.55);
    this.render();
  }
  toXY(lat,lng){
    const{minLat,maxLat,minLng,maxLng}=this.bounds;
    return{
      x:(lng-minLng)/(maxLng-minLng)*this.c.width,
      y:(1-(lat-minLat)/(maxLat-minLat))*this.c.height
    };
  }
  drawBg(){
    const ctx=this.ctx,w=this.c.width,h=this.c.height;
    // Sky background
    const grad=ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#E8F5E9');grad.addColorStop(1,'#C8E6C9');
    ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

    // Grid streets
    ctx.strokeStyle='#A5D6A7';ctx.lineWidth=1.5;
    for(let i=1;i<8;i++){
      ctx.beginPath();ctx.moveTo(0,h*i/8);ctx.lineTo(w,h*i/8);ctx.stroke();
      ctx.beginPath();ctx.moveTo(w*i/8,0);ctx.lineTo(w*i/8,h);ctx.stroke();
    }
    // Main roads
    ctx.strokeStyle='#81C784';ctx.lineWidth=3;
    [[0,h*.4,w,h*.6],[0,h*.7,w,h*.2],[w*.3,0,w*.5,h],[w*.6,0,w*.8,h]].forEach(([x1,y1,x2,y2])=>{
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    });
    // Outer ring road
    ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*.38,0,Math.PI*2);
    ctx.strokeStyle='#A5D6A7';ctx.lineWidth=2.5;ctx.stroke();

    // Parks (green blobs)
    [[w*.2,h*.3,30],[w*.7,h*.65,25],[w*.5,h*.15,20]].forEach(([x,y,r])=>{
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle='rgba(76,175,80,.25)';ctx.fill();
    });
    // Label
    ctx.fillStyle='rgba(0,0,0,.15)';ctx.font='11px Inter,sans-serif';ctx.textAlign='left';
    ctx.fillText('Bangalore City',8,h-8);
  }
  drawRoute(from,to,urgency){
    const ctx=this.ctx;
    const colors={critical:'#EF4444',warning:'#F97316',safe:'#22C55E'};
    const p=this.toXY(from.lat,from.lng),q=this.toXY(to.lat,to.lng);
    ctx.save();
    ctx.setLineDash([10,5]);
    ctx.lineDashOffset=-(this.tick%30);
    ctx.strokeStyle=colors[urgency]||'#22C55E';
    ctx.lineWidth=3;ctx.globalAlpha=.85;
    ctx.beginPath();ctx.moveTo(p.x,p.y);
    const mx=(p.x+q.x)/2+(q.y-p.y)*.3,my=(p.y+q.y)/2-(q.x-p.x)*.3;
    ctx.quadraticCurveTo(mx,my,q.x,q.y);
    ctx.stroke();ctx.restore();
  }
  drawMarker(lat,lng,type,label){
    const ctx=this.ctx;
    const{x,y}=this.toXY(lat,lng);
    const cfg={
      donor:{fill:'#16A34A',stroke:'#14532D',letter:'D'},
      ngo:{fill:'#2563EB',stroke:'#1E3A8A',letter:'N'},
      volunteer:{fill:'#F97316',stroke:'#C2410C',letter:'V'}
    }[type]||{fill:'#6B7280',stroke:'#374151',letter:'?'};
    // Glow
    ctx.shadowColor=cfg.fill;ctx.shadowBlur=10;
    ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);
    ctx.fillStyle=cfg.fill;ctx.fill();
    ctx.strokeStyle=cfg.stroke;ctx.lineWidth=2.5;ctx.stroke();
    ctx.shadowBlur=0;
    // Letter
    ctx.fillStyle='#fff';ctx.font='bold 11px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(cfg.letter,x,y);
    // Label
    ctx.fillStyle='#1A2E1A';ctx.font='9px Inter,sans-serif';
    ctx.fillText(label.length>14?label.slice(0,12)+'…':label,x,y+22);
  }
  render(){
    if(!this.c)return;
    this.ctx.clearRect(0,0,this.c.width,this.c.height);
    this.drawBg();
    this.routes.forEach(r=>this.drawRoute(r.from,r.to,r.urgency));
    this.markers.forEach(m=>this.drawMarker(m.lat,m.lng,m.type,m.label));
  }
  animate(){
    const loop=()=>{this.tick++;this.render();this.raf=requestAnimationFrame(loop);};
    loop();
  }
  stop(){if(this.raf)cancelAnimationFrame(this.raf);}
  load(markers,routes){this.markers=markers;this.routes=routes;this.render();}
}

// Build map from stored data
function buildMapData(){
  const donations=DB.list('donations');
  const ngos=DB.list('ngos');
  const volunteers=DB.list('volunteers');
  const markers=[];
  const routes=[];

  donations.filter(d=>d.status!=='delivered').forEach(d=>{
    markers.push({lat:d.location.lat,lng:d.location.lng,type:'donor',label:d.donorName});
    if(d.ngoId){
      const ngo=ngos.find(n=>n.id===d.ngoId);
      if(ngo){
        const u=calcUrgency(d.expiry);
        routes.push({from:d.location,to:ngo.location,urgency:u.label});
      }
    }
  });
  ngos.forEach(n=>markers.push({lat:n.location.lat,lng:n.location.lng,type:'ngo',label:n.name}));
  volunteers.filter(v=>v.active).forEach(v=>markers.push({lat:v.location.lat,lng:v.location.lng,type:'volunteer',label:v.name}));
  return{markers,routes};
}

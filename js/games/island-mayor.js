/* ===== ISLAND MAYOR v4 (solo city builder · square tiles · full-map · roads, pavements, decor) ===== */
(function(){
const N=48,HALF=N/2,STORE='town_v4',OLDSTORE='town_v3',WIPE=4,FH=1.1;
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]]; // E, S, W, N  (i = x axis, j = z axis)
const WALLS=[['b','#a8472f'],['b','#97402e'],['b','#b9714a'],['p','#d8c7a2'],['p','#c7b08e'],['p','#8f9ea8'],['p','#a7ae93'],['b','#7d4a3a']];
const ROOFS=['#7a3a2a','#4a4f58','#8a4a32','#55705a','#5d4a57'];
const CARS=['#9b2d2d','#d9a441','#2d5f7a','#e4e4e0','#3b3b3f','#2f7a4a'],SHIRTS=['#a8576b','#4f7f9c','#c9a24a','#5f8a6a','#7a6a99','#3d3d46'];
const FISHC=['#ff8c42','#c9d6dc','#4aa3df','#ffd166','#ff6b6b'];
let cells={},meshes={},movers=[],ripples=[],clouds=[],gulls=[],undo=[],ptrs=new Map(),csz={};
let scene,cam,ren,root,water,hov,cv,ready=false,running=false,raf=0,last=0,down=null,pd=0,pang=0,stroke=null;
let shDirty=1,lsx=1e9,lsz=1e9,fT=0,fN=0,prC=1,prM=1,prL=0,visiting=null,mine=null;
let hemi,sun,night=false,GL,WL,LAMPM,signMats=[],SMOKE,WT={value:0},sunS=0;
let tool='build',cat='r',kind='road',color=-1,drawMode=false,lastBeep=0;
let G={coins:300,era:0,fish:0,seen:{}},cloudDone=false,stamp=0,dq=[],dlgOpen=false,dTimer=0,dFull='',dCur=null,acc=0,tk=0,cT=0;
const ERAS=['Fishing Village','Harbor Town','Industrial Town','Modern City'];
/* camera: target point (tx,tz) on the ground, yaw az, pitch pol, distance dist */
let az=.8,pol=.85,dist=30,taz=.8,tpol=.85,tdist=30,tx=0,tz=0,ttx=0,ttz=0,vx=0,vz=0,minD=6,maxD=120;
const keys={};
const mats={},rnd=a=>a[Math.floor(Math.random()*a.length)],cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const key=(i,j)=>i+','+j,inB=(i,j)=>i>=0&&j>=0&&i<N&&j<N,wx=i=>i-HALF+.5;
const LANDM=new Uint8Array(N*N);
const LAND=(i,j)=>inB(i,j)&&LANDM[i*N+j]===1;
function genLand(){
  const IS=[[-16,11,3.4],[15,-13,2.8],[16,14,2.3],[-15,-15,2.2],[3,19,2]];
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    const x=wx(i),z=wx(j),d=Math.hypot(x,z),a=Math.atan2(z,x);
    let on=d<10.5+2.4*Math.sin(a*3+1)+1.5*Math.sin(a*5+2)+1.1*Math.sin(a*2+.4);
    if(!on)for(const s of IS){const dd=Math.hypot(x-s[0],z-s[1]);if(dd<s[2]+.7*Math.sin(Math.atan2(z-s[1],x-s[0])*3+s[0])){on=true;break}}
    LANDM[i*N+j]=on?1:0}
}
genLand();
const cellAt=(i,j)=>cells[key(i,j)];
const isRoad=(i,j)=>{const c=cellAt(i,j);return !!c&&c.t==='road'};
const BLOCKD={oak:1,pine:1,palm:1,bush:1,fountain:1,statue:1};
const isCW=(i,j)=>{const c=cellAt(i,j);if(!c||c.t!=='road'||!c.cw)return false;const m=roadMask(i,j);return m===5||m===10};
const isWalk=(i,j)=>{const c=cellAt(i,j);return !!c&&(c.t==='pavement'||c.t==='plaza'||isCW(i,j))&&!(c.d&&BLOCKD[c.d])};
const isBld=(i,j)=>{const c=cellAt(i,j);return !!c&&!!TY[c.t]&&TY[c.t].cat==='b'&&c.t!=='fishery'};
const H=(i,j)=>{const c=cellAt(i,j);return c&&isBld(i,j)?(c.h||1):0};
const roadMask=(i,j)=>(isRoad(i+1,j)?1:0)|(isRoad(i,j+1)?2:0)|(isRoad(i-1,j)?4:0)|(isRoad(i,j-1)?8:0);
let BOX,CYL,CYL12,CONE,CONE4,SPH;
function M(c,o){const k=c+(o?JSON.stringify(o):'');return mats[k]||(mats[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{})))}
function MT(t,o){const k='t'+t.uuid+(o?JSON.stringify(o):'');return mats[k]||(mats[k]=new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:.92,metalness:0},o||{})))}
function mk(g,c,sx,sy,sz,x,y,z,p,sh){const m=new THREE.Mesh(g,typeof c==='string'?M(c):c);m.scale.set(sx,sy,sz);m.position.set(x,y,z);if(sh!==false)m.castShadow=true;m.receiveShadow=true;p.add(m);return m}
const TX={};
function shade(h,v){const n=parseInt(h.slice(1),16),f=x=>cl(x+v,0,255)|0;return 'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')'}
function tex(id,w,h,draw,rx,ry){if(TX[id])return TX[id];const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return TX[id]=t}
const brick=c=>tex('b'+c,128,128,(g,w,h)=>{g.fillStyle='#b8ad9b';g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let i=-1;i<4;i++){g.fillStyle=shade(c,(Math.random()-.5)*46);g.fillRect(i*32+(r%2?16:0)+1,r*16+1,30,14)}},1,1);
const plaster=(c)=>tex('p'+c,128,128,(g,w,h)=>{g.fillStyle=c;g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';g.fillRect(Math.random()*w,Math.random()*h,2,2)}g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,h-3,w,3)},1,1);
const conc=()=>tex('conc',128,128,(g,w,h)=>{g.fillStyle='#9aa0a4';g.fillRect(0,0,w,h);for(let i=0;i<700;i++){g.fillStyle='rgba(0,0,0,.05)';g.fillRect(Math.random()*w,Math.random()*h,2,2)}g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,0,2,h);g.fillRect(0,h-2,w,2)},1,1);
const roofT=c=>tex('r'+c,64,64,(g,w,h)=>{g.fillStyle=c;g.fillRect(0,0,w,h);for(let r=0;r<8;r++){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,r*8+6,w,2);for(let i=0;i<4;i++)g.fillRect(i*16+(r%2?8:0),r*8,1.5,6)}},2,2);
const awnT=t=>tex('aw'+t,64,64,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=TY[t].aw[i%2];g.fillRect(i*8,0,8,h)}});
const wood=()=>tex('wood',128,128,(g,w,h)=>{for(let r=0;r<6;r++){g.fillStyle=shade('#8a6a4a',(Math.random()-.5)*40);g.fillRect(0,r*21,w,20);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,r*21+20,w,1.5)}},1,1);
/* road top: asphalt with lane lines that follow the connections (mask bits E1 S2 W4 N8); crosswalk adds zebra stripes */
const roadTex=(mask,cw)=>tex('rd'+mask+(cw?'c':''),128,128,(g,w,h)=>{
  g.fillStyle='#3c3f45';g.fillRect(0,0,w,h);
  for(let i=0;i<520;i++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.09)';g.fillRect(Math.random()*w,Math.random()*h,2,2)}
  const c=w/2,bits=[1,2,4,8],dv=[[1,0],[0,1],[-1,0],[0,-1]],n=bits.filter(b=>mask&b).length;
  g.strokeStyle='rgba(235,235,225,.75)';g.lineWidth=3;
  bits.forEach((b,i)=>{if(mask&b)return;g.beginPath();if(i===0){g.moveTo(w-5,0);g.lineTo(w-5,h)}if(i===1){g.moveTo(0,h-5);g.lineTo(w,h-5)}if(i===2){g.moveTo(5,0);g.lineTo(5,h)}if(i===3){g.moveTo(0,5);g.lineTo(w,5)}g.stroke()});
  if(cw&&(mask===5||mask===10)){g.fillStyle='rgba(245,245,238,.92)';
    for(let k=0;k<5;k++){if(mask===5)g.fillRect(w*.18,12+k*24,w*.64,13);else g.fillRect(12+k*24,h*.18,13,h*.64)}return}
  if(n===0)return;
  if(n<=2){g.strokeStyle='#e8c84a';g.lineWidth=4;g.setLineDash([13,11]);
    bits.forEach((b,i)=>{if(!(mask&b))return;g.beginPath();g.moveTo(c,c);g.lineTo(c+dv[i][0]*c,c+dv[i][1]*c);g.stroke()});g.setLineDash([])}
  else{g.fillStyle='rgba(245,245,238,.75)';
    if(mask&1)g.fillRect(w-16,6,5,h/2-10);if(mask&2)g.fillRect(w/2+4,h-16,w/2-10,5);if(mask&4)g.fillRect(11,h/2+4,5,h/2-10);if(mask&8)g.fillRect(6,11,w/2-10,5)}
},1,1);
/* pavement top: pavers with a raised curb on every side that touches a road */
const pavTex=mask=>tex('pv'+mask,128,128,(g,w,h)=>{
  g.fillStyle='#cfcabd';g.fillRect(0,0,w,h);
  for(let a=0;a<4;a++)for(let b=0;b<4;b++){g.fillStyle=shade('#cfcabd',(Math.random()-.5)*18);g.fillRect(a*32+1,b*32+1,30,30)}
  g.strokeStyle='rgba(120,114,100,.55)';g.lineWidth=2;for(let k=0;k<=4;k++){g.beginPath();g.moveTo(k*32,0);g.lineTo(k*32,h);g.stroke();g.beginPath();g.moveTo(0,k*32);g.lineTo(w,k*32);g.stroke()}
  g.fillStyle='#8a867c';if(mask&1)g.fillRect(w-12,0,12,h);if(mask&2)g.fillRect(0,h-12,w,12);if(mask&4)g.fillRect(0,0,12,h);if(mask&8)g.fillRect(0,0,w,12);
},1,1);
const parkTex=()=>tex('pk',128,128,(g,w,h)=>{g.fillStyle='#4a4e55';g.fillRect(0,0,w,h);g.strokeStyle='rgba(240,240,230,.8)';g.lineWidth=3;for(let k=0;k<=3;k++){g.beginPath();g.moveTo(8+k*37,8);g.lineTo(8+k*37,56);g.moveTo(8+k*37,72);g.lineTo(8+k*37,120);g.stroke()}},1,1);
const plazaTex=()=>tex('plz',128,128,(g,w,h)=>{g.fillStyle='#8b8272';g.fillRect(0,0,w,h);for(let i=0;i<30;i++){g.fillStyle=shade('#a99f8e',(Math.random()-.5)*50);g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,11+Math.random()*8,9+Math.random()*6,0,0,7);g.fill()}},1,1);
function signMat(t){const id='sg'+t;if(mats[id])return mats[id];const tx=tex(id,256,64,(g,w,h)=>{g.fillStyle=TY[t].bg;g.fillRect(0,0,w,h);g.strokeStyle='#e8d9a8';g.lineWidth=5;g.strokeRect(4,4,w-8,h-8);g.fillStyle='#f4e7bd';g.font='bold 34px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(TY[t].sign,w/2,h/2+2)});
  const m=new THREE.MeshStandardMaterial({map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:night?.7:0,roughness:.6});signMats.push(m);return mats[id]=m}
const TY={
  home:{n:'Home',e:'🏠',cat:'b',max:4,cost:30,inc:2,pop:3,u:0},
  fishery:{n:'Fishery',e:'🎣',cat:'b',max:2,cost:70,inc:6,u:0,sign:'FISHERY',bg:'#1d4a6b',aw:['#2f7fa6','#e8f1f5']},
  shop:{n:'Market',e:'🛍️',cat:'b',max:3,cost:50,inc:4,am:1,u:0,sign:'MARKET',bg:'#2a5238',aw:['#2f7a4a','#efe6d2']},
  rest:{n:'Restaurant',e:'🍽️',cat:'b',max:3,cost:70,inc:5,am:1,u:1,sign:'RESTAURANT',bg:'#6e1d25',aw:['#a3282f','#efe6d2']},
  laundry:{n:'Laundromat',e:'🧺',cat:'b',max:3,cost:60,inc:3,am:1,u:1,sign:'LAUNDRY',bg:'#1d5878',aw:['#2f7fa6','#e8f1f5']},
  factory:{n:'Factory',e:'🏭',cat:'b',max:3,cost:220,inc:14,u:2,sign:'FACTORY',bg:'#4a4d52'},
  condo:{n:'Condominium',e:'🏢',cat:'b',max:8,cost:180,inc:3,pop:8,u:3,sign:'CONDOS',bg:'#27343f'},
  clinic:{n:'Clinic',e:'🏥',cat:'b',max:3,cost:90,inc:2,am:1,u:1,sign:'CLINIC',bg:'#7a2230',aw:['#e5484d','#f4f4f0'],acc:'#e5484d'},
  school:{n:'School',e:'🏫',cat:'b',max:3,cost:100,inc:1,am:1,u:1,sign:'SCHOOL',bg:'#6b4a12',aw:['#e8b93c','#f4f0e0'],acc:'#e8b93c'},
  bank:{n:'Bank',e:'🏦',cat:'b',max:4,cost:160,inc:9,u:2,sign:'BANK',bg:'#1f4a35',aw:['#2e8b57','#efe6d2'],acc:'#2e8b57'},
  police:{n:'Police Station',e:'🚓',cat:'b',max:3,cost:120,inc:2,am:1,u:2,sign:'POLICE',bg:'#1f3a6b',aw:['#2f6fbf','#e8f1f5'],acc:'#2f6fbf'},
  fire:{n:'Fire Station',e:'🚒',cat:'b',max:3,cost:120,inc:2,am:1,u:2,sign:'FIRE DEPT',bg:'#7a1f14',aw:['#d93a2b','#efe6d2'],acc:'#d93a2b'},
  hotel:{n:'Hotel',e:'🏨',cat:'b',max:6,cost:200,inc:8,pop:2,u:3,sign:'HOTEL',bg:'#3d2a5c',aw:['#8a4fbf','#efe6d2'],acc:'#8a4fbf'},
  road:{n:'Road',e:'🛣️',cat:'r',cost:8,u:0},
  pavement:{n:'Pavement',e:'🚶',cat:'r',cost:5,u:0},
  crosswalk:{n:'Crosswalk',e:'🚸',cat:'r',cost:6,u:0},
  plaza:{n:'Plaza',e:'🟫',cat:'r',cost:10,u:0},
  parking:{n:'Parking',e:'🅿️',cat:'r',cost:9,u:0},
  oak:{n:'Oak Tree',e:'🌳',cat:'d',cost:15,u:0},
  pine:{n:'Pine Tree',e:'🌲',cat:'d',cost:15,u:0},
  palm:{n:'Palm Tree',e:'🌴',cat:'d',cost:18,u:0},
  bush:{n:'Bush',e:'🌿',cat:'d',cost:8,u:0},
  flowers:{n:'Flowers',e:'🌷',cat:'d',cost:6,u:0},
  bench:{n:'Bench',e:'🪑',cat:'d',cost:12,u:0},
  lamp:{n:'Street Lamp',e:'💡',cat:'d',cost:14,u:0},
  fountain:{n:'Fountain',e:'⛲',cat:'d',cost:60,u:0},
  busstop:{n:'Bus Stop',e:'🚏',cat:'d',cost:20,u:0},
  trafficlight:{n:'Traffic Light',e:'🚦',cat:'d',cost:25,u:0},
  statue:{n:'Statue',e:'🗿',cat:'d',cost:80,u:0}
};
const CATS=[['b','🏗️','Build'],['r','🛣️','Roads'],['d','🌳','Decor']];
const isDeco=k=>TY[k]&&TY[k].cat==='d';
function loadThree(cb){
  if(window.THREE)return cb();
  const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload=cb;s.onerror=()=>toast("Couldn't load the 3D engine — check your connection");document.head.appendChild(s);
}

/* ---- scene ---- */
function init(){
  ready=true;const box=$('townCv');
  BOX=new THREE.BoxGeometry(1,1,1);CYL=new THREE.CylinderGeometry(1,1,1,6);CYL12=new THREE.CylinderGeometry(1,1,1,12);CONE=new THREE.ConeGeometry(1,1,6);CONE4=new THREE.ConeGeometry(1,1,4);SPH=new THREE.SphereGeometry(1,12,9);
  ren=new THREE.WebGLRenderer({antialias:true,alpha:true});prM=Math.min(devicePixelRatio||1,2);prC=prM;ren.setPixelRatio(prC);
  ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=.92;
  GL=new THREE.MeshStandardMaterial({color:'#2f4856',roughness:.12,metalness:.45});WL=new THREE.MeshStandardMaterial({color:'#f2c36b',emissive:0xffa940,emissiveIntensity:.35,roughness:.35});
  LAMPM=new THREE.MeshStandardMaterial({color:'#fff3b0',emissive:0xffd070,emissiveIntensity:.35,roughness:.35});
  ren.shadowMap.enabled=true;ren.shadowMap.autoUpdate=false;ren.shadowMap.type=THREE.PCFSoftShadowMap;
  cv=ren.domElement;box.appendChild(cv);
  scene=new THREE.Scene();scene.fog=new THREE.Fog(0xd8d3c2,45,220);
  cam=new THREE.PerspectiveCamera(38,1,.5,800);
  hemi=new THREE.HemisphereLight(0xfff1dc,0xa89478,.5);scene.add(hemi);
  sun=new THREE.DirectionalLight(0xffd7a3,.9);sun.position.set(12,13,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const sc=sun.shadow.camera;sc.left=sc.bottom=-22;sc.right=sc.top=22;sc.near=1;sc.far=100;sun.shadow.bias=-.0005;sun.shadow.normalBias=.02;scene.add(sun);scene.add(sun.target);
  /* soft fill light for more realistic depth & less harsh shadows */
  const fill=new THREE.DirectionalLight(0xc4cfe0,.2);fill.position.set(-8,10,-6);scene.add(fill);
  root=new THREE.Group();scene.add(root);
  /* sea: flat, stable water — no vertex animation so roads / pavement / plazas built over water never get overflowed or clipped (critical on mobile) */
  const wm=new THREE.MeshStandardMaterial({color:'#2b7c8e',flatShading:true,transparent:true,opacity:.88,roughness:.35,metalness:.08});
  water=new THREE.Mesh(new THREE.PlaneGeometry(400,400,32,32),wm); // fewer segments = better mobile performance + no wave mesh fighting tiles
  water.rotation.x=-Math.PI/2;
  water.position.y=-.18; // sit clearly below all slabs / decks
  water.receiveShadow=true;
  scene.add(water);
  const bed=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),new THREE.MeshStandardMaterial({color:'#277a8d',roughness:1}));bed.rotation.x=-Math.PI/2;bed.position.y=-1.4;scene.add(bed);
  buildTerrain();
  hov=new THREE.Mesh(BOX,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.38,depthWrite:false}));hov.scale.set(.98,.06,.98);hov.visible=false;scene.add(hov);
  for(let i=0;i<9;i++){const c=new THREE.Group(),n=3+(i%2);for(let j=0;j<n;j++){const s=mk(SPH,'#ffffff',1.3+Math.random()*.8,.7,.9,j*1.3-n*.6,Math.random()*.3,Math.random()*.5,c,false);s.material=M('#ffffff',{transparent:true,opacity:.85})}
    c.position.set(-60+Math.random()*120,13+Math.random()*5,-50+Math.random()*100);c.userData.sp=.3+Math.random()*.35;scene.add(c);clouds.push(c)}
  for(let i=0;i<6;i++){const g=new THREE.Group(),wl=new THREE.Group(),wr=new THREE.Group();
    mk(BOX,'#ffffff',.14,.1,.34,0,0,0,g,false);mk(BOX,'#ffffff',.5,.03,.16,.25,0,0,wr,false);mk(BOX,'#ffffff',.5,.03,.16,-.25,0,0,wl,false);
    g.add(wr,wl);g.userData={wl,wr,rad:7+Math.random()*9,ph:Math.random()*6,sp:.2+Math.random()*.2,y:5+Math.random()*3};scene.add(g);gulls.push(g)}
  cv.addEventListener('pointerdown',onDown);cv.addEventListener('pointermove',onMove);
  cv.addEventListener('pointerup',onUp);cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);if(!ptrs.size){endStroke();down=null}});
  cv.addEventListener('wheel',e=>{e.preventDefault();tdist=cl(tdist*Math.exp(e.deltaY*.0012),minD,maxD)},{passive:false});
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('keydown',e=>{if(!running||/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))return;keys[e.key.toLowerCase()]=1;if(['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault()});
  window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
  loadLocal();
  swatches();cats();types();rebuildAll();syncMovers();setNight(false,true);
}
function buildTerrain(){
  const lands=[],shal=[];
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    if(LAND(i,j))lands.push([i,j]);
    else{let near=false;for(let a=-2;a<=2&&!near;a++)for(let b=-2;b<=2;b++)if(LAND(i+a,j+b)){near=true;break}if(near)shal.push([i,j])}}
  const m4=new THREE.Matrix4(),col=new THREE.Color(),q=new THREE.Quaternion();
  const gm=new THREE.InstancedMesh(BOX,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.88,metalness:.02}),lands.length);
  lands.forEach(([i,j],n)=>{
    let beach=false;for(let a=-1;a<=1&&!beach;a++)for(let b=-1;b<=1;b++)if(!LAND(i+a,j+b)){beach=true;break}
    const h=((i*73856093)^(j*19349663))%100/100;
    // Keep land perfectly flat so roads / pavement / plazas always sit cleanly on top (no burial / missing tiles)
    m4.compose(new THREE.Vector3(wx(i),-.25,wx(j)),q,new THREE.Vector3(1,.5,1));gm.setMatrixAt(n,m4);
    if(beach)col.setHSL(.12,.48,.68+h*.07);else col.setHSL(.27,.45,.38+h*.08);gm.setColorAt(n,col)});
  gm.instanceMatrix.needsUpdate=true;if(gm.instanceColor)gm.instanceColor.needsUpdate=true;gm.receiveShadow=true;root.add(gm);
  const sm=new THREE.InstancedMesh(BOX,new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),shal.length);
  shal.forEach(([i,j],n)=>{const h=((i*83492791)^(j*2654435761))%100/100;m4.compose(new THREE.Vector3(wx(i),-.85,wx(j)),q,new THREE.Vector3(1,.1,1));sm.setMatrixAt(n,m4);col.setHSL(.5,.5,.6+h*.06);sm.setColorAt(n,col)});
  sm.instanceMatrix.needsUpdate=true;if(sm.instanceColor)sm.instanceColor.needsUpdate=true;root.add(sm);
  /* tile grid: faint lines everywhere (so tiles on the sea are visible) + a gold map border */
  const pts=[];for(let k=0;k<=N;k++){const p=k-HALF;pts.push(p,.016,-HALF,p,.016,HALF,-HALF,.016,p,HALF,.016,p)}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  root.add(new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.2,depthWrite:false})));
  const bp=[-HALF,.03,-HALF,HALF,.03,-HALF,HALF,.03,HALF,-HALF,.03,HALF];const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));
  root.add(new THREE.LineLoop(bg,new THREE.LineBasicMaterial({color:0xffd166,transparent:true,opacity:.85})));
}
function resize(){const b=$('townCv').getBoundingClientRect();if(!ren||!b.width)return;ren.setSize(b.width,b.height);cam.aspect=b.width/b.height;cam.updateProjectionMatrix();
  /* furthest zoom-out = the WHOLE map fits on screen (any rotation), on portrait phones too */
  maxD=cl(HALF*1.42/(Math.tan(19*Math.PI/180)*Math.min(1,cam.aspect))*1.04,60,420);
  tdist=cl(tdist,minD,maxD);if(!resize.done){resize.done=1;tdist=dist=cl(cam.aspect<1?36:26,minD,maxD)}}
function updateCam(){cam.position.set(tx+dist*Math.sin(pol)*Math.cos(az),dist*Math.cos(pol),tz+dist*Math.sin(pol)*Math.sin(az));cam.lookAt(tx,0,tz);cam.updateMatrixWorld()}

/* ---- tile models ---- */
function face(p,di,ap,off,fn){const a=[0,Math.PI/2,Math.PI,-Math.PI/2][di],o=new THREE.Object3D();
  const px=Math.cos(a)*ap+(di%2?off:0),pz=Math.sin(a)*ap+(di%2?0:off);o.position.set(px,0,pz);o.rotation.y=Math.PI/2-a;p.add(o);fn(o)}
function sign(o,y,t){mk(BOX,signMat(t),.78,.2,.05,0,y+.97,.03,o)}
function entrance(o,y,t,tbl){
  if(t==='home'){mk(BOX,'#e8dfce',.46,.8,.05,0,y+.45,.02,o);mk(BOX,'#5b3a29',.36,.7,.07,0,y+.4,.03,o);mk(BOX,'#d4a73c',.05,.05,.08,.1,y+.4,.05,o,false);mk(BOX,'#9a948a',.6,.08,.3,0,y+.09,.12,o);return}
  if(t==='factory'){mk(BOX,'#3a3d41',.74,.84,.05,0,y+.46,.02,o);mk(BOX,'#8a9096',.66,.76,.06,0,y+.44,.03,o,false);for(let n=0;n<4;n++)mk(BOX,'#6b7075',.66,.02,.07,0,y+.2+n*.17,.04,o,false);sign(o,y,t);return}
  if(t==='condo'){mk(BOX,'#30353a',.86,.86,.05,0,y+.5,.02,o);mk(BOX,GL,.74,.74,.06,0,y+.45,.03,o,false);mk(BOX,WL,.04,.7,.07,0,y+.45,.04,o,false)}
  else{mk(BOX,'#2b2b2b',.5,.8,.05,0,y+.45,.02,o);mk(BOX,WL,.4,.7,.06,0,y+.4,.03,o,false);const a=mk(BOX,MT(awnT(t)),.84,.05,.36,0,y+.8,.16,o);a.rotation.x=.4}
  sign(o,y,t);
  if(t==='rest'&&tbl){mk(CYL12,'#222',.02,.4,.02,0,y+.25,.66,o);mk(CYL12,'#efe6d2',.17,.025,.17,0,y+.38,.66,o);mk(CONE,'#a3282f',.34,.16,.34,0,y+.72,.66,o);mk(CYL12,'#222',.015,.45,.015,0,y+.5,.66,o,false)}
}
function front(o,y,t){
  if(t==='laundry'){[-.2,.2].forEach(x=>{const w=mk(CYL12,'#e8f1f5',.2,.05,.2,x,y+.52,.03,o);w.rotation.x=Math.PI/2;const g=mk(CYL12,'#5fa8c4',.145,.06,.145,x,y+.52,.04,o,false);g.rotation.x=Math.PI/2});sign(o,y,t)}
  else{mk(BOX,'#2b2b2b',.76,.62,.05,0,y+.5,.02,o);mk(BOX,WL,.68,.54,.06,0,y+.5,.03,o,false);mk(BOX,'#2b2b2b',.03,.54,.07,0,y+.5,.04,o,false);sign(o,y,t)}
}
function windowF(o,y,t,lit,odd){
  if(t==='condo'){mk(BOX,'#30353a',.8,.66,.05,0,y+.58,.02,o);mk(BOX,lit?WL:GL,.72,.58,.06,0,y+.58,.03,o,false);mk(BOX,'#30353a',.03,.58,.07,0,y+.58,.04,o,false);
    if(odd){mk(BOX,'#7d8387',.9,.07,.34,0,y+.12,.17,o);mk(BOX,GL,.9,.24,.02,0,y+.27,.33,o,false)}return}
  mk(BOX,'#e8dfce',.4,.6,.05,0,y+.62,.02,o);mk(BOX,lit?WL:GL,.3,.5,.06,0,y+.62,.03,o,false);mk(BOX,'#e8dfce',.03,.5,.07,0,y+.62,.04,o,false);mk(BOX,'#e8dfce',.3,.03,.07,0,y+.62,.04,o,false);
  if(t==='home'){mk(BOX,'#3f5d4a',.1,.54,.04,-.25,y+.62,.03,o,false);mk(BOX,'#3f5d4a',.1,.54,.04,.25,y+.62,.03,o,false);if(odd){mk(BOX,'#5b3a29',.4,.08,.12,0,y+.3,.08,o);mk(BOX,rnd(['#b8404f','#d9a441','#c9602f']),.36,.08,.08,0,y+.37,.08,o,false)}}
}
/* flat tile slab: sits on the ground, or becomes a pier/bridge deck with piles when the tile is on the sea */
function slab(g,i,j,topMat,top){
  const water=!LAND(i,j);
  // On water: raise the deck a bit more so it always sits clearly above the flat water plane (avoids any mobile depth fighting)
  const useTop = water ? Math.max(top, 0.09) : top;
  const bot = water ? -.55 : -.02;
  const side = M(water ? '#7a6a55' : '#8e8b84');
  const hgt = useTop - bot;
  const m = new THREE.Mesh(BOX, [side, side, topMat, side, side, side]);
  m.scale.set(1, hgt, 1);
  m.position.y = bot + hgt / 2;
  m.receiveShadow = true;
  g.add(m);
  if(water){
    // longer piles that reach below the water surface
    [-1,1].forEach(a => [-1,1].forEach(b => mk(CYL12, '#4a3626', .055, 1.55, .055, a*.44, -.85, b*.44, g, false)));
    DIRS.forEach((d, di) => {
      const ni = i + d[0], nj = j + d[1];
      if(LAND(ni, nj) || cellAt(ni, nj)) return;
      if(d[0]) mk(BOX, '#6b5340', .05, .12, .98, d[0]*.475, useTop + .06, 0, g, false);
      else mk(BOX, '#6b5340', .98, .12, .05, 0, useTop + .06, d[1]*.475, g, false);
    });
  }
  return m}
function personMesh(p){const g=new THREE.Group();mk(CYL12,rnd(SHIRTS),.065,.2,.065,0,.15,0,g);mk(SPH,rnd(['#f5cba7','#e0ac80','#8d5a3b','#ffe0bd']),.062,.062,.062,0,.3,0,g);
  if(Math.random()<.5)mk(CYL12,rnd(['#ff6b6b','#2d3436','#ffd166']),.07,.025,.07,0,.355,0,g);p.add(g);return g}
function mkFish(p,col,s){const g=new THREE.Group();mk(SPH,col,.085*s,.04*s,.025*s,0,0,0,g,false);
  const tail=new THREE.Group();tail.position.x=-.08*s;g.add(tail);const t=mk(CONE,col,.035*s,.06*s,.012*s,-.03*s,0,0,tail,false);t.rotation.z=-Math.PI/2;
  mk(SPH,'#111',.009*s,.009*s,.009*s,.05*s,.01*s,.02*s,g,false);mk(SPH,'#111',.009*s,.009*s,.009*s,.05*s,.01*s,-.02*s,g,false);
  mk(BOX,col,.05*s,.03*s,.005*s,-.005*s,.04*s,0,g,false);p.add(g);return{g,tail}}
/* decor: trees, bushes, flowers, bench, lamp, fountain */
function deco(g,d,seed,y0){
  const s=(seed||0)+1,gr=['#4f9a45','#5aa84c','#3f8a3f','#68b254'][s%4];
  if(d==='oak'){mk(CYL12,'#6b4a32',.07,.38,.07,0,y0+.19,0,g);mk(SPH,gr,.3,.27,.3,0,y0+.58,0,g);mk(SPH,shade('#4f9a45',12),.2,.2,.2,.14,y0+.76,.05,g);mk(SPH,shade('#4f9a45',-10),.18,.18,.18,-.15,y0+.7,-.08,g)}
  else if(d==='pine'){mk(CYL12,'#5b3d2b',.05,.25,.05,0,y0+.12,0,g);[[.34,.34,.3],[.27,.3,.5],[.2,.27,.7],[.12,.22,.88]].forEach(c=>mk(CONE,s%2?'#2f6f46':'#2a6a3e',c[0],c[1],c[0],0,y0+c[2],0,g))}
  else if(d==='palm'){let px=0,py=y0;for(let k=0;k<4;k++){mk(CYL12,'#8a6a45',.05-k*.005,.2,.05-k*.005,px,py+.1,0,g);px+=.035;py+=.18}
    for(let k=0;k<6;k++){const pv=new THREE.Group();pv.position.set(px,py+.02,0);pv.rotation.y=k*Math.PI/3+s;g.add(pv);const f=mk(BOX,'#3f9a4a',.34,.02,.11,.17,0,0,pv);f.rotation.z=-.45}
    mk(SPH,'#7a4a2a',.05,.05,.05,px,py-.03,.04,g)}
  else if(d==='bush'){mk(SPH,gr,.2,.16,.2,0,y0+.14,0,g);mk(SPH,shade('#4f9a45',14),.14,.12,.14,.14,y0+.11,.06,g);mk(SPH,shade('#4f9a45',-8),.13,.11,.13,-.13,y0+.1,-.07,g)}
  else if(d==='flowers'){mk(CYL12,'#4f8a40',.34,.03,.34,0,y0+.015,0,g,false);for(let k=0;k<10;k++){const a=k*2.4+s,r=.05+(k%4)*.07,x=Math.cos(a)*r,z=Math.sin(a)*r;mk(CYL12,'#3f7a35',.01,.14,.01,x,y0+.09,z,g,false);mk(SPH,['#ff6b9d','#ffd166','#ffffff','#c77dff','#ff8c42'][k%5],.035,.035,.035,x,y0+.17,z,g,false)}}
  else if(d==='bench'){const b=new THREE.Group();b.rotation.y=(s%4)*Math.PI/2;g.add(b);mk(BOX,'#8a5a36',.54,.05,.2,0,y0+.2,0,b);mk(BOX,'#8a5a36',.54,.15,.04,0,y0+.3,-.09,b);mk(BOX,'#3a3a3e',.04,.2,.18,-.22,y0+.1,0,b);mk(BOX,'#3a3a3e',.04,.2,.18,.22,y0+.1,0,b)}
  else if(d==='lamp'){mk(CYL12,'#2f3338',.05,.05,.05,0,y0+.025,0,g);mk(CYL12,'#2f3338',.02,.72,.02,0,y0+.36,0,g);mk(SPH,LAMPM,.07,.07,.07,0,y0+.76,0,g,false);mk(CYL12,'#2f3338',.075,.025,.075,0,y0+.83,0,g,false)}
  else if(d==='busstop'){mk(BOX,'#2f6f8a',.56,.04,.26,0,y0+.5,0,g);[-1,1].forEach(a=>mk(CYL12,'#3a3f46',.015,.5,.015,a*.25,y0+.25,.1,g,false));mk(BOX,M('#9fd3e6',{transparent:true,opacity:.5}),.54,.36,.01,0,y0+.3,-.1,g,false);mk(BOX,'#8a5a36',.4,.03,.08,0,y0+.18,-.06,g);mk(CYL12,'#3a3f46',.012,.7,.012,.3,y0+.35,.12,g,false);mk(BOX,'#e0b030',.13,.13,.02,.3,y0+.72,.12,g,false)}
  else if(d==='trafficlight'){mk(CYL12,'#2f3338',.025,.8,.025,0,y0+.4,0,g);mk(BOX,'#1f2226',.1,.27,.08,0,y0+.82,0,g);[['#ff4d4d',.9],['#ffd23f',.82],['#3ddc84',.74]].forEach(l=>mk(SPH,l[0],.028,.028,.028,0,y0+l[1],.045,g,false))}
  else if(d==='statue'){mk(BOX,'#b9b4a8',.3,.16,.3,0,y0+.08,0,g);mk(CYL12,'#8d9aa0',.07,.34,.07,0,y0+.33,0,g);mk(SPH,'#8d9aa0',.075,.075,.075,0,y0+.58,0,g);mk(BOX,'#8d9aa0',.04,.2,.04,.09,y0+.52,0,g)}
  else if(d==='fountain'){mk(CYL12,'#b9b4a8',.4,.12,.4,0,y0+.06,0,g);mk(CYL12,M('#58b8dd',{transparent:true,opacity:.8}),.34,.02,.34,0,y0+.12,0,g,false);mk(CYL12,'#c8c3b7',.06,.34,.06,0,y0+.27,0,g);mk(CYL12,'#c8c3b7',.17,.05,.17,0,y0+.4,0,g);mk(CYL12,M('#58b8dd',{transparent:true,opacity:.85}),.14,.02,.14,0,y0+.43,0,g,false);mk(SPH,M('#9fdcf2',{transparent:true,opacity:.8}),.05,.1,.05,0,y0+.5,0,g,false)}
}
/* fishery: dock, shed, a tank with REAL swimming fish, crates of fish, fisherman, boat, leaping fish */
function buildFishery(g,i,j,c){
  const U=g.userData;U.fish=[];U.pk=true;
  mk(BOX,MT(wood()),1,.16,1,0,-.02,0,g);
  [-1,1].forEach(a=>[-1,1].forEach(b=>mk(CYL12,'#4a3626',.06,1.5,.06,a*.44,-.7,b*.44,g,false)));
  mk(BOX,MT(wood()),.4,.42,.4,-.26,.27,-.26,g);mk(CONE4,MT(roofT('#3a6f87')),.4,.3,.4,-.26,.63,-.26,g).rotation.y=Math.PI/4;
  mk(BOX,'#4a3626',.12,.26,.03,-.26,.2,-.04,g,false);mk(BOX,signMat('fishery'),.34,.09,.03,-.26,.43,-.04,g,false);
  const tcx=.22,tcz=.2,ts=.5,wy=.06;
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(a=>{if(a[0])mk(BOX,'#d9cfc0',.04,.17,ts,tcx+a[0]*ts/2,wy+.085,tcz,g);else mk(BOX,'#d9cfc0',ts,.17,.04,tcx,wy+.085,tcz+a[1]*ts/2,g)});
  mk(BOX,'#2d6f8a',ts-.04,.02,ts-.04,tcx,wy+.01,tcz,g,false);
  mk(BOX,M('#5cc0e6',{transparent:true,opacity:.55,depthWrite:false}),ts-.04,.01,ts-.04,tcx,wy+.13,tcz,g,false);
  const nF=5+Math.min(c.h||1,2)*2;
  for(let n=0;n<nF;n++){const f=mkFish(g,FISHC[n%FISHC.length],1.05+Math.random()*.35);U.fish.push({g:f.g,tail:f.tail,cx:tcx,cz:tcz,rx:.1+Math.random()*.06,rz:.09+Math.random()*.06,sp:(.9+Math.random()*.8)*(n%2?1:-1),ph:Math.random()*6.28,y:wy+.05+Math.random()*.05})}
  [[.3,-.3],[.05,-.33]].forEach((cr,n)=>{mk(BOX,'#9a7a52',.22,.14,.2,cr[0],wy+.07,cr[1],g);for(let k=0;k<3;k++){const f=mkFish(g,FISHC[(n+k)%3],1.1);f.g.position.set(cr[0]-.05+k*.05,wy+.17+k*.01,cr[1]);f.g.rotation.y=k*.7;f.g.rotation.z=.1}});
  const pm=personMesh(g);pm.position.set(-.05,wy,.34);pm.rotation.y=-.6;
  const rod=mk(CYL12,'#5a3d28',.008,.5,.008,.1,wy+.45,.5,g,false);rod.rotation.x=.9;rod.rotation.z=-.15;
  const ni=DIRS.findIndex(d=>{const a=i+d[0],b=j+d[1];return inB(a,b)&&!LAND(a,b)&&!cellAt(a,b)});
  if(ni>=0){const dv=DIRS[ni],bt=new THREE.Group();
    mk(BOX,'#7a4a2a',.62,.14,.26,0,.06,0,bt);mk(CONE,'#7a4a2a',.13,.26,.13,.4,.06,0,bt).rotation.z=-Math.PI/2;
    mk(BOX,'#efe6d2',.2,.16,.2,-.08,.19,0,bt);mk(CYL12,'#4a3626',.015,.5,.015,.1,.35,0,bt,false);mk(BOX,'#c9d6dc',.02,.22,.16,.1,.4,.09,bt,false);
    for(let k=0;k<2;k++){const f=mkFish(bt,FISHC[k],1.1);f.g.position.set(-.2+k*.12,.2,k?.06:-.06);f.g.rotation.y=k}
    bt.position.set(dv[0]*.84,-.04,dv[1]*.84);bt.rotation.y=dv[0]?Math.PI/2:0;g.add(bt);U.boat=bt;
    const jg=new THREE.Group();jg.position.set(dv[0]*1.25+(dv[1]?.35:0),0,dv[1]*1.25+(dv[0]?.35:0));jg.rotation.y=Math.random()*6;g.add(jg);
    const jf=mkFish(jg,'#ff8c42',1.5);jf.g.visible=false;U.jump={g:jf.g,tail:jf.tail,per:3.2+Math.random()*2,ph:Math.random()*5}}
}
/* PERF: merge every static mesh of a group into one mesh per material (hundreds of draw calls -> a handful per tile) */
function bake(r){
  r.updateMatrixWorld(true);
  const inv=new THREE.Matrix4().copy(r.matrixWorld).invert(),B=new Map(),m=new THREE.Matrix4(),n3=new THREE.Matrix3(),v=new THREE.Vector3(),dead=[];
  r.traverse(o=>{
    if(!o.isMesh||o.userData.keep||o.userData.baked)return;
    const ge=o.geometry,ms=Array.isArray(o.material)?o.material:null,gr=ms?ge.groups:[{start:0,count:ge.index.count,materialIndex:0}];
    m.multiplyMatrices(inv,o.matrixWorld);n3.getNormalMatrix(m);
    const P=ge.attributes.position,Nn=ge.attributes.normal,U=ge.attributes.uv,I=ge.index.array;
    gr.forEach(sg=>{const mat=ms?ms[sg.materialIndex]:o.material,k=mat.uuid+(o.castShadow?1:0);
      let b=B.get(k);if(!b)B.set(k,b={mat,cs:o.castShadow,p:[],n:[],u:[],i:[],c:0});
      const mp=new Map();
      for(let a=sg.start;a<sg.start+sg.count;a++){const od=I[a];let nv=mp.get(od);
        if(nv===undefined){nv=b.c++;mp.set(od,nv);
          v.fromBufferAttribute(P,od).applyMatrix4(m);b.p.push(v.x,v.y,v.z);
          v.fromBufferAttribute(Nn,od).applyMatrix3(n3).normalize();b.n.push(v.x,v.y,v.z);
          b.u.push(U.getX(od),U.getY(od))}
        b.i.push(nv)}});
    dead.push(o)});
  dead.forEach(o=>o.parent&&o.parent.remove(o));
  B.forEach(b=>{const ge=new THREE.BufferGeometry();
    ge.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));ge.setIndex(b.i);
    const me=new THREE.Mesh(ge,b.mat);me.castShadow=b.cs;me.receiveShadow=true;me.userData.baked=1;r.add(me)});
}
function disp(g){g.traverse(o=>{if(o.userData.baked&&o.geometry)o.geometry.dispose()})}
function buildCell(i,j,pop){
  const k=key(i,j),c=cells[k];
  if(meshes[k]){root.remove(meshes[k]);disp(meshes[k]);delete meshes[k]}
  shDirty=1;
  if(!c)return;
  const t=c.t,g=new THREE.Group();g.position.set(wx(i),0,wx(j));g.userData.k=k;g.userData.t0=pop?performance.now()/1000:-9;
  const plaza=c.pl||t==='plaza';
  if(t==='road'){const m=roadMask(i,j);slab(g,i,j,MT(roadTex(m,isCW(i,j)),{roughness:.95}),.06);if(c.d){const dg=new THREE.Group();deco(dg,c.d,c.r,.06);if(c.rot)dg.rotation.y=c.rot*Math.PI/2;g.add(dg);g.userData.pk=true}}
  else if(t==='pavement'){let m=0;DIRS.forEach((d,n)=>{if(isRoad(i+d[0],j+d[1]))m|=1<<n});slab(g,i,j,MT(pavTex(m)),.08)}
  else if(t==='plaza'){slab(g,i,j,MT(plazaTex()),.07)}
  else if(t==='parking'){slab(g,i,j,MT(parkTex()),.06)}
  if(t==='pavement'||t==='plaza'){if(c.d){deco(g,c.d,c.r,t==='plaza'?.07:.08);g.userData.pk=true}}
  if(t==='grass'){if(c.d)deco(g,c.d,c.r,0);g.userData.pk=true}
  if(t==='road'||t==='pavement'||t==='plaza'||t==='grass'||t==='parking'){
    /* rotate only non-road tiles (pavement/plaza/grass + decor look good rotated; roads have directional lines) */
    if(t!=='road' && c.rot!=null && c.rot>0) g.rotation.y = c.rot * Math.PI/2;
    bake(g);root.add(g);meshes[k]=g;return}
  if(t==='fishery'){buildFishery(g,i,j,c);if(c.rot!=null&&c.rot>0) g.rotation.y = c.rot * Math.PI/2;root.add(g);meshes[k]=g;return}

  /* ---- buildings (square footprint, merge into blocks with neighbours) ---- */
  g.userData.pk=true;
  if(c.pl)slab(g,i,j,MT(plazaTex()),.07);
  const T=TY[t],fac=t==='factory',condo=t==='condo',height=c.h||1;
  const nb=DIRS.map(d=>isBld(i+d[0],j+d[1])),block=(csz[k]>1||condo||fac);
  const x0=nb[2]?-.5:-.47,x1=nb[0]?.5:.47,z0=nb[3]?-.5:-.47,z1=nb[1]?.5:.47,wX=x1-x0,wZ=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
  const ext=[x1,z1,-x0,-z0],offs=[cz,cx,cz,cx];
  const wl=WALLS[(c.c||0)%WALLS.length];
  const wm=fac?MT(brick('#6b3f33')):condo?MT(conc()):wl[0]==='b'?MT(brick(wl[1])):MT(plaster(wl[1]));
  mk(BOX,'#8f8a80',wX+.04,.07,wZ+.04,cx,.035,cz,g);
  const lower=new THREE.Group(),top=new THREE.Group();top.position.y=.05+(height-1)*FH;g.add(lower,top);
  let doorDi=DIRS.findIndex((d,n)=>!nb[n]&&isWalk(i+d[0],j+d[1]));if(doorDi<0)doorDi=DIRS.findIndex((d,n)=>!nb[n]&&isRoad(i+d[0],j+d[1]));if(doorDi<0)doorDi=nb.findIndex(b=>!b);if(doorDi<0)doorDi=0;
  if(c.rot!=null&&c.rot>=0&&c.rot<=3) doorDi=c.rot; else c.rot=doorDi;
  for(let f=0;f<height;f++){
    const p=f===height-1?top:lower,y=f===height-1?0:.05+f*FH;
    mk(BOX,wm,wX,FH,wZ,cx,y+FH/2,cz,p);
    mk(BOX,block?'#b3a590':'#d9cfc0',wX+.04,.09,wZ+.04,cx,y+.045,cz,p);
    DIRS.forEach((d,di)=>{
      if(H(i+d[0],j+d[1])>f)return;
      const lit=((i*31+j*17+f*13+di*7)&3)===0,odd=(f+di)%2===0;
      face(p,di,ext[di],offs[di],o=>{
        if(f===0&&di===doorDi)entrance(o,y,t,isWalk(i+d[0],j+d[1]));
        else if(f===0&&t!=='home'&&t!=='condo'&&!fac)front(o,y,t);
        else windowF(o,y,t,lit,odd)});
    });
  }
  const rc=ROOFS[(c.r||0)%ROOFS.length];
  if(T.acc)mk(BOX,T.acc,wX+.05,.08,wZ+.05,cx,FH-.1,cz,top);
  if(!block){
    mk(CONE4,MT(roofT(rc)),.8,1.0,.8,cx,FH+.5,cz,top).rotation.y=Math.PI/4;
    mk(BOX,rc,wX+.1,.07,wZ+.1,cx,FH+.035,cz,top);
    if(c.ch)mk(BOX,'#8f4a3b',.2,.62,.2,.3,FH+.66,.1,top),mk(BOX,'#4a2b25',.26,.06,.26,.3,FH+.98,.1,top);
  }else{
    mk(BOX,'#a89b86',wX+.02,.16,wZ+.02,cx,FH+.08,cz,top);
    mk(BOX,'#4a4d52',wX-.12,.05,wZ-.12,cx,FH+.15,cz,top);
    mk(BOX,'#b9bec2',.26,.18,.2,cx+.15,FH+.26,cz-.15,top);
    if(height>=3||condo){mk(CYL12,'#6b4a32',.14,.3,.14,cx-.2,FH+.32,cz+.12,top);mk(CONE,'#4a3426',.16,.12,.16,cx-.2,FH+.53,cz+.12,top)}
    if(condo)mk(CYL12,'#cfd3d6',.015,.8,.015,cx+.1,FH+.55,cz+.2,top,false);
  }
  if(fac){
    [[-.2,-.15,1.3],[.2,.15,1.0]].forEach(sk=>{mk(CYL12,'#8a4a3a',.13,sk[2],.13,sk[0],FH+.2+sk[2]/2,sk[1],top);mk(CYL12,'#e8e4dc',.137,.1,.137,sk[0],FH+.2+sk[2]-.1,sk[1],top,false)});
    SMOKE=SMOKE||new THREE.MeshStandardMaterial({color:'#d8d8d8',transparent:true,opacity:.78,roughness:1});
    g.userData.smoke=[];
    for(let n=0;n<8;n++){const m=new THREE.Mesh(SPH,SMOKE);m.userData.keep=1;const sk=n%2?[.2,.15,1.15]:[-.2,-.15,1.5];top.add(m);g.userData.smoke.push({m,x:sk[0],z:sk[1],y:FH+sk[2]+.2,ph:n/8})}
  }
  bake(lower);bake(top);bake(g);g.userData.top=top;
  root.add(g);meshes[k]=g;
}
function clusters(){
  csz={};const seen={};
  Object.keys(cells).forEach(k=>{
    if(seen[k])return;const [i,j]=k.split(',').map(Number);
    if(!isBld(i,j)){seen[k]=1;return}
    const st=[k],grp=[];seen[k]=1;
    while(st.length){const a=st.pop();grp.push(a);const [p,q]=a.split(',').map(Number);
      DIRS.forEach(d=>{const n=key(p+d[0],q+d[1]);if(!seen[n]&&cells[n]&&isBld(p+d[0],q+d[1])){seen[n]=1;st.push(n)}})}
    grp.forEach(a=>csz[a]=grp.length);
  });
}
function rebuildAll(){Object.keys(meshes).forEach(k=>{root.remove(meshes[k]);disp(meshes[k]);delete meshes[k]});clusters();Object.keys(cells).forEach(k=>{const [i,j]=k.split(',').map(Number);buildCell(i,j,false)})}
function refresh(keysSet){
  const old=csz;clusters();const set=new Set();
  keysSet.forEach(k=>{set.add(k);const [i,j]=k.split(',').map(Number);DIRS.forEach(d=>set.add(key(i+d[0],j+d[1])))});
  Object.keys(csz).forEach(k=>{if(old[k]!==csz[k])set.add(k)});Object.keys(old).forEach(k=>{if(csz[k]===undefined)set.add(k)});
  set.forEach(k=>{const [i,j]=k.split(',').map(Number);if(inB(i,j))buildCell(i,j,keysSet.has(k))});
}

/* ---- cars drive ONLY on roads, people walk ONLY on pavements / plazas / crosswalks ---- */
function mkMover(kd){
  const g=new THREE.Group();
  if(kd==='car'){const c=rnd(CARS);mk(BOX,c,.26,.12,.5,0,.12,0,g);mk(BOX,'#e9f6fb',.22,.1,.24,0,.23,-.03,g);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(w=>{const m=mk(CYL12,'#2d3436',.065,.05,.065,w[0]*.14,.065,w[1]*.16,g);m.rotation.z=Math.PI/2});
    mk(BOX,'#fff3b0',.05,.04,.02,.07,.13,.26,g,false);mk(BOX,'#fff3b0',.05,.04,.02,-.07,.13,.26,g,false)}
  else personMesh(g);
  g.traverse(o=>{if(o.isMesh)o.castShadow=false});scene.add(g);return g}
function listTiles(fn){const a=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++)if(fn(i,j))a.push([i,j]);return a}
const okFor=(kd,i,j)=>kd==='car'?isRoad(i,j):isWalk(i,j);
const nbrs=(kd,p)=>DIRS.map(d=>[p[0]+d[0],p[1]+d[1]]).filter(q=>okFor(kd,q[0],q[1]));
function nextStep(m){
  let o=nbrs(m.kind,m.a);const n=o.filter(p=>!(m.prev&&p[0]===m.prev[0]&&p[1]===m.prev[1]));if(n.length)o=n;
  m.b=o.length?rnd(o):m.a}
function syncMovers(){
  movers=movers.filter(m=>{const ok=okFor(m.kind,m.a[0],m.a[1])&&okFor(m.kind,m.b[0],m.b[1]);if(!ok)scene.remove(m.mesh);return ok});
  const S0=stats();
  const roads=listTiles(isRoad).filter(p=>nbrs('car',p).length),walk=listTiles(isWalk).filter(p=>nbrs('person',p).length);
  /* no roads -> no cars. no pavements -> no people. */
  const want={car:roads.length>=2?Math.min(18,1+Math.floor(roads.length/4)+G.era*2+Math.floor(S0.pop/12)):0,
              person:walk.length>=2?Math.min(22,Math.min(Math.ceil(walk.length/2),2+Math.round(S0.pop/3))):0};
  ['car','person'].forEach(kd=>{
    const pool=kd==='car'?roads:walk;let have=movers.filter(m=>m.kind===kd);
    while(have.length>want[kd]){const m=have.pop();scene.remove(m.mesh);movers.splice(movers.indexOf(m),1)}
    while(have.length<want[kd]&&pool.length){const a=rnd(pool),m={kind:kd,mesh:mkMover(kd),a,b:a,t:0,prev:null,sp:kd==='car'?1.05+Math.random()*.3:.45+Math.random()*.2,lat:kd==='car'?.17:(Math.random()<.5?-1:1)*(.1+Math.random()*.12),ang:0,ph:Math.random()*9};
      m.mesh.position.set(wx(a[0]),.05,wx(a[1]));nextStep(m);movers.push(m);have.push(m)}});
  hud();
}
const topY=(i,j)=>{const c=cellAt(i,j);if(!c)return 0.05;return c.t==='pavement'?0.075:c.t==='plaza'?0.065:0.045};
function updMovers(dt,t){
  const occ=new Set();
  movers.forEach(m=>{if(m.kind==='person')occ.add(key(...(m.t>.5?m.b:m.a)))});
  movers.forEach(m=>{
    let go=true;
    if(m.kind==='car'&&m.a!==m.b&&m.t<.55){if(isCW(m.b[0],m.b[1])&&occ.has(key(m.b[0],m.b[1])))go=false}   // cars yield on crosswalks
    if((m.a!==m.b||m.t>0)&&go)m.t+=dt*m.sp;
    if(m.t>=1){m.prev=m.a;m.a=m.b;m.t=0;if(!okFor(m.kind,m.a[0],m.a[1])){scene.remove(m.mesh);m.dead=1;return}nextStep(m)}
    const pa=[wx(m.a[0]),wx(m.a[1])],pb=[wx(m.b[0]),wx(m.b[1])],dx=pb[0]-pa[0],dz=pb[1]-pa[1];
    const tgt=(dx||dz)?Math.atan2(dx,dz):m.ang;let df=tgt-m.ang;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;m.ang+=df*Math.min(1,dt*(m.kind==='car'?6:9));
    const e=m.t,px=pa[0]+dx*e+(-Math.cos(m.ang))*m.lat,pz=pa[1]+dz*e+Math.sin(m.ang)*m.lat;
    const bob=m.kind==='person'?Math.abs(Math.sin(t*9+m.ph))*.035:Math.sin(t*14+m.ph)*.006;
    const y=topY(m.a[0],m.a[1])*(1-e)+topY(m.b[0],m.b[1])*e;
    m.mesh.position.set(px,y+bob,pz);m.mesh.rotation.y=m.ang;
  });
  if(movers.some(m=>m.dead))movers=movers.filter(m=>!m.dead);
}

/* ---- building actions (square tiles) ---- */
function ripple(i,j){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(wx(i),.12,wx(j));scene.add(m);ripples.push({m,t0:performance.now()/1000})}
const need=n=>toast('Not enough coins 💰 — need '+n);
function sfx(f,d,ty,v,s){const n=performance.now();if(n-lastBeep<55)return;lastBeep=n;beep(f,d,ty,v,s)}
const surcharge=(i,j)=>LAND(i,j)?0:6;   // laying things on open sea costs a little extra
function pay(c){if(G.coins<c){need(c);return false}G.coins-=c;return true}
function applyAt(i,j,mode,drag){
  if(visiting||!inB(i,j))return false;
  const k=key(i,j),c=cells[k],land=LAND(i,j),T=TY[kind];
  /* ----- erase ----- */
  if(mode==='erase'){
    if(!c)return false;
    if(c.d){const dc=TY[c.d].cost;G.coins+=Math.floor(dc/2);delete c.d;if(c.t==='grass')delete cells[k];sfx(300,.12,'sine',.09,110);return k}
    const tt=TY[c.t];
    if(tt&&tt.cat==='b'&&c.h>1){G.coins+=Math.floor(tt.cost*.3);c.h--}
    else if(tt&&tt.cat==='b'&&c.pl){G.coins+=Math.floor(tt.cost/2);const keep=c;cells[k]={t:'plaza',r:keep.r}}
    else{G.coins+=Math.floor(((tt&&tt.cost)||0)/2);delete cells[k]}
    sfx(300,.14,'sine',.1,110);return k}
  /* ----- paint: re-type or re-colour a building ----- */
  if(mode==='paint'){
    if(!c||!TY[c.t]||TY[c.t].cat!=='b'){if(!drag)toast('Tap a building to change its type or colour');return false}
    if(color>=0&&(kind===c.t||T.cat!=='b')){c.c=color;sfx(520,.08,'triangle',.08);return k}
    if(T.cat!=='b'){if(!drag)toast('Pick a building type first');return false}
    if(T.u>G.era){toast('🔒 '+T.n+' unlocks in '+ERAS[T.u]);return false}
    if(kind===c.t&&color<0)return false;
    if(kind==='fishery'||c.t==='fishery'){toast('Fisheries can only be built on open water');return false}
    const cost=Math.round(T.cost*.5);if(!pay(cost))return false;
    c.t=kind;c.h=Math.min(c.h||1,T.max);if(color>=0)c.c=color;if(!drag)toast(T.e+' Now a '+T.n);sfx(520,.1,'triangle',.1);return k}
  /* ----- build ----- */
  if(T.u>G.era){if(!drag)toast('🔒 '+T.n+' unlocks in '+ERAS[T.u]);return false}
  const rcol=color>=0?color:Math.floor(Math.random()*WALLS.length);
  if(isDeco(kind)){
    if(!c){if(!land){if(!drag)toast('🌳 Decor needs solid ground — lay a 🟫 Plaza on the water first');return false}
      if(!pay(T.cost))return false;cells[k]={t:'grass',d:kind,r:Math.floor(Math.random()*9)};sfx(480,.08,'triangle',.08);return k}
    if(c.t==='grass'||c.t==='pavement'||c.t==='plaza'){
      if(c.d===kind)return false;if(!pay(T.cost))return false;c.d=kind;c.r=Math.floor(Math.random()*9);sfx(480,.08,'triangle',.08);return k}
    if(!drag)toast('That tile is taken — pick a free tile, grass, pavement or plaza');return false}
  if(kind==='crosswalk'){
    if(!c||c.t!=='road'){if(!drag)toast('🚸 Lay a 🛣️ Road first, then add a crosswalk on it');return false}
    const m=roadMask(i,j);if(m!==5&&m!==10){if(!drag)toast('Crosswalks go on straight road pieces');return false}
    if(c.cw&&drag)return false;
    if(c.cw){c.cw=0;if(!drag)toast('Crosswalk removed');return k}
    if(!pay(T.cost))return false;c.cw=1;if(!drag)toast('🚸 Crosswalk — people can cross here and cars will stop');sfx(520,.08,'triangle',.08);return k}
  if(kind==='road'||kind==='pavement'||kind==='plaza'||kind==='parking'){
    const extra=surcharge(i,j);
    if(!c){if(!pay(T.cost+extra))return false;cells[k]={t:kind,r:Math.floor(Math.random()*9)};sfx(260+Math.random()*80,.1,'sine',.1,400);return k}
    if(c.t===kind)return false;
    if(TY[c.t]&&TY[c.t].cat==='b'){if(!drag)toast('A building is here — erase it first');return false}
    if(!pay(Math.round(T.cost*.6)))return false;
    const d=c.d;c.t=kind;delete c.cw;if(kind==='road'||kind==='parking')delete c.d;else if(d)c.d=d;sfx(300,.1,'sine',.08,420);return k}
  /* buildings */
  if(kind==='fishery'){
    if(c){if(c.t!=='fishery'){if(!drag)toast('🎣 Fisheries must be built on open water');return false}
      if(drag)return false;if(c.h>=T.max){toast('Max size for a Fishery ('+T.max+' tanks)');return false}
      const cost=Math.round(T.cost*.6);if(!pay(cost))return false;c.h++;toast('🎣 Bigger tank — more fish! (−'+cost+' 💰)');sfx(520,.1,'triangle',.1);return k}
    if(land){if(!drag)toast('🎣 Fisheries go on the water — tap a blue tile');return false}
    if(!pay(T.cost))return false;cells[k]={t:'fishery',h:1,c:0,r:Math.floor(Math.random()*ROOFS.length)};if(!drag)toast('🎣 Fishery built — look at the fish in the tank!');sfx(240+Math.random()*120,.16,'sine',.13,560);return k}
  if(c){
    if(c.t===kind){if(drag)return false;if(c.h>=T.max){toast('Max height for a '+T.n+' ('+T.max+' floors)');return false}
      const cost=Math.round(T.cost*.6);if(!pay(cost))return false;c.h++;if(color>=0)c.c=color;toast(T.e+' Floor '+c.h+' (−'+cost+' 💰)');sfx(300,.12,'sine',.1,500);return k}
    if(TY[c.t]&&TY[c.t].cat==='b'){if(!drag)toast('Use the 🖌️ tool to change a building’s type');return false}
    if(c.t==='plaza'||c.t==='grass'){
      if(!pay(T.cost))return false;cells[k]={t:kind,h:1,c:rcol,r:Math.floor(Math.random()*ROOFS.length),ch:Math.random()<.4?1:0,pl:c.t==='plaza'?1:0};sfx(240+Math.random()*120,.16,'sine',.13,560);return k}
    if(!drag)toast('Buildings go on grass or a 🟫 Plaza — erase this tile first');return false}
  if(!land){if(!drag)toast('Lay a 🟫 Plaza on the water first, then build on it');return false}
  if(!pay(T.cost))return false;
  const nb=DIRS.map(d=>cellAt(i+d[0],j+d[1])).filter(x=>x&&TY[x.t]&&TY[x.t].cat==='b');
  cells[k]={t:kind,h:1,c:color>=0?color:(nb.length?rnd(nb).c:rcol),r:Math.floor(Math.random()*ROOFS.length),ch:Math.random()<.4?1:0};
  if(!drag)toast(nb.length?'Connected! Buildings now share a roof 🏘️':T.e+' New '+T.n+' (−'+T.cost+' 💰)');
  sfx(240+Math.random()*120,.16,'sine',.13,560);setTimeout(()=>beep(820,.08,'triangle',.06),70);return k;
}
const snapshot=()=>JSON.stringify({c:cells,$:G.coins,f:G.fish||0});
function rotateAt(i,j){
  if(visiting||!inB(i,j))return;
  const k=key(i,j),c=cells[k];
  if(!c){toast('Nothing to rotate');return}
  const T=TY[c.t];
  // rotatable: buildings, decor on grass/pavement/plaza, fishery, and standalone decor
  const can = (T && (T.cat==='b' || T.cat==='d')) || c.d || c.t==='fishery' || c.t==='grass';
  if(!can){toast('This tile cannot be rotated');return}
  undo.push(snapshot());
  if(undo.length>40)undo.shift();
  c.rot = ((c.rot||0)+1)%4;
  refresh(new Set([k]));
  sfx(480,.08,'triangle',.09);
  toast('Rotated 90° · facing ' + ['East','South','West','North'][c.rot]);
  hud();save();cloudSave();
}
function beginStroke(mode,drag){stroke={prev:snapshot(),seen:new Set(),changed:new Set(),mode,drag,li:-1,lj:-1}}
function strokeTile(i,j){
  const k=key(i,j);if(stroke.seen.has(k))return;stroke.seen.add(k);
  const r=applyAt(i,j,stroke.mode,stroke.drag);
  if(r){stroke.changed.add(r);refresh(new Set([r]));if(!stroke.drag)ripple(i,j);hud()}}
function strokeTo(i,j){
  if(stroke.li<0){stroke.li=i;stroke.lj=j;strokeTile(i,j);return}
  let a=stroke.li,b=stroke.lj;const dx=Math.abs(i-a),dy=Math.abs(j-b),sx=a<i?1:-1,sy=b<j?1:-1;let er=dx-dy,guard=0;
  while((a!==i||b!==j)&&guard++<200){const e2=2*er;if(e2>-dy){er-=dy;a+=sx}if(e2<dx){er+=dx;b+=sy}strokeTile(a,b)}
  stroke.li=i;stroke.lj=j}
function endStroke(){
  if(!stroke)return;const s=stroke;stroke=null;
  if(!s.changed.size)return;
  undo.push(s.prev);if(undo.length>40)undo.shift();
  syncMovers();checkEra(stats());save();cloudSave()}

/* ---- persistence (v4 = everyone starts from scratch) ---- */
function freshState(){cells={};G={coins:300,era:0,fish:0,seen:{}};stamp=0}
function applyState(sv){cells=sv.cells||{};G=Object.assign({coins:300,era:0,fish:0,seen:{}},sv.G||{});stamp=sv.t||0}
function loadLocal(){
  try{localStorage.removeItem(OLDSTORE)}catch(e){}   // old hex-grid islands are wiped
  try{const sv=JSON.parse(localStorage.getItem(STORE));if(!sv||sv.v!==WIPE||!sv.cells)throw 0;applyState(sv)}catch(e){freshState()}}
function save(){if(visiting)return;stamp=Date.now();try{localStorage.setItem(STORE,JSON.stringify({v:WIPE,cells,G,t:stamp}))}catch(e){}}
function cloudSave(now){clearTimeout(cT);const go=()=>{try{if(user&&cloudDone&&!visiting)db.ref('towns/'+user.uid).set({data:JSON.stringify({v:WIPE,cells,G,t:stamp}),v:WIPE,t:firebase.database.ServerValue.TIMESTAMP,mayor:(profile&&profile.name)||'',era:G.era,pop:stats().pop}).catch(()=>{})}catch(e){}};now?go():cT=setTimeout(go,2500)}
function cloudInit(){
  cloudDone=false;const fin=()=>{if(cloudDone)return;cloudDone=true;types();syncMovers();hud();once('intro',[{t:()=>'Welcome to the island, Mayor '+mayor()+'! 🎩 I am Marina, your advisor. Everyone starts fresh — this is a brand new map!'},{t:'The whole sea is yours to build on. Start with a 🛣️ Road for the cars, add 🚶 Pavement beside it for people, then place 🏠 homes, a 🛍️ market and a 🎣 fishery out on the water.'},{t:'Tip: switch on ✏️ draw mode to paint long roads by dragging. You can even lay roads and pavement over the sea, and decorate with 🌳 trees, 🪑 benches and 💡 lamps. Reach the goal at the top to grow into a harbor, an industrial town, and finally a modern city!'}])};
  if(!user||!window.firebase){fin();return}
  const to=setTimeout(fin,4000);
  db.ref('towns/'+user.uid).once('value').then(sn=>{const v=sn.val();
    if(v&&v.data){let sv=null;try{sv=JSON.parse(v.data)}catch(e){}
      if(!sv||sv.v!==WIPE){db.ref('towns/'+user.uid).remove().catch(()=>{})}       // legacy island: wiped
      else{let lt=0;try{lt=(JSON.parse(localStorage.getItem(STORE)||'{}').t)||0}catch(e){}
        if((sv.t||0)>lt){applyState(sv);rebuildAll();toast('☁️ Island loaded from your account')}}}}).catch(()=>{}).then(()=>{clearTimeout(to);fin()})}
function restore(sv){const o=JSON.parse(sv);cells=o.c;G.coins=o.$;G.fish=o.f||0;rebuildAll();syncMovers();save();cloudSave()}

/* ---- mayor economy ---- */
const mayor=()=>(profile&&profile.name)||'Mayor';
function stats(){const S={pop:0,inc:0,am:0,fac:0,fish:0,road:0,walk:0,deco:0};
  Object.values(cells).forEach(c=>{if(c.d)S.deco++;if(c.t==='road')S.road++;if(c.t==='pavement'||c.t==='plaza')S.walk++;
    const T=TY[c.t];if(!T||T.cat!=='b')return;S.pop+=(T.pop||0)*c.h;S.inc+=(T.inc||0)*c.h;if(T.am)S.am+=c.h;if(c.t==='factory')S.fac+=c.h;if(c.t==='fishery')S.fish+=c.h});
  S.hap=cl(72+Math.min(22,S.am*4)+Math.min(10,S.deco*.8)-S.fac*7-(G.ind?8:0)+(G.green?6:0),15,100);return S}
const GOALS=[S=>S.pop>=12&&S.fish>=1,S=>S.pop>=30&&S.fish>=2&&S.am>=3,S=>S.pop>=70&&S.fac>=2],GT=['12 people + a 🎣 Fishery','30 people, 2 🎣 Fishery tanks, 3 shop/restaurant floors','70 people + 2 🏭 factory floors'];
function hud(S){S=S||stats();$('tnEra').textContent=['🎣','⚓','🏭','🏙️'][G.era]+' '+ERAS[G.era];$('tnStats').textContent='💰 '+G.coins+'  👥 '+S.pop+'  🐟 '+Math.floor(G.fish||0)+'  '+(S.hap>=70?'😊':S.hap>=45?'😐':'😠')+Math.round(S.hap);
  $('tnGoal').textContent=G.era<3?'🎯 Next era: '+GT[G.era]:'🏙️ Modern City — keep building!'}
function checkEra(S){if(G.era<3&&GOALS[G.era](S)){G.era++;G.coins+=150;types();snd('win');eraDlg(G.era)}hud(S)}
function tick(dt){if(visiting||!cloudDone||dlgOpen)return;acc+=dt;if(acc<4)return;acc=0;const S=stats(),inc=Math.round((S.inc+S.pop*.3)*S.hap/100)+3+Math.min(8,Math.floor((S.road+S.walk)/8));   // base taxes: you can never get stuck at 0
  G.coins+=inc;G.fish=(G.fish||0)+S.fish*3;if(inc>0)beep(1100,.05,'sine',.05);checkEra(S);
  if(S.fish)once('fish',[{t:'The fishermen are bringing in the catch! 🐟 Peek into the fishery tank to see the fish swimming, and watch for fish leaping out of the sea. Each tank adds steady income.'}]);
  if(S.fac)once('fac',[{t:'Mayor, the factory smokestacks are working hard 🏭 — great income, but smoke makes residents unhappy. Balance it with shops, restaurants and 🌳 trees.'}]);
  if(S.hap<45)once('hap',[{t:()=>'Mayor '+mayor()+', the people are unhappy 😠! Pollution is high. Add more markets, restaurants, laundromats — and trees and flowers always help.'}]);
  if(G.coins<25)once('broke',[{t:'We are almost out of coins 💰. Be patient — taxes arrive every few seconds. You can also erase a building to get half its cost back.'}]);
  if(S.road>=2)once('road',[{t:'Look — cars are on the road! 🚗 They only drive on 🛣️ roads. Add 🚶 pavement beside them and people will walk there, and a 🚸 crosswalk lets them cross while cars stop.'}]);
  if(Math.max(0,...Object.values(csz))>=2)once('block',[{t:'Connected buildings form a city block 🏘️ — shared walls, a flat parapet roof and rooftop gear. That is how real cities grow!'}]);
  hud(S);save();if(++tk%5===0)cloudSave()}
function eraDlg(e){
  if(e===1)say([{t:()=>'Look at the harbor, Mayor '+mayor()+'! We are now a HARBOR TOWN ⚓🎉'},{t:'Folks want somewhere to eat and wash their clothes. 🍽️ Restaurants and 🧺 Laundromats are unlocked, and the province sent a 150 coin grant!'}]);
  if(e===2)say([{t:'An INDUSTRIAL TOWN! Steam, steel and smokestacks 🏭 (+150 coins grant).'},{t:'Ironworks Co. wants to build in our town and offers 300 coins up front, but their smoke will upset residents. Your call, Mayor.',
    ch:[{t:'Accept the deal (+300 💰, more pollution)',fn:()=>{G.coins+=300;G.ind=1;hud()}},{t:'Decline — keep our air clean (+happiness)',fn:()=>{G.green=1;hud()}}]},{t:'Factories are unlocked! They earn a fortune but cost happiness. Balance them with shops and restaurants.'}]);
  if(e===3)say([{t:()=>'We did it, Mayor '+mayor()+'! 🏙️ A MODERN CITY rose from a fishing village!'},{t:'🏢 Condominiums are unlocked. Build up to 8 floors high and keep the citizens happy. The sea built this town — now make it shine ✨'}]);
}
/* ---- dialogue box ---- */
function once(id,lines){if(G.seen[id])return;G.seen[id]=1;say(lines)}
function say(lines){dq.push(...lines);if(!dlgOpen)nextLine()}
function nextLine(){const l=dq.shift();clearInterval(dTimer);
  if(!l){dlgOpen=false;dCur=null;$('tnDlg').classList.remove('on');save();return}
  dlgOpen=true;dCur=l;$('tnDlg').classList.add('on');$('tnCh').innerHTML='';$('tnNext').style.display='none';dFull=typeof l.t==='function'?l.t():l.t;
  const el=$('tnTxt');el.textContent='';let i=0;dTimer=setInterval(()=>{i+=2;el.textContent=dFull.slice(0,i);if(i%8===0)beep(600+Math.random()*80,.02,'square',.012);if(i>=dFull.length)finishLine()},24)}
function finishLine(){clearInterval(dTimer);$('tnTxt').textContent=dFull;const l=dCur;if(!l)return;
  if(l.ch){$('tnCh').innerHTML=l.ch.map((c,j)=>'<button class="btn btn-mint" data-j="'+j+'">'+c.t+'</button>').join('');$('tnCh').querySelectorAll('button').forEach(b=>b.onclick=()=>{const f=l.ch[+b.dataset.j].fn;if(f)f();snd('ok');nextLine()})}
  else $('tnNext').style.display=''}

/* ---- picking ---- */
let RAY,MV,PLANE;
function setRay(cx,cy){RAY=RAY||new THREE.Raycaster();MV=MV||new THREE.Vector2();PLANE=PLANE||new THREE.Plane(new THREE.Vector3(0,1,0),0);
  const b=cv.getBoundingClientRect();MV.set((cx-b.left)/b.width*2-1,-((cy-b.top)/b.height)*2+1);RAY.setFromCamera(MV,cam)}
function groundAt(cx,cy){setRay(cx,cy);const p=new THREE.Vector3();return RAY.ray.intersectPlane(PLANE,p)?p:null}
function pickTile(cx,cy,useMesh){
  if(useMesh){setRay(cx,cy);const list=Object.values(meshes).filter(g=>g.userData.pk);
    const hit=list.length?RAY.intersectObjects(list,true)[0]:null;
    if(hit){let o=hit.object;while(o&&!(o.userData&&o.userData.k))o=o.parent;if(o){const a=o.userData.k.split(',').map(Number);return a}}}
  const p=groundAt(cx,cy);if(!p)return null;const i=Math.floor(p.x+HALF),j=Math.floor(p.z+HALF);return inB(i,j)?[i,j]:null}

/* ---- camera input: drag = pan (grab the ground), pinch = zoom, twist = rotate. ✏️ draw mode: drag paints tiles ---- */
function panBy(px,py,x,y){updateCam();const a=groundAt(px,py),b=groundAt(x,y);if(!a||!b)return null;
  const dx=a.x-b.x,dz=a.z-b.z;ttx=cl(ttx+dx,-HALF,HALF);ttz=cl(ttz+dz,-HALF,HALF);tx=ttx;tz=ttz;return[dx,dz]}
function gestureState(){const a=[...ptrs.values()];return{mx:(a[0].x+a[1].x)/2,my:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1,ang:Math.atan2(a[1].y-a[0].y,a[1].x-a[0].x)}}
function onDown(e){
  ensureAudio();try{cv.setPointerCapture(e.pointerId)}catch(_){}
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});vx=vz=0;
  if(ptrs.size===2){endStroke();const s=gestureState();pd=s.d;pang=s.ang;down&&(down.moved=true,down.mode='gesture');pgx=s.mx;pgy=s.my}
  else if(ptrs.size===1)down={btn:e.button,x:e.clientX,y:e.clientY,t:performance.now(),moved:false,mode:null,shift:e.shiftKey,lt:performance.now()};
}
let pgx=0,pgy=0;
function onMove(e){
  const p=ptrs.get(e.pointerId);
  if(!p){if(e.pointerType==='mouse')hovP={x:e.clientX,y:e.clientY};return}
  const px=p.x,py=p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===2){
    const s=gestureState();
    tdist=cl(tdist*pd/s.d,minD,maxD);                                  // pinch out = zoom in
    let da=s.ang-pang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
    if(Math.abs(s.ang-pang)<1)taz-=da;                                 // twist clockwise = map turns clockwise
    panBy(pgx,pgy,s.mx,s.my);pd=s.d;pang=s.ang;pgx=s.mx;pgy=s.my;return}
  if(!down)return;
  if(!down.moved){
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<=(e.pointerType==='mouse'?4:9))return;
    down.moved=true;
    const rot=down.btn===2||(down.shift&&down.btn===0);
    down.mode=rot?'rotate':down.btn===1?'pan':(drawMode&&down.btn===0&&tool!=='rotate')?'draw':'pan';
    if(down.mode==='draw'){beginStroke(down.btn===2?'erase':tool,true);const c=pickTile(down.x,down.y,false);if(c)strokeTo(c[0],c[1])}
    hov.visible=false;
    if(down.mode==='pan'){down.lx=down.x;down.ly=down.y}}
  if(down.mode==='rotate'){taz+=(e.clientX-px)*.008;tpol=cl(tpol-(e.clientY-py)*.006,.25,1.3)}   // drag right -> scene turns with the hand; drag down -> look from higher up
  else if(down.mode==='pan'){const now=performance.now(),d=panBy(down.lx,down.ly,e.clientX,e.clientY),dtm=Math.max(.008,(now-down.lt)/1000);
    if(d){vx=vx*.5+(d[0]/dtm)*.5;vz=vz*.5+(d[1]/dtm)*.5}down.lx=e.clientX;down.ly=e.clientY;down.lt=now}
  else if(down.mode==='draw'&&stroke){const c=pickTile(e.clientX,e.clientY,false);if(c)strokeTo(c[0],c[1])}
}
function onUp(e){
  if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);
  if(ptrs.size===0&&down){
    const d=down;down=null;
    if(!d.moved&&performance.now()-d.t<900){const c=pickTile(d.x,d.y,true);if(c){if(tool==='rotate'){rotateAt(c[0],c[1])}else{beginStroke(d.btn===2?'erase':tool,false);strokeTile(c[0],c[1]);endStroke()}}}
    else if(d.mode==='draw')endStroke();
    else if(d.mode==='pan'&&performance.now()-d.lt<90){const sp=Math.hypot(vx,vz),cap=dist*1.2+10;if(sp>cap){const f=cap/sp;vx*=f;vz*=f}}else{vx=vz=0}
  }else if(ptrs.size===1&&down){down.moved=true;down.mode='pan';const r=[...ptrs.values()][0];down.lx=r.x;down.ly=r.y;down.lt=performance.now();vx=vz=0}
}
let hovP=null;
function hoverUpdate(){
  if(!hovP||!cv)return;const c=pickTile(hovP.x,hovP.y,true);hovP=null;
  if(!c){hov.visible=false;return}
  const cc=cellAt(c[0],c[1]),h=cc&&TY[cc.t]&&TY[cc.t].cat==='b'?(cc.h||1)*FH+.1:.1;
  hov.position.set(wx(c[0]),h,wx(c[1]));hov.visible=true;hov.material.color.set(tool==='erase'?0xff6b6b:tool==='paint'?0xffd166:tool==='rotate'?0x74b9ff:drawMode?0x5ef0c4:0xffffff)}

/* ---- UI ---- */
function swatches(){const el=$('tnSw');el.innerHTML='<button class="sw'+(color<0?' on':'')+'" data-c="-1">🎲</button>'+WALLS.map((c,i)=>'<button class="sw'+(color===i?' on':'')+'" data-c="'+i+'" style="background:'+c[1]+'"></button>').join('');
  el.querySelectorAll('.sw').forEach(b=>b.onclick=()=>{color=+b.dataset.c;swatches();snd('tap')})}
function cats(){syncBar();const el=$('tnCats');el.innerHTML=CATS.map(c=>'<button class="tc'+(cat===c[0]?' on':'')+'" data-c="'+c[0]+'"><span>'+c[1]+'</span>'+c[2]+'</button>').join('');
  el.querySelectorAll('.tc').forEach(b=>b.onclick=()=>{cat=b.dataset.c;if(TY[kind].cat!==cat)kind=Object.keys(TY).find(k=>TY[k].cat===cat&&TY[k].u<=G.era);if(tool==='erase')setTool('build');cats();types();snd('tap')})}
function types(){const el=$('tnTypes');el.innerHTML=Object.keys(TY).filter(k=>TY[k].cat===cat).map(k=>{const T=TY[k],lk=T.u>G.era;return '<button class="tp'+(kind===k?' on':'')+(lk?' lk':'')+'" data-k="'+k+'"><span>'+(lk?'🔒':T.e)+'</span>'+T.n+'<small>💰'+T.cost+'</small></button>'}).join('');
  el.querySelectorAll('.tp').forEach(b=>b.onclick=()=>{const T=TY[b.dataset.k];if(T.u>G.era){toast('🔒 '+T.n+' unlocks in '+ERAS[T.u]);return}kind=b.dataset.k;if(tool==='erase')setTool('build');types();snd('tap')})}
function syncBar(){const b=document.querySelector('.tn-bar');if(b){b.dataset.tool=tool;b.dataset.cat=cat}}
function setTool(t){tool=t;syncBar();['Build','Paint','Erase','Rotate'].forEach(n=>$('tn'+n).classList.toggle('on',t===n.toLowerCase()));snd('tap')}
function setDraw(b){drawMode=b;$('tnDraw').classList.toggle('on',b);$('tnDraw').textContent=b?'✏️':'🖐️';$('tnDraw').title=b?'Draw mode: drag to paint tiles':'Move mode: drag to pan the map';
  toast(b?'✏️ Draw mode — drag to paint roads, pavement, anything (two fingers still move the camera)':'🖐️ Move mode — drag to pan the map')}
function setNight(b,q){
  night=b;
  $('tnNight').textContent=b?'☀️':'🌙';
  $('tnNight').title=b?'Switch to day':'Switch to night — windows, lamps & signs light up';
  sun.intensity=b?.12:.9;
  sun.color.set(b?0x6a7ab8:0xffd7a3);
  hemi.intensity=b?.22:.5;
  hemi.color.set(b?0x1a2540:0xfff1dc);hemi.groundColor.set(b?0x0a1018:0xa89478);
  if(ren)ren.toneMappingExposure=b?1.05:.92;
  scene.fog.color.set(b?0x0c1528:0xd8d3c2);
  scene.fog.near=b?30:45;
  scene.fog.far=b?160:220;
  water.material.color.set(b?'#0a1e2e':'#2b7c8e');
  /* Windows & lamps glow strongly at night */
  WL.emissiveIntensity=b?2.4:.25;
  WL.emissive.setHex(b?0xffc878:0xffa940);
  LAMPM.emissiveIntensity=b?4.5:.2;
  LAMPM.emissive.setHex(b?0xffe8a0:0xffd070);
  /* Even “dark” glass gets a soft city glow so the skyline feels alive */
  GL.emissiveIntensity=b?.55:0;
  GL.emissive.setHex(b?0xffb060:0x000000);
  GL.color.setHex(b?0x3a4a5a:0x2f4856);
  signMats.forEach(m=>{m.emissiveIntensity=b?1.1:0});
  $('screen-town').style.background=b
    ?'linear-gradient(#070e1c,#121f38 55%,#1a2740)'
    :'linear-gradient(#86b6c8,#e3ddc9 62%,#f1ddbf)';
  if(!q){if(b)toast('🌙 Night mode — windows, street lamps & signs are lit');else toast('☀️ Day mode')}
}

/* ---- loop ---- */
function frame(now){
  if(!running)return;raf=requestAnimationFrame(frame);
  const t=now/1000,dt=Math.min(.05,(now-last)/1000||.016);last=now;const tt=performance.now()/1000;
  /* keyboard camera (desktop) */
  const ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iy=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
  if(ix||iy){const sp=dist*.9*dt,rx=Math.sin(az),rz=-Math.cos(az),fx=-Math.cos(az),fz=-Math.sin(az);ttx+=(rx*ix+fx*iy)*sp;ttz+=(rz*ix+fz*iy)*sp}
  if(keys.q)taz+=dt*1.6;if(keys.e)taz-=dt*1.6;
  if(vx||vz){ttx+=vx*dt;ttz+=vz*dt;const f=Math.exp(-4.5*dt);vx*=f;vz*=f;if(Math.hypot(vx,vz)<.05)vx=vz=0}
  ttx=cl(ttx,-HALF,HALF);ttz=cl(ttz,-HALF,HALF);
  const k=Math.min(1,dt*10);az+=(taz-az)*k;pol+=(tpol-pol)*k;dist+=(tdist-dist)*k;tx+=(ttx-tx)*Math.min(1,dt*14);tz+=(ttz-tz)*Math.min(1,dt*14);
  updateCam();
  scene.fog.near=dist*.9+40;scene.fog.far=dist*2+230;
  const sx=Math.round(tx/3)*3,sz=Math.round(tz/3)*3;if(sx!==lsx||sz!==lsz){lsx=sx;lsz=sz;shDirty=1}
  sun.position.set(sx+12,13,sz+8);sun.target.position.set(sx,0,sz);
  const ss=Math.round(cl(dist*.8,12,42));if(ss!==sunS){sunS=ss;shDirty=1;const sc=sun.shadow.camera;sc.left=sc.bottom=-ss;sc.right=sc.top=ss;sc.updateProjectionMatrix()}
  WT.value=t;hoverUpdate();
  Object.values(meshes).forEach(g=>{const u=g.userData;
    if(u.boat){u.boat.position.y=-.04+Math.sin(t*1.7+u.boat.position.x)*.045;u.boat.rotation.z=Math.sin(t*1.3+u.boat.position.z)*.06}
    if(u.fish)u.fish.forEach(f=>{const a=t*f.sp+f.ph,dx=-f.rx*Math.sin(a)*Math.sign(f.sp),dz=f.rz*Math.cos(a)*Math.sign(f.sp);
      f.g.position.set(f.cx+f.rx*Math.cos(a),f.y+Math.sin(t*2+f.ph)*.012,f.cz+f.rz*Math.sin(a));f.g.rotation.y=Math.atan2(-dz,dx);f.tail.rotation.y=Math.sin(t*12+f.ph)*.55});
    if(u.jump){const J=u.jump,s=((t+J.ph)%J.per)/J.per*J.per/.9;if(s<1){J.g.visible=true;J.g.position.set(-.35+.7*s,-.12+Math.sin(s*Math.PI)*.42,0);J.g.rotation.z=Math.cos(s*Math.PI)*.95;J.tail.rotation.y=Math.sin(t*25)*.6}else J.g.visible=false}
    if(u.smoke)u.smoke.forEach(p=>{const f=(tt*.3+p.ph)%1;p.m.position.set(p.x+f*.6,p.y+f*1.7,p.z+f*.15);p.m.scale.setScalar(.06+Math.sin(f*Math.PI)*.2)});
    if(u.top){const a=tt-u.t0;if(a<1.2){shDirty=1;const e=Math.max(.001,1-Math.exp(-5*a)*Math.cos(18*a));u.top.scale.set(1+(1-e)*.22,e,1+(1-e)*.22)}else if(u.top.scale.y!==1)u.top.scale.set(1,1,1)}});
  for(let i=ripples.length-1;i>=0;i--){const rp=ripples[i],a=tt-rp.t0;if(a>.9){scene.remove(rp.m);ripples.splice(i,1);continue}rp.m.scale.setScalar(1+a*1.6);rp.m.material.opacity=.6*(1-a/.9)}
  clouds.forEach(c=>{c.position.x+=c.userData.sp*dt;if(c.position.x>70)c.position.x=-70});
  gulls.forEach(g=>{const u=g.userData,a=t*u.sp+u.ph;g.position.set(Math.cos(a)*u.rad,u.y+Math.sin(t+u.ph)*.3,Math.sin(a)*u.rad);g.rotation.y=-a;const f=Math.sin(t*7+u.ph)*.5;u.wr.rotation.z=f;u.wl.rotation.z=-f});
  tick(dt);updMovers(dt,t);
  if(shDirty){ren.shadowMap.needsUpdate=true;shDirty=0}
  ren.render(scene,cam);

}
function start(){if(running)return;running=true;last=performance.now();raf=requestAnimationFrame(frame)}
function stop(){running=false;cancelAnimationFrame(raf);endStroke();if(cloudDone){save();cloudSave(true)}}
function fit(){ttx=ttz=0;tdist=maxD;tpol=Math.min(tpol,.75)}

function endVisit(){
  if(!visiting)return;visiting=null;
  if(mine){cells=mine.cells;G=mine.G;stamp=mine.stamp;mine=null}
  $('screen-town').classList.remove('visiting');rebuildAll();syncMovers();hud();
}
window.visitTown=function(uid,name,av){
  if(!user||!window.firebase)return;
  if(roomId){toast('Leave your current room first');return}
  if(!friendsData[uid]){toast('You can only visit friends’ towns');return}
  closePlayerCard();closeFriends();show('screen-town');
  loadThree(()=>{
    if(!ready)init();resize();start();
    const bail=m=>{toast(m);endVisit();stop();show('screen-lobby')};
    db.ref('towns/'+uid).once('value').then(sn=>{
      const v=sn.val();let sv=null;try{sv=v&&v.data&&JSON.parse(v.data)}catch(e){}
      if(!sv||sv.v!==WIPE||!sv.cells){bail((name||'Your friend')+' hasn’t built a town yet 🏝️');return}
      if(!visiting)mine={cells,G,stamp};
      visiting=uid;cells=sv.cells;G=Object.assign({coins:0,era:0,fish:0,seen:{}},sv.G||{});
      dq=[];dlgOpen=false;$('tnDlg').classList.remove('on');
      $('visName').textContent=(av||'🏝️')+' '+(name||'Friend')+'’s town';
      $('screen-town').classList.add('visiting');
      rebuildAll();syncMovers();fit();toast('👀 Visiting '+(name||'a friend')+' — view only');
    }).catch(()=>bail('Couldn’t open that town — check the database rules for towns'));
  });
};
window.openTown=function(){show('screen-town');loadThree(()=>{if(!ready)init();resize();start();cloudInit()})};
window.addEventListener('resize',()=>{if(ready&&running)resize()});window.addEventListener('orientationchange',()=>setTimeout(()=>{if(ready&&running)resize()},250));
$('tnBack').onclick=()=>{endVisit();stop();snd('tap');show('screen-lobby')};
$('tnBuild').onclick=()=>setTool('build');$('tnPaint').onclick=()=>setTool('paint');$('tnErase').onclick=()=>setTool('erase');$('tnRotate').onclick=()=>setTool('rotate');$('tnNight').onclick=()=>{setNight(!night);snd('tap')};
$('tnDraw').onclick=()=>setDraw(!drawMode);
$('tnMoreBtn').onclick=()=>$('tnMore').classList.toggle('on');
$('visLeave').onclick=()=>{endVisit();stop();snd('tap');show('screen-lobby')};
$('tnZi').onclick=()=>{tdist=cl(tdist*.75,minD,maxD);snd('tap')};$('tnZo').onclick=()=>{tdist=cl(tdist*1.35,minD,maxD);snd('tap')};
$('tnRl').onclick=()=>{taz+=Math.PI/4;snd('tap')};$('tnRr').onclick=()=>{taz-=Math.PI/4;snd('tap')};
$('tnTilt').onclick=()=>{tpol=tpol>.9?.3:tpol>.5?1.1:.65;snd('tap')};
$('tnFit').onclick=()=>{fit();snd('tap')};
$('tnUndo').onclick=()=>{if(!undo.length)return toast('Nothing to undo');restore(undo.pop());snd('tap')};
$('tnClear').onclick=()=>{if(!Object.keys(cells).length)return;undo.push(snapshot());cells={};rebuildAll();syncMovers();save();cloudSave();toast('Island cleared — tap ↩️ to bring it back')};
$('tnNext').onclick=()=>{snd('tap');nextLine()};$('tnTxt').onclick=()=>{if(dCur&&$('tnNext').style.display==='none'&&!dCur.ch||dCur&&dCur.ch&&dFull!==$('tnTxt').textContent)finishLine()};
$('tnSnd').onclick=()=>{toggleSound();$('tnSnd').textContent=soundOn?'🔊':'🔇'};
})();

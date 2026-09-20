(() => {
  'use strict';
  const canvas = document.getElementById('avatarCanvas');
  const mini = document.getElementById('miniCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const miniCtx = mini.getContext('2d', { alpha: false });
  [ctx, miniCtx].forEach(c => { c.imageSmoothingEnabled = false; });
  const choices = document.getElementById('choices');
  const choiceTitle = document.getElementById('choiceTitle');
  const choiceHelp = document.getElementById('choiceHelp');
  const status = document.getElementById('status');
  const undoBtn = document.getElementById('undoBtn');
  const resetDialog = document.getElementById('resetDialog');

  const skins = [
    ['Porcelain', '#f7d6bd'], ['Peach', '#f3bd94'], ['Golden', '#d99a67'], ['Warm brown', '#b86e45'],
    ['Chestnut', '#8b4f38'], ['Deep brown', '#653522'], ['Ebony', '#3e241d'], ['Rosewood', '#6d3c39']
  ];
  const backgrounds = [
    ['Teal', '#2fc5c4'], ['Sky', '#58b6ed'], ['Navy', '#244d80'], ['Gold', '#f6bd2e'], ['Coral', '#f27c6b'], ['Berry', '#a66ac1'],
    ['Mint', '#72ca9a'], ['Forest', '#28755d'], ['Brick', '#b9504d'], ['Peach', '#f8ac77'], ['Lilac', '#bca8e8'], ['Slate', '#596d86']
  ];
  const shirts = [
    ['Navy hoodie', '#173f77', 'hoodie'], ['Blue shirt', '#3a83cf', 'tee'], ['Gold shirt', '#f4b928', 'tee'], ['Coral shirt', '#ed7163', 'tee'],
    ['Teal shirt', '#27b9b8', 'tee'], ['Green hoodie', '#318563', 'hoodie'], ['Purple shirt', '#8466c1', 'tee'], ['Red shirt', '#c8494f', 'tee'],
    ['Striped shirt', '#4c7ed1', 'stripe'], ['Charcoal hoodie', '#38475d', 'hoodie'], ['Orange shirt', '#e98536', 'tee'], ['Pink shirt', '#e77da1', 'tee']
  ];
  const hairs = [
    ['Short crop', 'crop'], ['Side part', 'side'], ['Long straight', 'long'], ['Waves', 'waves'], ['Curly halo', 'curly'], ['Coils', 'coils'],
    ['Box braids', 'braids'], ['Locs', 'locs'], ['High ponytail', 'pony'], ['Bun', 'bun'], ['Buzz cut', 'buzz'], ['Bald', 'bald'],
    ['Afro', 'afro'], ['Undercut', 'under'], ['Hijab', 'hijab'], ['Kufi cap', 'kufi'], ['Headband', 'headband'], ['Pigtails', 'pigtails']
  ];
  const instruments = [
    ['Flute', 'flute'], ['Oboe', 'oboe'], ['Bassoon', 'bassoon'], ['Clarinet', 'clarinet'], ['Bass clarinet', 'bassClarinet'], ['Alto saxophone', 'altoSax'],
    ['Tenor saxophone', 'tenorSax'], ['Baritone saxophone', 'bariSax'], ['Trumpet', 'trumpet'], ['French horn', 'horn'], ['Trombone', 'trombone'],
    ['Baritone / euphonium', 'euphonium'], ['Tuba', 'tuba'], ['Electric bass', 'bass'], ['Percussion / drumsticks', 'drums'], ['Mallets / bells', 'bells']
  ];
  const tabInfo = {
    skin: ['Choose a skin tone', 'Pick the tone that feels most like you.'],
    hair: ['Choose a hairstyle', 'All styles are for everyone.'],
    shirt: ['Choose your shirt', 'Pick a color or pattern that stands out.'],
    instrument: ['Choose your instrument', 'Pick the instrument you play in band.'],
    background: ['Choose a background color', 'This color will be part of your downloaded avatar.']
  };
  let selectedTab = 'skin';
  let state = { skin: 3, hair: 0, shirt: 0, instrument: 5, background: 0 };
  let history = [];
  const hairColors = ['#241d20', '#4a2a1d', '#70422a', '#a9662e', '#bc8b4f', '#2c292f'];

  function px(c, x, y, w = 1, h = 1, color) { c.fillStyle = color; c.fillRect(x, y, w, h); }
  function rect(c, x,y,w,h,fill,outline) { px(c,x,y,w,h,fill); if(outline){ px(c,x,y,w,1,outline);px(c,x,y+h-1,w,1,outline);px(c,x,y,1,h,outline);px(c,x+w-1,y,1,h,outline); } }
  function line(c,x1,y1,x2,y2,color,width=1){ c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1+.5,y1+.5);c.lineTo(x2+.5,y2+.5);c.stroke(); }
  function circle(c,x,y,r,fill){c.fillStyle=fill;c.beginPath();c.arc(x+.5,y+.5,r,0,Math.PI*2);c.fill();}
  function poly(c,points,fill,outline){c.fillStyle=fill;c.beginPath();c.moveTo(points[0][0]+.5,points[0][1]+.5);points.slice(1).forEach(([x,y])=>c.lineTo(x+.5,y+.5));c.closePath();c.fill();if(outline){c.strokeStyle=outline;c.lineWidth=1;c.stroke();}}
  function currentSkin(){ return skins[state.skin][1]; }
  function contrast(hex){ const n=parseInt(hex.slice(1),16), r=n>>16,g=(n>>8)&255,b=n&255; return (r*299+g*587+b*114)/1000>145 ? '#553a2d' : '#f8d8bd'; }

  function drawHair(c, type, color, skin){
    const dark = '#1c2028', mid = color, hi = color === '#241d20' ? '#45414b' : '#d19a58';
    const P=(x,y,w,h,col=mid)=>px(c,x,y,w,h,col);
    if(type==='bald') return;
    if(type==='hijab'){ rect(c,15,7,34,34,'#7359aa',dark);rect(c,18,11,28,27,'#9379c2');rect(c,20,17,24,23,skin);return; }
    if(type==='kufi'){ rect(c,19,8,26,6,'#2d886f',dark);rect(c,17,12,30,4,'#42aa8b',dark);return; }
    if(type==='buzz'){rect(c,18,9,28,9,mid,dark);for(let i=0;i<6;i++)P(20+i*4,10,2,2,hi);return;}
    if(type==='crop'||type==='side'||type==='under'){rect(c,16,8,32,11,mid,dark);P(14,13,6,10);P(44,12,6,12); if(type==='side'){P(18,8,18,4,hi);P(16,12,12,5,hi)} if(type==='under'){P(16,18,4,8,skin);P(44,18,4,8,skin)} return;}
    if(type==='long'){rect(c,16,8,32,13,mid,dark);rect(c,14,15,7,28,mid,dark);rect(c,43,15,7,28,mid,dark);P(21,9,17,3,hi);return;}
    if(type==='waves'){rect(c,15,8,34,14,mid,dark);for(let i=0;i<6;i++){P(17+i*5,11,4,3,hi);P(15+i*5,15,4,3,mid)}P(13,18,5,12);P(46,18,5,12);return;}
    if(type==='curly'||type==='coils'||type==='afro'){let r=type==='afro'?6:4;let pts=type==='afro'?[[17,12],[25,8],[34,8],[43,11],[13,20],[49,20],[18,28],[44,28]]:[[18,12],[25,9],[33,9],[41,11],[15,19],[47,19],[20,23],[42,23]];pts.forEach(([x,y])=>circle(c,x,y,r,mid));pts.slice(0,5).forEach(([x,y])=>circle(c,x+1,y,r-2,hi));return;}
    if(type==='braids'||type==='locs'){rect(c,16,8,32,12,mid,dark);for(let i=0;i<5;i++){P(15+i*7,16,4,type==='braids'?28:31);P(16+i*7,18,2,25,hi)}return;}
    if(type==='pony'){rect(c,16,8,32,13,mid,dark);circle(c,48,16,8,mid);P(18,10,18,3,hi);return;}
    if(type==='bun'){rect(c,16,9,32,13,mid,dark);circle(c,34,5,7,mid);P(20,11,18,3,hi);return;}
    if(type==='headband'){rect(c,16,8,32,14,mid,dark);rect(c,15,14,34,4,'#f5bd28',dark);P(20,8,17,3,hi);return;}
    if(type==='pigtails'){rect(c,16,8,32,13,mid,dark);circle(c,13,17,7,mid);circle(c,51,17,7,mid);return;}
  }

  function drawPerson(c){
    const skin=currentSkin(), shadow=contrast(skin), [,,cut]=shirts[state.shirt], shirt=shirts[state.shirt][1];
    // neck, shirt, sleeves and hands are behind / around the instrument
    rect(c,28,32,8,7,skin,shadow);
    rect(c,12,38,40,26,shirt,'#172b46');
    if(cut==='hoodie'){rect(c,23,37,18,9,shirt,'#172b46');rect(c,26,39,12,7,'#4f6691');line(c,30,45,30,53,'#d7e5f3');line(c,35,45,35,53,'#d7e5f3');}
    if(cut==='stripe'){for(let y=43;y<61;y+=6)rect(c,13,y,38,2,'#edf5ff');}
    rect(c,9,45,7,17,shirt,'#172b46');rect(c,48,45,7,17,shirt,'#172b46');
    // face
    rect(c,17,13,30,24,skin,shadow);rect(c,19,31,26,8,skin,shadow);
    drawHair(c,hairs[state.hair][1],hairColors[state.hair%hairColors.length],skin);
    // Facial features are drawn last so head coverings never erase them.
    px(c,23,24,2,3,'#192233');px(c,39,24,2,3,'#192233');line(c,28,31,36,31,'#6a3d39',1);
  }

  function brass(c,kind){
    const gold='#f5b82e',hi='#ffe59a',dark='#6d4218';
    if(kind==='trumpet'){
      line(c,18,46,46,46,gold,4);poly(c,[[45,40],[56,43],[56,50],[45,53]],gold,dark);
      rect(c,27,42,3,8,gold,dark);rect(c,32,42,3,8,gold,dark);rect(c,37,42,3,8,gold,dark);
      return;
    }
    if(kind==='trombone'){
      poly(c,[[16,43],[24,46],[24,51],[16,54]],gold,dark);line(c,23,48,52,48,gold,3);
      line(c,30,43,30,58,gold,2);line(c,30,58,53,58,gold,2);line(c,53,48,53,58,gold,2);line(c,38,46,38,53,dark,1);
      return;
    }
    if(kind==='horn'){
      circle(c,34,50,12,gold);circle(c,34,50,7,dark);circle(c,34,50,4,'#fff1b5');
      line(c,20,42,43,59,gold,3);line(c,21,58,45,41,gold,3);poly(c,[[18,42],[11,38],[11,49],[18,48]],gold,dark);
      return;
    }
    const isTuba=kind==='tuba', x=isTuba?19:23, y=isTuba?36:40, w=isTuba?27:22, h=isTuba?28:23;
    poly(c,[[x+4,y+7],[x+w-5,y+7],[x+w-2,y+h-4],[x+7,y+h],[x,y+h-7]],gold,dark);
    poly(c,[[x+2,y+7],[x-2,y],[x+w+1,y],[x+w-3,y+7]],hi,dark);
    line(c,x+8,y+8,x+8,y+h-3,dark,2);line(c,x+15,y+8,x+15,y+h-5,dark,2);line(c,x+5,y+11,x-3,y+17,gold,3);
  }
  function woodwind(c,kind){
    const black='#22252c',brown='#9a552c',silver='#dfe9ef',key='#f5f7f8';
    if(kind==='flute'){
      line(c,14,48,52,48,silver,4);rect(c,13,45,4,7,silver,'#637486');for(let x=24;x<48;x+=5)circle(c,x,48,1,'#526475');return;
    }
    if(kind==='bassoon'){
      line(c,27,38,36,61,brown,6);line(c,36,61,42,63,'#c9d4da',2);line(c,28,39,34,35,silver,2);rect(c,25,38,5,5,brown,'#4f301e');
      for(let i=0;i<5;i++)circle(c,31+i,45+i*3,1,key);return;
    }
    const isBass=kind==='bassClarinet', isOboe=kind==='oboe', col=isOboe?'#4b3027':black;
    const x=isBass?29:31,y=isBass?35:38,h=isBass?28:24,w=isBass?5:(isOboe?3:4);
    poly(c,[[x,y],[x+w,y],[x+w+7,y+h],[x+5,y+h+3],[x-1,y+h]],col,'#111922');
    for(let i=0;i<5;i++)circle(c,x+3+i,y+6+i*4,1,key);
    if(isBass){line(c,x+7,y+h,x+15,y+h+2,silver,2);poly(c,[[x+13,y+h],[x+21,y+h-2],[x+21,y+h+5],[x+14,y+h+4]],silver,'#54606c');}
    else poly(c,[[x+3,y+h],[x+10,y+h+4],[x+1,y+h+5]],col,'#111922');
  }
  function sax(c,kind){
    const sizes={altoSax:[31,38,16],tenorSax:[29,36,20],bariSax:[27,33,25]},[x,y,size]=sizes[kind];
    const gold='#e8aa24',hi='#ffe48a',dark='#704516';
    line(c,x+5,y,x+5,y+size,gold,6);line(c,x+5,y+size,x+16,y+size+3,gold,6);circle(c,x+19,y+size+3,6,gold);circle(c,x+19,y+size+3,3,dark);
    line(c,x+4,y+2,x-2,y-5,gold,2);for(let i=0;i<4;i++)circle(c,x+8,y+8+i*5,1,hi);
    if(kind==='bariSax')line(c,x+1,y+8,x-5,y+18,gold,2);
  }
  function drawInstrument(c,kind){
    if(['flute','oboe','bassoon','clarinet','bassClarinet'].includes(kind)){woodwind(c,kind);return;}
    if(['altoSax','tenorSax','bariSax'].includes(kind)){sax(c,kind);return;}
    if(['trumpet','trombone','horn','tuba','euphonium'].includes(kind)){brass(c,kind);return;}
    if(kind==='bass'){
      const body='#c84f49',bodyHi='#ea7666',dark='#3a2930',wood='#c89558';
      line(c,17,36,45,58,dark,3);circle(c,31,53,8,body);circle(c,42,52,7,body);rect(c,30,47,14,12,body,dark);rect(c,31,48,5,4,bodyHi);
      line(c,40,47,55,31,wood,5);poly(c,[[53,29],[61,27],[61,34],[55,35]],wood,dark);
      for(let i=0;i<4;i++)line(c,39,45+i,59,29+i,'#49372b',1);for(let i=0;i<4;i++)line(c,48+i*3,36-i*3,50+i*3,38-i*3,dark,1);
      rect(c,38,50,3,7,'#f4d99b',dark);return;
    }
    if(kind==='drums'){
      circle(c,33,55,11,'#376fae');circle(c,33,55,8,'#d7e6ef');circle(c,33,55,6,'#f7fafc');
      line(c,22,39,32,49,'#bf8247',2);line(c,44,39,34,49,'#bf8247',2);rect(c,22,52,22,3,'#213b5c');return;
    }
    if(kind==='bells'){
      poly(c,[[15,50],[49,50],[45,61],[18,61]],'#41586e','#172b46');
      for(let i=0;i<8;i++)rect(c,18+i*4,52,3,5,i%2?'#f4bd36':'#c6d9df','#172b46');
      line(c,25,44,20,53,'#bd7e43',2);line(c,40,44,36,53,'#bd7e43',2);circle(c,25,43,2,'#f0b737');circle(c,40,43,2,'#f0b737');return;
    }
  }
  function drawHands(c,kind){
    const skin=currentSkin(),shadow=contrast(skin);let hands;
    if(['flute','trumpet','trombone'].includes(kind))hands=[[20,46],[40,46]];
    else if(['oboe','clarinet','bassoon','bassClarinet','altoSax','tenorSax','bariSax'].includes(kind))hands=[[26,43],[38,52]];
    else if(['horn','euphonium','tuba'].includes(kind))hands=[[20,48],[42,50]];
    else if(kind==='bass')hands=[[42,38],[28,50]];
    else if(kind==='drums')hands=[[18,40],[42,40]];
    else hands=[[22,45],[38,45]];
    hands.forEach(([x,y])=>rect(c,x,y,6,6,skin,shadow));
  }
  function drawAvatar(c){const bg=backgrounds[state.background][1];rect(c,0,0,64,64,bg); // sparse decorative pixels
    px(c,5,11,2,2,'#ffffff66');px(c,55,12,3,1,'#ffffff66');px(c,7,37,1,3,'#ffffff66');px(c,55,31,2,2,'#ffffff66');
    const instrument=instruments[state.instrument][1];drawPerson(c);drawInstrument(c,instrument);drawHands(c,instrument);
  }
  function render(){drawAvatar(ctx);drawAvatar(miniCtx);undoBtn.disabled=history.length===0;}
  function setState(key,val){history.push({...state});if(history.length>25)history.shift();state[key]=val;status.textContent='';status.className='status';render();renderChoices();}
  function optionsFor(tab){if(tab==='skin')return skins;if(tab==='hair')return hairs;if(tab==='shirt')return shirts;if(tab==='instrument')return instruments;return backgrounds;}
  function iconFor(tab,index){const c=document.createElement('canvas');c.width=64;c.height=54;c.className=tab+'-icon';const x=c.getContext('2d');x.imageSmoothingEnabled=false;
    if(tab==='skin'){rect(x,13,8,38,38,optionsFor(tab)[index][1],'#26354b');px(x,23,25,3,3,'#1d2836');px(x,39,25,3,3,'#1d2836');return c;}
    if(tab==='background'){const d=document.createElement('span');d.className='swatch';d.style.background=optionsFor(tab)[index][1];return d;}
    if(tab==='hair'){rect(x,19,17,26,27,'#d99a67','#27354a');drawHair(x,hairs[index][1],hairColors[index%hairColors.length],'#d99a67');return c;}
    if(tab==='shirt'){rect(x,12,18,40,35,shirts[index][1],'#1b2e49');if(shirts[index][2]==='hoodie')rect(x,22,13,20,15,shirts[index][1],'#1b2e49');if(shirts[index][2]==='stripe')for(let y=26;y<50;y+=7)rect(x,13,y,38,2,'#edf5ff');return c;}
    const source=document.createElement('canvas');source.width=64;source.height=64;const sx=source.getContext('2d');sx.imageSmoothingEnabled=false;drawInstrument(sx,instruments[index][1]);x.imageSmoothingEnabled=false;x.drawImage(source,8,28,52,36,2,2,60,50);return c;
  }
  function renderChoices(){const [title,help]=tabInfo[selectedTab];choiceTitle.textContent=title;choiceHelp.textContent=help;choices.innerHTML='';optionsFor(selectedTab).forEach((opt,index)=>{const b=document.createElement('button');b.type='button';b.className='choice'+(state[selectedTab]===index?' is-selected':'');b.setAttribute('aria-pressed',String(state[selectedTab]===index));b.setAttribute('aria-label',opt[0]);b.append(iconFor(selectedTab,index));const label=document.createElement('span');label.textContent=opt[0];b.append(label);b.addEventListener('click',()=>setState(selectedTab,index));choices.append(b);});}
  function changeTab(tab){selectedTab=tab;document.querySelectorAll('.tab').forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});choices.setAttribute('aria-labelledby','tab-'+tab);renderChoices();}
  const tabs=[...document.querySelectorAll('.tab')];
  tabs.forEach((b,index)=>{
    b.addEventListener('click',()=>changeTab(b.dataset.tab));
    b.addEventListener('keydown',event=>{
      let next=index;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();changeTab(tabs[next].dataset.tab);tabs[next].focus();
    });
  });
  document.getElementById('randomizeBtn').addEventListener('click',()=>{history.push({...state});state.skin=Math.floor(Math.random()*skins.length);state.hair=Math.floor(Math.random()*hairs.length);state.shirt=Math.floor(Math.random()*shirts.length);state.background=Math.floor(Math.random()*backgrounds.length);status.textContent='A new look is ready. Your instrument stayed the same.';status.className='status';render();renderChoices();});
  undoBtn.addEventListener('click',()=>{if(history.length){state=history.pop();status.textContent='Your last change was undone.';status.className='status';render();renderChoices();}});
  document.getElementById('resetBtn').addEventListener('click',()=>resetDialog.showModal());
  document.getElementById('confirmResetBtn').addEventListener('click',()=>{history.push({...state});state={skin:3,hair:0,shirt:0,instrument:5,background:0};status.textContent='You are back to the default avatar.';status.className='status';resetDialog.close();render();renderChoices();});
  document.getElementById('downloadBtn').addEventListener('click',()=>{try{const out=document.createElement('canvas');out.width=512;out.height=512;const o=out.getContext('2d');if(!o)throw new Error('Canvas is unavailable.');o.imageSmoothingEnabled=false;o.drawImage(canvas,0,0,512,512);out.toBlob(blob=>{if(!blob){status.textContent='Sorry—your avatar could not be downloaded. Please try again.';status.className='status error';return;}const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='band-avatar.png';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500);status.textContent='Downloaded! Attach band-avatar.png to your Google Classroom assignment.';status.className='status';},'image/png');}catch(err){status.textContent='Sorry—your avatar could not be downloaded. Please try again.';status.className='status error';}});
  render();renderChoices();
})();

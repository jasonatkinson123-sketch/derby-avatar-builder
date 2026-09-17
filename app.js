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
    px(c,23,24,2,3,'#192233');px(c,39,24,2,3,'#192233');line(c,28,31,36,31,'#6a3d39',1);
    drawHair(c,hairs[state.hair][1],hairColors[state.hair%hairColors.length],skin);
    // hands always visibly update with skin tone
    rect(c,12,51,7,7,skin,shadow);rect(c,45,51,7,7,skin,shadow);
  }

  function brass(c,x,y,kind){const gold='#f8c431',hi='#fff1aa',dark='#754417'; if(kind==='trumpet'){line(c,x,y+4,x+23,y+4,gold,4);rect(c,x+17,y,5,8,gold,dark);line(c,x+7,y+1,x+7,y+8,dark,1);line(c,x+11,y+1,x+11,y+8,dark,1);return;}if(kind==='trombone'){line(c,x,y+5,x+29,y+5,gold,3);line(c,x+8,y+2,x+8,y+13,gold,2);line(c,x+29,y+1,x+29,y+11,gold,2);line(c,x+12,y+12,x+30,y+12,gold,2);rect(c,x+28,y,7,13,gold,dark);return;}if(kind==='horn'){circle(c,x+17,y+9,9,gold);circle(c,x+17,y+9,5,'#7e4a16');line(c,x+6,y+3,x+20,y+16,gold,2);line(c,x+7,y+13,x+22,y+3,gold,2);return;}if(kind==='tuba'||kind==='euphonium'){rect(c,x+10,y+6,12,19,gold,dark);rect(c,x+8,y,16,9,gold,dark);rect(c,x+6,y,20,4,hi,dark);line(c,x+11,y+7,x+4,y+13,gold,2);line(c,x+4,y+13,x+4,y+22,gold,2);return;}}
  function woodwind(c,x,y,kind){const dark='#1e2530',silver='#eaf2f7',key='#bec9d2';let col=dark,w=3,h=30;if(kind==='flute'){col=silver;w=3;h=33;line(c,x,y+2,x+32,y+2,col,3);for(let i=0;i<5;i++)circle(c,x+10+i*4,y+2,1,dark);return;}if(kind==='bassoon'){col='#a86632';w=5;h=32;line(c,x+5,y,x+5,y+h,col,w);line(c,x+5,y+h,x+13,y+h+6,col,2);return;}if(kind==='oboe'){col='#422d28';w=3;h=31;}if(kind==='clarinet'){col='#1f2229';w=4;h=32;}if(kind==='bassClarinet'){col='#22262d';w=5;h=35;}line(c,x,y,x+6,y+h,col,w);for(let i=0;i<6;i++)circle(c,x+1+i,y+5+i*4,1,key);if(kind==='bassClarinet'){line(c,x+6,y+h,x+12,y+h+3,silver,2);line(c,x+12,y+h+3,x+12,y+h+8,silver,2);}}
  function sax(c,x,y,size){const gold='#e9ad25',dark='#6e4317';line(c,x+5,y,x+5,y+size,gold,5);line(c,x+5,y+size,x+15,y+size+4,gold,5);circle(c,x+17,y+size+4,5,gold);circle(c,x+17,y+size+4,2,dark);line(c,x+4,y+2,x-1,y-5,gold,2);for(let i=0;i<4;i++)circle(c,x+7,y+8+i*5,1,'#fff1a3');}
  function drawInstrument(c, kind){const skin=currentSkin(); // instruments overlap body, no face obstruction
    if(kind==='flute'){woodwind(c,16,45,'flute');line(c,14,49,47,49,'#eaf2f7',3);return;}
    if(kind==='oboe'||kind==='clarinet'||kind==='bassoon'||kind==='bassClarinet'){woodwind(c,31,38,kind);return;}
    if(kind==='altoSax'){sax(c,31,38,16);return;}if(kind==='tenorSax'){sax(c,30,36,20);return;}if(kind==='bariSax'){sax(c,28,34,25);return;}
    if(kind==='trumpet'||kind==='trombone'||kind==='horn'||kind==='tuba'||kind==='euphonium'){brass(c,kind==='tuba'||kind==='euphonium'?23:16,43,kind);return;}
    if(kind==='bass'){const b='#c65345',dark='#442432';line(c,17,36,45,58,dark,3);rect(c,27,48,20,8,b,dark);rect(c,42,38,4,16,'#d6b06a',dark);line(c,43,37,58,30,'#d6b06a',3);for(let i=0;i<4;i++)line(c,43,40+i*2,58,33+i*2,'#eef2f2',1);return;}
    if(kind==='drums'){circle(c,33,55,11,'#3d75b8');circle(c,33,55,8,'#d7e6ef');line(c,21,39,34,48,'#c88c4f',2);line(c,44,39,34,48,'#c88c4f',2);line(c,23,57,20,64,'#354b68',2);line(c,42,57,45,64,'#354b68',2);return;}
    if(kind==='bells'){rect(c,16,51,31,8,'#465b70','#172b46');for(let i=0;i<7;i++)rect(c,18+i*4,52,3,3,i%2?'#f4b629':'#b7d2d7','#172b46');line(c,27,46,21,52,'#c78a4e',2);line(c,39,46,35,52,'#c78a4e',2);circle(c,26,45,2,'#f0b737');circle(c,40,45,2,'#f0b737');return;}
  }
  function drawAvatar(c){const bg=backgrounds[state.background][1];rect(c,0,0,64,64,bg); // sparse decorative pixels
    px(c,5,11,2,2,'#ffffff66');px(c,55,12,3,1,'#ffffff66');px(c,7,37,1,3,'#ffffff66');px(c,55,31,2,2,'#ffffff66');
    drawPerson(c);drawInstrument(c,instruments[state.instrument][1]);
  }
  function render(){drawAvatar(ctx);drawAvatar(miniCtx);undoBtn.disabled=history.length===0;}
  function setState(key,val){history.push({...state});if(history.length>25)history.shift();state[key]=val;status.textContent='';status.className='status';render();renderChoices();}
  function optionsFor(tab){if(tab==='skin')return skins;if(tab==='hair')return hairs;if(tab==='shirt')return shirts;if(tab==='instrument')return instruments;return backgrounds;}
  function iconFor(tab,index){const c=document.createElement('canvas');c.width=64;c.height=54;c.className=tab+'-icon';const x=c.getContext('2d');x.imageSmoothingEnabled=false;
    if(tab==='skin'){rect(x,13,8,38,38,optionsFor(tab)[index][1],'#26354b');px(x,23,25,3,3,'#1d2836');px(x,39,25,3,3,'#1d2836');return c;}
    if(tab==='background'){const d=document.createElement('span');d.className='swatch';d.style.background=optionsFor(tab)[index][1];return d;}
    if(tab==='hair'){rect(x,19,17,26,27,'#d99a67','#27354a');drawHair(x,hairs[index][1],hairColors[index%hairColors.length],'#d99a67');return c;}
    if(tab==='shirt'){rect(x,12,18,40,35,shirts[index][1],'#1b2e49');if(shirts[index][2]==='hoodie')rect(x,22,13,20,15,shirts[index][1],'#1b2e49');if(shirts[index][2]==='stripe')for(let y=26;y<50;y+=7)rect(x,13,y,38,2,'#edf5ff');return c;}
    rect(x,0,0,64,54,'#fbfaf5');drawInstrument(x,instruments[index][1]);return c;
  }
  function renderChoices(){const [title,help]=tabInfo[selectedTab];choiceTitle.textContent=title;choiceHelp.textContent=help;choices.innerHTML='';optionsFor(selectedTab).forEach((opt,index)=>{const b=document.createElement('button');b.type='button';b.className='choice'+(state[selectedTab]===index?' is-selected':'');b.setAttribute('aria-pressed',String(state[selectedTab]===index));b.setAttribute('aria-label',opt[0]);b.append(iconFor(selectedTab,index));const label=document.createElement('span');label.textContent=opt[0];b.append(label);b.addEventListener('click',()=>setState(selectedTab,index));choices.append(b);});}
  function changeTab(tab){selectedTab=tab;document.querySelectorAll('.tab').forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));});renderChoices();}
  document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>changeTab(b.dataset.tab)));
  document.getElementById('randomizeBtn').addEventListener('click',()=>{history.push({...state});state.skin=Math.floor(Math.random()*skins.length);state.hair=Math.floor(Math.random()*hairs.length);state.shirt=Math.floor(Math.random()*shirts.length);state.background=Math.floor(Math.random()*backgrounds.length);status.textContent='A new look is ready. Your instrument stayed the same.';status.className='status';render();renderChoices();});
  undoBtn.addEventListener('click',()=>{if(history.length){state=history.pop();status.textContent='Your last change was undone.';status.className='status';render();renderChoices();}});
  document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('Start over with the default avatar?')){history.push({...state});state={skin:3,hair:0,shirt:0,instrument:5,background:0};status.textContent='You are back to the default avatar.';status.className='status';render();renderChoices();}});
  document.getElementById('downloadBtn').addEventListener('click',()=>{try{const out=document.createElement('canvas');out.width=512;out.height=512;const o=out.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(canvas,0,0,512,512);out.toBlob(blob=>{if(!blob)throw new Error('The browser could not create the image.');const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='band-avatar.png';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),500);status.textContent='Downloaded! Attach band-avatar.png to your Google Classroom assignment.';status.className='status';},'image/png');}catch(err){status.textContent='Sorry—your avatar could not be downloaded. Please try again.';status.className='status error';}});
  render();renderChoices();
})();

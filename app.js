(() => {
  'use strict';

  const GRID = 128;
  const canvas = document.getElementById('avatarCanvas');
  const mini = document.getElementById('miniCanvas');
  const choices = document.getElementById('choices');
  const choiceTitle = document.getElementById('choiceTitle');
  const choiceHelp = document.getElementById('choiceHelp');
  const status = document.getElementById('status');
  const undoBtn = document.getElementById('undoBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetDialog = document.getElementById('resetDialog');

  const skins = [
    { label: 'Light', colors: ['#f3c7a6', '#ca855f', '#ffe0c4'] },
    { label: 'Medium', colors: ['#d99a67', '#aa6546', '#f1bd91'] },
    { label: 'Warm brown', colors: ['#a95f3b', '#763c2b', '#ca8259'] },
    { label: 'Deep', colors: ['#633820', '#3f241c', '#865233'] }
  ];
  const hairStyles = [
    { label: 'Textured curls', id: 'curls', folder: 'hair' },
    { label: 'High ponytail', id: 'ponytail', folder: 'hair' },
    { label: 'Shoulder-length locs', id: 'locs', folder: 'hair' },
    { label: 'Hijab', id: 'hijab', folder: 'headwear' }
  ];
  const naturalHairPalettes = [
    { label: 'Black', colors: ['#2a252a', '#14151b', '#4a424a'] },
    { label: 'Dark brown', colors: ['#4b2e25', '#24191a', '#765040'] },
    { label: 'Auburn', colors: ['#8c472b', '#48251e', '#c06d3d'] }
  ];
  const hijabPalettes = [
    { label: 'Purple', colors: ['#62448f', '#352853', '#8c6abc'] },
    { label: 'Navy', colors: ['#244d80', '#152d50', '#527cac'] },
    { label: 'Teal', colors: ['#237d79', '#164c50', '#49aaa4'] }
  ];
  const shirtColors = [
    { label: 'Navy', colors: ['#214d85', '#16345f', '#4d75aa'] },
    { label: 'Teal', colors: ['#198d88', '#11605e', '#43b2aa'] },
    { label: 'Mustard', colors: ['#e6a918', '#9a6810', '#ffd35a'] },
    { label: 'Coral', colors: ['#df625b', '#993d43', '#f58c7c'] }
  ];
  const shirtStyles = [
    { label: 'T-shirt', id: 'tee' },
    { label: 'Sweatshirt', id: 'sweatshirt' },
    { label: 'Hoodie', id: 'hoodie' }
  ];
  const shirts = shirtStyles.flatMap((style, styleIndex) => shirtColors.map((color, colorIndex) => ({
    label: `${color.label} ${style.label}`,
    style: style.id,
    styleIndex,
    colorIndex
  })));
  const instruments = [
    { label: 'Alto saxophone', id: 'alto-sax' },
    { label: 'Flute', id: 'flute' },
    { label: 'Electric bass', id: 'electric-bass' },
    { label: 'Mallets / bells', id: 'mallets-bells' }
  ];
  const backgrounds = [
    { label: 'Turquoise', color: '#2fc5c4' },
    { label: 'Coral', color: '#ef7064' },
    { label: 'Deep blue', color: '#265db0' },
    { label: 'Mint', color: '#69d4a3' }
  ];
  const tabInfo = {
    skin: ['Choose a skin tone', 'Face, neck, arms, and hands change together.'],
    hair: ['Choose hair or headwear', 'Pick a style, then choose its color palette.'],
    shirt: ['Choose your shirt', 'Every instrument pose keeps your selected style and color.'],
    instrument: ['Choose your instrument', 'Each instrument uses its own arm and hand pose.'],
    background: ['Choose a background color', 'This solid color is included in the PNG.']
  };

  const MARKERS = {
    skin: ['#d99a67', '#aa6546', '#f1bd91'],
    shirt: ['#557bb5', '#294c82', '#789bd0'],
    hair: ['#2a252a', '#14151b', '#4a424a']
  };
  const imageCache = new Map();
  const tintedCache = new Map();
  let selectedTab = 'skin';
  let state = { skin: 2, hair: 0, hairColor: 0, shirt: 8, instrument: 0, background: 0 };
  let history = [];
  let renderVersion = 0;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function loadImage(path) {
    if (!imageCache.has(path)) {
      imageCache.set(path, new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Could not load ${path}`));
        image.src = `assets/${path}`;
      }));
    }
    return imageCache.get(path);
  }

  async function tintedImage(path, palettes = {}) {
    const key = `${path}|${JSON.stringify(palettes)}`;
    if (tintedCache.has(key)) return tintedCache.get(key);
    const source = await loadImage(path);
    if (!Object.keys(palettes).length) {
      tintedCache.set(key, source);
      return source;
    }
    const offscreen = document.createElement('canvas');
    offscreen.width = GRID;
    offscreen.height = GRID;
    const context = offscreen.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.drawImage(source, 0, 0);
    const pixels = context.getImageData(0, 0, GRID, GRID);
    const swaps = [];
    Object.entries(palettes).forEach(([name, colors]) => {
      MARKERS[name].forEach((marker, index) => swaps.push([hexToRgb(marker), hexToRgb(colors[index])]));
    });
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (!pixels.data[i + 3]) continue;
      for (const [from, to] of swaps) {
        if (pixels.data[i] === from[0] && pixels.data[i + 1] === from[1] && pixels.data[i + 2] === from[2]) {
          pixels.data[i] = to[0]; pixels.data[i + 1] = to[1]; pixels.data[i + 2] = to[2];
          break;
        }
      }
    }
    context.putImageData(pixels, 0, 0);
    tintedCache.set(key, offscreen);
    return offscreen;
  }

  function layerPaths(avatarState) {
    const hair = hairStyles[avatarState.hair];
    const shirt = shirts[avatarState.shirt];
    const instrument = instruments[avatarState.instrument];
    return [
      { path: `${hair.folder}/${hair.id}-rear.png`, palettes: { hair: (hair.id === 'hijab' ? hijabPalettes : naturalHairPalettes)[avatarState.hairColor].colors } },
      { path: `poses/${instrument.id}/rear.png` },
      { path: `clothing/${shirt.style}.png`, palettes: { shirt: shirtColors[shirt.colorIndex].colors } },
      { path: 'faces/base.png', palettes: { skin: skins[avatarState.skin].colors } },
      { path: `${hair.folder}/${hair.id}-front.png`, palettes: { hair: (hair.id === 'hijab' ? hijabPalettes : naturalHairPalettes)[avatarState.hairColor].colors } },
      { path: 'faces/features.png' },
      { path: `poses/${instrument.id}/arms-rear.png`, palettes: { skin: skins[avatarState.skin].colors, shirt: shirtColors[shirt.colorIndex].colors } },
      { path: `instruments/${instrument.id}.png` },
      { path: `poses/${instrument.id}/arms-front.png`, palettes: { skin: skins[avatarState.skin].colors, shirt: shirtColors[shirt.colorIndex].colors } }
    ];
  }

  async function compose(target, avatarState) {
    const context = target.getContext('2d', { alpha: false });
    context.imageSmoothingEnabled = false;
    context.fillStyle = backgrounds[avatarState.background].color;
    context.fillRect(0, 0, target.width, target.height);
    for (const layer of layerPaths(avatarState)) {
      const image = await tintedImage(layer.path, layer.palettes || {});
      context.drawImage(image, 0, 0, target.width, target.height);
    }
  }

  async function render() {
    const version = ++renderVersion;
    try {
      await Promise.all([compose(canvas, state), compose(mini, state)]);
      if (version !== renderVersion) return;
      undoBtn.disabled = history.length === 0;
    } catch (error) {
      status.textContent = 'Sorry—some avatar artwork could not be loaded. Please refresh and try again.';
      status.className = 'status error';
      console.error(error);
    }
  }

  function remember() {
    history.push({ ...state });
    if (history.length > 30) history.shift();
  }

  function updateState(changes) {
    remember();
    state = { ...state, ...changes };
    status.textContent = '';
    status.className = 'status';
    render();
    renderChoices();
  }

  function choiceButton(label, pressed, changes, previewState, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `choice ${className}${pressed ? ' is-selected' : ''}`;
    button.setAttribute('aria-pressed', String(pressed));
    button.setAttribute('aria-label', label);
    const preview = document.createElement('canvas');
    preview.width = GRID;
    preview.height = GRID;
    preview.className = 'option-icon';
    compose(preview, previewState).catch(console.error);
    button.append(preview);
    const text = document.createElement('span');
    text.textContent = label;
    button.append(text);
    button.addEventListener('click', () => updateState(changes));
    return button;
  }

  function addGroupLabel(text) {
    const heading = document.createElement('h3');
    heading.className = 'option-group-title';
    heading.textContent = text;
    choices.append(heading);
  }

  function renderChoices() {
    const [title, help] = tabInfo[selectedTab];
    choiceTitle.textContent = title;
    choiceHelp.textContent = help;
    choices.innerHTML = '';
    if (selectedTab === 'skin') {
      skins.forEach((item, index) => choices.append(choiceButton(item.label, state.skin === index, { skin: index }, { ...state, skin: index })));
    } else if (selectedTab === 'hair') {
      addGroupLabel('Style');
      const styleGrid = document.createElement('div');
      styleGrid.className = 'choice-subgrid';
      hairStyles.forEach((item, index) => styleGrid.append(choiceButton(item.label, state.hair === index, { hair: index, hairColor: Math.min(state.hairColor, 2) }, { ...state, hair: index })));
      choices.append(styleGrid);
      addGroupLabel(state.hair === 3 ? 'Headwear color' : 'Hair color');
      const paletteGrid = document.createElement('div');
      paletteGrid.className = 'choice-subgrid palette-grid';
      const palettes = state.hair === 3 ? hijabPalettes : naturalHairPalettes;
      palettes.forEach((item, index) => paletteGrid.append(choiceButton(item.label, state.hairColor === index, { hairColor: index }, { ...state, hairColor: index }, 'compact-choice')));
      choices.append(paletteGrid);
    } else if (selectedTab === 'shirt') {
      shirts.forEach((item, index) => choices.append(choiceButton(item.label, state.shirt === index, { shirt: index }, { ...state, shirt: index })));
    } else if (selectedTab === 'instrument') {
      instruments.forEach((item, index) => choices.append(choiceButton(item.label, state.instrument === index, { instrument: index }, { ...state, instrument: index })));
    } else {
      backgrounds.forEach((item, index) => choices.append(choiceButton(item.label, state.background === index, { background: index }, { ...state, background: index })));
    }
  }

  function changeTab(tab) {
    selectedTab = tab;
    document.querySelectorAll('.tab').forEach(button => {
      const active = button.dataset.tab === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    choices.setAttribute('aria-labelledby', `tab-${tab}`);
    renderChoices();
  }

  const tabs = [...document.querySelectorAll('.tab')];
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => changeTab(button.dataset.tab));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      changeTab(tabs[next].dataset.tab);
      tabs[next].focus();
    });
  });

  document.getElementById('randomizeBtn').addEventListener('click', () => {
    remember();
    state = {
      ...state,
      skin: Math.floor(Math.random() * skins.length),
      hair: Math.floor(Math.random() * hairStyles.length),
      hairColor: Math.floor(Math.random() * 3),
      shirt: Math.floor(Math.random() * shirts.length),
      background: Math.floor(Math.random() * backgrounds.length)
    };
    status.textContent = 'A new look is ready. Your instrument stayed the same.';
    status.className = 'status';
    render();
    renderChoices();
  });

  undoBtn.addEventListener('click', () => {
    if (!history.length) return;
    state = history.pop();
    status.textContent = 'Your last change was undone.';
    status.className = 'status';
    render();
    renderChoices();
  });

  document.getElementById('resetBtn').addEventListener('click', () => resetDialog.showModal());
  document.getElementById('confirmResetBtn').addEventListener('click', () => {
    remember();
    state = { skin: 2, hair: 0, hairColor: 0, shirt: 8, instrument: 0, background: 0 };
    resetDialog.close();
    status.textContent = 'You are back to the default avatar.';
    status.className = 'status';
    render();
    renderChoices();
  });

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    try {
      const source = document.createElement('canvas');
      source.width = GRID;
      source.height = GRID;
      await compose(source, state);
      const output = document.createElement('canvas');
      output.width = 512;
      output.height = 512;
      const context = output.getContext('2d');
      context.imageSmoothingEnabled = false;
      context.drawImage(source, 0, 0, 512, 512);
      const blob = await new Promise(resolve => output.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'band-avatar.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'Downloaded! Attach band-avatar.png to your Google Classroom assignment.';
      status.className = 'status';
    } catch (error) {
      console.error(error);
      status.textContent = 'Sorry—your avatar could not be downloaded. Please try again.';
      status.className = 'status error';
    } finally {
      downloadBtn.disabled = false;
    }
  });

  async function init() {
    status.textContent = 'Loading artwork…';
    try {
      await Promise.all(layerPaths(state).map(layer => loadImage(layer.path)));
      status.textContent = '';
      renderChoices();
      await render();
    } catch (error) {
      console.error(error);
      status.textContent = 'Sorry—some avatar artwork could not be loaded. Please refresh and try again.';
      status.className = 'status error';
    }
  }

  init();
})();

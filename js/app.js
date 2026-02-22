// ===== State =====
const state = {
  cocktails: [],
  bottles: [],
  tools: [],
  categories: [],
  toolGuides: { tools: [], techniques: [] },
  inventory: { bottles: new Set() },
  filters: { status: 'all', category: 'all', method: 'all' },
  search: { inventory: '', cocktails: '' },
  images: {},
  previouslyUnlocked: new Set(),
  activeTab: 'mybar',
};

// ===== Labels =====
const GLASS_SVG = {
  'cocktail-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l4 10 4-10"/><path d="M12 12v8"/><path d="M8 22h8"/></svg>',
  'old-fashioned-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6h14l-1 14H6L5 6z"/><path d="M5 6h14"/></svg>',
  'highball-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2h10l-1 20H8L7 2z"/><path d="M7 2h10"/></svg>',
  'collins-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2h10l-1 20H8L7 2z"/><path d="M7 2h10"/></svg>',
  'wine-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l-1 7a3.5 3.5 0 01-3 3.5A3.5 3.5 0 019 9L8 2z"/><path d="M12 12.5v7"/><path d="M8 22h8"/></svg>',
  'shot-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l-1.5 16h-7L7 4z"/><path d="M7 4h10"/></svg>',
  'copper-mug': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11v16H6L5 4z"/><path d="M16 8h2a2 2 0 012 2v2a2 2 0 01-2 2h-2"/></svg>',
  'hurricane-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6c0 4 3 6 3 10s-3 4-3 8h-6c0-4-3-4-3-8s3-6 3-10z"/><path d="M9 22h6"/></svg>',
  'margarita-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l4 10 4-10"/><path d="M12 12v8"/><path d="M8 22h8"/></svg>',
  'irish-coffee-glass': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6h11v12H6L5 6z"/><path d="M16 9h2a2 2 0 012 2v1a2 2 0 01-2 2h-2"/><path d="M8 22h8"/><path d="M9 18h6v4H9z"/></svg>',
  'champagne-flute': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4l-1 10a1.5 1.5 0 01-1 1.4A1.5 1.5 0 0111 12L10 2z"/><path d="M12 13.5v6"/><path d="M9 22h6"/></svg>',
  'julep-cup': '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12l-1.5 16h-9L6 4z"/><path d="M6 4h12"/><path d="M8 10h8" opacity=".4"/></svg>',
};
const DEFAULT_GLASS_SVG = GLASS_SVG['cocktail-glass'];
const CATEGORY_LABELS = {
  short: 'ショート', long: 'ロング', tropical: 'トロピカル',
  standard: 'スタンダード', shot: 'ショット', hot: 'ホット', 'non-alcohol': 'ノンアル',
};
const METHOD_LABELS = {
  shake: 'シェーク', stir: 'ステア', build: 'ビルド', blend: 'ブレンド', layer: 'レイヤー',
};
const TASTE_LABELS = {
  sweet: '甘口', dry: '辛口', sour: '酸味', bitter: '苦味',
  'sweet-sour': '甘酸', refreshing: '爽快', savory: '旨味',
};
const STRENGTH_LABELS = {
  strong: '強め', medium: '普通', weak: '軽め', none: 'ノンアル',
};

// ===== Inventory sections (alcohol bottles only) =====
const ALCOHOL_TYPES = new Set(['spirit', 'liqueur', 'vermouth', 'bitters']);
const BOTTLE_SECTIONS = [
  { type: 'spirit', label: 'スピリッツ', open: true },
  { type: 'liqueur', label: 'リキュール', open: false },
  { type: 'vermouth', label: 'ベルモット', open: false },
  { type: 'bitters', label: 'ビターズ', open: false },
];
// ===== CocktailDB image mapping =====
const COCKTAILDB_NAMES = {
  'martini': 'Dry Martini', 'manhattan': 'Manhattan', 'old-fashioned': 'Old Fashioned',
  'gimlet': 'Gimlet', 'daiquiri': 'Daiquiri', 'margarita': 'Margarita',
  'moscow-mule': 'Moscow Mule', 'mojito': 'Mojito', 'negroni': 'Negroni',
  'gin-tonic': 'Gin and Tonic', 'whiskey-sour': 'Whiskey Sour',
  'cosmopolitan': 'Cosmopolitan', 'sidecar': 'Sidecar', 'pina-colada': 'Pina Colada',
  'espresso-martini': 'Espresso Martini', 'mai-tai': 'Mai Tai',
  'irish-coffee': 'Irish Coffee', 'shirley-temple': 'Shirley Temple',
  'b52': 'B-52', 'spritz': 'Aperol Spritz',
  'tom-collins': 'Tom Collins', 'french-75': 'French 75',
  'tequila-sunrise': 'Tequila Sunrise', 'paloma': 'Paloma',
  'screwdriver': 'Screwdriver', 'black-russian': 'Black Russian',
  'white-russian': 'White Russian', 'bloody-mary': 'Bloody Mary',
  'cuba-libre': 'Cuba Libre', 'blue-lagoon': 'Blue Lagoon',
  'mint-julep': 'Mint Julep', 'rob-roy': 'Rob Roy',
  'godfather': 'Godfather', 'amaretto-sour': 'Amaretto Sour',
  'long-island-iced-tea': 'Long Island Tea', 'brandy-alexander': 'Brandy Alexander',
  'grasshopper': 'Grasshopper', 'sex-on-the-beach': 'Sex on the Beach',
  'hot-toddy': 'Hot Toddy', 'americano': 'Americano',
  'boulevardier': 'Boulevardier', 'mimosa': 'Mimosa',
  'dark-n-stormy': 'Dark and Stormy', 'whiskey-highball': 'Whiskey Highball',
  'virgin-mojito': 'Virgin Mojito',
  'kamikaze': 'Kamikaze', 'gin-fizz': 'Gin Fizz', 'bees-knees': 'Bees Knees',
  'fuzzy-navel': 'Fuzzy Navel', 'whiskey-ginger': 'Whiskey Highball',
  'cape-codder': 'Cape Codder', 'horses-neck': 'Horses Neck',
  'john-collins': 'John Collins', 'gin-rickey': 'Gin Rickey',
  'planters-punch': 'Planters Punch', 'caipirinha': 'Caipirinha',
  'harvey-wallbanger': 'Harvey Wallbanger', 'rusty-nail': 'Rusty Nail',
  'kir-royale': 'Kir Royale', 'midori-sour': 'Midori Sour',
  'bramble': 'Bramble', 'sazerac': 'Sazerac',
  'singapore-sling': 'Singapore Sling', 'last-word': 'Last Word',
  'vesper': 'Vesper', 'harvard-cooler': 'Harvard Cooler',
};

// ===== Data Loading =====
async function loadData() {
  const [cocktails, bottles, tools, categories, toolGuides] = await Promise.all([
    fetch('data/cocktails.json').then(r => r.json()),
    fetch('data/bottles.json').then(r => r.json()),
    fetch('data/tools.json').then(r => r.json()),
    fetch('data/categories.json').then(r => r.json()),
    fetch('data/tool-guides.json').then(r => r.json()),
  ]);
  state.cocktails = cocktails;
  state.bottles = bottles;
  state.tools = tools;
  state.categories = categories;
  state.toolGuides = toolGuides;
}

// ===== Inventory Persistence =====
function saveInventory() {
  localStorage.setItem('homeBarInventory', JSON.stringify({
    bottles: [...state.inventory.bottles],
  }));
}

function loadInventory() {
  try {
    const data = JSON.parse(localStorage.getItem('homeBarInventory'));
    if (data) {
      state.inventory.bottles = new Set(data.bottles || []);
    }
  } catch (e) { /* ignore */ }
}

// ===== Tab Navigation =====
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-bar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Lazy render on tab switch
  if (tabName === 'cocktails') renderCocktails();
  if (tabName === 'recommend') renderRecommendations();
  if (tabName === 'guide') renderGuide();

  // Scroll to top
  window.scrollTo(0, 0);
}

// ===== Cocktail Analysis =====
function isAlcoholBottle(bottleId) {
  const b = state.bottles.find(b => b.id === bottleId);
  return b && ALCOHOL_TYPES.has(b.type);
}

function analyzeCocktail(cocktail) {
  const missingBottles = [];
  const haveBottles = [];
  for (const ing of cocktail.ingredients) {
    if (!isAlcoholBottle(ing.bottle_id)) continue;
    if (state.inventory.bottles.has(ing.bottle_id)) haveBottles.push(ing);
    else missingBottles.push(ing);
  }
  const totalItems = haveBottles.length + missingBottles.length;
  const progress = totalItems > 0 ? haveBottles.length / totalItems : 1;

  let status;
  if (missingBottles.length === 0) status = 'unlocked';
  else if (missingBottles.length <= 2) status = 'almost';
  else status = 'locked';

  return { status, missingBottles, haveBottles, progress };
}

// ===== Recommendations =====
function getRecommendations() {
  const alcoholBottles = state.bottles.filter(b => ALCOHOL_TYPES.has(b.type) && !state.inventory.bottles.has(b.id));
  const results = [];
  for (const item of alcoholBottles) {
    const tempBottles = new Set(state.inventory.bottles);
    tempBottles.add(item.id);

    const newlyUnlocked = [];
    for (const cocktail of state.cocktails) {
      if (analyzeCocktail(cocktail).status === 'unlocked') continue;
      const allAlcohol = cocktail.ingredients
        .filter(i => isAlcoholBottle(i.bottle_id))
        .every(i => tempBottles.has(i.bottle_id));
      if (allAlcohol) newlyUnlocked.push(cocktail);
    }
    if (newlyUnlocked.length > 0) results.push({ item, newlyUnlocked });
  }
  results.sort((a, b) => b.newlyUnlocked.length - a.newlyUnlocked.length);
  return results.slice(0, 8);
}

// ===== Helpers =====
function isGlassware(toolId) {
  const t = state.tools.find(t => t.id === toolId);
  return t && t.category === 'glassware';
}
function getGlassInfo(cocktail) {
  const glassId = cocktail.required_tools.find(t => isGlassware(t));
  if (!glassId) return null;
  const tool = state.tools.find(t => t.id === glassId);
  return { id: glassId, svg: GLASS_SVG[glassId] || DEFAULT_GLASS_SVG, name: tool ? tool.name.ja : glassId };
}
function getBottleName(id) {
  const b = state.bottles.find(b => b.id === id);
  return b ? b.name.ja : id;
}
function getToolName(id) {
  const t = state.tools.find(t => t.id === id);
  return t ? t.name.ja : id;
}
function countUsage(itemId) {
  let count = 0;
  for (const c of state.cocktails) {
    if (c.ingredients.some(i => i.bottle_id === itemId)) count++;
  }
  return count;
}

const checkSvg = '<svg width="12" height="12" fill="none" stroke="#0a0a0a" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
const chevronSvg = '<svg class="chevron" width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/></svg>';


// ===== Render: My Bar Stats =====
function renderMyBarStats() {
  const alcoholCount = [...state.inventory.bottles].filter(id => {
    const b = state.bottles.find(b => b.id === id);
    return b && ALCOHOL_TYPES.has(b.type);
  }).length;
  const unlocked = state.cocktails.filter(c => analyzeCocktail(c).status === 'unlocked').length;
  document.getElementById('stat-bottles').textContent = alcoholCount;
  document.getElementById('stat-unlocked').textContent = unlocked;
}

// ===== Render: Inventory =====
function renderInventory() {
  const panel = document.getElementById('inventory-panel');
  const query = state.search.inventory.toLowerCase();
  let html = '';

  // Helper: check if item matches search
  const matchItem = (item) => {
    if (!query) return true;
    return item.name.ja.toLowerCase().includes(query)
      || (item.name.en && item.name.en.toLowerCase().includes(query));
  };

  // Only show alcohol bottles
  const alcoholBottles = state.bottles.filter(b => ALCOHOL_TYPES.has(b.type));

  // When searching, show flat list
  if (query) {
    const matched = alcoholBottles.filter(matchItem);
    if (matched.length === 0) {
      html = '<div class="empty-state"><p class="empty-text">見つかりません</p></div>';
    } else {
      for (const item of matched) {
        const checked = state.inventory.bottles.has(item.id);
        const usage = countUsage(item.id);
        html += `<div class="inv-item ${checked ? 'checked' : ''}" data-type="bottle" data-id="${item.id}">
          <div class="inv-checkbox">${checkSvg}</div>
          <span>${item.name.ja}</span>
          <span class="inv-badge">${usage}杯</span>
        </div>`;
      }
    }
    panel.innerHTML = html;
    return;
  }

  for (const section of BOTTLE_SECTIONS) {
    const items = alcoholBottles.filter(b => b.type === section.type);
    if (items.length === 0) continue;
    const checkedCount = items.filter(b => state.inventory.bottles.has(b.id)).length;
    html += `<details class="inv-section" ${section.open ? 'open' : ''}>
      <summary>${chevronSvg}<span>${section.label}</span><span class="inv-section-count">${checkedCount}/${items.length}</span></summary>
      <div>`;
    for (const item of items) {
      const checked = state.inventory.bottles.has(item.id);
      const usage = countUsage(item.id);
      html += `<div class="inv-item ${checked ? 'checked' : ''}" data-type="bottle" data-id="${item.id}">
        <div class="inv-checkbox">${checkSvg}</div>
        <span>${item.name.ja}</span>
        <span class="inv-badge">${usage}杯</span>
      </div>`;
    }
    html += '</div></details>';
  }

  panel.innerHTML = html;
}

// ===== Render: Cocktail Cards =====
function renderCocktails() {
  const grid = document.getElementById('cocktail-grid');
  const emptyState = document.getElementById('empty-state');

  const query = state.search.cocktails.toLowerCase();

  const filtered = state.cocktails.filter(c => {
    const a = analyzeCocktail(c);
    if (state.filters.status !== 'all' && a.status !== state.filters.status) return false;
    if (state.filters.category !== 'all' && c.category !== state.filters.category) return false;
    if (state.filters.method !== 'all' && c.method !== state.filters.method) return false;
    if (query) {
      const nameMatch = c.name.ja.toLowerCase().includes(query)
        || c.name.en.toLowerCase().includes(query);
      if (!nameMatch) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  // Sort: unlocked first, then by progress descending (closest to making)
  filtered.sort((a, b) => {
    const aa = analyzeCocktail(a);
    const ab = analyzeCocktail(b);
    const statusOrder = { unlocked: 0, almost: 1, locked: 2 };
    const statusDiff = statusOrder[aa.status] - statusOrder[ab.status];
    if (statusDiff !== 0) return statusDiff;
    return ab.progress - aa.progress;
  });

  let html = '';
  for (const cocktail of filtered) {
    const a = analyzeCocktail(cocktail);
    const glass = getGlassInfo(cocktail);
    const glassSvg = glass ? glass.svg : DEFAULT_GLASS_SVG;
    const imgUrl = state.images[cocktail.id];
    const justUnlocked = a.status === 'unlocked' && !state.previouslyUnlocked.has(cocktail.id);
    const fillClass = a.status === 'unlocked' ? 'fill-success' : a.status === 'almost' ? 'fill-warning' : 'fill-neutral';

    const statusBadge = a.status === 'unlocked'
      ? '<span class="status-badge unlocked-badge">UNLOCKED</span>'
      : a.status === 'almost'
      ? `<span class="status-badge almost-badge">あと${a.missingBottles.length}</span>`
      : `<span class="status-badge locked-badge">${a.missingBottles.length}不足</span>`;

    let missingHtml = '';
    if (a.status !== 'unlocked') {
      const allMissing = a.missingBottles.map(i => getBottleName(i.bottle_id));
      const shown = allMissing.slice(0, 2);
      missingHtml = '<div class="missing-row">'
        + shown.map(name => `<span class="missing-tag">${name}</span>`).join('')
        + (allMissing.length > 2 ? `<span class="missing-tag">+${allMissing.length - 2}</span>` : '')
        + '</div>';
    }

    const glassHtml = glass ? `<span class="glass-badge">${glass.svg} ${glass.name}</span>` : '';

    html += `
    <div class="cocktail-card ${a.status} ${justUnlocked ? 'just-unlocked' : ''}" data-cocktail-id="${cocktail.id}">
      <div class="card-image gradient-${cocktail.category}">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${cocktail.name.ja}" loading="lazy">`
          : `<span class="emoji-fallback">${glassSvg}</span>`}
        ${statusBadge}
      </div>
      <div class="card-progress">
        <div class="card-progress-fill ${fillClass}" style="width: ${Math.round(a.progress * 100)}%"></div>
      </div>
      <div class="card-body">
        <div class="card-name">${cocktail.name.ja}</div>
        <div class="card-name-en">${cocktail.name.en}</div>
        <div class="badge-row">
          <span class="method-badge method-${cocktail.method}">${METHOD_LABELS[cocktail.method]}</span>
          <span class="taste-badge">${TASTE_LABELS[cocktail.taste] || cocktail.taste}</span>
          ${glassHtml}
        </div>
        ${missingHtml}
      </div>
    </div>`;
  }
  grid.innerHTML = html;
}

// ===== Render: Recommendations =====
function renderRecommendations() {
  const list = document.getElementById('recommendations-list');
  const empty = document.getElementById('rec-empty');
  const recs = getRecommendations();

  if (recs.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  let html = '';
  for (const rec of recs) {
    const item = rec.item;
    html += `
    <div class="rec-card">
      <div class="rec-header">
        <span class="rec-icon"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4v4l2 4v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V10l2-4V2z"/><path d="M10 2h4"/><path d="M9 14h6"/></svg></span>
        <div>
          <div class="rec-name">${item.name.ja}</div>
          <div class="rec-price">${item.price_range || ''}</div>
        </div>
        <span class="rec-badge">+${rec.newlyUnlocked.length}杯</span>
      </div>
      <div class="rec-cocktails">
        ${rec.newlyUnlocked.map(c => `<span>${c.name.ja}</span>`).join('')}
      </div>
    </div>`;
  }
  list.innerHTML = html;
}

// ===== Render: Progress =====
function renderProgress() {
  const unlocked = state.cocktails.filter(c => analyzeCocktail(c).status === 'unlocked').length;
  document.getElementById('unlock-count').textContent = unlocked;
  document.getElementById('total-count').textContent = state.cocktails.length;
  document.getElementById('progress-bar').style.width = (unlocked / state.cocktails.length * 100) + '%';
}

// ===== Render: Modal =====
function showModal(cocktailId) {
  const cocktail = state.cocktails.find(c => c.id === cocktailId);
  if (!cocktail) return;

  const a = analyzeCocktail(cocktail);
  const glass = getGlassInfo(cocktail);
  const glassSvg = glass ? glass.svg : DEFAULT_GLASS_SVG;
  const imgUrl = state.images[cocktail.id];

  const ingredientsList = cocktail.ingredients.map(ing => {
    const isAlcohol = isAlcoholBottle(ing.bottle_id);
    if (isAlcohol) {
      const have = state.inventory.bottles.has(ing.bottle_id);
      return `<div class="${have ? 'have-tag' : 'missing-tag'}">${have ? '✓' : '✕'} ${getBottleName(ing.bottle_id)} <span style="opacity:0.6">${ing.amount}</span></div>`;
    }
    return `<div class="have-tag">・ ${getBottleName(ing.bottle_id)} <span style="opacity:0.6">${ing.amount}</span></div>`;
  }).join('');

  const garnishList = (cocktail.garnish || []).map(g =>
    `<span class="taste-badge">${getBottleName(g.bottle_id)} ${g.amount}</span>`
  ).join('');

  const nonGlassTools = cocktail.required_tools.filter(t => !isGlassware(t));
  const toolsList = nonGlassTools.map(t =>
    `<span class="taste-badge">${getToolName(t)}</span>`
  ).join('');

  const steps = cocktail.instructions.map((step, i) =>
    `<div class="recipe-step"><div class="step-number">${i + 1}</div><p class="step-text">${step}</p></div>`
  ).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-image gradient-${cocktail.category}">
      ${imgUrl ? `<img src="${imgUrl}" alt="${cocktail.name.ja}">` : `<span class="modal-glass-icon">${glassSvg}</span>`}
    </div>
    <div class="modal-body">
      <div class="modal-header">
        <h2 class="modal-title">${cocktail.name.ja}</h2>
        <button id="modal-close" class="modal-close">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <p class="modal-en">${cocktail.name.en}</p>
      <div class="modal-tags">
        <span class="method-badge method-${cocktail.method}">${METHOD_LABELS[cocktail.method]}</span>
        <span class="taste-badge">${CATEGORY_LABELS[cocktail.category]}</span>
        <span class="taste-badge">${TASTE_LABELS[cocktail.taste]}</span>
        <span class="taste-badge">${STRENGTH_LABELS[cocktail.alcohol_strength]}</span>
      </div>
      <p class="modal-desc">${cocktail.description}</p>

      <h3 class="modal-section-title">材料</h3>
      <div class="modal-tags">${ingredientsList}</div>

      ${garnishList ? `<h3 class="modal-section-title">ガーニッシュ</h3><div class="modal-tags">${garnishList}</div>` : ''}

      ${glass ? `<h3 class="modal-section-title">グラス</h3><div class="modal-tags"><span class="glass-badge">${glass.svg} ${glass.name}</span></div>` : ''}
      ${cocktail.alternative_tools_note ? `<p class="modal-note">${cocktail.alternative_tools_note}</p>` : ''}

      ${nonGlassTools.length > 0 ? `<h3 class="modal-section-title">必要な器具</h3><div class="modal-tags">${toolsList}</div>` : ''}

      <h3 class="modal-section-title">作り方</h3>
      <div>${steps}</div>
    </div>
  `;

  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ===== Image Loading =====
async function loadImages() {
  try {
    const cached = JSON.parse(localStorage.getItem('cocktailImages') || '{}');
    if (Object.keys(cached).length > 0) {
      state.images = cached;
      if (state.activeTab === 'cocktails') renderCocktails();
    }
  } catch (e) { /* ignore */ }

  const promises = state.cocktails.map(async (cocktail) => {
    if (state.images[cocktail.id]) return;
    const searchName = COCKTAILDB_NAMES[cocktail.id];
    if (!searchName) return;
    try {
      const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchName)}`);
      const data = await res.json();
      if (data.drinks && data.drinks[0] && data.drinks[0].strDrinkThumb) {
        state.images[cocktail.id] = data.drinks[0].strDrinkThumb + '/preview';
      }
    } catch (e) { /* fallback to SVG icon */ }
  });

  await Promise.allSettled(promises);
  localStorage.setItem('cocktailImages', JSON.stringify(state.images));
  if (state.activeTab === 'cocktails') renderCocktails();
}

// ===== Tool Illustrations (for guide) =====
const TOOL_ILLUST = {
  'shaker': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 8h16l2 6H22l2-6z"/><rect x="20" y="14" width="24" height="4" rx="1"/><path d="M21 18l3 38h16l3-38"/><ellipse cx="32" cy="37" rx="6" ry="8" stroke-dasharray="3 3" opacity=".3"/></svg>',
  'mixing-glass': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10h24l-3 42H23L20 10z"/><path d="M20 10h24" stroke-width="2"/><ellipse cx="32" cy="32" rx="7" ry="10" stroke-dasharray="3 3" opacity=".3"/></svg>',
  'bar-spoon': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="52" rx="5" ry="3"/><path d="M32 49V12"/><path d="M29 12a3 3 0 016 0"/><path d="M28 28c2-2 6 2 8 0" opacity=".5"/><path d="M28 34c2-2 6 2 8 0" opacity=".5"/></svg>',
  'strainer': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="28" rx="14" ry="6"/><path d="M18 28v4c0 3.3 6.3 6 14 6s14-2.7 14-6v-4"/><path d="M22 32v3m4-4v4m4-4v4m4-4v4m4-3v3"/><path d="M32 8v14"/><circle cx="32" cy="8" r="3"/></svg>',
  'jigger': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 30h20"/><path d="M26 30l-4-22h20l-4 22"/><path d="M26 30l-2 26h16l-2-26"/></svg>',
  'muddler': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="6" width="8" height="44" rx="4"/><rect x="26" y="50" width="12" height="8" rx="2"/><line x1="28" y1="14" x2="36" y2="14" opacity=".4"/></svg>',
  'blender': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 6h20v4H22z"/><path d="M24 10l-2 30h20l-2-30"/><rect x="20" y="40" width="24" height="8" rx="2"/><circle cx="32" cy="44" r="2"/></svg>',
  'peeler': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M26 8c0 0 2 4 6 4s6-4 6-4"/><path d="M26 8v6h12V8"/><rect x="30" y="14" width="4" height="36" rx="2"/></svg>',
  'ice-tray': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="18" width="44" height="28" rx="3"/><line x1="10" y1="32" x2="54" y2="32"/><line x1="21" y1="18" x2="21" y2="46"/><line x1="32" y1="18" x2="32" y2="46"/><line x1="43" y1="18" x2="43" y2="46"/></svg>',
};

const TECHNIQUE_SVG = {
  shake: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4l1 3H9l1-3z"/><rect x="8" y="5" width="8" height="2" rx=".5"/><path d="M9 7l1 15h4l1-15"/><path d="M4 5l2-2m14 2l-2-2"/></svg>',
  stir: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><circle cx="12" cy="3" r="1.5"/><path d="M10 14c1-1 3 1 4 0" opacity=".5"/><path d="M10 17c1-1 3 1 4 0" opacity=".5"/></svg>',
  build: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="16" rx="1"/><path d="M6 4h12"/><path d="M9 10h6" opacity=".4"/><path d="M9 14h6" opacity=".4"/></svg>',
  blend: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8v3H8z"/><path d="M9 5l-1 12h8l-1-12"/><rect x="7" y="17" width="10" height="4" rx="1"/><circle cx="12" cy="19" r="1"/></svg>',
  layer: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l-1 16H8L7 4z"/><path d="M8.5 9h7" opacity=".6"/><path d="M8.2 13h7.6" opacity=".4"/><path d="M7 4h10"/></svg>',
};

// ===== Render: Guide =====
function renderGuide() {
  const panel = document.getElementById('guide-panel');
  if (panel.innerHTML) return; // Already rendered (static content)

  const { techniques, tools } = state.toolGuides;
  const chevron = '<svg class="guide-card-chevron" width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/></svg>';

  let html = '<div class="guide-section-label">テクニック</div>';

  for (const tech of techniques) {
    const techSvg = TECHNIQUE_SVG[tech.id] || DEFAULT_GLASS_SVG;
    const toolNames = tech.required_tools.map(id => getToolName(id)).join('、');
    html += `
    <div class="guide-card" data-guide-id="${tech.id}">
      <div class="guide-card-header">
        <div class="guide-card-icon technique">${techSvg}</div>
        <div class="guide-card-text">
          <div class="guide-card-name">${tech.name.ja}</div>
          <div class="guide-card-name-en">${tech.name.en}</div>
        </div>
        ${chevron}
      </div>
      <div class="guide-card-body">
        <p>${tech.description}</p>

        <h4>いつ使う？</h4>
        <p>${tech.when_to_use}</p>

        <h4>手順</h4>
        <ol class="guide-steps">${tech.steps.map(s => `<li><span>${s}</span></li>`).join('')}</ol>

        <h4>コツ</h4>
        <ul class="guide-tips">${tech.tips.map(t => `<li>${t}</li>`).join('')}</ul>

        <h4>必要な器具</h4>
        <p>${toolNames}</p>

        <h4>代表的なカクテル</h4>
        <div class="guide-cocktail-tags">${tech.example_cocktails.map(c => `<span>${c}</span>`).join('')}</div>
      </div>
    </div>`;
  }

  html += '<div class="guide-section-label">ツール</div>';

  for (const guide of tools) {
    const toolData = state.tools.find(t => t.id === guide.id);
    if (!toolData) continue;
    const illust = TOOL_ILLUST[guide.id] || '';
    const priority = toolData.priority === 'essential' ? '必須' : toolData.priority === 'recommended' ? 'おすすめ' : 'あると便利';

    html += `
    <div class="guide-card" data-guide-id="${guide.id}">
      <div class="guide-card-header">
        <div class="guide-card-icon tool">${illust}</div>
        <div class="guide-card-text">
          <div class="guide-card-name">${toolData.name.ja}</div>
          <div class="guide-card-sub">${priority} ・ ${toolData.price_range || ''}</div>
        </div>
        ${chevron}
      </div>
      <div class="guide-card-body">
        <p>${toolData.description}</p>

        <h4>使い方</h4>
        <ol class="guide-steps">${guide.how_to_use.map(s => `<li><span>${s}</span></li>`).join('')}</ol>

        <h4>コツ</h4>
        <ul class="guide-tips">${guide.tips.map(t => `<li>${t}</li>`).join('')}</ul>

        <h4>よくある失敗</h4>
        <ul class="guide-tips guide-mistakes">${guide.common_mistakes.map(m => `<li>${m}</li>`).join('')}</ul>

        <div class="guide-info-box">
          <div class="guide-info-label">お手入れ</div>
          ${guide.care}
        </div>
        <div class="guide-info-box">
          <div class="guide-info-label">代用品</div>
          ${guide.alternatives}
        </div>
      </div>
    </div>`;
  }

  panel.innerHTML = html;

  // Toggle open/close
  panel.addEventListener('click', (e) => {
    const header = e.target.closest('.guide-card-header');
    if (!header) return;
    header.closest('.guide-card').classList.toggle('open');
  });
}

// ===== Full Render =====
function render() {
  state.previouslyUnlocked = new Set(
    state.cocktails.filter(c => analyzeCocktail(c).status === 'unlocked').map(c => c.id)
  );
  renderMyBarStats();
  renderInventory();
  renderProgress();
  if (state.activeTab === 'cocktails') renderCocktails();
  if (state.activeTab === 'recommend') renderRecommendations();
}

// ===== Event Handlers =====
function setupEventHandlers() {
  // Tab navigation
  document.querySelectorAll('.tab-bar-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Inventory item toggle (alcohol bottles only)
  document.getElementById('inventory-panel').addEventListener('click', (e) => {
    const item = e.target.closest('.inv-item');
    if (!item) return;
    const { id } = item.dataset;
    if (state.inventory.bottles.has(id)) state.inventory.bottles.delete(id);
    else state.inventory.bottles.add(id);
    saveInventory();
    render();
  });

  // Cocktail card click → modal
  document.getElementById('cocktail-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.cocktail-card');
    if (card) showModal(card.dataset.cocktailId);
  });

  // Modal close
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Filters
  document.querySelectorAll('[data-filter-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.status = btn.dataset.filterStatus;
      renderCocktails();
    });
  });

  document.getElementById('filter-category').addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    renderCocktails();
  });

  document.getElementById('filter-method').addEventListener('change', (e) => {
    state.filters.method = e.target.value;
    renderCocktails();
  });

  // Search: inventory
  const invSearch = document.getElementById('search-inventory');
  const invClear = document.getElementById('search-inventory-clear');
  invSearch.addEventListener('input', () => {
    state.search.inventory = invSearch.value;
    invClear.classList.toggle('hidden', !invSearch.value);
    renderInventory();
  });
  invClear.addEventListener('click', () => {
    invSearch.value = '';
    state.search.inventory = '';
    invClear.classList.add('hidden');
    renderInventory();
  });

  // Search: cocktails
  const cktSearch = document.getElementById('search-cocktails');
  const cktClear = document.getElementById('search-cocktails-clear');
  cktSearch.addEventListener('input', () => {
    state.search.cocktails = cktSearch.value;
    cktClear.classList.toggle('hidden', !cktSearch.value);
    renderCocktails();
  });
  cktClear.addEventListener('click', () => {
    cktSearch.value = '';
    state.search.cocktails = '';
    cktClear.classList.add('hidden');
    renderCocktails();
  });
}

// ===== Init =====
async function init() {
  await loadData();
  loadInventory();
  setupEventHandlers();
  render();
  loadImages();
}

init();

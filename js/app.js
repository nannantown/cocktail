// ===== State =====
const state = {
  cocktails: [],
  bottles: [],
  tools: [],
  categories: [],
  inventory: { bottles: new Set(), tools: new Set() },
  filters: { status: 'all', category: 'all', method: 'all' },
  search: { inventory: '', cocktails: '' },
  images: {},
  previouslyUnlocked: new Set(),
  activeTab: 'mybar',
};

// ===== Labels =====
const GLASS_EMOJI = {
  'cocktail-glass': '🍸', 'old-fashioned-glass': '🥃', 'highball-glass': '🥂',
  'collins-glass': '🥂', 'wine-glass': '🍷', 'shot-glass': '🥃',
  'copper-mug': '🍺', 'hurricane-glass': '🍹', 'margarita-glass': '🍸',
  'irish-coffee-glass': '☕', 'champagne-flute': '🥂', 'julep-cup': '🥃',
};
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

// ===== Inventory sections =====
const BOTTLE_SECTIONS = [
  { type: 'spirit', label: 'スピリッツ', open: true },
  { type: 'liqueur', label: 'リキュール', open: false },
  { type: 'vermouth', label: 'ベルモット', open: false },
  { type: 'bitters', label: 'ビターズ', open: false },
  { type: 'mixer', label: 'ミキサー', open: false },
  { type: 'juice', label: 'ジュース', open: false },
  { type: 'syrup', label: 'シロップ', open: false },
  { type: 'fresh', label: 'フレッシュ', open: false },
  { type: 'garnish', label: 'ガーニッシュ', open: false },
  { type: 'pantry', label: 'パントリー', open: false },
  { type: 'other', label: 'その他', open: false },
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
};

// ===== Data Loading =====
async function loadData() {
  const [cocktails, bottles, tools, categories] = await Promise.all([
    fetch('data/cocktails.json').then(r => r.json()),
    fetch('data/bottles.json').then(r => r.json()),
    fetch('data/tools.json').then(r => r.json()),
    fetch('data/categories.json').then(r => r.json()),
  ]);
  state.cocktails = cocktails;
  state.bottles = bottles;
  state.tools = tools;
  state.categories = categories;
}

// ===== Inventory Persistence =====
function saveInventory() {
  localStorage.setItem('homeBarInventory', JSON.stringify({
    bottles: [...state.inventory.bottles],
    tools: [...state.inventory.tools],
  }));
}

function loadInventory() {
  try {
    const data = JSON.parse(localStorage.getItem('homeBarInventory'));
    if (data) {
      state.inventory.bottles = new Set(data.bottles || []);
      state.inventory.tools = new Set(data.tools || []);
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

  // Scroll to top
  window.scrollTo(0, 0);
}

// ===== Cocktail Analysis =====
function analyzeCocktail(cocktail) {
  const missingBottles = [];
  const haveBottles = [];
  for (const ing of cocktail.ingredients) {
    if (state.inventory.bottles.has(ing.bottle_id)) haveBottles.push(ing);
    else missingBottles.push(ing);
  }
  const missingTools = [];
  const haveTools = [];
  const nonGlassTools = cocktail.required_tools.filter(t => !isGlassware(t));
  for (const toolId of nonGlassTools) {
    if (state.inventory.tools.has(toolId)) haveTools.push(toolId);
    else missingTools.push(toolId);
  }
  const totalItems = cocktail.ingredients.length + nonGlassTools.length;
  const haveItems = haveBottles.length + haveTools.length;
  const progress = totalItems > 0 ? haveItems / totalItems : 0;

  let status;
  if (missingBottles.length === 0 && missingTools.length === 0) status = 'unlocked';
  else if (missingBottles.length + missingTools.length <= 2) status = 'almost';
  else status = 'locked';

  return { status, missingBottles, haveBottles, missingTools, haveTools, progress };
}

// ===== Recommendations =====
function getRecommendations() {
  const allItems = [
    ...state.bottles.filter(b => !state.inventory.bottles.has(b.id)).map(b => ({ ...b, itemType: 'bottle' })),
    ...state.tools.filter(t => t.category !== 'glassware' && !state.inventory.tools.has(t.id)).map(t => ({ ...t, itemType: 'tool' })),
  ];
  const results = [];
  for (const item of allItems) {
    const tempBottles = new Set(state.inventory.bottles);
    const tempTools = new Set(state.inventory.tools);
    if (item.itemType === 'bottle') tempBottles.add(item.id);
    else tempTools.add(item.id);

    const newlyUnlocked = [];
    for (const cocktail of state.cocktails) {
      if (analyzeCocktail(cocktail).status === 'unlocked') continue;
      const allIngs = cocktail.ingredients.every(i => tempBottles.has(i.bottle_id));
      const allToolsOk = cocktail.required_tools.filter(t => !isGlassware(t)).every(t => tempTools.has(t));
      if (allIngs && allToolsOk) newlyUnlocked.push(cocktail);
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
  return { id: glassId, emoji: GLASS_EMOJI[glassId] || '🍸', name: tool ? tool.name.ja : glassId };
}
function getBottleName(id) {
  const b = state.bottles.find(b => b.id === id);
  return b ? b.name.ja : id;
}
function getToolName(id) {
  const t = state.tools.find(t => t.id === id);
  return t ? t.name.ja : id;
}
function countUsage(itemId, itemType) {
  let count = 0;
  for (const c of state.cocktails) {
    if (itemType === 'bottle') {
      if (c.ingredients.some(i => i.bottle_id === itemId) || (c.garnish && c.garnish.some(g => g.bottle_id === itemId))) count++;
    } else {
      if (c.required_tools.includes(itemId)) count++;
    }
  }
  return count;
}

const checkSvg = '<svg width="12" height="12" fill="none" stroke="#0a0a0a" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
const chevronSvg = '<svg class="chevron" width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/></svg>';

// ===== Tool Illustrations =====
const TOOL_ILLUST = {
  'shaker': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 8h16l2 6H22l2-6z"/><rect x="20" y="14" width="24" height="4" rx="1"/><path d="M21 18l3 38h16l3-38"/><ellipse cx="32" cy="37" rx="6" ry="8" stroke-dasharray="3 3" opacity=".3"/></svg>',
  'mixing-glass': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10h24l-3 42H23L20 10z"/><path d="M20 10h24" stroke-width="2"/><ellipse cx="32" cy="32" rx="7" ry="10" stroke-dasharray="3 3" opacity=".3"/><line x1="38" y1="6" x2="38" y2="16" stroke-width="1" opacity=".5"/></svg>',
  'bar-spoon': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="52" rx="5" ry="3"/><path d="M32 49V12"/><path d="M29 12a3 3 0 016 0" /><path d="M28 28c2-2 6 2 8 0" opacity=".5"/><path d="M28 34c2-2 6 2 8 0" opacity=".5"/><path d="M28 40c2-2 6 2 8 0" opacity=".5"/></svg>',
  'strainer': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="28" rx="14" ry="6"/><path d="M18 28v4c0 3.3 6.3 6 14 6s14-2.7 14-6v-4"/><path d="M22 32v3m4-4v4m4-4v4m4-4v4m4-3v3"/><path d="M32 8v14"/><circle cx="32" cy="8" r="3"/></svg>',
  'jigger': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 30h20"/><path d="M26 30l-4-22h20l-4 22"/><path d="M26 30l-2 26h16l-2-26"/></svg>',
  'muddler': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="6" width="8" height="44" rx="4"/><rect x="26" y="50" width="12" height="8" rx="2"/><line x1="28" y1="14" x2="36" y2="14" opacity=".4"/><line x1="28" y1="20" x2="36" y2="20" opacity=".4"/></svg>',
  'blender': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 6h20v4H22z"/><path d="M24 10l-2 30h20l-2-30"/><rect x="20" y="40" width="24" height="8" rx="2"/><path d="M38 10l4-4" stroke-width="1"/><circle cx="32" cy="44" r="2"/><path d="M28 24l8-4m-8 8l8-4" opacity=".3"/></svg>',
  'peeler': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M26 8c0 0 2 4 6 4s6-4 6-4"/><path d="M26 8v6h12V8"/><rect x="30" y="14" width="4" height="36" rx="2"/><path d="M28 10h8" opacity=".5"/></svg>',
  'ice-tray': '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="18" width="44" height="28" rx="3"/><line x1="10" y1="32" x2="54" y2="32"/><line x1="21" y1="18" x2="21" y2="46"/><line x1="32" y1="18" x2="32" y2="46"/><line x1="43" y1="18" x2="43" y2="46"/></svg>',
};

// ===== Render: My Bar Stats =====
function renderMyBarStats() {
  const unlocked = state.cocktails.filter(c => analyzeCocktail(c).status === 'unlocked').length;
  document.getElementById('stat-bottles').textContent = state.inventory.bottles.size;
  document.getElementById('stat-tools').textContent = state.inventory.tools.size;
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

  // Helper: render a tool card with illustration + toggle switch
  const renderToolCard = (item) => {
    const checked = state.inventory.tools.has(item.id);
    const usage = countUsage(item.id, 'tool');
    const illust = TOOL_ILLUST[item.id] || '';
    return `<div class="tool-card ${checked ? 'active' : ''}" data-type="tool" data-id="${item.id}">
      <div class="tool-card-illust">${illust}</div>
      <div class="tool-card-info">
        <div class="tool-card-name">${item.name.ja}</div>
        <div class="tool-card-sub">${usage}杯で使用</div>
      </div>
      <div class="tool-toggle">
        <div class="tool-toggle-track"><div class="tool-toggle-thumb"></div></div>
      </div>
    </div>`;
  };

  // When searching, show flat list instead of sections
  if (query) {
    const matchedBottles = state.bottles.filter(matchItem);
    const matchedTools = state.tools.filter(t => t.category !== 'glassware' && matchItem(t));
    if (matchedBottles.length === 0 && matchedTools.length === 0) {
      html = '<div class="empty-state"><p class="empty-text">見つかりません</p></div>';
    } else {
      for (const item of matchedBottles) {
        const checked = state.inventory.bottles.has(item.id);
        const usage = countUsage(item.id, 'bottle');
        html += `<div class="inv-item ${checked ? 'checked' : ''}" data-type="bottle" data-id="${item.id}">
          <div class="inv-checkbox">${checkSvg}</div>
          <span>${item.name.ja}</span>
          <span class="inv-badge">${usage}杯</span>
        </div>`;
      }
      if (matchedTools.length > 0) {
        html += '<div class="tool-card-grid">';
        for (const item of matchedTools) html += renderToolCard(item);
        html += '</div>';
      }
    }
    panel.innerHTML = html;
    return;
  }

  // Tools first: visual card grid with toggle switches, collapsible
  const nonGlasswareTools = state.tools.filter(t => t.category !== 'glassware');
  if (nonGlasswareTools.length > 0) {
    const checkedCount = nonGlasswareTools.filter(t => state.inventory.tools.has(t.id)).length;
    html += `<details class="inv-section tool-section" open>
      <summary>${chevronSvg}<span>ツール</span><span class="inv-section-count">${checkedCount}/${nonGlasswareTools.length}</span></summary>
      <div class="tool-card-grid">`;
    for (const item of nonGlasswareTools) html += renderToolCard(item);
    html += '</div></details>';
  }

  html += '<div class="inv-heading">ボトル・材料</div>';
  for (const section of BOTTLE_SECTIONS) {
    const items = state.bottles.filter(b => b.type === section.type);
    if (items.length === 0) continue;
    const checkedCount = items.filter(b => state.inventory.bottles.has(b.id)).length;
    html += `<details class="inv-section" ${section.open ? 'open' : ''}>
      <summary>${chevronSvg}<span>${section.label}</span><span class="inv-section-count">${checkedCount}/${items.length}</span></summary>
      <div>`;
    for (const item of items) {
      const checked = state.inventory.bottles.has(item.id);
      const usage = countUsage(item.id, 'bottle');
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
    const emoji = glass ? glass.emoji : '🍸';
    const imgUrl = state.images[cocktail.id];
    const justUnlocked = a.status === 'unlocked' && !state.previouslyUnlocked.has(cocktail.id);
    const fillClass = a.status === 'unlocked' ? 'fill-success' : a.status === 'almost' ? 'fill-warning' : 'fill-neutral';

    const statusBadge = a.status === 'unlocked'
      ? '<span class="status-badge unlocked-badge">UNLOCKED</span>'
      : a.status === 'almost'
      ? `<span class="status-badge almost-badge">あと${a.missingBottles.length + a.missingTools.length}</span>`
      : `<span class="status-badge locked-badge">${a.missingBottles.length + a.missingTools.length}不足</span>`;

    let missingHtml = '';
    if (a.status !== 'unlocked') {
      const allMissing = [
        ...a.missingBottles.map(i => getBottleName(i.bottle_id)),
        ...a.missingTools.map(t => getToolName(t)),
      ];
      const shown = allMissing.slice(0, 2);
      missingHtml = '<div class="missing-row">'
        + shown.map(name => `<span class="missing-tag">${name}</span>`).join('')
        + (allMissing.length > 2 ? `<span class="missing-tag">+${allMissing.length - 2}</span>` : '')
        + '</div>';
    }

    const glassHtml = glass ? `<span class="glass-badge">${glass.emoji} ${glass.name}</span>` : '';

    html += `
    <div class="cocktail-card ${a.status} ${justUnlocked ? 'just-unlocked' : ''}" data-cocktail-id="${cocktail.id}">
      <div class="card-image gradient-${cocktail.category}">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${cocktail.name.ja}" loading="lazy">`
          : `<span class="emoji-fallback">${emoji}</span>`}
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
    const isBottle = item.itemType === 'bottle';
    html += `
    <div class="rec-card">
      <div class="rec-header">
        <span class="rec-icon">${isBottle ? '🍾' : '🔧'}</span>
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
  const emoji = glass ? glass.emoji : '🍸';
  const imgUrl = state.images[cocktail.id];

  const ingredientsList = cocktail.ingredients.map(ing => {
    const have = state.inventory.bottles.has(ing.bottle_id);
    return `<div class="${have ? 'have-tag' : 'missing-tag'}">${have ? '✓' : '✕'} ${getBottleName(ing.bottle_id)} <span style="opacity:0.6">${ing.amount}</span></div>`;
  }).join('');

  const garnishList = (cocktail.garnish || []).map(g =>
    `<span class="taste-badge">${getBottleName(g.bottle_id)} ${g.amount}</span>`
  ).join('');

  const nonGlassTools = cocktail.required_tools.filter(t => !isGlassware(t));
  const toolsList = nonGlassTools.map(t => {
    const have = state.inventory.tools.has(t);
    return `<span class="${have ? 'have-tag' : 'missing-tag'}">${have ? '✓' : '✕'} ${getToolName(t)}</span>`;
  }).join('');

  const steps = cocktail.instructions.map((step, i) =>
    `<div class="recipe-step"><div class="step-number">${i + 1}</div><p class="step-text">${step}</p></div>`
  ).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-image gradient-${cocktail.category}">
      ${imgUrl ? `<img src="${imgUrl}" alt="${cocktail.name.ja}">` : `<span style="font-size:3.5rem;opacity:0.7">${emoji}</span>`}
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

      ${glass ? `<h3 class="modal-section-title">グラス</h3><div class="modal-tags"><span class="glass-badge">${glass.emoji} ${glass.name}</span></div>` : ''}
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
    } catch (e) { /* fallback to emoji */ }
  });

  await Promise.allSettled(promises);
  localStorage.setItem('cocktailImages', JSON.stringify(state.images));
  if (state.activeTab === 'cocktails') renderCocktails();
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

  // Inventory item toggle (bottles + tools)
  document.getElementById('inventory-panel').addEventListener('click', (e) => {
    const item = e.target.closest('.inv-item') || e.target.closest('.tool-card');
    if (!item) return;
    const { type, id } = item.dataset;
    const set = type === 'bottle' ? state.inventory.bottles : state.inventory.tools;
    if (set.has(id)) set.delete(id);
    else set.add(id);
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

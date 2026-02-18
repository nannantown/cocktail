// ===== State =====
const state = {
  cocktails: [],
  bottles: [],
  tools: [],
  categories: [],
  inventory: { bottles: new Set(), tools: new Set() },
  filters: { status: 'all', category: 'all', method: 'all' },
  images: {},
  previouslyUnlocked: new Set(),
};

// ===== Glass emoji mapping =====
const GLASS_EMOJI = {
  'cocktail-glass': '🍸', 'old-fashioned-glass': '🥃', 'highball-glass': '🥂',
  'collins-glass': '🥂', 'wine-glass': '🍷', 'shot-glass': '🥃',
  'copper-mug': '🍺', 'hurricane-glass': '🍹', 'margarita-glass': '🍸',
  'irish-coffee-glass': '☕', 'champagne-flute': '🥂',
};

// ===== Category labels =====
const CATEGORY_LABELS = {
  short: 'ショート', long: 'ロング', tropical: 'トロピカル',
  standard: 'スタンダード', shot: 'ショット', hot: 'ホット', 'non-alcohol': 'ノンアル',
};

const METHOD_LABELS = {
  shake: 'シェーク', stir: 'ステア', build: 'ビルド', blend: 'ブレンド', layer: 'レイヤー',
};

const TASTE_LABELS = {
  sweet: '甘口', dry: '辛口', sour: '酸味', bitter: '苦味',
  'sweet-sour': '甘酸', refreshing: '爽快',
};

const STRENGTH_LABELS = {
  strong: '強め', medium: '普通', weak: '軽め', none: 'ノンアル',
};

// ===== Bottle type sections for inventory =====
const BOTTLE_SECTIONS = [
  { type: 'spirit', label: '🥃 スピリッツ', open: true },
  { type: 'liqueur', label: '🍷 リキュール', open: false },
  { type: 'vermouth', label: '🍶 ベルモット', open: false },
  { type: 'bitters', label: '💧 ビターズ', open: false },
  { type: 'mixer', label: '🫧 ミキサー', open: false },
  { type: 'juice', label: '🍋 ジュース', open: false },
  { type: 'syrup', label: '🍯 シロップ', open: false },
  { type: 'fresh', label: '🌿 フレッシュ', open: false },
  { type: 'garnish', label: '🍒 ガーニッシュ', open: false },
  { type: 'pantry', label: '🧂 パントリー', open: false },
  { type: 'other', label: '📦 その他', open: false },
];

const TOOL_SECTIONS = [
  { category: 'mixing', label: '🔧 ミキシングツール', open: true },
  { category: 'measuring', label: '📏 計量', open: false },
  { category: 'garnish', label: '🔪 ガーニッシュ', open: false },
  { category: 'glassware', label: '🍸 グラスウェア', open: false },
  { category: 'other', label: '🧊 その他', open: false },
];

// ===== CocktailDB image search mapping =====
const COCKTAILDB_NAMES = {
  'martini': 'Dry Martini', 'manhattan': 'Manhattan', 'old-fashioned': 'Old Fashioned',
  'gimlet': 'Gimlet', 'daiquiri': 'Daiquiri', 'margarita': 'Margarita',
  'moscow-mule': 'Moscow Mule', 'mojito': 'Mojito', 'negroni': 'Negroni',
  'gin-tonic': 'Gin and Tonic', 'whiskey-sour': 'Whiskey Sour',
  'cosmopolitan': 'Cosmopolitan', 'sidecar': 'Sidecar', 'pina-colada': 'Pina Colada',
  'espresso-martini': 'Espresso Martini', 'mai-tai': 'Mai Tai',
  'irish-coffee': 'Irish Coffee', 'shirley-temple': 'Shirley Temple',
  'b52': 'B-52', 'spritz': 'Aperol Spritz',
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
  const data = {
    bottles: [...state.inventory.bottles],
    tools: [...state.inventory.tools],
  };
  localStorage.setItem('homeBarInventory', JSON.stringify(data));
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

// ===== Cocktail Analysis =====
function analyzeCocktail(cocktail) {
  const missingBottles = [];
  const haveBottles = [];
  for (const ing of cocktail.ingredients) {
    if (state.inventory.bottles.has(ing.bottle_id)) {
      haveBottles.push(ing);
    } else {
      missingBottles.push(ing);
    }
  }

  const missingTools = [];
  const haveTools = [];
  for (const toolId of cocktail.required_tools) {
    if (state.inventory.tools.has(toolId)) {
      haveTools.push(toolId);
    } else {
      missingTools.push(toolId);
    }
  }

  const totalItems = cocktail.ingredients.length + cocktail.required_tools.length;
  const haveItems = haveBottles.length + haveTools.length;
  const progress = totalItems > 0 ? haveItems / totalItems : 0;

  let status;
  if (missingBottles.length === 0 && missingTools.length === 0) {
    status = 'unlocked';
  } else if (missingBottles.length + missingTools.length <= 2) {
    status = 'almost';
  } else {
    status = 'locked';
  }

  return { status, missingBottles, haveBottles, missingTools, haveTools, progress };
}

// ===== Recommendations =====
function getRecommendations() {
  const allItems = [
    ...state.bottles.filter(b => !state.inventory.bottles.has(b.id)).map(b => ({ ...b, itemType: 'bottle' })),
    ...state.tools.filter(t => !state.inventory.tools.has(t.id)).map(t => ({ ...t, itemType: 'tool' })),
  ];

  const results = [];

  for (const item of allItems) {
    const tempBottles = new Set(state.inventory.bottles);
    const tempTools = new Set(state.inventory.tools);

    if (item.itemType === 'bottle') tempBottles.add(item.id);
    else tempTools.add(item.id);

    const newlyUnlocked = [];
    for (const cocktail of state.cocktails) {
      const current = analyzeCocktail(cocktail);
      if (current.status === 'unlocked') continue;

      const allIngs = cocktail.ingredients.every(i => tempBottles.has(i.bottle_id));
      const allToolsOk = cocktail.required_tools.every(t => tempTools.has(t));
      if (allIngs && allToolsOk) {
        newlyUnlocked.push(cocktail);
      }
    }

    if (newlyUnlocked.length > 0) {
      results.push({ item, newlyUnlocked });
    }
  }

  results.sort((a, b) => b.newlyUnlocked.length - a.newlyUnlocked.length);
  return results.slice(0, 6);
}

// ===== Bottle/Tool name lookups =====
function getBottleName(id) {
  const b = state.bottles.find(b => b.id === id);
  return b ? b.name.ja : id;
}
function getToolName(id) {
  const t = state.tools.find(t => t.id === id);
  return t ? t.name.ja : id;
}

// Count how many cocktails use a given bottle or tool
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

// ===== Render: Inventory =====
function renderInventory() {
  const panel = document.getElementById('inventory-panel');
  let html = '';

  // Bottle sections
  html += '<div class="mb-4"><h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ボトル・材料</h3>';
  for (const section of BOTTLE_SECTIONS) {
    const items = state.bottles.filter(b => b.type === section.type);
    if (items.length === 0) continue;
    const checkedCount = items.filter(b => state.inventory.bottles.has(b.id)).length;
    html += `<details class="inventory-section mb-1" ${section.open ? 'open' : ''}>
      <summary class="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-white/5">
        <svg class="chevron w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/></svg>
        <span class="text-sm">${section.label}</span>
        <span class="ml-auto text-xs text-gray-500">${checkedCount}/${items.length}</span>
      </summary>
      <div class="ml-2">`;
    for (const item of items) {
      const checked = state.inventory.bottles.has(item.id);
      const usage = countUsage(item.id, 'bottle');
      html += `<div class="inv-item ${checked ? 'checked' : ''}" data-type="bottle" data-id="${item.id}">
        <div class="inv-checkbox"><svg class="w-3 h-3 text-bar-bg" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
        <span>${item.name.ja}</span>
        <span class="inv-badge">${usage}杯</span>
      </div>`;
    }
    html += '</div></details>';
  }
  html += '</div>';

  // Tool sections
  html += '<div><h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ツール・グラス</h3>';
  for (const section of TOOL_SECTIONS) {
    const items = state.tools.filter(t => t.category === section.category);
    if (items.length === 0) continue;
    const checkedCount = items.filter(t => state.inventory.tools.has(t.id)).length;
    html += `<details class="inventory-section mb-1" ${section.open ? 'open' : ''}>
      <summary class="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-white/5">
        <svg class="chevron w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/></svg>
        <span class="text-sm">${section.label}</span>
        <span class="ml-auto text-xs text-gray-500">${checkedCount}/${items.length}</span>
      </summary>
      <div class="ml-2">`;
    for (const item of items) {
      const checked = state.inventory.tools.has(item.id);
      const usage = countUsage(item.id, 'tool');
      html += `<div class="inv-item ${checked ? 'checked' : ''}" data-type="tool" data-id="${item.id}">
        <div class="inv-checkbox"><svg class="w-3 h-3 text-bar-bg" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
        <span>${item.name.ja}</span>
        <span class="inv-badge">${usage}杯</span>
      </div>`;
    }
    html += '</div></details>';
  }
  html += '</div>';

  panel.innerHTML = html;
}

// ===== Render: Cocktail Cards =====
function renderCocktails() {
  const grid = document.getElementById('cocktail-grid');
  const emptyState = document.getElementById('empty-state');

  const filtered = state.cocktails.filter(c => {
    const analysis = analyzeCocktail(c);
    if (state.filters.status !== 'all' && analysis.status !== state.filters.status) return false;
    if (state.filters.category !== 'all' && c.category !== state.filters.category) return false;
    if (state.filters.method !== 'all' && c.method !== state.filters.method) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  // Sort: unlocked first, then almost, then locked
  const statusOrder = { unlocked: 0, almost: 1, locked: 2 };
  filtered.sort((a, b) => {
    const sa = analyzeCocktail(a).status;
    const sb = analyzeCocktail(b).status;
    return statusOrder[sa] - statusOrder[sb];
  });

  let html = '';
  for (const cocktail of filtered) {
    const analysis = analyzeCocktail(cocktail);
    const glassToolId = cocktail.required_tools.find(t => t.endsWith('-glass') || t === 'copper-mug');
    const emoji = GLASS_EMOJI[glassToolId] || '🍸';
    const imgUrl = state.images[cocktail.id];
    const justUnlocked = analysis.status === 'unlocked' && !state.previouslyUnlocked.has(cocktail.id);

    const progressColor = analysis.status === 'unlocked' ? 'bg-emerald-400'
      : analysis.status === 'almost' ? 'bg-amber-400' : 'bg-gray-500';

    const statusBadge = analysis.status === 'unlocked'
      ? '<span class="status-badge unlocked-badge">UNLOCKED</span>'
      : analysis.status === 'almost'
      ? `<span class="status-badge almost-badge">あと${analysis.missingBottles.length + analysis.missingTools.length}</span>`
      : `<span class="status-badge locked-badge">🔒 ${analysis.missingBottles.length + analysis.missingTools.length}不足</span>`;

    // Missing items (max 3 shown)
    let missingHtml = '';
    if (analysis.status !== 'unlocked') {
      const allMissing = [
        ...analysis.missingBottles.map(i => getBottleName(i.bottle_id)),
        ...analysis.missingTools.map(t => getToolName(t)),
      ];
      const shown = allMissing.slice(0, 3);
      missingHtml = '<div class="flex flex-wrap gap-1 mt-2">'
        + shown.map(name => `<span class="missing-tag">✕ ${name}</span>`).join('')
        + (allMissing.length > 3 ? `<span class="missing-tag">+${allMissing.length - 3}</span>` : '')
        + '</div>';
    }

    html += `
    <div class="cocktail-card ${analysis.status} ${justUnlocked ? 'just-unlocked' : ''}" data-cocktail-id="${cocktail.id}">
      <div class="card-image gradient-${cocktail.category}">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${cocktail.name.ja}" loading="lazy">`
          : `<span class="emoji-fallback">${emoji}</span>`}
        ${statusBadge}
      </div>
      <div class="card-progress">
        <div class="card-progress-fill ${progressColor}" style="width: ${Math.round(analysis.progress * 100)}%"></div>
      </div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 class="font-bold text-base">${cocktail.name.ja}</h3>
            <p class="text-xs text-gray-500">${cocktail.name.en}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <span class="method-badge method-${cocktail.method}">${METHOD_LABELS[cocktail.method]}</span>
          <span class="taste-badge">${TASTE_LABELS[cocktail.taste] || cocktail.taste}</span>
          <span class="taste-badge">${STRENGTH_LABELS[cocktail.alcohol_strength]}</span>
        </div>
        ${missingHtml}
      </div>
    </div>`;
  }
  grid.innerHTML = html;
}

// ===== Render: Recommendations =====
function renderRecommendations() {
  const section = document.getElementById('recommendations');
  const list = document.getElementById('recommendations-list');
  const recs = getRecommendations();

  if (recs.length === 0) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  let html = '';
  for (const rec of recs) {
    const item = rec.item;
    const isBottle = item.itemType === 'bottle';
    const icon = isBottle ? '🍾' : '🔧';
    const typeName = isBottle ? (item.type === 'spirit' ? 'スピリッツ' : item.type) : item.category;

    html += `
    <div class="rec-card">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">${icon}</span>
        <div>
          <p class="font-bold text-sm">${item.name.ja}</p>
          <p class="text-xs text-gray-500">${item.price_range || ''}</p>
        </div>
        <span class="ml-auto bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">+${rec.newlyUnlocked.length}杯</span>
      </div>
      <div class="flex flex-wrap gap-1">
        ${rec.newlyUnlocked.map(c => `<span class="text-xs bg-white/5 px-2 py-0.5 rounded">${c.name.ja}</span>`).join('')}
      </div>
    </div>`;
  }
  list.innerHTML = html;
}

// ===== Render: Progress Stats =====
function renderProgress() {
  const unlocked = state.cocktails.filter(c => analyzeCocktail(c).status === 'unlocked').length;
  document.getElementById('unlock-count').textContent = unlocked;
  document.getElementById('total-count').textContent = state.cocktails.length;
  const pct = (unlocked / state.cocktails.length) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
}

// ===== Render: Modal =====
function showModal(cocktailId) {
  const cocktail = state.cocktails.find(c => c.id === cocktailId);
  if (!cocktail) return;

  const analysis = analyzeCocktail(cocktail);
  const glassToolId = cocktail.required_tools.find(t => t.endsWith('-glass') || t === 'copper-mug');
  const emoji = GLASS_EMOJI[glassToolId] || '🍸';
  const imgUrl = state.images[cocktail.id];

  const ingredientsList = cocktail.ingredients.map(ing => {
    const have = state.inventory.bottles.has(ing.bottle_id);
    return `<div class="${have ? 'have-tag' : 'missing-tag'} text-sm py-1 px-3">
      ${have ? '✓' : '✕'} ${getBottleName(ing.bottle_id)} <span class="opacity-60">${ing.amount}</span>
    </div>`;
  }).join('');

  const garnishList = (cocktail.garnish || []).map(g => {
    return `<span class="taste-badge">${getBottleName(g.bottle_id)} ${g.amount}</span>`;
  }).join('');

  const toolsList = cocktail.required_tools.map(t => {
    const have = state.inventory.tools.has(t);
    return `<span class="${have ? 'have-tag' : 'missing-tag'}">${have ? '✓' : '✕'} ${getToolName(t)}</span>`;
  }).join('');

  const steps = cocktail.instructions.map((step, i) => {
    return `<div class="recipe-step">
      <div class="step-number">${i + 1}</div>
      <p class="text-sm text-gray-300 pt-0.5">${step}</p>
    </div>`;
  }).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-image gradient-${cocktail.category}">
      ${imgUrl ? `<img src="${imgUrl}" alt="${cocktail.name.ja}">` : `<span class="text-6xl">${emoji}</span>`}
    </div>
    <div class="p-6">
      <div class="flex items-center justify-between mb-1">
        <h2 class="text-xl font-bold">${cocktail.name.ja}</h2>
        <button id="modal-close" class="text-gray-400 hover:text-white p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <p class="text-sm text-gray-500 mb-3">${cocktail.name.en}</p>
      <div class="flex flex-wrap gap-1.5 mb-4">
        <span class="method-badge method-${cocktail.method}">${METHOD_LABELS[cocktail.method]}</span>
        <span class="taste-badge">${CATEGORY_LABELS[cocktail.category]}</span>
        <span class="taste-badge">${TASTE_LABELS[cocktail.taste]}</span>
        <span class="taste-badge">${STRENGTH_LABELS[cocktail.alcohol_strength]}</span>
      </div>
      <p class="text-sm text-gray-400 mb-4">${cocktail.description}</p>

      <h3 class="text-sm font-bold mb-2 text-bar-accent">材料</h3>
      <div class="flex flex-wrap gap-1.5 mb-4">${ingredientsList}</div>

      ${garnishList ? `<h3 class="text-sm font-bold mb-2 text-bar-accent">ガーニッシュ</h3><div class="flex flex-wrap gap-1.5 mb-4">${garnishList}</div>` : ''}

      <h3 class="text-sm font-bold mb-2 text-bar-accent">必要な器具</h3>
      <div class="flex flex-wrap gap-1.5 mb-4">${toolsList}</div>
      ${cocktail.alternative_tools_note ? `<p class="text-xs text-gray-500 mb-4">💡 ${cocktail.alternative_tools_note}</p>` : ''}

      <h3 class="text-sm font-bold mb-2 text-bar-accent">作り方</h3>
      <div class="mb-2">${steps}</div>
    </div>
  `;

  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// ===== Image Loading (TheCocktailDB) =====
async function loadImages() {
  // Try to load from cache first
  try {
    const cached = JSON.parse(localStorage.getItem('cocktailImages') || '{}');
    if (Object.keys(cached).length > 0) {
      state.images = cached;
      renderCocktails(); // Re-render with cached images
    }
  } catch (e) { /* ignore */ }

  // Fetch fresh images in background
  const promises = state.cocktails.map(async (cocktail) => {
    if (state.images[cocktail.id]) return; // Already cached

    const searchName = COCKTAILDB_NAMES[cocktail.id];
    if (!searchName) return;

    try {
      const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchName)}`);
      const data = await res.json();
      if (data.drinks && data.drinks[0] && data.drinks[0].strDrinkThumb) {
        state.images[cocktail.id] = data.drinks[0].strDrinkThumb + '/preview';
      }
    } catch (e) { /* API unavailable, use emoji fallback */ }
  });

  await Promise.allSettled(promises);

  // Cache and re-render
  localStorage.setItem('cocktailImages', JSON.stringify(state.images));
  renderCocktails();
}

// ===== Full Render =====
function render() {
  // Track previously unlocked before re-render
  state.previouslyUnlocked = new Set(
    state.cocktails.filter(c => analyzeCocktail(c).status === 'unlocked').map(c => c.id)
  );

  renderInventory();
  renderCocktails();
  renderRecommendations();
  renderProgress();
}

// ===== Event Handlers =====
function setupEventHandlers() {
  // Inventory item toggle
  document.getElementById('inventory-panel').addEventListener('click', (e) => {
    const item = e.target.closest('.inv-item');
    if (!item) return;

    const type = item.dataset.type;
    const id = item.dataset.id;

    if (type === 'bottle') {
      if (state.inventory.bottles.has(id)) state.inventory.bottles.delete(id);
      else state.inventory.bottles.add(id);
    } else {
      if (state.inventory.tools.has(id)) state.inventory.tools.delete(id);
      else state.inventory.tools.add(id);
    }

    saveInventory();
    render();
  });

  // Cocktail card click → modal
  document.getElementById('cocktail-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.cocktail-card');
    if (card) showModal(card.dataset.cocktailId);
  });

  // Modal overlay click → close
  document.getElementById('modal-overlay').addEventListener('click', closeModal);

  // Escape key → close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Filter: status buttons
  document.querySelectorAll('[data-filter-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.status = btn.dataset.filterStatus;
      renderCocktails();
    });
  });

  // Filter: category select
  document.getElementById('filter-category').addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    renderCocktails();
  });

  // Filter: method select
  document.getElementById('filter-method').addEventListener('change', (e) => {
    state.filters.method = e.target.value;
    renderCocktails();
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
    overlay.classList.toggle('hidden');
  });

  document.getElementById('sidebar-overlay').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
  });
}

// ===== Init =====
async function init() {
  await loadData();
  loadInventory();
  setupEventHandlers();
  render();
  // Load images in background (non-blocking)
  loadImages();
}

init();

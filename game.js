// ===================================================================
// Fisher — rough prototype
// Single location (Pond). Cast -> lure delay -> reel minigame -> sell.
// Pure client-side, localStorage save. No backend needed for this build.
// ===================================================================

const SAVE_KEY = 'fisher_save_v1';

// ---------------- Data (placeholder — swap freely later) ----------------

const FISH_DATA = [
  { id: 'bluegill', name: 'Bluegill',        minKg: 0.10, maxKg: 0.50, struggle: 1, value: 5,  xp: 3,  rarity: 50 },
  { id: 'carp',     name: 'Pond Carp',       minKg: 0.50, maxKg: 2.00, struggle: 2, value: 12, xp: 8,  rarity: 30 },
  { id: 'catfish',  name: 'Small Catfish',   minKg: 1.00, maxKg: 3.50, struggle: 3, value: 20, xp: 15, rarity: 14 },
  { id: 'koi',      name: 'Koi',             minKg: 0.30, maxKg: 1.20, struggle: 2, value: 25, xp: 12, rarity: 5  },
  { id: 'turtle',   name: 'Snapping Turtle', minKg: 2.00, maxKg: 6.00, struggle: 4, value: 40, xp: 30, rarity: 1  },
];

const FISH_ICON = 'graphics/fish-icon.svg'; // one shared icon for the reel marker, catch popup, and shop lists

const ROD_CATALOG = [
  { id: 'starter',    name: 'Starter Rod',    price: 40,  lureSpeed: 1, luck: 1, control: 0, resilience: 1, maxKg: 3.0, durability: 100, reqLevel: 1 },
  { id: 'reinforced', name: 'Reinforced Rod', price: 120, lureSpeed: 2, luck: 2, control: 2, resilience: 2, maxKg: 5.0, durability: 150, reqLevel: 2 },
];

const BAIT_CATALOG = [
  { id: 'worm',      name: 'Worm',       price: 0, luckBonus: 0, reqLevel: 1 },
  { id: 'shinylure', name: 'Shiny Lure', price: 8, luckBonus: 2, reqLevel: 1 },
];

// ---------------- State ----------------

function freshState() {
  return {
    money: 0,
    xp: 0,
    ownedRods: [{ instanceId: 'r0', catalogId: 'starter', damage: 0 }],
    equippedInstanceId: 'r0',
    baitCounts: { shinylure: 0 },
    selectedBaitId: 'worm',
    inventory: [],
    stats: { totalCaught: 0, reelsSnapped: 0 },
    starterFreeRepairs: 3, // "insurance" — the free starter rod's first 3 repairs cost nothing
    hasSeenReelTutorial: false,
  };
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    const fresh = freshState();
    return Object.assign(fresh, parsed, {
      baitCounts: Object.assign(fresh.baitCounts, parsed.baitCounts || {}),
      stats: Object.assign(fresh.stats, parsed.stats || {}),
    });
  } catch (e) {
    console.warn('Save failed to load, starting fresh.', e);
    return freshState();
  }
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save game.', e);
  }
}

let state = loadGame();

// ---------------- Helpers ----------------

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function getLevel(xp) { return 1 + Math.floor(xp / 50); }

function getRodCatalog(catalogId) { return ROD_CATALOG.find(r => r.id === catalogId); }

function getEquippedRod() { return state.ownedRods.find(r => r.instanceId === state.equippedInstanceId); }

function getEffectiveStats(rodInstance) {
  const base = getRodCatalog(rodInstance.catalogId);
  const isBroken = rodInstance.damage >= base.durability;
  const mult = isBroken ? 0.4 : 1; // "60% less effective" == 40% remaining
  return {
    lureSpeed: base.lureSpeed * mult,
    luck: base.luck * mult,
    control: base.control * mult,
    resilience: base.resilience * mult,
    maxKg: base.maxKg * mult,
    durability: base.durability,
    isBroken,
    price: base.price,
    name: base.name,
  };
}

function applyDamage(rodInstance, amount) {
  const base = getRodCatalog(rodInstance.catalogId);
  rodInstance.damage = Math.min(base.durability, rodInstance.damage + amount);
}

function getRepairInfo(rodInstance) {
  const base = getRodCatalog(rodInstance.catalogId);
  const dmgRatio = rodInstance.damage / base.durability;
  const normalCost = Math.round(dmgRatio * 0.5 * base.price);
  const isFree = normalCost > 0 && rodInstance.catalogId === 'starter' && state.starterFreeRepairs > 0;
  return { normalCost, isFree, cost: isFree ? 0 : normalCost };
}

function pickFish(luck) {
  const weights = FISH_DATA.map(f => {
    const boost = 1 + (luck * (50 - f.rarity) / 50) * 0.08;
    return Math.max(0.01, f.rarity * boost);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < FISH_DATA.length; i++) {
    r -= weights[i];
    if (r <= 0) return FISH_DATA[i];
  }
  return FISH_DATA[FISH_DATA.length - 1];
}

function rollWeight(fish) {
  return fish.minKg + Math.random() * (fish.maxKg - fish.minKg);
}

// ---------------- DOM refs ----------------

const moneyDisplay = document.getElementById('moneyDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const rodNameEl = document.getElementById('rodName');
const durabilityFill = document.getElementById('durabilityFill');
const castBtn = document.getElementById('castBtn');
const waitIndicator = document.getElementById('waitIndicator');

const tutorialModal = document.getElementById('tutorialModal');
const tutorialStartBtn = document.getElementById('tutorialStartBtn');
const reelOverlay = document.getElementById('reelOverlay');
const reelBar = document.getElementById('reelBar');
const fishMarker = document.getElementById('fishMarker');
const progressFill = document.getElementById('progressFill');

const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultDetail = document.getElementById('resultDetail');
const resultCloseBtn = document.getElementById('resultCloseBtn');

const shopBtn = document.getElementById('shopBtn');
const shopModal = document.getElementById('shopModal');
const shopCloseBtn = document.getElementById('shopCloseBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const tabBuy = document.getElementById('tab-buy');
const tabSell = document.getElementById('tab-sell');
const tabRepair = document.getElementById('tab-repair');

// ---------------- Casting ----------------

let castInProgress = false;
let reel = null;

function startCast() {
  if (castInProgress) return;
  castInProgress = true;
  castBtn.disabled = true;
  shopBtn.disabled = true;
  waitIndicator.classList.remove('hidden');

  const rod = getEquippedRod();
  const stats = getEffectiveStats(rod);
  const baseWait = 3 + Math.random() * 3; // 3-6s
  const wait = Math.max(1, baseWait - stats.lureSpeed * 0.5);

  setTimeout(() => {
    waitIndicator.classList.add('hidden');
    beginReel();
  }, wait * 1000);
}

let pendingReel = null;

function beginReel() {
  const rod = getEquippedRod();
  const stats = getEffectiveStats(rod);
  const baitDef = BAIT_CATALOG.find(b => b.id === state.selectedBaitId) || {};
  const luck = stats.luck + (baitDef.luckBonus || 0);

  const fish = pickFish(luck);
  const weight = rollWeight(fish);

  if (state.selectedBaitId !== 'worm') {
    state.baitCounts[state.selectedBaitId] = Math.max(0, (state.baitCounts[state.selectedBaitId] || 0) - 1);
  }

  // Line snap: fish too heavy for this rod's Max Kg
  if (weight > stats.maxKg) {
    applyDamage(rod, 40);
    state.stats.reelsSnapped++;
    saveGame();
    finishCastAttempt();
    renderHUD();
    showResult('Line Snapped!', `A ${fish.name} (${weight.toFixed(2)}kg) was way past your rod's ${stats.maxKg.toFixed(1)}kg limit. The line snapped and it got away.`);
    return;
  }

  const barWidth = Math.min(70, 30 + stats.control * 6);
  pendingReel = { fish, weight, barWidth, resilience: stats.resilience };

  if (!state.hasSeenReelTutorial) {
    tutorialModal.classList.remove('hidden');
  } else {
    launchReel();
  }
}

function launchReel() {
  const { fish, weight, barWidth, resilience } = pendingReel;
  pendingReel = null;

  reel = {
    fish, weight,
    barPos: 50, barVel: 0, barWidth,
    fishPos: 50, fishTarget: 50, fishTimer: 0,
    progress: 0, perfect: true, locked: true, elapsed: 0,
    holding: false,
    resilience, struggle: fish.struggle,
    lastFrame: null,
  };

  reelOverlay.classList.remove('hidden');
  requestAnimationFrame(reelLoop);
}

function reelLoop(ts) {
  if (!reel) return;
  if (reel.lastFrame == null) reel.lastFrame = ts;
  const dt = Math.min(0.05, (ts - reel.lastFrame) / 1000);
  reel.lastFrame = ts;
  reel.elapsed += dt;

  if (reel.locked && (reel.elapsed >= 1.2 || reel.progress >= 20)) {
    reel.locked = false;
  }

  // Fish random-walk: struggle drives jump size/frequency, resilience dampens it
  reel.fishTimer -= dt;
  if (reel.fishTimer <= 0) {
    const jump = reel.struggle * 12;
    const dampen = 1 / (1 + reel.resilience * 0.35);
    reel.fishTarget = clamp(50 + (Math.random() * 2 - 1) * jump * dampen, 5, 95);
    reel.fishTimer = Math.max(0.25, 0.9 - reel.struggle * 0.1);
  }
  const fishSpeed = (2 + reel.struggle) * (1 / (1 + reel.resilience * 0.25));
  reel.fishPos += clamp(reel.fishTarget - reel.fishPos, -fishSpeed * dt * 30, fishSpeed * dt * 30);
  reel.fishPos = clamp(reel.fishPos, 2, 98);

  // Bar physics: hold accelerates right, release decelerates back left.
  // While locked, the bar holds still (no drift either way) so the player
  // isn't starting the real attempt already yanked out of position.
  const half = reel.barWidth / 2;
  if (!reel.locked) {
    const accel = 90, drag = 70;
    if (reel.holding) {
      reel.barVel += accel * dt;
    } else {
      reel.barVel -= drag * dt;
    }
    reel.barVel = clamp(reel.barVel, -60, 60);
    reel.barPos += reel.barVel * dt;
    if (reel.barPos - half < 0) { reel.barPos = half; reel.barVel = Math.max(0, reel.barVel); }
    if (reel.barPos + half > 100) { reel.barPos = 100 - half; reel.barVel = Math.min(0, reel.barVel); }
  }

  // Progress: +/-12% per second based on overlap
  const inside = Math.abs(reel.fishPos - reel.barPos) <= half;
  const delta = (inside ? 12 : -12) * dt;
  if (delta < 0) reel.perfect = false;
  reel.progress = clamp(reel.progress + delta, 0, 100);

  renderReel();

  if (reel.progress >= 100) { endReel(true); return; }
  if (reel.progress <= 0 && !reel.locked) { endReel(false); return; }

  requestAnimationFrame(reelLoop);
}

function endReel(won) {
  const rod = getEquippedRod();
  reelOverlay.classList.add('hidden');

  if (won) {
    const xpGain = Math.round(reel.fish.xp * (reel.perfect ? 1.5 : 1));
    state.xp += xpGain;
    state.inventory.push({ fishId: reel.fish.id, weight: reel.weight });
    state.stats.totalCaught++;
    applyDamage(rod, 6);
    showResult(
      reel.perfect ? 'Perfect Catch!' : 'Caught!',
      `${reel.fish.name} — ${reel.weight.toFixed(2)}kg. +${xpGain} XP${reel.perfect ? ' (perfect bonus)' : ''}. Head to the shop to sell it.`
    );
  } else {
    applyDamage(rod, 14);
    showResult('It got away…', `The ${reel.fish.name} broke free. No catch this time.`);
  }

  saveGame();
  renderHUD();
  reel = null;
  finishCastAttempt();
}

function finishCastAttempt() {
  castInProgress = false;
  castBtn.disabled = false;
  shopBtn.disabled = false;
}

function setHolding(v) { if (reel) reel.holding = v; }
reelOverlay.addEventListener('pointerdown', () => setHolding(true));
window.addEventListener('pointerup', () => setHolding(false));
window.addEventListener('pointercancel', () => setHolding(false));
window.addEventListener('keydown', (e) => { if ([' ', 'x', 'a', 'X', 'A'].includes(e.key)) { e.preventDefault(); setHolding(true); } });
window.addEventListener('keyup', (e) => { if ([' ', 'x', 'a', 'X', 'A'].includes(e.key)) setHolding(false); });

// ---------------- Shop actions ----------------

function buyRod(catalogId) {
  const cat = ROD_CATALOG.find(r => r.id === catalogId);
  if (!cat) return;
  if (state.ownedRods.some(r => r.catalogId === catalogId)) return;
  if (getLevel(state.xp) < cat.reqLevel) return;
  if (state.money < cat.price) return;
  state.money -= cat.price;
  state.ownedRods.push({ instanceId: 'r' + Date.now(), catalogId, damage: 0 });
  saveGame(); renderHUD(); renderShop();
}

function equipRod(instanceId) {
  state.equippedInstanceId = instanceId;
  saveGame(); renderHUD(); renderShop();
}

function buyBait(baitId) {
  const cat = BAIT_CATALOG.find(b => b.id === baitId);
  if (!cat || cat.price === 0) return;
  if (getLevel(state.xp) < cat.reqLevel) return;
  if (state.money < cat.price) return;
  state.money -= cat.price;
  state.baitCounts[baitId] = (state.baitCounts[baitId] || 0) + 1;
  saveGame(); renderHUD(); renderShop();
}

function sellFish(index) {
  const item = state.inventory[index];
  if (!item) return;
  const fish = FISH_DATA.find(f => f.id === item.fishId);
  state.money += fish.value;
  state.inventory.splice(index, 1);
  saveGame(); renderHUD(); renderShop();
}

function sellAll() {
  let total = 0;
  state.inventory.forEach((item) => { total += FISH_DATA.find(f => f.id === item.fishId).value; });
  state.inventory = [];
  state.money += total;
  saveGame(); renderHUD(); renderShop();
}

function repairRod() {
  const rod = getEquippedRod();
  const info = getRepairInfo(rod);
  if (info.normalCost <= 0) return;
  if (!info.isFree && state.money < info.cost) return;
  if (info.isFree) {
    state.starterFreeRepairs -= 1;
  } else {
    state.money -= info.cost;
  }
  rod.damage = 0;
  saveGame(); renderHUD(); renderShop();
}

function resetSave() {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  localStorage.removeItem(SAVE_KEY);
  state = freshState();
  saveGame(); renderHUD(); renderShop();
}

// ---------------- Rendering ----------------

function renderHUD() {
  moneyDisplay.innerHTML = `<img class="icon-inline" src="graphics/coin.svg" alt="coins"> ${state.money}`;
  const lvl = getLevel(state.xp);
  levelDisplay.innerHTML = `<img class="icon-inline" src="graphics/star.svg" alt="level"> Lv.${lvl} · ${state.xp} XP`;

  const rod = getEquippedRod();
  const base = getRodCatalog(rod.catalogId);
  const stats = getEffectiveStats(rod);
  rodNameEl.textContent = base.name + (stats.isBroken ? ' (broken)' : '');
  const dmgPct = Math.min(100, (rod.damage / base.durability) * 100);
  durabilityFill.style.width = (100 - dmgPct) + '%';
  durabilityFill.classList.toggle('durability-broken', dmgPct >= 100);
}

function renderReel() {
  reelBar.style.left = (reel.barPos - reel.barWidth / 2) + '%';
  reelBar.style.width = reel.barWidth + '%';
  fishMarker.style.left = reel.fishPos + '%';
  progressFill.style.width = reel.progress + '%';
}

function showResult(title, detail) {
  resultTitle.textContent = title;
  resultDetail.textContent = detail;
  resultModal.classList.remove('hidden');
}

function renderShop() {
  const lvl = getLevel(state.xp);
  const rod = getEquippedRod();

  const rodsHtml = ROD_CATALOG.map((cat) => {
    const owned = state.ownedRods.find(r => r.catalogId === cat.id);
    const locked = lvl < cat.reqLevel;
    let action;
    if (owned) {
      action = rod.catalogId === cat.id
        ? `<span class="tag">Equipped</span>`
        : `<button class="btn" data-equip="${owned.instanceId}">Equip</button>`;
    } else if (locked) {
      action = `<span class="tag locked">Requires Lv.${cat.reqLevel}</span>`;
    } else {
      action = `<button class="btn btn-accent" data-buyrod="${cat.id}" ${state.money < cat.price ? 'disabled' : ''}>Buy — ${cat.price} <img class="icon-inline" src="graphics/coin.svg" alt="coins"></button>`;
    }
    return `<div class="shop-item">
      <div class="shop-item-info"><strong>${cat.name}</strong>
        <div class="stat-row">Lure ${cat.lureSpeed} · Luck ${cat.luck} · Ctrl ${cat.control} · Res ${cat.resilience} · Max ${cat.maxKg}kg</div>
      </div>${action}</div>`;
  }).join('');

  const baitOptions = BAIT_CATALOG.filter(b => b.price > 0 && (state.baitCounts[b.id] || 0) > 0)
    .map(b => `<option value="${b.id}" ${state.selectedBaitId === b.id ? 'selected' : ''}>${b.name} (${state.baitCounts[b.id]} left)</option>`).join('');

  const baitHtml = BAIT_CATALOG.filter(b => b.price > 0).map((cat) => {
    const locked = lvl < cat.reqLevel;
    const owned = state.baitCounts[cat.id] || 0;
    return `<div class="shop-item">
      <div class="shop-item-info"><strong>${cat.name}</strong> <span class="tag">Owned: ${owned}</span>
        <div class="stat-row">+${cat.luckBonus} Luck for one cast</div>
      </div>
      ${locked ? `<span class="tag locked">Requires Lv.${cat.reqLevel}</span>` : `<button class="btn btn-accent" data-buybait="${cat.id}" ${state.money < cat.price ? 'disabled' : ''}>Buy — ${cat.price} <img class="icon-inline" src="graphics/coin.svg" alt="coins"></button>`}
    </div>`;
  }).join('');

  tabBuy.innerHTML = `
    <h3>Rods</h3>${rodsHtml}
    <h3>Bait</h3>${baitHtml}
    <h3>Bait for next cast</h3>
    <select id="baitSelect">
      <option value="worm" ${state.selectedBaitId === 'worm' ? 'selected' : ''}>Worm (free, unlimited)</option>
      ${baitOptions}
    </select>`;

  if (state.inventory.length === 0) {
    tabSell.innerHTML = `<p class="empty-note">Your creel is empty — go catch something.</p>`;
  } else {
    const rows = state.inventory.map((item, i) => {
      const fish = FISH_DATA.find(f => f.id === item.fishId);
      return `<div class="shop-item">
        <div class="shop-item-info"><strong><img class="icon-fish" src="${FISH_ICON}" alt=""> ${fish.name}</strong> — ${item.weight.toFixed(2)}kg</div>
        <button class="btn btn-accent" data-sell="${i}">Sell — ${fish.value} <img class="icon-inline" src="graphics/coin.svg" alt="coins"></button>
      </div>`;
    }).join('');
    tabSell.innerHTML = rows + `<button id="sellAllBtn" class="btn full-width" style="margin-top:10px;">Sell All</button>`;
  }

  const base = getRodCatalog(rod.catalogId);
  const stats = getEffectiveStats(rod);
  const info = getRepairInfo(rod);
  const repairLabel = info.normalCost <= 0
    ? 'No damage to repair'
    : info.isFree
      ? 'Free Repair (Insurance)'
      : `Repair — ${info.cost} <img class="icon-inline" src="graphics/coin.svg" alt="coins">`;
  tabRepair.innerHTML = `
    <p>${base.name} damage: ${rod.damage}/${base.durability}</p>
    ${stats.isBroken ? `<p class="warn">Broken — every stat is 60% weaker until repaired.</p>` : ''}
    ${rod.catalogId === 'starter' ? `<p class="tag">Starter Rod insurance: ${state.starterFreeRepairs} free repair${state.starterFreeRepairs === 1 ? '' : 's'} left</p>` : ''}
    <button id="repairBtn" class="btn btn-accent full-width" ${info.normalCost <= 0 || (!info.isFree && state.money < info.cost) ? 'disabled' : ''}>${repairLabel}</button>
    <h3>Stats</h3>
    <p>Total caught: ${state.stats.totalCaught} · Reels snapped: ${state.stats.reelsSnapped}</p>
    <button id="resetBtn" class="danger-btn" style="margin-top:16px;">Reset save data</button>
  `;

  tabBuy.querySelectorAll('[data-buyrod]').forEach(b => b.onclick = () => buyRod(b.dataset.buyrod));
  tabBuy.querySelectorAll('[data-equip]').forEach(b => b.onclick = () => equipRod(b.dataset.equip));
  tabBuy.querySelectorAll('[data-buybait]').forEach(b => b.onclick = () => buyBait(b.dataset.buybait));
  const baitSelect = document.getElementById('baitSelect');
  if (baitSelect) baitSelect.onchange = (e) => { state.selectedBaitId = e.target.value; saveGame(); };
  tabSell.querySelectorAll('[data-sell]').forEach(b => b.onclick = () => sellFish(parseInt(b.dataset.sell, 10)));
  const sellAllBtn = document.getElementById('sellAllBtn');
  if (sellAllBtn) sellAllBtn.onclick = sellAll;
  const repairBtn = document.getElementById('repairBtn');
  if (repairBtn) repairBtn.onclick = repairRod;
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) resetBtn.onclick = resetSave;
}

// ---------------- Wiring ----------------

castBtn.onclick = startCast;
tutorialStartBtn.onclick = () => {
  tutorialModal.classList.add('hidden');
  state.hasSeenReelTutorial = true;
  saveGame();
  launchReel();
};
resultCloseBtn.onclick = () => resultModal.classList.add('hidden');
shopBtn.onclick = () => { renderShop(); shopModal.classList.remove('hidden'); };
shopCloseBtn.onclick = () => shopModal.classList.add('hidden');
tabButtons.forEach((btn) => btn.onclick = () => {
  tabButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  tabPanels.forEach(p => p.classList.add('hidden'));
  document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
});

renderHUD();

// ============================================================
// UTILITIES — Security & Performance
// ============================================================

/** HTML-escape a string to prevent XSS when used in safe contexts */
function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = String(str || '');
  return d.innerHTML;
}

/** Debounce — delays fn execution until after `delay` ms of inactivity */
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ============================================================
// GSAP ANIMATION ENGINE — 60fps compositor-only
// ============================================================

/** Ensure gsap is ready and configure for consistent 60fps */
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.ticker.lagSmoothing(0);
  gsap.defaults({ overwrite: 'auto' });
}

const A = {
  // ── Tab Switch — Cross-fade with deferred unmount ───────
  switchTab(fromEl, toEl, direction, onDone) {
    gsap.killTweensOf([fromEl, toEl]);

    // Ensure both layers are visible and stacked
    gsap.set(fromEl, { display: 'block', zIndex: 1, clearProps: 'transform,opacity' });
    gsap.set(toEl,   { display: 'block', zIndex: 2, opacity: 0, y: 18 * direction });

    const tl = gsap.timeline({
      onComplete: () => {
        // Deferred unmount: only now remove the outgoing view from paint
        gsap.set(fromEl, { display: 'none', opacity: 0, y: 0, zIndex: '' });
        gsap.set(toEl,   { zIndex: '' });
        if (onDone) onDone();
      }
    });

    // Exit: outgoing fades + slides down
    tl.to(fromEl, {
      opacity: 0,
      y: -18 * direction,
      duration: 0.22,
      ease: 'power2.in',
    }, 0);

    // Enter: incoming fades in + slides into place (staggered start)
    tl.to(toEl, {
      opacity: 1,
      y: 0,
      duration: 0.30,
      ease: 'power3.out',
    }, 0.08);

    return tl;
  },

  // ── Bottom Sheet ────────────────────────────────────────
  openSheet(overlay, sheet) {
    const tl = gsap.timeline();
    gsap.killTweensOf([overlay, sheet]);
    overlay.classList.add('open');
    tl.set(overlay, { visibility: 'visible' })
      .set(sheet, { transform: 'translateY(100%)', force3D: true })
      .to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .to(sheet,   { transform: 'translateY(0%)', duration: 0.45, ease: 'back.out(1.2)', force3D: true }, 0.08);
    return tl;
  },

  closeSheet(overlay, sheet) {
    const tl = gsap.timeline({
      onComplete: () => {
        overlay.classList.remove('open');
        gsap.set(overlay, { visibility: 'hidden', opacity: 0 });
        gsap.set(sheet, { transform: 'translateY(100%)' });
      }
    });
    gsap.killTweensOf([overlay, sheet]);
    overlay.classList.remove('open');
    tl.to(sheet,   { transform: 'translateY(100%)', duration: 0.32, ease: 'power3.in', force3D: true }, 0)
      .to(overlay, { opacity: 0, duration: 0.22, ease: 'power2.in' }, 0.1);
    return tl;
  },

  snapSheetBack(sheet) {
    gsap.killTweensOf(sheet);
    return gsap.to(sheet, { transform: 'translateY(0%)', duration: 0.4, ease: 'elastic.out(1, 0.5)', force3D: true });
  },

  dismissSheetDrag(sheet, overlay) {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { visibility: 'hidden', opacity: 0 });
        gsap.set(sheet, { transform: 'translateY(100%)' });
      }
    });
    gsap.killTweensOf(sheet);
    tl.to(sheet,   { transform: 'translateY(100%)', duration: 0.3, ease: 'power3.in' }, 0)
      .to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.08);
    return tl;
  },

  // ── Toast ────────────────────────────────────────────────
  toastShow(el) {
    gsap.killTweensOf(el);
    gsap.set(el, { visibility: 'visible' });
    return gsap.fromTo(el,
      { opacity: 0, y: 16, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }
    );
  },

  toastHide(el) {
    gsap.killTweensOf(el);
    return gsap.to(el, {
      opacity: 0, y: 12, scale: 0.95, duration: 0.25, ease: 'power2.in',
      onComplete: () => gsap.set(el, { visibility: 'hidden', pointerEvents: 'none' })
    });
  },

  // ── Multi-Select Bar ────────────────────────────────────
  showMultiSelectBar(el) {
    gsap.killTweensOf(el);
    return gsap.to(el, { yPercent: 0, duration: 0.35, ease: 'power3.out' });
  },

  hideMultiSelectBar(el) {
    gsap.killTweensOf(el);
    return gsap.to(el, { yPercent: 100, duration: 0.28, ease: 'power3.in' });
  },

  // ── Numpad ───────────────────────────────────────────────
  numpadTap(btn) {
    gsap.killTweensOf(btn);
    gsap.fromTo(btn, { scale: 0.82 }, { scale: 1, duration: 0.35, ease: 'back.out(4)' });
  },

  displayBounce(el) {
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scale: 1.06 }, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
  },

  // ── Nav ─────────────────────────────────────────────────
  navTap(el) {
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(4)' });
  },

  navDot(el, active) {
    const dot = el.querySelector('.nav-dot');
    if (!dot) return;
    gsap.killTweensOf(dot);
    gsap.to(dot, { scale: active ? 1 : 0, duration: 0.35, ease: 'back.out(3)' });
  },

  // ── Category Chips ──────────────────────────────────────
  categorySelect(el) {
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scale: 0.9, opacity: 0.6 }, { scale: 1.05, opacity: 1, duration: 0.35, ease: 'back.out(3)' });
  },

  categoryDeselect(el) {
    gsap.killTweensOf(el);
    gsap.to(el, { scale: 1, opacity: 0.5, duration: 0.2, ease: 'power2.out' });
  },

  // ── Color Dots ──────────────────────────────────────────
  dotSelect(el) {
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scale: 0.8 }, { scale: 1.15, duration: 0.4, ease: 'back.out(3)' });
  },

  // ── Hero Counter ────────────────────────────────────────
  animateCounter(element, fromPaise, toPaise, symbol, duration) {
    duration = duration || 0.45;
    const obj = { val: fromPaise };
    gsap.killTweensOf(obj);
    gsap.to(obj, {
      val: toPaise,
      duration: duration,
      ease: 'power2.out',
      onUpdate() {
        element.innerHTML = `<span class="hero-currency">${symbol}</span>${fmtAmt(Math.round(obj.val))}`;
      }
    });
  },

  // ── Progress Bar ────────────────────────────────────────
  progressFill(el, pct) {
    gsap.killTweensOf(el);
    gsap.to(el, { scaleX: Math.max(0, pct), duration: 0.5, ease: 'power3.out' });
  },

  // ── Entry Cards ─────────────────────────────────────────
  staggerCards(cards) {
    if (!cards.length) return;
    gsap.fromTo(cards,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, stagger: 0.025, ease: 'power2.out' }
    );
  },

  entryPress(el) {
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scale: 0.97 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
  },

  // ── Delete Swipe ────────────────────────────────────────
  deleteSwipeDismiss(card, bg, onComplete) {
    const tl = gsap.timeline({ onComplete });
    tl.to(card, { xPercent: -100, duration: 0.3, ease: 'power3.in' }, 0)
      .to(bg, { opacity: 1, duration: 0.2 }, 0);
    return tl;
  },

  deleteSwipeSnapBack(card, bg) {
    const tl = gsap.timeline({ onComplete: () => gsap.set(bg, { opacity: 0 }) });
    tl.to(card, { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.6)' }, 0)
      .to(bg, { opacity: 0, duration: 0.25 }, 0);
    return tl;
  },

  // ── Category Bars (Reports) ─────────────────────────────
  categoryBars(fills, pcts) {
    fills.forEach((fill, i) => {
      gsap.killTweensOf(fill);
      gsap.to(fill, {
        scaleX: pcts[i] / 100,
        duration: 0.7,
        delay: i * 0.05,
        ease: 'power3.out'
      });
    });
  },

  // ── Hero Card Pulse (on log) ────────────────────────────
  heroPulse(el) {
    gsap.killTweensOf(el);
    const tl = gsap.timeline();
    tl.to(el, { scale: 1.02, boxShadow: '0 0 0 2px var(--accent)', duration: 0.12, ease: 'power2.out' })
      .to(el, { scale: 1, boxShadow: '0 0 0 0px transparent', duration: 0.3, ease: 'power2.out' });
    return tl;
  },

  // ── Action Buttons ──────────────────────────────────────
  actionBtnPress(el) {
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scale: 0.95 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
  },

  // ── Entry Checkbox Expand ───────────────────────────────
  checkboxExpand(checkboxes) {
    return gsap.to(checkboxes, { width: 20, opacity: 1, marginRight: 12, duration: 0.3, stagger: 0.02, ease: 'power3.out' });
  },

  // ── Icon Slide Select (Edit Sheet) ──────────────────────
  iconSlideSelect(el) {
    gsap.killTweensOf(el);
    gsap.fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
  }
};

// ============================================================
// HARDWARE NAVIGATION MANAGERS
// ============================================================
class GestureManager {
  constructor(container, tabs, onSwipe) {
    this.container = container;
    this.tabs = tabs;
    this.onSwipe = onSwipe;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isTracking = false;
    this.shouldSwitch = false;
    this.currentTabIndex = 0;
    this.EDGE_ZONE = 28; 
    this.SWIPE_THRESHOLD = 55; 
    this.VELOCITY_THRESHOLD = 0.25; 
    this.MAX_VERTICAL_DRIFT = 90; 
    this.MAX_DIAGONAL_RATIO = 0.5; 
    this.bind();
  }
  
  bind() {
    this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
  }
  
  isScrollableElement(target) {
    return !!target.closest('.quick-category-slider, .icon-slider, .trend-box, #history-container, .bottom-sheet, .numpad-card, input, textarea, .entry-card-wrapper');
  }
  
  onTouchStart(e) {
    const touch = e.changedTouches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = performance.now();
    this.isTracking = true;
    this.shouldSwitch = false;
    
    const isEdge = this.startX <= this.EDGE_ZONE || this.startX >= window.innerWidth - this.EDGE_ZONE;
    const isScrollable = this.isScrollableElement(e.target);
    this.shouldSwitch = isEdge || !isScrollable;
  }
  
  onTouchMove(e) {
    if (!this.isTracking || !this.shouldSwitch) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absY > this.MAX_VERTICAL_DRIFT && absY > absX) {
      this.shouldSwitch = false;
      return;
    }
    
    if (absY > 0 && absX / absY < 2) {
      this.shouldSwitch = false;
      return;
    }
    
    if (absX > 15 && e.target.closest('.quick-category-slider, .icon-slider')) {
      this.shouldSwitch = false;
    }
  }
  
  onTouchEnd(e) {
    if (!this.isTracking || !this.shouldSwitch) {
      this.isTracking = false;
      return;
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaTime = performance.now() - this.startTime;
    const absX = Math.abs(deltaX);
    const velocity = absX / deltaTime;
    
    this.isTracking = false;
    
    const isSwipe = (absX > this.SWIPE_THRESHOLD && velocity > this.VELOCITY_THRESHOLD) || absX > this.SWIPE_THRESHOLD * 2.5;
    if (!isSwipe) return;
    
    const direction = deltaX > 0 ? -1 : 1;
    const newIndex = this.currentTabIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.tabs.length) {
      this.currentTabIndex = newIndex;
      this.onSwipe(this.tabs[newIndex], direction);
    }
  }
  
  setTabIndex(index) {
    this.currentTabIndex = index;
  }
}

class NavigationStack {
  constructor(tabs) {
    this.tabs = tabs;
    this.stack = ['home'];
    this.isProcessing = false;
    this.exitTimer = null;
    this.sheetStack = []; // track open sheet overlay IDs for back-button dismissal
    
    history.replaceState({ tab: 'home', sheet: null, id: Date.now() }, '', '#home');
    window.addEventListener('popstate', this.onPopState.bind(this));
  }
  
  push(tabId) {
    if (this.stack[this.stack.length - 1] === tabId) return;
    this.stack.push(tabId);
    history.pushState({ tab: tabId, sheet: null, id: Date.now() }, '', `#${tabId}`);
  }

  /** Call when a sheet/modal opens — pushes a history layer */
  pushSheet(overlayId) {
    if (this.sheetStack.includes(overlayId)) return;
    this.sheetStack.push(overlayId);
    const currentTab = this.stack[this.stack.length - 1];
    history.pushState({ tab: currentTab, sheet: overlayId, id: Date.now() }, '');
  }

  /** Call when a sheet/modal closes via user interaction (not back button) */
  popSheet(overlayId) {
    const idx = this.sheetStack.indexOf(overlayId);
    if (idx !== -1) this.sheetStack.splice(idx, 1);
  }
  
  onPopState(e) {
    if (this.isProcessing) return;
    
    // Priority 1: dismiss open sheet with animation
    const openSheet = document.querySelector('.sheet-overlay.open');
    if (openSheet) {
      e.preventDefault();
      this.popSheet(openSheet.id);
      const sheet = openSheet.querySelector('.bottom-sheet');
      if (typeof gsap !== 'undefined' && sheet) {
        A.closeSheet(openSheet, sheet);
      } else {
        openSheet.classList.remove('open');
        if (sheet) sheet.style.transform = '';
      }
      // Re-push a clean state so user doesn't exit
      const currentTab = this.stack[this.stack.length - 1];
      history.pushState({ tab: currentTab, sheet: null, id: Date.now() }, '', `#${currentTab}`);
      return;
    }
    
    // Priority 2: exit multi-select mode
    if (typeof isMultiSelectMode !== 'undefined' && isMultiSelectMode) {
      e.preventDefault();
      exitMultiSelect();
      const currentTab = this.stack[this.stack.length - 1];
      history.pushState({ tab: currentTab, sheet: null, id: Date.now() }, '', `#${currentTab}`);
      return;
    }
    
    // Priority 3: navigate to previous tab
    if (this.stack.length > 1) {
      e.preventDefault();
      this.stack.pop();
      const prevTab = this.stack[this.stack.length - 1];
      const navEl = document.querySelector(`.nav-item[data-tab="${prevTab}"]`);
      if (navEl) {
        this.isProcessing = true;
        switchTab(prevTab, navEl);
        this.isProcessing = false;
      }
    } else {
      this.showExitConfirm();
    }
  }
  
  preventExit() {
    const current = this.stack[this.stack.length - 1];
    history.pushState({ tab: current, sheet: null, id: Date.now() }, '', `#${current}`);
  }
  
  showExitConfirm() {
    if (this.exitTimer) return;
    showToast('Press back again to exit');
    this.exitTimer = setTimeout(() => {
      this.exitTimer = null;
    }, 2000);
  }
}

class SheetGestureManager {
  constructor(sheetId, overlayId, onClose) {
    this.sheet = document.getElementById(sheetId);
    this.overlay = document.getElementById(overlayId);
    this.onClose = onClose;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    
    if (!this.sheet || !this.overlay) return;

    this.sheet.addEventListener('touchstart', this.onStart.bind(this), { passive: true });
    this.sheet.addEventListener('touchmove', this.onMove.bind(this), { passive: false });
    this.sheet.addEventListener('touchend', this.onEnd.bind(this), { passive: true });
    
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }
  
  onStart(e) {
    // Never start drag from form elements or interactive controls
    if (e.target.closest('input, textarea, select, button, .icon-slide, .type-btn, .icon-slider, .link-btn')) return;
    const isHandle = e.target.closest('.sheet-handle');
    const isTopArea = e.target === this.sheet || e.target.closest('.bottom-sheet');
    const isScrolledToTop = this.sheet.scrollTop <= 0;
    
    if ((isHandle || (isTopArea && isScrolledToTop))) {
      this.startY = e.touches[0].clientY;
      this.isDragging = true;
      this.sheet.style.transition = 'none';
    }
  }
  
  onMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.currentY = e.touches[0].clientY - this.startY;
    if (this.currentY > 0) {
      this.sheet.style.transform = `translateY(${this.currentY}px)`;
      this.overlay.style.opacity = 1 - (this.currentY / 400);
    }
  }
  
  onEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.sheet.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    this.overlay.style.transition = 'opacity 0.35s ease';
    
    if (this.currentY > 120) {
      this.close();
    } else {
      this.sheet.style.transform = '';
      this.overlay.style.opacity = '';
    }
    this.currentY = 0;
  }
  
  close() {
    this.sheet.style.transform = 'translateY(100%)';
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.classList.remove('open');
      this.sheet.style.transform = '';
      this.overlay.style.opacity = '';
      if (this.onClose) this.onClose();
    }, 350);
  }
}

let gestureManager;
let navStack;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openSheet = document.querySelector('.sheet-overlay.open');
    if (openSheet) {
      openSheet.classList.remove('open');
      e.preventDefault();
      return;
    }
    if (typeof isMultiSelectMode !== 'undefined' && isMultiSelectMode) {
      exitMultiSelect();
      e.preventDefault();
      return;
    }
  }
  
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const tabs = ['home', 'reports', 'settings'];
    const currentIdx = tabs.indexOf(typeof currentTab !== 'undefined' ? currentTab : 'home');
    const direction = e.key === 'ArrowRight' ? 1 : -1;
    const newIdx = currentIdx + direction;
    
    if (newIdx >= 0 && newIdx < tabs.length) {
      const navEl = document.querySelector(`.nav-item[data-tab="${tabs[newIdx]}"]`);
      if (navEl) {
        switchTab(tabs[newIdx], navEl);
        if (typeof navStack !== 'undefined') navStack.push(tabs[newIdx]);
        if (typeof gestureManager !== 'undefined') gestureManager.setTabIndex(newIdx);
      }
      e.preventDefault();
    }
  }
});

document.body.addEventListener('touchmove', function(e) {
  if (e.target === document.body || e.target === document.querySelector('.app-container')) {
    e.preventDefault();
  }
}, { passive: false });

const db = new Dexie('PocketPulseDB');

// v1: original schema (amounts stored as floats, e.g. 50.0)
db.version(1).stores({
  transactions: '++id, date, amount, type, category',
  settings: 'id'
});

// v2: one-time migration — multiply all existing amounts × 100 → paise
db.version(2).stores({
  transactions: '++id, date, amount, type, category',
  settings: 'id'
}).upgrade(tx =>
  tx.table('transactions').toCollection().modify(t => {
    t.amount = Math.round(t.amount * 100);
  })
);

// v3: compound indexes for efficient period+type queries
db.version(3).stores({
  transactions: '++id, date, [type+date], [category+date], amount',
  settings: 'id'
});

// v4: reportCache for offline report rendering
db.version(4).stores({
  transactions: '++id, date, [type+date], [category+date], amount',
  settings: 'id',
  reportCache: 'id'
});

// ── Settings helpers ──────────────────────────────────────────
async function saveSetting(key, value) {
  return db.settings.put({ id: key, value }).catch(e => console.error('saveSetting:', e));
}
async function getSetting(key, defaultValue) {
  const rec = await db.settings.get(key).catch(() => null);
  return rec != null ? rec.value : defaultValue;
}

// ── Transaction DB helpers ────────────────────────────────────
function addTransactionToDB(t) {
  return db.transactions.add(t).catch(e => { console.error('addTx:', e); throw e; });
}

/** Get transactions for a given date range (for reports and hero card) */
function getTxInRange(fromDate, toDate = Date.now()) {
  return db.transactions
    .where('date')
    .between(fromDate, toDate, true, true)
    .reverse()
    .toArray()
    .catch(e => { console.error('getTxInRange:', e); return []; });
}

/** Get paginated history (most recent first) */
function getTxPage(offset = 0, limit = 15) {
  return db.transactions
    .orderBy('date')
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray()
    .catch(e => { console.error('getTxPage:', e); return []; });
}

/** Count total transactions (for pagination UI) */
function countTx() {
  return db.transactions.count().catch(() => 0);
}

/** Get aggregates for reports (sum spend/earn in range) */
async function getAggregatesInRange(fromDate, toDate = Date.now()) {
  const txs = await getTxInRange(fromDate, toDate);
  let spendPaise = 0, earnPaise = 0;
  txs.forEach(t => {
    if (t.type === 'spend') spendPaise += t.amount;
    else earnPaise += t.amount;
  });
  return { spendPaise, earnPaise, txs };
}

// ============================================================
// CURRENCY — Base-100 integer math
// ============================================================
/** Convert display ₹ value → paise integer. e.g. 10.5 → 1050 */
function toPaise(val) {
  return Math.round(parseFloat(val || 0) * 100);
}
/** Format paise → display string. e.g. 5000 → "50", 1050 → "50.50" */
function fmtAmt(paise) {
  const rupees = paise / 100;
  return Number.isInteger(rupees)
    ? rupees.toLocaleString()
    : new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rupees);
}

// ============================================================
// STATE
// ============================================================
let weeklyBudget    = 3000;  // stored in ₹ (display value)
let expectedEarnings = 8000; // stored in ₹ (display value)
let currentVisibleTxs = [];
let currentTab = 'home';
let isMultiSelectMode = false;
let selectedTxIds = new Set();
let recentlyDeletedTxs = [];
let longPressTimer = null;
let swipeStartX = 0;
let swipeCurrentX = 0;
let isSwiping = false;

// Pagination state
let historyPage = 0;
const HISTORY_PAGE_SIZE = 15;
let historyTotalCount = 0;
let isLoadingHistory = false;
let historyHasRenderedOnce = false;

// Concurrency guard
let isUpdatingState = false;
let tabSwitchGen = 0; // Prevents stale onComplete callbacks from interrupted animations

// Hero counter animation state
let previousSpendPaise = 0;

// ============================================================
// TAB SWITCHING — Absolute-layered cross-fade with deferred unmount
// ============================================================
function switchTab(tabId, el) {
  const current = document.querySelector('.tab-content.active');
  const next = document.getElementById('tab-' + tabId);
  if (!next || current === next) return;

  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    if (typeof gsap !== 'undefined') A.navDot(n, false);
  });
  if (el) {
    el.classList.add('active');
    if (typeof gsap !== 'undefined') {
      A.navTap(el);
      A.navDot(el, true);
    }
  }

  currentTab = tabId;

  const tabs = ['home', 'reports', 'settings'];
  const fromIdx = tabs.indexOf(current.id.replace('tab-', ''));
  const toIdx = tabs.indexOf(tabId);
  const dir = toIdx > fromIdx ? 1 : -1;

  // Transfer .active class immediately for state consistency
  current.classList.remove('active');
  next.classList.add('active');

  if (typeof gsap !== 'undefined') {
    // Clean any stale inline styles from interrupted transitions
    document.querySelectorAll('.tab-content').forEach(t => {
      gsap.set(t, { clearProps: 'all' });
    });

    const gen = ++tabSwitchGen;
    A.switchTab(current, next, dir, () => {
      if (gen !== tabSwitchGen) return;
      // Deferred unmount complete — outgoing is now safely hidden
    });
  }

  updateState();

  if (tabId === 'home') {
    setTimeout(() => {
      document.getElementById('tab-home')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  }
}

// ── Accent theme ──────────────────────────────────────────────
function setTheme(el, hex, save = true) {
  document.querySelectorAll('.dot').forEach(d => {
    const isSelected = d.dataset.color === hex;
    d.classList.toggle('selected', isSelected);
    if (isSelected && typeof gsap !== 'undefined') A.dotSelect(d);
  });
  document.documentElement.style.setProperty('--accent', hex);
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16), g = parseInt(h.substring(2,4), 16), b = parseInt(h.substring(4,6), 16);
  const isLight = ((r*299)+(g*587)+(b*114))/1000 > 128;
  document.documentElement.style.setProperty('--solid-text-color', isLight ? '#000000' : '#FFFFFF');
  document.documentElement.style.setProperty('--solid-log-bg',    isLight ? '#000000' : '#FFFFFF');
  if (save) saveSetting('accentColor', hex);
}

async function wipeData() {
  if (!confirm('Are you sure you want to wipe all data? This cannot be undone.')) return;
  try {
    await db.transactions.clear();
    await db.settings.clear();
    showToast('All data wiped!');
    setTimeout(() => location.reload(), 1000);
  } catch (e) { console.error(e); showToast('Error wiping data'); }
}

// ============================================================
// NUMPAD  (acc & tapHistory stored in PAISE)
// ============================================================
let acc = 0;          // running total — PAISE
let tapHistory = [];  // per-tap paise values
let numpadValues = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]; // display ₹ denominations
let globalReportPeriod = 'weekly';
let currencySymbol = '₹';
let appTheme = 'glass';

const CATEGORIES = [
  { id: 'zap',               name: 'General'  },
  { id: 'utensils',          name: 'Food'     },
  { id: 'car',               name: 'Transport'},
  { id: 'shopping-bag',      name: 'Shopping' },
  { id: 'lightbulb',         name: 'Bills'    },
  { id: 'heart-pulse',       name: 'Health'   },
  { id: 'circle-dollar-sign',name: 'Salary'   },
  { id: 'clapperboard',      name: 'Ent.'     }
];
let selectedHomeCategory = CATEGORIES[0];

function renderHomeCategories() {
  const slider = document.getElementById('quick-category-slider');
  slider.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'qc-item' + (selectedHomeCategory.id === cat.id ? ' active' : '');
    item.onclick = () => {
    if(navigator.vibrate) navigator.vibrate(20);
    selectedHomeCategory = cat;
    if (typeof gsap !== 'undefined') A.categorySelect(item);
    renderHomeCategories();
  };
    item.innerHTML = `<i data-lucide="${sanitize(cat.id)}" class="qc-icon"></i>`;
    slider.appendChild(item);
  });
  lucide.createIcons({ nodes: [slider] });
}

async function updateNumpadValues(newArray) {
  numpadValues = newArray;
  await saveSetting('numpadValues', numpadValues);
}

function renderNumpad() {
  const grid = document.getElementById('numpad-grid');
  grid.innerHTML = '';
  numpadValues.forEach(val => {
    const displayVal = val >= 1000 ? (val / 1000) + 'K' : val;
    const btn = document.createElement('button');
    btn.className = 'np-btn';
    btn.innerText = displayVal;
    btn.onclick = () => { if(navigator.vibrate) navigator.vibrate(50); addNum(val); if(typeof gsap!=='undefined') A.numpadTap(btn); };
    grid.appendChild(btn);
  });
}

function renderSettingsNumpad() {
  const grid = document.getElementById('numpad-settings-grid');
  grid.innerHTML = '';
  numpadValues.forEach((val, i) => {
    const input = document.createElement('input');
    input.type = 'number'; input.className = 'np-input'; input.value = val; input.min = '1'; input.step = '1';
    input.addEventListener('blur', e => {
      let newVal = parseInt(e.target.value);
      if (isNaN(newVal) || newVal <= 0) newVal = 1;
      e.target.value = newVal; numpadValues[i] = newVal; updateNumpadValues(numpadValues); renderNumpad();
    });
    grid.appendChild(input);
  });
}

function updateAccDisplay() {
  const display = document.getElementById('np-display');
  if (acc === 0) {
    display.innerText = 'Tap a number...'; display.style.opacity = '0.5';
  } else {
    const histDisplay = tapHistory.map(p => fmtAmt(p)).join(' + ');
    display.innerText = tapHistory.length > 1
      ? `${histDisplay} = ${currencySymbol}${fmtAmt(acc)}`
      : `${currencySymbol}${fmtAmt(acc)}`;
    display.style.opacity = '1';
  }
}

/** val is a display ₹ denomination (e.g. 50). Convert to paise before storing. */
function addNum(val) {
  const paise = toPaise(val);
  acc += paise;
  tapHistory.push(paise);
  updateAccDisplay();
  if (typeof gsap !== 'undefined') A.displayBounce(document.getElementById('np-display'));
}

function undoTap() {
  if (tapHistory.length === 0) return showToast('Nothing to undo');
  acc -= tapHistory.pop();
  updateAccDisplay();
}

function clearNum() { acc = 0; tapHistory = []; updateAccDisplay(); }

async function logTransaction() {
  if (acc === 0) return showToast('Tap a number to log!');
  const transaction = {
    amount: acc,  // PAISE
    type: 'spend',
    category: selectedHomeCategory.name,
    note: selectedHomeCategory.name === 'General' ? 'Quick Log' : selectedHomeCategory.name,
    icon: selectedHomeCategory.id,
    date: Date.now()
  };
  try {
    await addTransactionToDB(transaction);
    if (typeof gsap !== 'undefined') A.heroPulse(document.querySelector('.hero-card'));
    showToast(`✓ Logged ${currencySymbol}${fmtAmt(acc)}`);
    clearNum();
    updateState();
  } catch (err) { console.error(err); showToast('Error logging transaction'); }
}

// ============================================================
// PERIOD CONFIG — determines date range for queries
// ============================================================
function getPeriodConfig() {
  const now = new Date();
  switch (globalReportPeriod) {
    case 'weekly': {
      const dayOfWeek = now.getDay(); // 0=Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      return { fromDate: monday.getTime(), label: "THIS WEEK'S SPEND", limitLabel: 'Weekly Max Limit', budgetMultiplier: 1 };
    }
    case 'monthly':
      return {
        fromDate: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        label: "THIS MONTH'S SPEND", limitLabel: 'Monthly Max Limit', budgetMultiplier: 4.33
      };
    case 'yearly':
      return {
        fromDate: new Date(now.getFullYear(), 0, 1).getTime(),
        label: "THIS YEAR'S SPEND", limitLabel: 'Yearly Max Limit', budgetMultiplier: 52
      };
    default: // 'all'
      return { fromDate: 0, label: 'ALL TIME SPEND', limitLabel: 'All Time Max Limit', budgetMultiplier: 1 };
  }
}

// ============================================================
// CORE UI UPDATES
// ============================================================
async function updateState() {
  if (isUpdatingState) return;
  isUpdatingState = true;
  try {
    const { fromDate, label, limitLabel, budgetMultiplier } = getPeriodConfig();

    let aggs;
    if (!navigator.onLine) {
      const cached = await db.reportCache.get(globalReportPeriod);
      aggs = cached ? cached.data : { spendPaise: 0, earnPaise: 0, txs: [] };
    } else {
      aggs = await getAggregatesInRange(fromDate);
      await db.reportCache.put({ id: globalReportPeriod, data: aggs });
    }
    const { spendPaise, earnPaise, txs } = aggs;

    if (currentTab === 'home') {
      document.getElementById('hero-period-label').textContent = label;
      updateHeroCard(spendPaise, budgetMultiplier, label);
      await renderHistory(true); // Reset and load page 1
    } else if (currentTab === 'reports') {
      updateReportsTab(spendPaise, earnPaise, txs, budgetMultiplier, fromDate, limitLabel);
    }
  } finally {
    isUpdatingState = false;
  }
}

// ── Hero Card ─────────────────────────────────────────────────
function animateCounter(element, fromPaise, toPaise_target, duration) {
  if (typeof gsap !== 'undefined') {
    A.animateCounter(element, fromPaise, toPaise_target, currencySymbol, duration);
  } else {
    element.innerHTML = `<span class="hero-currency">${currencySymbol}</span>${fmtAmt(toPaise_target)}`;
  }
}

function updateHeroCard(spendPaise, budgetMultiplier, label) {
  const heroEl = document.getElementById('hero-total');
  animateCounter(heroEl, previousSpendPaise, spendPaise);
  previousSpendPaise = spendPaise;

  const currentBudget = weeklyBudget * budgetMultiplier;
  const spendRupees = spendPaise / 100;
  const pct = Math.min((spendRupees / currentBudget) * 100, 100) || 0;

  if (typeof gsap !== 'undefined') {
    A.progressFill(document.getElementById('hero-progress'), pct / 100);
  } else {
    document.getElementById('hero-progress').style.transform = `scaleX(${pct / 100})`;
  }
  document.getElementById('hero-progress').style.background = pct >= 100
    ? 'var(--text)'
    : 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 80%, white), var(--accent))';
  document.getElementById('hero-limit-display').textContent = `${currencySymbol}${Math.round(currentBudget).toLocaleString()}`;

  // Hide budget bar and limit for "all" period
  const budgetInfo = document.querySelector('.hero-budget-info');
  const budgetBar = document.querySelector('.hero-budget-bar');
  if (budgetInfo) budgetInfo.style.display = globalReportPeriod === 'all' ? 'none' : '';
  if (budgetBar) budgetBar.style.display = globalReportPeriod === 'all' ? 'none' : '';
}

/** Lightweight hero update from DB cache — no full history re-render */
async function updateHeroFromCache() {
  try {
    const { fromDate, budgetMultiplier } = getPeriodConfig();
    const { spendPaise } = await getAggregatesInRange(fromDate);
    updateHeroCard(spendPaise, budgetMultiplier);
  } catch (_) { /* silent — full updateState will run on next tab switch */ }
}

// ── Reports Tab ───────────────────────────────────────────────
function updateReportsTab(spendPaise, earnPaise, txs, budgetMultiplier, fromDate, limitLabel) {
  const surplusPaise = earnPaise - spendPaise;
  const spendRupees = spendPaise / 100;
  const safeToSpend = Math.max(0, (weeklyBudget * budgetMultiplier) - spendRupees);

  document.getElementById('report-spent').textContent  = `${currencySymbol}${fmtAmt(spendPaise)}`;
  document.getElementById('report-earned').textContent = `${currencySymbol}${fmtAmt(earnPaise)}`;

  const reportSurplus = document.getElementById('report-surplus');
  reportSurplus.textContent = `${surplusPaise < 0 ? '-' : ''}${currencySymbol}${fmtAmt(Math.abs(surplusPaise))}`;
  reportSurplus.style.color = surplusPaise < 0 ? 'var(--spend-color)' : surplusPaise > 0 ? 'var(--earn-color)' : 'var(--text)';

  document.getElementById('report-safe').textContent = `Safe to spend: ${currencySymbol}${Math.round(safeToSpend).toLocaleString()}`;
  document.getElementById('limit-label').textContent = limitLabel;

  // Rebuild trend chart with period-aware buckets
  renderTrendBox(txs, globalReportPeriod);

  // Rebuild category breakdown
  const categoryTotals = {};
  txs.filter(t => t.type === 'spend').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  renderCategoryBreakdown(categoryTotals, spendPaise);
}

// ============================================================
// TREND CHART — Period-aware buckets
// ============================================================
function renderTrendBox(txs, period) {
  const trendBox = document.getElementById('trend-box');
  if (!trendBox) return;

  const spendTxs = txs.filter(t => t.type === 'spend');
  if (spendTxs.length === 0) {
    trendBox.innerHTML = '<div class="empty-state-small">No spending data for this period</div>';
    return;
  }
  
  if (trendBox.querySelector('.empty-state-small')) {
    trendBox.innerHTML = '';
  }

  let buckets, labels;
  const now = new Date();

  if (period === 'weekly') {
    buckets = Array(7).fill(0);
    labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const today = new Date(); today.setHours(0,0,0,0);
    const dayOfWeek = (today.getDay() + 6) % 7; 
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - dayOfWeek);

    spendTxs.forEach(t => {
      const tDate = new Date(t.date); tDate.setHours(0,0,0,0);
      const diff = Math.floor((tDate - weekStart) / 86400000);
      if (diff >= 0 && diff < 7) buckets[diff] += t.amount;
    });

  } else if (period === 'monthly') {
    buckets = Array(4).fill(0);
    labels = ['W1','W2','W3','W4'];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    spendTxs.filter(t => t.date >= monthStart).forEach(t => {
      const weekIdx = Math.min(3, Math.floor((t.date - monthStart) / (7 * 86400000)));
      buckets[weekIdx] += t.amount;
    });

  } else if (period === 'yearly') {
    buckets = Array(12).fill(0);
    labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    spendTxs.forEach(t => {
      const month = new Date(t.date).getMonth();
      buckets[month] += t.amount;
    });

  } else {
    // All time — Dynamic Year grouping
    const years = [...new Set(spendTxs.map(t => new Date(t.date).getFullYear()))].sort();
    if (years.length === 0) {
      buckets = [0]; labels = [now.getFullYear().toString()];
    } else {
      buckets = Array(years.length).fill(0);
      labels = years.map(y => y.toString().substring(2)); // e.g. '24'
      spendTxs.forEach(t => {
        const year = new Date(t.date).getFullYear();
        const idx = years.indexOf(year);
        buckets[idx] += t.amount;
      });
    }
  }

  const maxVal = Math.max(...buckets, 1);
  const todayBucketIdx = period === 'weekly' ? (now.getDay() + 6) % 7 : -1;

  // DOM POOLING
  const requiredCount = buckets.length;
  while (trendBox.children.length > requiredCount) {
    trendBox.removeChild(trendBox.lastChild);
  }
  while (trendBox.children.length < requiredCount) {
    const col = document.createElement('div');
    col.className = 'trend-col';
    const bar = document.createElement('div');
    const labelEl = document.createElement('div');
    labelEl.className = 'trend-label';
    col.appendChild(bar);
    col.appendChild(labelEl);
    trendBox.appendChild(col);
  }

  buckets.forEach((val, i) => {
    const col = trendBox.children[i];
    const bar = col.firstChild;
    const labelEl = col.lastChild;

    bar.className = 'trend-bar' + (i === todayBucketIdx ? ' active' : '');
    const heightPct = Math.max((val / maxVal) * 100, 4);
    
    labelEl.textContent = labels[i] || '';

    if (val > 0) {
      bar.title = `${currencySymbol}${fmtAmt(val)}`;
      bar.setAttribute('data-value', fmtAmt(val));
      bar.setAttribute('data-has-value', '1');
    } else {
      bar.removeAttribute('title');
      bar.removeAttribute('data-value');
      bar.removeAttribute('data-has-value');
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        bar.style.transition = 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        bar.style.height = heightPct + '%';
      }, i * 40);
    });
  });
}

// ============================================================
// CATEGORY BREAKDOWN
// ============================================================
const FALLBACK_ICONS = {
  'Freelance': 'briefcase',
  'Investment': 'trending-up',
  'Side Hustle': 'rocket'
};

function hashString(str) {
  return str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
}

function renderCategoryBreakdown(categoryTotals, totalSpendPaise) {
  const container = document.getElementById('category-breakdown');
  if (!container) return;
  container.innerHTML = '';

  const sorted = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state-small">No spend data for this period</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  sorted.forEach(([category, paise], i) => {
    const pct = totalSpendPaise > 0 ? (paise / totalSpendPaise * 100) : 0;
    
    let catIcon = 'circle-help';
    const foundCat = CATEGORIES.find(c => c.name === category);
    if (foundCat) {
      catIcon = foundCat.id;
    } else if (FALLBACK_ICONS[category]) {
      catIcon = FALLBACK_ICONS[category];
    } else {
      console.warn('Unknown category:', category);
    }

    const row = document.createElement('div');
    row.className = 'cat-row';

    const label = document.createElement('div');
    label.className = 'cat-label';

    const iconSpan = document.createElement('i');
    iconSpan.setAttribute('data-lucide', catIcon);
    iconSpan.style.width = '14px';
    iconSpan.style.height = '14px';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = category;

    label.appendChild(iconSpan);
    label.appendChild(nameSpan);

    const bar = document.createElement('div');
    bar.className = 'cat-bar-track';
    const fill = document.createElement('div');
    fill.className = 'cat-bar-fill';
    fill.style.transform = 'scaleX(0)';
    fill.style.backgroundColor = `hsl(${hashString(category)}, 70%, 65%)`; // Security 1
    bar.appendChild(fill);

    const pctLabel = document.createElement('div');
    pctLabel.className = 'cat-pct';
    pctLabel.textContent = pct.toFixed(0) + '%';

    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(pctLabel);
    fragment.appendChild(row);
  });

  container.appendChild(fragment);
  lucide.createIcons({ nodes: [container] });

  // GSAP category bar animation
  if (typeof gsap !== 'undefined') {
    const fills = container.querySelectorAll('.cat-bar-fill');
    const pcts = sorted.map(([_, paise]) => totalSpendPaise > 0 ? (paise / totalSpendPaise * 100) : 0);
    A.categoryBars(fills, pcts);
  }
}

// ============================================================
// HISTORY — Paginated + Secure Card Builder
// ============================================================

/** Build a single transaction card using safe DOM APIs (no innerHTML with user data) */
function buildTxCard(t) {
  const isSpend = t.type === 'spend';
  const icon = sanitize(t.icon || (isSpend ? 'zap' : 'circle-dollar-sign'));
  const colorClass = isSpend ? 'spend' : 'earn';
  const sign = isSpend ? `-${currencySymbol}` : `+${currencySymbol}`;
  const bg = isSpend
    ? 'color-mix(in srgb, var(--spend-color) 15%, transparent)'
    : 'color-mix(in srgb, var(--earn-color) 15%, transparent)';
  const iconColor = isSpend ? 'var(--spend-color)' : 'var(--earn-color)';

  const wrapper = document.createElement('div');
  wrapper.className = 'entry-card-wrapper';
  wrapper.id = `tx-${t.id}`;

  const deleteBg = document.createElement('div');
  deleteBg.className = 'delete-bg';
  deleteBg.style.opacity = '0';
  deleteBg.innerHTML = '<i data-lucide="trash-2"></i>';

  const card = document.createElement('div');
  card.className = `entry-card${selectedTxIds.has(t.id) ? ' selected' : ''}`;
  // Store all data in dataset — no inline handlers with user data
  card.dataset.txId = t.id;
  card.dataset.note = t.note || '';
  card.dataset.amount = t.amount;
  card.dataset.type = t.type;
  card.dataset.icon = t.icon || 'zap';
  card.dataset.category = t.category || 'General';

  card.addEventListener('touchstart', (e) => handleTxTouchStart(e, t.id), { passive: true });
  card.addEventListener('touchmove',  (e) => handleTxTouchMove(e, t.id),  { passive: false });
  card.addEventListener('touchend',   (e) => handleTxTouchEnd(e, t.id));
  card.addEventListener('click',      (e) => {
    const d = card.dataset;
    handleTxClick(e, +d.txId, d.note, +d.amount, d.type, d.icon, d.category);
  });

  const checkbox = document.createElement('div');
  checkbox.className = 'entry-checkbox';
  checkbox.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i>';

  const left = document.createElement('div');
  left.className = 'entry-left';

  const iconDiv = document.createElement('div');
  iconDiv.className = 'entry-icon';
  iconDiv.style.background = bg;
  iconDiv.style.color = iconColor;
  iconDiv.innerHTML = `<i data-lucide="${icon}"></i>`;

  const textContainer = document.createElement('div');
  textContainer.className = 'entry-text-container';

  const noteEl = document.createElement('div');
  noteEl.className = 'entry-note';
  noteEl.textContent = t.note || t.category; // textContent = safe

  const timeEl = document.createElement('div');
  timeEl.className = 'entry-time';
  timeEl.textContent = new Date(t.date).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const amtEl = document.createElement('div');
  amtEl.className = `entry-amt ${colorClass}`;
  amtEl.textContent = `${sign}${fmtAmt(t.amount)}`;

  textContainer.appendChild(noteEl);
  textContainer.appendChild(timeEl);
  left.appendChild(iconDiv);
  left.appendChild(textContainer);
  card.appendChild(checkbox);
  card.appendChild(left);
  card.appendChild(amtEl);
  wrapper.appendChild(deleteBg);
  wrapper.appendChild(card);

  // Entry animation
  wrapper.style.opacity = '0';
  wrapper.style.transform = 'translateY(8px)';
  requestAnimationFrame(() => {
    wrapper.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
    wrapper.style.opacity = '1';
    wrapper.style.transform = 'translateY(0)';
  });

  return wrapper;
}

/** Render paginated history */
async function renderHistory(reset = false) {
  const container = document.getElementById('history-container');

  if (reset) {
    historyPage = 0;
    historyTotalCount = await countTx();
    container.classList.add('loading');
    // Remove skeleton on first real load
    const skel = document.getElementById('history-skeleton');
    if (skel) skel.remove();
    container.innerHTML = '';
    currentVisibleTxs = [];
  }

  if (isLoadingHistory) return;
  isLoadingHistory = true;

  const txs = await getTxPage(historyPage * HISTORY_PAGE_SIZE, HISTORY_PAGE_SIZE);

  if (txs.length === 0 && historyPage === 0) {
    container.innerHTML = '<div class="empty-state">No transactions yet.<br>Tap a number to log your first one!</div>';
    isLoadingHistory = false;
    container.classList.remove('loading');
    return;
  }

  const fragment = document.createDocumentFragment();
  txs.forEach(t => fragment.appendChild(buildTxCard(t)));
  container.appendChild(fragment);
  lucide.createIcons({ nodes: [container] }); // Only scan new nodes

  // GSAP staggered card entrance — only on first render to avoid re-animation on tab switches
  if (typeof gsap !== 'undefined' && historyPage === 1 && !historyHasRenderedOnce) {
    const cards = container.querySelectorAll('.entry-card-wrapper');
    A.staggerCards(Array.from(cards));
    historyHasRenderedOnce = true;
  }

  currentVisibleTxs = [...currentVisibleTxs, ...txs];
  historyPage++;
  isLoadingHistory = false;
  container.classList.remove('loading');

  // Show/hide Load More button
  const hasMore = (historyPage * HISTORY_PAGE_SIZE) < historyTotalCount;
  let loadMoreBtn = document.getElementById('load-more-btn');
  if (hasMore && !loadMoreBtn) {
    loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'load-more-btn';
    loadMoreBtn.className = 'load-more-btn';
    loadMoreBtn.textContent = 'Load More';
    loadMoreBtn.onclick = () => renderHistory(false);
    container.after(loadMoreBtn);
  } else if (!hasMore && loadMoreBtn) {
    loadMoreBtn.remove();
  }

  if (isMultiSelectMode) {
    container.classList.add('multi-select-active');
    document.getElementById('ms-select-all').style.display = 'block';
  } else {
    container.classList.remove('multi-select-active');
    document.getElementById('ms-select-all').style.display = 'none';
  }
}

// ============================================================
// EDIT SHEET
// ============================================================
let currentEditType     = 'spend';
let currentEditId       = null;
let currentEditIcon     = 'zap';
let currentEditCategory = 'Quick';

/** amtPaise: stored paise value — display as ₹ in input */
function openEdit(id, note, amtPaise, type, icon, category) {
  currentEditId = id;
  document.getElementById('edit-note-input').value  = note === 'Quick Log' ? '' : note;
  document.getElementById('edit-amt-input').value   = amtPaise / 100; // show display ₹
  const toggles = document.querySelectorAll('.type-btn');
  toggles.forEach(t => t.classList.remove('active'));
  currentEditType = type;
  if (type === 'spend') toggles[0].classList.add('active'); else toggles[1].classList.add('active');
  currentEditIcon     = icon || 'zap';
  currentEditCategory = category || 'Quick';
  renderEditCategories();
  updateEditDisplay();
  if (typeof gsap !== 'undefined') {
    A.openSheet(document.getElementById('edit-overlay'), document.getElementById('edit-sheet'));
  } else {
    document.getElementById('edit-overlay').classList.add('open');
  }
  if (navStack) navStack.pushSheet('edit-overlay');
}

function renderEditCategories() {
  const slider = document.getElementById('edit-icon-slider');
  slider.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'icon-slide' + (currentEditIcon === cat.id ? ' active' : '');
    item.onclick = () => { if(navigator.vibrate) navigator.vibrate(20); if(typeof gsap!=='undefined') A.iconSlideSelect(item); selectEditIcon(item, cat.id, cat.name); };
    item.innerHTML = `<i data-lucide="${sanitize(cat.id)}"></i>`;
    slider.appendChild(item);
  });
  lucide.createIcons({ nodes: [slider] });
}

function selectEditIcon(el, icon, category) { currentEditIcon = icon; currentEditCategory = category; renderEditCategories(); }

function closeEdit(e) {
  if (e && e.target.id !== 'edit-overlay') return;
  document.getElementById('edit-sheet').style.transform = '';
  document.getElementById('edit-overlay').classList.remove('open');
  if (navStack) navStack.popSheet('edit-overlay');
}

function setType(el, type) {
  document.querySelectorAll('.type-btn').forEach(t => t.classList.remove('active'));
  el.classList.add('active'); currentEditType = type; updateEditDisplay();
}

function updateEditDisplay() {
  const rawVal  = parseFloat(document.getElementById('edit-amt-input').value) || 0;
  const paise   = toPaise(rawVal);
  const display = document.getElementById('edit-display');
  const isSpend = currentEditType === 'spend';
  display.textContent  = (isSpend ? '-' : '+') + currencySymbol + fmtAmt(paise);
  display.style.color = isSpend ? 'var(--spend-color)' : 'var(--earn-color)';
}

async function saveEdit() {
  if (!currentEditId) return;
  const rawVal = parseFloat(document.getElementById('edit-amt-input').value) || 0;
  const newAmt = toPaise(rawVal); // store in PAISE
  const newNote = document.getElementById('edit-note-input').value || currentEditCategory;

  // ── Optimistic UI: update card DOM immediately ──
  const cardEl = document.getElementById(`tx-${currentEditId}`);
  if (cardEl) {
    const isSpend = currentEditType === 'spend';
    const sign = isSpend ? `-${currencySymbol}` : `+${currencySymbol}`;
    const noteEl = cardEl.querySelector('.entry-note');
    const amtEl = cardEl.querySelector('.entry-amt');
    const iconEl = cardEl.querySelector('.entry-icon');
    if (noteEl) noteEl.textContent = newNote;
    if (amtEl) {
      amtEl.textContent = sign + fmtAmt(newAmt);
      amtEl.className = `entry-amt ${isSpend ? 'spend' : 'earn'}`;
    }
    if (iconEl) {
      iconEl.style.background = isSpend
        ? 'color-mix(in srgb, var(--spend-color) 15%, transparent)'
        : 'color-mix(in srgb, var(--earn-color) 15%, transparent)';
      iconEl.style.color = isSpend ? 'var(--spend-color)' : 'var(--earn-color)';
    }
    // Update dataset for swipe-to-edit
    const card = cardEl.querySelector('.entry-card');
    if (card) {
      card.dataset.note = newNote;
      card.dataset.amount = newAmt;
      card.dataset.type = currentEditType;
      card.dataset.icon = currentEditIcon;
      card.dataset.category = currentEditCategory;
    }
  }

  // Close sheet immediately
  if (typeof gsap !== 'undefined') {
    A.closeSheet(document.getElementById('edit-overlay'), document.getElementById('edit-sheet'));
  } else {
    document.getElementById('edit-sheet').style.transform = '';
    document.getElementById('edit-overlay').classList.remove('open');
  }
  if (navStack) navStack.popSheet('edit-overlay');
  showToast('Changes saved! ✓');

  // Update hero card in background (lightweight, no full re-render)
  updateHeroFromCache();

  // Persist to DB in background
  try {
    await db.transactions.update(currentEditId, {
      amount: newAmt,
      type: currentEditType,
      note: newNote,
      category: currentEditCategory,
      icon: currentEditIcon
    });
  } catch (err) {
    console.error(err);
    showToast('Error saving — reverting');
    // Rollback: full re-render from DB
    updateState();
  }
}

// (Edit sheet swipe-to-dismiss is now handled by SheetGestureManager above)

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  clearTimeout(toastTimer);
  if (typeof gsap !== 'undefined') {
    A.toastShow(t);
  } else {
    t.classList.add('show');
  }
  toastTimer = setTimeout(() => {
    if (typeof gsap !== 'undefined') {
      A.toastHide(t);
    } else {
      t.classList.remove('show');
    }
  }, 2000);
}

// ── Delete / Multi-select logic ────────────────────────────────
function handleTxTouchStart(e, id) {
  if (isMultiSelectMode) return;
  swipeStartX = e.touches[0].clientX;
  swipeCurrentX = 0;
  isSwiping = false;

  longPressTimer = setTimeout(() => {
    longPressTimer = null;
    enableMultiSelect(id);
  }, 500);
}

function handleTxTouchMove(e, id) {
  if (isMultiSelectMode) return;

  const touchX = e.touches[0].clientX;
  const deltaX = touchX - swipeStartX;

  if (Math.abs(deltaX) > 10) {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    isSwiping = true;
  }

  if (deltaX < 0 && isSwiping) {
    if (e.cancelable) e.preventDefault();
    swipeCurrentX = deltaX;
    const card = document.querySelector(`#tx-${id} .entry-card`);
    const bg = document.querySelector(`#tx-${id} .delete-bg`);
    if (card) card.style.transform = `translateX(${deltaX}px)`;
    if (bg) bg.style.opacity = Math.min(1, Math.abs(deltaX) / 80);
  }
}

function handleTxTouchEnd(e, id) {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
  if (isMultiSelectMode) return;

  const card = document.querySelector(`#tx-${id} .entry-card`);
  const bg = document.querySelector(`#tx-${id} .delete-bg`);
  if (!card) return;

  if (swipeCurrentX < -80) {
    if (typeof gsap !== 'undefined') {
      A.deleteSwipeDismiss(card, bg, () => executeDelete([id]));
    } else {
      card.style.transition = 'transform 0.3s';
      card.style.transform = `translateX(-100%)`;
      if (bg) bg.style.opacity = '1';
      setTimeout(() => executeDelete([id]), 300);
    }
  } else {
    if (typeof gsap !== 'undefined') {
      A.deleteSwipeSnapBack(card, bg);
    } else {
      card.style.transition = 'transform 0.3s';
      card.style.transform = `translateX(0)`;
      if (bg) { bg.style.transition = 'opacity 0.3s'; bg.style.opacity = '0'; }
    }
  }

  swipeStartX = 0;
  swipeCurrentX = 0;
  setTimeout(() => isSwiping = false, 50);
}

function handleTxClick(e, id, note, amount, type, icon, category) {
  if (isSwiping) return;
  if (isMultiSelectMode) {
    const card = document.querySelector(`#tx-${id} .entry-card`);
    if (selectedTxIds.has(id)) {
      selectedTxIds.delete(id);
      if (card) card.classList.remove('selected');
      if (selectedTxIds.size === 0) { exitMultiSelect(); return; }
    } else {
      selectedTxIds.add(id);
      if (card) card.classList.add('selected');
    }
    updateMultiSelectBar();
  } else {
    openEdit(id, note, amount, type, icon, category);
  }
}

function enableMultiSelect(id) {
  if (navigator.vibrate) navigator.vibrate(50);
  isMultiSelectMode = true;
  selectedTxIds.add(id);

  document.getElementById('history-container').classList.add('multi-select-active');
  document.getElementById('ms-select-all').style.display = 'block';
  if (typeof gsap !== 'undefined') {
    A.showMultiSelectBar(document.getElementById('ms-delete-bar'));
    // Animate checkboxes
    const checkboxes = document.querySelectorAll('.entry-checkbox');
    if (checkboxes.length) A.checkboxExpand(checkboxes);
  } else {
    document.getElementById('ms-delete-bar').classList.add('show');
  }

  const card = document.querySelector(`#tx-${id} .entry-card`);
  if (card) card.classList.add('selected');

  updateMultiSelectBar();
}

function exitMultiSelect() {
  isMultiSelectMode = false;
  selectedTxIds.clear();
  document.getElementById('history-container').classList.remove('multi-select-active');
  document.getElementById('ms-select-all').style.display = 'none';
  if (typeof gsap !== 'undefined') {
    A.hideMultiSelectBar(document.getElementById('ms-delete-bar'));
  } else {
    document.getElementById('ms-delete-bar').classList.remove('show');
  }
  document.querySelectorAll('.entry-card.selected').forEach(c => c.classList.remove('selected'));
}

function selectAllHistory() {
  currentVisibleTxs.forEach(t => {
    selectedTxIds.add(t.id);
    const card = document.querySelector(`#tx-${t.id} .entry-card`);
    if (card) card.classList.add('selected');
  });
  updateMultiSelectBar();
}

function updateMultiSelectBar() {
  const countSpan = document.getElementById('ms-count');
  if (countSpan) countSpan.textContent = selectedTxIds.size;
}

function deleteSelected() {
  if (selectedTxIds.size > 0) {
    executeDelete(Array.from(selectedTxIds));
  }
}

function executeDelete(ids) {
  Promise.all(ids.map(id => db.transactions.get(id))).then(txs => {
    recentlyDeletedTxs = txs.filter(t => t);
    db.transactions.bulkDelete(ids).then(() => {
      isMultiSelectMode = false;
      selectedTxIds.clear();
      document.getElementById('ms-delete-bar').classList.remove('show');
      document.getElementById('ms-select-all').style.display = 'none';
      const hc = document.getElementById('history-container');
      if (hc) hc.classList.remove('multi-select-active');
      updateState();
      showUndoToast(`${ids.length} item(s) deleted`);
    }).catch(err => {
      console.error('Delete failed:', err);
      showToast('Error deleting items');
    });
  }).catch(err => {
    console.error('Get transactions failed:', err);
    showToast('Error loading items for deletion');
  });
}

function showUndoToast(msg) {
  const t = document.getElementById('toast');
  // Build undo toast safely
  t.innerHTML = '';
  const msgSpan = document.createElement('span');
  msgSpan.textContent = msg;
  const undoBtn = document.createElement('button');
  undoBtn.className = 'toast-undo';
  undoBtn.textContent = 'Undo';
  undoBtn.onclick = undoDelete;
  t.appendChild(msgSpan);
  t.appendChild(undoBtn);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    recentlyDeletedTxs = [];
  }, 4000);
}

async function undoDelete() {
  const t = document.getElementById('toast');
  t.classList.remove('show');
  clearTimeout(toastTimer);
  if (recentlyDeletedTxs.length > 0) {
    try {
      await db.transactions.bulkAdd(recentlyDeletedTxs);
      recentlyDeletedTxs = [];
      updateState();
      showToast('Undo successful');
    } catch (err) {
      console.error('Undo failed:', err);
      showToast('Error restoring items');
    }
  }
}

// ── Period dropdown ───────────────────────────────────────────
function openPeriodDropdown() {
  const ov = document.getElementById('period-overlay');
  if (typeof gsap !== 'undefined') A.openSheet(ov, document.getElementById('period-sheet'));
  else ov.classList.add('open');
  if (navStack) navStack.pushSheet('period-overlay');
}
function closePeriod(e) {
  if (e && e.target.id !== 'period-overlay') return;
  const ov = document.getElementById('period-overlay');
  if (typeof gsap !== 'undefined') A.closeSheet(ov, document.getElementById('period-sheet'));
  else ov.classList.remove('open');
  if (navStack) navStack.popSheet('period-overlay');
}
function setPeriod(period)    { globalReportPeriod = period; closePeriod(); updateState(); }

// ── Currency dropdown ─────────────────────────────────────────
function openCurrencySheet() {
  const ov = document.getElementById('currency-overlay');
  if (typeof gsap !== 'undefined') A.openSheet(ov, document.getElementById('currency-sheet'));
  else ov.classList.add('open');
  if (navStack) navStack.pushSheet('currency-overlay');
}
function closeCurrencySheet(e) {
  if (e && e.target.id !== 'currency-overlay') return;
  const ov = document.getElementById('currency-overlay');
  if (typeof gsap !== 'undefined') A.closeSheet(ov, document.getElementById('currency-sheet'));
  else ov.classList.remove('open');
  if (navStack) navStack.popSheet('currency-overlay');
}
async function updateCurrencyState(newSymbol) {
  currencySymbol = newSymbol;
  await saveSetting('currencySymbol', currencySymbol);
  document.getElementById('currency-current-label').textContent = currencySymbol;
  document.querySelectorAll('.currency-symbol-display').forEach(el => el.textContent = currencySymbol);
  updateState(); updateAccDisplay(); closeCurrencySheet();
}

// ── App theme ─────────────────────────────────────────────────
// Theme is locked to glass for modern aesthetics.

// ── Export and Import ──────────────────────────────────────────
async function exportData() {
  try {
    const txs = await db.transactions.toArray();
    const settings = await db.settings.toArray();
    const data = {
      version: 1,
      transactions: txs,
      settings: settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully! 📤');
  } catch (err) {
    console.error('Export error:', err);
    showToast('Failed to export data');
  }
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON format');
      if (!Array.isArray(data.transactions)) throw new Error('Missing transactions array');

      const validatedTxs = [];
      for (const tx of data.transactions) {
        if (typeof tx.amount !== 'number' || isNaN(tx.amount)) throw new Error('Invalid transaction amount');
        if (tx.type !== 'spend' && tx.type !== 'earn') throw new Error('Invalid transaction type');
        if (!tx.category || typeof tx.category !== 'string') throw new Error('Invalid category');
        
        const cleanTx = {
          amount: Math.round(tx.amount),
          type: tx.type,
          category: tx.category,
          note: tx.note || tx.category,
          icon: tx.icon || 'zap',
          date: tx.date || Date.now()
        };
        validatedTxs.push(cleanTx);
      }

      if (!confirm('Importing data will overwrite all current transactions. Proceed?')) {
        event.target.value = '';
        return;
      }
      await db.transaction('rw', db.transactions, db.settings, async () => {
        await db.transactions.clear();
        await db.transactions.bulkAdd(validatedTxs);
        
        if (Array.isArray(data.settings)) {
          for (const s of data.settings) {
            if (s.id && s.value !== undefined) {
              await db.settings.put(s);
            }
          }
        }
        showToast('Data imported successfully! 📥');
        setTimeout(() => location.reload(), 1000);
      });
    } catch (err) {
      console.error('Import error:', err);
      showToast('Import failed: ' + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

// ── Storage Persistence & Quota ──────────────────────────────
async function requestStoragePersistence() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const persisted = await navigator.storage.persist();
        console.log(`Storage persistence granted: ${persisted}`);
      } else {
        console.log('Storage is already persistent');
      }
    } catch (e) {
      console.warn('Storage persistence request failed:', e);
    }
  }
}

async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { usage, quota } = await navigator.storage.estimate();
      const percentUsed = (usage / quota) * 100;
      if (percentUsed > 80) {
        showToast('⚠️ Storage usage exceeds 80%!');
      }
    } catch (e) {
      console.warn('Could not estimate storage quota:', e);
    }
  }
}

function showFatalErrorScreen(err) {
  document.body.innerHTML = `
    <div style="padding: 40px 20px; text-align: center; color: #fff; font-family: sans-serif; background: #121212; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
      <h2 style="color: #FF4D4D; margin-bottom: 16px; font-weight: 800;">Database Connection Failed</h2>
      <p style="color: #aaa; margin-bottom: 24px; font-size: 14px; line-height: 1.5; max-width: 320px;">PocketPulse was unable to access local IndexedDB storage. Private browsing settings may be blocking storage access.</p>
      <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px; border: 1px dashed rgba(255,255,255,0.1); margin-bottom: 24px; max-width: 90%; text-align: left; word-break: break-all; color: #FF6B4D;">
        ${err.message || err}
      </div>
      <button data-action="reload" style="background: #C8FF00; color: #000; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: transform 0.1s;">Retry Connection</button>
    </div>
  `;
}

// ── Expose inline event handlers ─────────────────────────────
window.switchTab         = switchTab;
window.setTheme          = setTheme;
window.wipeData          = wipeData;
window.openPeriodDropdown= openPeriodDropdown;
window.closePeriod       = closePeriod;
window.setPeriod         = setPeriod;
window.openCurrencySheet = openCurrencySheet;
window.closeCurrencySheet= closeCurrencySheet;
window.updateCurrencyState=updateCurrencyState;
// Theme toggle removed
window.exportData        = exportData;
window.importData        = importData;
window.clearNum          = clearNum;
window.undoTap           = undoTap;
window.logTransaction    = logTransaction;
window.openEdit          = openEdit;
window.closeEdit         = closeEdit;
window.setType           = setType;
window.updateEditDisplay = updateEditDisplay;
window.saveEdit          = saveEdit;
window.handleTxTouchStart= handleTxTouchStart;
window.handleTxTouchMove = handleTxTouchMove;
window.handleTxTouchEnd  = handleTxTouchEnd;
window.handleTxClick     = handleTxClick;
window.exitMultiSelect   = exitMultiSelect;
window.selectAllHistory  = selectAllHistory;
window.deleteSelected    = deleteSelected;
window.undoDelete        = undoDelete;

// ============================================================
// INITIALIZE
// ============================================================
const ppInit = async () => {
  initGSAP();
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
  try {
    try {
      await db.open();
      await requestStoragePersistence();
      await checkStorageQuota();
    } catch (err) {
      console.error('Init error:', err);
      showFatalErrorScreen(err);
      return;
    }

    weeklyBudget     = await getSetting('weeklyBudget', 3000);
    expectedEarnings = await getSetting('expectedEarnings', 8000);

    let savedNumpadValues = await getSetting('numpadValues', null);
    if (!savedNumpadValues || savedNumpadValues.length < 10) {
      savedNumpadValues = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      await saveSetting('numpadValues', savedNumpadValues);
    }
    numpadValues = savedNumpadValues;

    renderNumpad();
    renderSettingsNumpad();

    // Process static HTML icons (nav, hero chevron, settings chevron) once before dynamic renders
    lucide.createIcons();

    renderHomeCategories();

    // Accent color — use data-color instead of parsing onclick attributes
    const savedAccent = await getSetting('accentColor', '#C8FF00');
    setTheme(null, savedAccent, false);

    // Attach accent dot listeners via JS (no inline onclick)
    document.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => setTheme(dot, dot.dataset.color));
    });

    currencySymbol = await getSetting('currencySymbol', '₹');
    document.getElementById('currency-current-label').textContent = currencySymbol;
    document.querySelectorAll('.currency-symbol-display').forEach(el => el.textContent = currencySymbol);

    document.getElementById('limit-input').value    = weeklyBudget;
    document.getElementById('earnings-input').value = expectedEarnings;

    // Debounced input handlers
    document.getElementById('limit-input').addEventListener('input', debounce(async e => {
      weeklyBudget = parseInt(e.target.value) || 0;
      await saveSetting('weeklyBudget', weeklyBudget);
      updateState();
    }, 500));
    document.getElementById('earnings-input').addEventListener('input', debounce(async e => {
      expectedEarnings = parseInt(e.target.value) || 0;
      await saveSetting('expectedEarnings', expectedEarnings);
      updateState();
    }, 500));

    // Event Delegation for data-action attributes
    document.body.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.action;

      if (action === 'openPeriodDropdown') openPeriodDropdown();
      if (action === 'undoTap') undoTap();
      if (action === 'clearNum') clearNum();
      if (action === 'logTransaction') logTransaction();
      if (action === 'selectAllHistory') selectAllHistory();
      if (action === 'openCurrencySheet') openCurrencySheet();
      if (action === 'exportData') exportData();
      if (action === 'wipeData') wipeData();
      if (action === 'closeEdit') closeEdit(e);
      if (action === 'saveEdit') saveEdit();
      if (action === 'closePeriod') closePeriod(e);
      if (action === 'closeCurrencySheet') closeCurrencySheet(e);
      if (action === 'exitMultiSelect') exitMultiSelect();
      if (action === 'deleteSelected') deleteSelected();
      if (action === 'reload') location.reload();

      if (action === 'showToast') showToast(actionEl.dataset.toast);
      if (action === 'switchTab') {
        switchTab(actionEl.dataset.tab, actionEl);
        if (window.navStack) navStack.push(actionEl.dataset.tab);
        if (window.gestureManager) gestureManager.setTabIndex(['home', 'reports', 'settings'].indexOf(actionEl.dataset.tab));
      }
      // GSAP micro-interactions
      if (typeof gsap !== 'undefined') {
        if (action === 'logTransaction' || action === 'clearNum') A.actionBtnPress(actionEl);
        if (action === 'undoTap') A.actionBtnPress(actionEl);
        if (action === 'openPeriodDropdown' || action === 'openCurrencySheet') A.actionBtnPress(actionEl);
      }
      if (action === 'setType') setType(actionEl, actionEl.dataset.type);
      if (action === 'setPeriod') setPeriod(actionEl.dataset.period);
      if (action === 'updateCurrencyState') updateCurrencyState(actionEl.dataset.currency);
    });

    // Direct event listeners for inputs
    document.getElementById('import-file-input')?.addEventListener('change', importData);
    document.getElementById('edit-amt-input')?.addEventListener('input', updateEditDisplay);

    await updateState();

    // Initialize Hardware Navigation Managers
    gestureManager = new GestureManager(document.querySelector('.app-container'), ['home', 'reports', 'settings'], (tabId, dir) => {
      const navEl = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
      if (navEl) {
        switchTab(tabId, navEl);
        if (window.navStack) navStack.push(tabId);
      }
    });
    navStack = new NavigationStack(['home', 'reports', 'settings']);
    new SheetGestureManager('edit-sheet', 'edit-overlay', () => closeEdit(null));
    new SheetGestureManager('period-sheet', 'period-overlay', () => closePeriod(null));
    new SheetGestureManager('currency-sheet', 'currency-overlay', () => closeCurrencySheet(null));

  } catch (err) { console.error('Init error:', err); }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  ppInit();
} else {
  window.addEventListener('DOMContentLoaded', ppInit);
}

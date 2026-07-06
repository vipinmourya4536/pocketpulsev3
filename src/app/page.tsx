'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    document.body.classList.add('theme-glass');
    document.body.style.cssText =
      'background:#121212;display:flex;justify-content:center;align-items:stretch;min-height:100dvh;overflow:hidden;position:fixed;inset:0;margin:0;padding:0;';
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      />
      <link rel="stylesheet" href="/pp-style.css" />

      <div className="app-container" dangerouslySetInnerHTML={{ __html: APP_HTML }} />

      <Script
        src="https://unpkg.com/gsap@3.12.7/dist/gsap.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/lucide@0.359.0/dist/umd/lucide.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/dexie@3.2.4/dist/dexie.js"
        strategy="afterInteractive"
      />
      <Script src="/pp-app.js" strategy="afterInteractive" />
    </>
  );
}

const APP_HTML = `
  <!-- TAB 1: HOME -->
  <div class="tab-content active" id="tab-home">
    <div class="header">Home</div>

    <div class="hero-card">
      <div class="hero-label dropdown-trigger" data-action="openPeriodDropdown">
        <span id="hero-period-label">THIS WEEK'S SPEND</span>
        <i data-lucide="chevron-down" style="width: 14px; height: 14px; margin-left: 4px;"></i>
      </div>
      <div class="hero-amount" id="hero-total"><span class="hero-currency">₹</span>0</div>
      <div class="hero-budget-info" style="font-size:13px; color:var(--muted); font-weight: 600;">of <span id="hero-limit-display">₹3,000</span> limit</div>
      <div class="hero-budget-bar">
        <div class="hero-budget-fill" id="hero-progress"></div>
      </div>
    </div>

    <div class="numpad-card" id="numpad-wrapper">
      <div class="np-header">
        <div class="np-total" id="np-display">Tap a number...</div>
        <button class="np-undo" data-action="undoTap">↩</button>
      </div>
      <div class="quick-category-slider" id="quick-category-slider"></div>
      <div class="np-grid" id="numpad-grid"></div>
      <div class="np-actions">
        <button class="action-btn btn-clear" data-action="clearNum">✗ Clear</button>
        <button class="action-btn btn-log" data-action="logTransaction">✓ Log</button>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; margin-bottom: 12px;">
      <div class="section-label" style="margin: 0;">Recent History</div>
      <button id="ms-select-all" style="display: none; background: transparent; border: none; color: var(--accent); font-weight: 700; font-size: 12px; cursor: pointer; padding: 0 4px;" data-action="selectAllHistory">Select All</button>
    </div>
    <div id="history-container">
      <div id="history-skeleton">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>
  </div>

  <!-- TAB 2: REPORTS & LIMITS -->
  <div class="tab-content" id="tab-reports">
    <div class="header">Reports &amp; Limits</div>
    <div class="summary-cards">
      <div class="summary-card">
        <div class="sum-label">Spent</div>
        <div class="sum-val" id="report-spent" style="color:var(--text)">₹0</div>
      </div>
      <div class="summary-card">
        <div class="sum-label">Earned</div>
        <div class="sum-val" id="report-earned" style="color:var(--earn-color)">₹0</div>
      </div>
      <div class="summary-card" style="grid-column: span 2;">
        <div class="sum-label">Net Surplus</div>
        <div class="sum-val" id="report-surplus" style="color:var(--text)">₹0</div>
        <div style="font-size:12px; color:var(--muted); font-weight:600; margin-top:4px;" id="report-safe">Safe to spend: ₹0</div>
      </div>
    </div>
    <div class="section-label">Spending Trend</div>
    <div class="trend-box" id="trend-box"></div>
    <div class="section-label">By Category</div>
    <div class="category-breakdown" id="category-breakdown"></div>
    <div class="section-label">Boundaries</div>
    <div class="limit-box">
      <div class="hero-label" id="limit-label">Weekly Max Limit</div>
      <div class="input-row">
        <span class="currency-symbol-display" style="font-size:24px; font-weight:800; color:var(--accent)">₹</span>
        <input type="number" class="limit-input" id="limit-input" value="3000" />
      </div>
    </div>
    <div class="limit-box">
      <div class="hero-label">Expected Earnings</div>
      <div class="input-row">
        <span class="currency-symbol-display" style="font-size:24px; font-weight:800; color:var(--accent)">₹</span>
        <input type="number" class="limit-input" id="earnings-input" value="8000" />
      </div>
    </div>
  </div>

  <!-- TAB 3: SETTINGS -->
  <div class="tab-content" id="tab-settings">
    <div class="header">Settings</div>
    <div class="setting-row">
      <div class="setting-label">Accent Color</div>
      <div class="color-dots">
        <div class="dot selected" data-color="#C8FF00" style="background:#C8FF00"></div>
        <div class="dot" data-color="#4DBBFF" style="background:#4DBBFF"></div>
        <div class="dot" data-color="#B46DFF" style="background:#B46DFF"></div>
        <div class="dot" data-color="#FF6B4D" style="background:#FF6B4D"></div>
      </div>
    </div>
    <div class="setting-row" data-action="openCurrencySheet">
      <div class="setting-label">Currency Symbol</div>
      <div style="display: flex; align-items: center; gap: 4px; color: var(--accent); font-weight:800; cursor:pointer;">
        <span id="currency-current-label">₹</span>
        <i data-lucide="chevron-right" style="width:16px; height:16px;"></i>
      </div>
    </div>
    <div class="setting-row" style="flex-direction: column; align-items: stretch; gap: 12px;">
      <div class="setting-label">Data Backup &amp; Restore</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button class="link-btn" style="text-align: center; font-weight: 700; padding: 12px; margin: 0;" data-action="exportData">📤 Export Data</button>
        <button class="link-btn" style="text-align: center; font-weight: 700; padding: 12px; margin: 0; position: relative; cursor: pointer;">
          📥 Import Data
          <input type="file" id="import-file-input" accept=".json" style="position: absolute; inset: 0; opacity: 0; cursor: pointer;" />
        </button>
      </div>
    </div>
    <div class="section-label" style="margin-top: 10px;">Customize Quick Chips</div>
    <div class="numpad-settings-grid" id="numpad-settings-grid"></div>
    <div class="links">
      <button class="link-btn" data-action="showToast" data-toast="Terms &amp; Conditions modal coming soon">📄 Terms &amp; Conditions</button>
      <button class="link-btn" data-action="showToast" data-toast="Privacy Policy modal coming soon">🔒 Privacy Policy</button>
    </div>
    <div style="margin-top: 40px; margin-bottom: 20px;">
      <button class="link-btn" style="width: 100%; color:#FF4D4D; border-color:rgba(255,77,77,0.3); text-align: center; font-weight: 800;" data-action="wipeData">⚠️ Wipe All Data</button>
    </div>
    <div class="quote-box">
      <div class="quote-text">&quot;Take care of the pennies, and the pounds will take care of themselves.&quot;</div>
      <div class="quote-thanks">Thanks for choosing us! 🚀</div>
    </div>
  </div>

  <!-- BOTTOM NAV -->
  <div class="bottom-nav">
    <div class="nav-item active" data-action="switchTab" data-tab="home">
      <i data-lucide="wallet"></i><span class="nav-label">Home</span>
    </div>
    <div class="nav-item" data-action="switchTab" data-tab="reports">
      <i data-lucide="bar-chart-2"></i><span class="nav-label">Reports</span>
    </div>
    <div class="nav-item" data-action="switchTab" data-tab="settings">
      <i data-lucide="settings"></i><span class="nav-label">Settings</span>
    </div>
  </div>

  <!-- EDIT BOTTOM SHEET -->
  <div class="sheet-overlay" id="edit-overlay" data-action="closeEdit">
    <div class="bottom-sheet" id="edit-sheet">
      <div class="sheet-handle"></div>
      <div class="edit-display" id="edit-display">-₹0</div>
      <div class="input-group">
        <label class="input-label">Amount (₹)</label>
        <input type="number" class="form-input" id="edit-amt-input" />
      </div>
      <div class="input-group">
        <label class="input-label">Type</label>
        <div class="type-toggles">
          <button class="type-btn active spend" data-action="setType" data-type="spend">💸 Spend</button>
          <button class="type-btn earn" data-action="setType" data-type="earn">💰 Earn</button>
        </div>
      </div>
      <div class="input-group">
        <label class="input-label">Category</label>
        <div class="icon-slider" id="edit-icon-slider"></div>
      </div>
      <div class="input-group">
        <label class="input-label">Note</label>
        <input type="text" class="form-input" id="edit-note-input" />
      </div>
      <button class="save-btn" data-action="saveEdit">Save Changes</button>
    </div>
  </div>

  <!-- PERIOD SELECTION BOTTOM SHEET -->
  <div class="sheet-overlay" id="period-overlay" data-action="closePeriod">
    <div class="bottom-sheet" id="period-sheet" style="padding-bottom: 24px;">
      <div class="sheet-handle"></div>
      <div class="header" style="margin-bottom: 16px; font-size: 20px;">Select Period</div>
      <div class="period-option" data-action="setPeriod" data-period="weekly">This Week</div>
      <div class="period-option" data-action="setPeriod" data-period="monthly">This Month</div>
      <div class="period-option" data-action="setPeriod" data-period="yearly">This Year</div>
      <div class="period-option" data-action="setPeriod" data-period="all">All Time</div>
    </div>
  </div>

  <!-- CURRENCY SELECTION BOTTOM SHEET -->
  <div class="sheet-overlay" id="currency-overlay" data-action="closeCurrencySheet">
    <div class="bottom-sheet" id="currency-sheet" style="padding-bottom: 24px;">
      <div class="sheet-handle"></div>
      <div class="header" style="margin-bottom: 16px; font-size: 20px;">Select Currency</div>
      <div class="period-option" data-action="updateCurrencyState" data-currency="₹">Rupee (₹)</div>
      <div class="period-option" data-action="updateCurrencyState" data-currency="$">Dollar ($)</div>
      <div class="period-option" data-action="updateCurrencyState" data-currency="€">Euro (€)</div>
      <div class="period-option" data-action="updateCurrencyState" data-currency="£">Pound (£)</div>
      <div class="period-option" data-action="updateCurrencyState" data-currency="¥">Yen (¥)</div>
    </div>
  </div>

  <!-- MULTI SELECT BAR -->
  <div class="ms-delete-bar" id="ms-delete-bar">
    <button class="ms-cancel-btn" data-action="exitMultiSelect">Cancel</button>
    <button class="ms-delete-btn" data-action="deleteSelected">Delete (<span id="ms-count">0</span>)</button>
  </div>

  <!-- TOAST -->
  <div class="toast" id="toast"></div>
`;
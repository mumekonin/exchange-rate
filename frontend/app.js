// BirrConvert — app.js
'use strict';

// CONFIG 
const API_BASE    = 'https://exchange-rate-mg5x.onrender.com';
const CONVERT_URL = `${API_BASE}/convert-rate`;
const TODAY_URL   = `${API_BASE}/today-rate`;

// CURRENCY DATA 
const CURRENCIES = {
  ETB: { name: 'Ethiopian Birr',    country: 'Ethiopia',       icon: 'account_balance',  rateKey: 'etbRate' },
  USD: { name: 'US Dollar',         country: 'United States',  icon: 'attach_money',     rateKey: 'usdRate' },
  EUR: { name: 'Euro',              country: 'European Union', icon: 'euro',             rateKey: 'eurRate' },
  GBP: { name: 'British Pound',     country: 'United Kingdom', icon: 'currency_pound',   rateKey: 'gbpRate' },
  JPY: { name: 'Japanese Yen',      country: 'Japan',          icon: 'currency_yen',     rateKey: 'jpyRate' },
  CNY: { name: 'Chinese Yuan',      country: 'China',          icon: 'currency_yuan',    rateKey: 'cnyRate' },
  CAD: { name: 'Canadian Dollar',   country: 'Canada',         icon: 'attach_money',     rateKey: 'cadRate' },
  AUD: { name: 'Australian Dollar', country: 'Australia',      icon: 'payments',         rateKey: 'audRate' },
  CHF: { name: 'Swiss Franc',       country: 'Switzerland',    icon: 'paid',             rateKey: 'chfRate' },
  INR: { name: 'Indian Rupee',      country: 'India',          icon: 'currency_rupee',   rateKey: 'inrRate' },
  AED: { name: 'UAE Dirham',        country: 'UAE',            icon: 'monetization_on',  rateKey: 'aedRate' },
};

// Stat highlights
const STAT_KEYS = ['USD', 'EUR', 'GBP', 'AED'];

// Stat-specific larger icons
const STAT_ICONS = {
  USD: 'attach_money',
  EUR: 'euro',
  GBP: 'currency_pound',
  AED: 'monetization_on',
};

// DOM REFS 
const themeBtn       = document.getElementById('themeBtn');
const iconMoon       = document.getElementById('iconMoon');
const iconSun        = document.getElementById('iconSun');
const fromSelect     = document.getElementById('fromCurrency');
const toSelect       = document.getElementById('toCurrency');
const fromIcon       = document.getElementById('fromIcon');
const toIcon         = document.getElementById('toIcon');
const amountInput    = document.getElementById('amount');
const swapBtn        = document.getElementById('swapBtn');
const convertBtn     = document.getElementById('convertBtn');
const convertText    = document.getElementById('convertBtnText');
const convertIcon    = document.getElementById('convertIcon');
const convertSpinner = document.getElementById('convertSpinner');
const resultBox      = document.getElementById('resultBox');
const ratesBody      = document.getElementById('ratesBody');
const refreshBtn     = document.getElementById('refreshBtn');
const statsGrid      = document.getElementById('statsGrid');
const rateDate       = document.getElementById('rateDate');
const rateId         = document.getElementById('rateId');
const toastEl        = document.getElementById('toast');

// THEME 
let theme = localStorage.getItem('birrconvert-theme') || 'dark';
applyTheme(theme);

themeBtn.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  localStorage.setItem('birrconvert-theme', theme);
});

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  iconMoon.style.display = t === 'dark'  ? 'block' : 'none';
  iconSun.style.display  = t === 'light' ? 'block' : 'none';
}

// TOAST 
let toastTimer = null;
function showToast(msg, type = 'success') {
  const icon = type === 'success' ? 'check_circle' : 'error';
  toastEl.innerHTML = `<span class="material-icons-round toast-icon">${icon}</span> ${msg}`;
  toastEl.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3800);
}

// POPULATE SELECTS 
function buildSelects() {
  [fromSelect, toSelect].forEach((sel, idx) => {
    sel.innerHTML = '';
    Object.entries(CURRENCIES).forEach(([code, info]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${code} — ${info.name}`;
      sel.appendChild(opt);
    });
    sel.value = idx === 0 ? 'USD' : 'ETB';
  });
  updateIconDisplay();
}

function updateIconDisplay() {
  const fromInfo = CURRENCIES[fromSelect.value];
  const toInfo   = CURRENCIES[toSelect.value];
  if (fromIcon && fromInfo) fromIcon.textContent = fromInfo.icon;
  if (toIcon   && toInfo)   toIcon.textContent   = toInfo.icon;
}

fromSelect.addEventListener('change', updateIconDisplay);
toSelect.addEventListener('change',   updateIconDisplay);

//  SWAP 
swapBtn.addEventListener('click', () => {
  const tmp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value   = tmp;
  updateIconDisplay();
});

// CONVERT 
convertBtn.addEventListener('click', doConvert);
amountInput.addEventListener('keydown', e => { if (e.key === 'Enter') doConvert(); });

async function doConvert() {
  const amount       = parseFloat(amountInput.value);
  const fromCurrency = fromSelect.value;
  const toCurrency   = toSelect.value;

  if (!amount || isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid positive amount.', 'error');
    amountInput.focus();
    return;
  }

  // Loading state
  convertBtn.disabled = true;
  convertText.textContent = 'Converting…';
  convertIcon.style.display = 'none';
  convertSpinner.style.display = 'block';
  resultBox.className = 'result-box';
  resultBox.innerHTML = `
    <div class="result-label">Processing</div>
    <div class="result-loading">
      <span class="material-icons-round spin-icon" style="font-size:1.1rem;vertical-align:middle;">autorenew</span>
      &nbsp;${amount} ${fromCurrency} → ${toCurrency} …
    </div>`;

  try {
    const res = await fetch(CONVERT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fromCurrency, toCurrency, amount }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.message || errData.error || `Server error ${res.status}`;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    const data   = await res.json();
    const result = data.Amount ?? data.amount ?? data.convertedAmount;
    if (result == null || isNaN(result)) throw new Error('Invalid response from server.');

    const fromInfo  = CURRENCIES[fromCurrency];
    const toInfo    = CURRENCIES[toCurrency];
    const formatted = formatAmount(result, toCurrency);

    resultBox.className = 'result-box success';
    resultBox.innerHTML = `
      <div class="result-label">
        <span class="material-icons-round" style="font-size:.75rem;vertical-align:middle;">check_circle</span>
        Converted Amount
      </div>
      <div class="result-amount">
        ${formatted}
        <span class="result-currency">${toCurrency}</span>
      </div>
      <div class="result-meta">
        <span class="material-icons-round" style="font-size:.85rem;vertical-align:middle;opacity:.6;">${fromInfo.icon}</span>
        ${amount.toLocaleString()} ${fromCurrency}
        &nbsp;<span class="material-icons-round" style="font-size:.85rem;vertical-align:middle;">east</span>&nbsp;
        <span class="material-icons-round" style="font-size:.85rem;vertical-align:middle;opacity:.6;">${toInfo.icon}</span>
        ${formatted} ${toCurrency}
      </div>`;

    showToast(`${amount} ${fromCurrency} converted to ${formatted} ${toCurrency}`);

  } catch (err) {
    resultBox.className = 'result-box error';
    resultBox.innerHTML = `
      <div class="result-label" style="color:var(--danger)">
        <span class="material-icons-round" style="font-size:.75rem;vertical-align:middle;">error</span>
        Error
      </div>
      <div class="result-empty" style="color:var(--danger)">
        <span class="material-icons-round" style="vertical-align:middle;margin-right:6px;">warning</span>
        ${err.message}
      </div>`;
    showToast(err.message, 'error');

  } finally {
    convertBtn.disabled = false;
    convertText.textContent = 'Get Exchange Rate';
    convertIcon.style.display = 'block';
    convertSpinner.style.display = 'none';
  }
}

function formatAmount(val, code) {
  if (code === 'JPY' || code === 'INR') {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

// FETCH TODAY'S RATES 
refreshBtn.addEventListener('click', fetchTodayRates);

async function fetchTodayRates() {
  refreshBtn.classList.add('spinning');
  renderSkeletonRows();
  renderSkeletonStats();

  try {
    const res = await fetch(TODAY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderRatesTable(data);
    renderStats(data);
    renderDateBar(data);
    showToast('Exchange rates refreshed successfully.');
  } catch (err) {
    renderErrorRows();
    renderErrorStats();
    showToast('Failed to load rates. Is the server running?', 'error');
    console.error('[BirrConvert] Rate fetch error:', err);
  } finally {
    refreshBtn.classList.remove('spinning');
  }
}

// RENDER RATES TABLE 
function renderSkeletonRows() {
  const skRow = () => `
    <tr>
      <td><div class="currency-cell">
        <div class="currency-flag-circle sk" style="width:36px;height:36px;"></div>
        <div>
          <div class="sk" style="width:90px;height:13px;margin-bottom:5px;"></div>
          <div class="sk" style="width:120px;height:10px;"></div>
        </div>
      </div></td>
      <td><div class="sk" style="width:40px;height:12px;"></div></td>
      <td><div class="sk" style="width:80px;height:13px;margin-left:auto;"></div></td>
    </tr>`;
  ratesBody.innerHTML = Array(10).fill(0).map(skRow).join('');
}

function renderErrorRows() {
  ratesBody.innerHTML = `
    <tr><td colspan="3" style="text-align:center;padding:28px 0;
      font-family:var(--font-mono);font-size:.82rem;color:var(--danger);">
      <span class="material-icons-round" style="vertical-align:middle;margin-right:6px;font-size:1rem;">wifi_off</span>
      Could not load exchange rates. Check your server connection.
    </td></tr>`;
}

function renderRatesTable(data) {
  const rows = Object.entries(CURRENCIES)
    .filter(([code]) => code !== 'ETB')
    .map(([code, info]) => {
      const rate = data[info.rateKey];
      const formatted = rate != null
        ? rate.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: code === 'JPY' || code === 'INR' ? 4 : 6,
          })
        : 'N/A';

      return `
        <tr>
          <td>
            <div class="currency-cell">
              <div class="currency-flag-circle">
                <span class="material-icons-round currency-icon">${info.icon}</span>
              </div>
              <div>
                <div class="currency-code">${code}</div>
                <div class="currency-full-name">${info.name}</div>
                <div class="currency-country">${info.country}</div>
              </div>
            </div>
          </td>
          <td style="font-family:var(--font-mono);font-size:.78rem;color:var(--text-mute);">${code}</td>
          <td><span class="rate-val">${formatted}</span></td>
        </tr>`;
    });
  ratesBody.innerHTML = rows.join('');
}

// RENDER STATS 
function renderSkeletonStats() {
  statsGrid.innerHTML = STAT_KEYS.map(() => `
    <div class="stat-item">
      <div class="sk" style="width:32px;height:32px;border-radius:8px;margin-bottom:10px;"></div>
      <div class="sk" style="width:60px;height:10px;margin-bottom:8px;"></div>
      <div class="sk" style="width:100px;height:22px;margin-bottom:6px;"></div>
      <div class="sk" style="width:80px;height:10px;"></div>
    </div>`).join('');
}

function renderErrorStats() {
  statsGrid.innerHTML = STAT_KEYS.map(code => `
    <div class="stat-item">
      <span class="material-icons-round stat-icon" style="color:var(--danger);">${STAT_ICONS[code]}</span>
      <div class="stat-label">${code}</div>
      <div class="stat-value" style="color:var(--danger);font-size:1rem;">N/A</div>
    </div>`).join('');
}

function renderStats(data) {
  statsGrid.innerHTML = STAT_KEYS.map(code => {
    const info = CURRENCIES[code];
    const rate = data[info.rateKey];
    const formatted = rate != null
      ? rate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
      : 'N/A';

    return `
      <div class="stat-item">
        <span class="material-icons-round stat-icon">${STAT_ICONS[code]}</span>
        <div class="stat-label">1 ETB in ${code}</div>
        <div class="stat-value">${formatted}</div>
        <div class="stat-name">${info.name} · ${info.country}</div>
      </div>`;
  }).join('');
}

// DATE BAR 
function renderDateBar(data) {
  const dateSpan = document.getElementById('rateDate');
  if (data.exchangeDate) {
    const d = new Date(data.exchangeDate);
    const formatted = d.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
    dateSpan.innerHTML = `
      <span class="material-icons-round" style="font-size:.9rem;vertical-align:middle;margin-right:4px;">calendar_today</span>
      ${formatted}`;
  } else {
    dateSpan.innerHTML = `
      <span class="material-icons-round" style="font-size:.9rem;vertical-align:middle;margin-right:4px;">calendar_today</span>
      Date unavailable`;
  }
  if (data.id) {
    rateId.textContent = `ID ···${data.id.slice(-6)}`;
  }
}

// INIT 
buildSelects();
fetchTodayRates();
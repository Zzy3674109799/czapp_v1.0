// app.jsx — App 外壳：手机框架 + 导航 + 路由 + Tweaks
const { useState: useStateA } = React;

const PALETTES = {
  warm:  { honey: '#F2B33D', coral: '#F08A6E', coralTint: '#FCE3DB', mist: '#8FB6C7', mistTint: '#E0EDF1', leaf: '#8FB87A' },
  mint:  { honey: '#67C2A6', coral: '#5FB9A6', coralTint: '#D9F0E8', mist: '#9FC6A9', mistTint: '#E2F0E6', leaf: '#6BA88A' },
  berry: { honey: '#E59ACB', coral: '#E0789E', coralTint: '#FADBE8', mist: '#B49AD6', mistTint: '#EBE2F5', leaf: '#A6A0D9' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "homeStyle": "stage",
  "palette": "warm",
  "petMood": "auto",
  "blush": true,
  "todayEmpty": false,
  "showOnboarding": false,
  "darkMode": false
}/*EDITMODE-END*/;

const NAV = [
  { id: 'home',  label: '首页', icon: 'home' },
  { id: 'bills', label: '账单', icon: 'chart' },
  { id: 'goals', label: '攒钱', icon: 'target' },
  { id: 'pet',   label: '存崽', icon: 'pet' },
];

const TITLES = { home: '', bills: '账单 · 统计', goals: '攒钱目标', pet: '我的存崽' };

const STORAGE_KEY = 'cunzai_state_v1';
const BILL_RESET_VERSION = '20260605-clear-bills';
const DB_NAME = 'cunzai_app_db';
const DB_STORE = 'kv';
const DB_STATE_KEY = 'state';

function defaultCategories() {
  return (INITIAL.categories || Object.entries(CATS).map(([id, c]) => ({
    id,
    label: c.label,
    tint: c.tint,
    icon: id,
    visible: !c.income || id === 'salary',
    income: !!c.income,
    keywords: '',
  }))).map((c) => ({ ...c }));
}

function normalizeCategoriesLegacy(s) {
  const defaults = defaultCategories();
  const existing = new Map((s.categories || []).map((c) => [c.id, c]));
  const defaultIds = new Set(defaults.map((d) => d.id));
  const custom = (s.categories || []).filter((c) => c && c.custom && c.id && !defaultIds.has(c.id));
  return [
    ...defaults.map((d) => ({ ...d, ...(existing.get(d.id) || {}) })),
    ...custom.map((c) => ({
      id: c.id,
      label: c.label || '新分类',
      tint: c.tint || '#A99B86',
      icon: c.icon || 'other',
      visible: c.visible !== false,
      income: !!c.income,
      keywords: c.keywords || '',
      custom: true,
    })),
  ];
}

function normalizeCategories(s) {
  const defaults = defaultCategories();
  const defaultMap = new Map(defaults.map((d) => [d.id, d]));
  const seen = new Set();
  const seenLabels = new Set();
  const normalizeOne = (c) => {
    const base = defaultMap.get(c.id) || {};
    return {
      ...base,
      id: c.id,
      label: c.label || base.label || '新分类',
      tint: c.tint || base.tint || '#A99B86',
      icon: c.icon || base.icon || c.id || 'other',
      visible: c.visible !== false,
      income: typeof c.income === 'boolean' ? c.income : !!base.income,
      keywords: c.keywords || '',
      custom: !!c.custom || !defaultMap.has(c.id),
    };
  };
  const ordered = (s.categories || []).filter((c) => c && c.id).map((c) => {
    seen.add(c.id);
    const normalized = normalizeOne(c);
    if (normalized.label) seenLabels.add(normalized.label);
    return normalized;
  });
  return [
    ...ordered,
    ...defaults.filter((d) => !seen.has(d.id) && !seenLabels.has(d.label)).map((d) => normalizeOne(d)),
  ];
}

function applyCategoryConfig(categories) {
  (categories || []).forEach((c) => {
    if (!c || !c.id) return;
    const base = CATS[c.id] || CATS[c.icon] || CATS.other;
    CATS[c.id] = {
      ...base,
      label: c.label || base.label,
      tint: c.tint || base.tint,
      income: typeof c.income === 'boolean' ? c.income : base.income,
      icon: c.icon || base.icon || c.id,
      custom: !!c.custom,
    };
  });
  window.__CUNZAI_CATEGORIES = categories || [];
}

function applyLearningRules(rules) {
  window.__CUNZAI_LEARNING_RULES = rules || [];
}

function clearBillData(s) {
  return {
    ...s,
    __billResetVersion: BILL_RESET_VERSION,
    days: [],
    byCat: [],
    week: [
      { d: '一', v: 0 }, { d: '二', v: 0 }, { d: '三', v: 0 },
      { d: '四', v: 0 }, { d: '五', v: 0 }, { d: '六', v: 0 }, { d: '日', v: 0 },
    ],
    budget: {
      ...s.budget,
      spent: 0,
      todaySpent: 0,
      income: 0,
    },
    lastImport: null,
  };
}

function normalizeState(s) {
  if (!s) return null;
  const withCats = { ...s, categories: normalizeCategories(s), learningRules: Array.isArray(s.learningRules) ? s.learningRules : [] };
  return withCats.__billResetVersion === BILL_RESET_VERSION ? withCats : clearBillData(withCats);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw));
  } catch (e) { return null; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

function formatBillDateTime(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function parseEntryDate(value) {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const now = new Date();
  if (!m) return now;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), now.getHours(), now.getMinutes(), now.getSeconds());
  return Number.isNaN(d.getTime()) ? now : d;
}

function billDayMeta(d) {
  const today = new Date();
  const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return {
    label: `${d.getMonth() + 1}月${d.getDate()}日`,
    date: isToday ? '今天' : weekdays[d.getDay()],
    sort: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
  };
}

function upsertBillDay(days, item, entryDate) {
  const meta = billDayMeta(entryDate);
  const dateKey = formatBillDateTime(entryDate).slice(0, 10);
  const next = [...(days || [])];
  const index = next.findIndex((d) => (d.items || []).some((it) => String(it.time || '').slice(0, 10) === dateKey));
  const current = index >= 0 ? next[index] : { ...meta, total: 0, items: [] };
  const items = [item, ...(current.items || [])].sort((a, b) => (parseBillTime(b.time) || 0) - (parseBillTime(a.time) || 0));
  const spent = items.filter((it) => it.amt > 0).reduce((a, it) => a + it.amt, 0);
  const income = items.filter((it) => it.amt < 0).reduce((a, it) => a + Math.abs(it.amt), 0);
  const updated = { ...current, ...meta, items, total: spent || -income, isIncome: spent === 0 && income > 0 };
  if (index >= 0) next[index] = updated;
  else next.push(updated);
  return next.sort((a, b) => (b.sort || 0) - (a.sort || 0));
}

function parseBillTime(value) {
  const d = new Date(String(value || '').replace(/-/g, '/'));
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function openAppDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadStateFromDb() {
  const db = await openAppDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(DB_STATE_KEY);
    req.onsuccess = () => resolve(req.result && req.result.value ? req.result.value : (req.result || null));
    req.onerror = () => reject(req.error);
  });
}

async function saveStateToDb(s) {
  const db = await openAppDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE).put({ value: s, savedAt: Date.now() }, DB_STATE_KEY);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [state, setState] = useStateA(() => loadState() || normalizeState(INITIAL));
  const [dbReady, setDbReady] = useStateA(false);
  React.useEffect(() => {
    let alive = true;
    loadStateFromDb()
      .then((dbState) => {
        if (!alive) return;
        if (dbState) setState(normalizeState(dbState));
        setDbReady(true);
      })
      .catch(() => setDbReady(true));
    return () => { alive = false; };
  }, []);
  React.useEffect(() => {
    saveState(state);
    if (dbReady) saveStateToDb(state).catch(() => {});
  }, [state, dbReady]);
  // 深色模式：写到 body data-theme
  React.useEffect(() => {
    document.body.setAttribute('data-theme', t.darkMode ? 'dark' : 'light');
    return () => document.body.removeAttribute('data-theme');
  }, [t.darkMode]);
  applyCategoryConfig(state.categories);
  applyLearningRules(state.learningRules);
  React.useEffect(() => {
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    document.body.classList.toggle('native-app', isNative);
    return () => document.body.classList.remove('native-app');
  }, []);
  const [tab, setTab] = useStateA('home');
  const [monthOffset, setMonthOffset] = useStateA(0);
  const [recording, setRecording] = useStateA(false);
  const [levelUp, setLevelUp] = useStateA(null);
  const [checkin, setCheckin] = useStateA(false);
  const [importing, setImporting] = useStateA(false);
  const [onboarding, setOnboarding] = useStateA(t.showOnboarding);
  const [editingBudget, setEditingBudget] = useStateA(false);
  const [managingCats, setManagingCats] = useStateA(false);
  const [showReport, setShowReport] = useStateA(false);
  const [reportState, setReportState] = useStateA(null);
  const [toast, setToast] = useStateA('');

  // Tweak 触发再次显示 onboarding
  React.useEffect(() => { if (t.showOnboarding) setOnboarding(true); }, [t.showOnboarding]);

  const finishOnboarding = (res) => {
    setState((s) => ({
      ...s,
      pet: { ...s.pet, species: res.species, name: res.name },
      budget: { ...s.budget, total: res.budget },
    }));
    setTweak('homeStyle', res.variant);
    setTweak('showOnboarding', false);
    setOnboarding(false);
    setTab('home');
  };

  // 应用配色 + 萌点到 CSS 变量
  const pal = PALETTES[t.palette] || PALETTES.warm;
  const rootVars = {
    '--honey': pal.honey, '--coral': pal.coral, '--coral-tint': pal.coralTint,
    '--mist': pal.mist, '--mist-tint': pal.mistTint, '--leaf': pal.leaf,
    '--blush-op': t.blush ? 0.55 : 0,
  };

  // 心情覆盖（演示用）：把月支出映射到不同情绪
  let liveState = t.petMood === 'auto' ? state
    : { ...state, budget: { ...state.budget, total: state.budget.total,
        spent: { excited: 800, happy: 1900, content: 2600, sad: 3400, sleeping: state.budget.spent }[t.petMood] || state.budget.spent,
        todaySpent: t.petMood === 'sleeping' ? 0 : state.budget.todaySpent } };
  // 今日空状态（还没记账）
  if (t.todayEmpty) liveState = { ...liveState, budget: { ...liveState.budget, todaySpent: 0 } };
  const monthViewState = typeof buildMonthViewReal === 'function'
    ? buildMonthViewReal(liveState, monthOffset)
    : liveState;
  const prevMonth = () => setMonthOffset((m) => Math.min(11, m + 1));
  const nextMonth = () => setMonthOffset((m) => Math.max(0, m - 1));

  const onSaved = (entry) => {
    setRecording(false);
    const isInc = entry.type === 'income';
    const gain = isInc ? 5 : 8;
    const willLevel = state.pet.exp + gain >= 100;   // 用当前 state 判断（updater 异步，不能在里面读）
    const newLevel = state.pet.level + 1;
    setState((s) => {
      const entryDate = parseEntryDate(entry.date);
      const item = { id: 'n' + Date.now(), cat: entry.cat, note: entry.note, amt: isInc ? -entry.amt : entry.amt, time: formatBillDateTime(entryDate) };
      const days = upsertBillDay(s.days, item, entryDate);
      const now = new Date();
      const inCurrentMonth = entryDate.getFullYear() === now.getFullYear() && entryDate.getMonth() === now.getMonth();
      // 经验闭环：记一笔涨经验，满 100 升级（+20 奖励金币）
      let exp = s.pet.exp + gain;
      let level = s.pet.level;
      let bonus = 1;
      if (exp >= 100) { level += 1; exp -= 100; bonus += 20; }
      return {
        ...s, days,
        budget: { ...s.budget,
          spent: s.budget.spent + (inCurrentMonth && !isInc ? entry.amt : 0),
          todaySpent: s.budget.todaySpent + (inCurrentMonth && !isInc ? entry.amt : 0),
          income: s.budget.income + (inCurrentMonth && isInc ? entry.amt : 0) },
        pet: { ...s.pet, coins: s.pet.coins + bonus, exp, level },
      };
    });
    if (willLevel) setTimeout(() => setLevelUp(newLevel), 280);
  };

  const go = (dest, payload) => {
    if (dest === 'record') setRecording(true);
    else if (dest === 'checkin') setCheckin(true);
    else if (dest === 'import') setImporting(true);
    else if (dest === 'editBudget') setEditingBudget(true);
    else if (dest === 'manageCategories') setManagingCats(true);
    else if (dest === 'report') {
      setReportState(payload || monthViewState);
      setShowReport(true);
    }
    else if (dest === 'updateBill') {
      setState((s) => ({
        ...s,
        days: s.days.map((d) => ({
          ...d,
          items: d.items.map((it) => it.id === payload.id ? payload : it),
          total: d.items.reduce((a, it) => a + (it.id === payload.id ? Math.abs(payload.amt) : (it.amt > 0 ? it.amt : 0)), 0),
        })),
      }));
    }
    else if (dest === 'deleteBill') {
      setState((s) => ({
        ...s,
        days: s.days.map((d) => ({ ...d, items: d.items.filter((it) => it.id !== payload.id) })).filter((d) => d.items.length > 0),
      }));
    }
    else setTab(dest);
  };

  const saveBudget = (v) => setState((s) => ({ ...s, budget: { ...s.budget, total: v } }));

  const onImported = (summary) => {
    const entries = summary.entries || [];
    const learnedRules = summary.learnedRules || [];
    const existing = new Set((state.days || []).flatMap((d) => (d.items || []).map(importBillKey)));
    const uniqueEntries = entries.filter((e) => {
      const key = importBillKey(e);
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });
    const skipped = entries.length - uniqueEntries.length;
    const cleanSummary = rebuildImportSummary(summary, uniqueEntries, skipped);
    setState((s) => ({
      ...s,
      learningRules: mergeLearningRules(s.learningRules || [], learnedRules),
      days: uniqueEntries.length ? [
        {
          label: '刚刚导入',
          date: `新增 ${uniqueEntries.length} 笔${skipped ? ` · 跳过 ${skipped} 笔重复` : ''}`,
          total: uniqueEntries.filter((e) => e.amt > 0).reduce((a, e) => a + e.amt, 0),
          items: uniqueEntries,
        },
        ...s.days,
      ] : s.days,
      budget: {
        ...s.budget,
        spent: s.budget.spent + cleanSummary.amount,
        todaySpent: s.budget.todaySpent + cleanSummary.amount,
        income: s.budget.income + (cleanSummary.income || 0),
      },
      byCat: cleanSummary.breakdown ? mergeCats(s.byCat, cleanSummary.breakdown) : s.byCat,
      pet: { ...s.pet, coins: s.pet.coins + cleanSummary.total },
      lastImport: cleanSummary,
    }));
    setToast(uniqueEntries.length
      ? `导入成功：新增 ${uniqueEntries.length} 笔${skipped ? `，跳过 ${skipped} 笔重复` : ''}`
      : `没有新增账单，已跳过 ${skipped} 笔重复`);
    setTimeout(() => setToast(''), 2600);
  };

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box', ...rootVars }}>
      <div className="phone">
        {/* 状态栏 */}
        <div className="statusbar">
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700 }}>9:30</span>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Sig /><Wifi /><Batt />
          </span>
        </div>

        {/* 顶栏 */}
        <div className="appbar">
          {tab === 'home' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pet species={state.pet.species} mood="content" size={30} />
              <span style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 19, color: 'var(--ink)', whiteSpace: 'nowrap' }}>存崽记账</span>
            </div>
          ) : (
            <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>{TITLES[tab]}</span>
          )}
          <button className="om-tap icon-btn" onClick={() => setCheckin(true)}><UiIcon name="cal" size={20} /></button>
        </div>

        {/* 内容 */}
        <div className="screen" key={tab}>
          {tab === 'home' && <Home state={monthViewState} variant={t.homeStyle} go={go} onPrevMonth={prevMonth} onNextMonth={nextMonth} canNextMonth={monthOffset > 0} />}
          {tab === 'bills' && <Bills state={state} go={go} monthOffset={monthOffset} setMonthOffset={setMonthOffset} />}
          {tab === 'goals' && <Goals state={state} setState={setState} />}
          {tab === 'pet' && <PetPage state={state} setState={setState} />}
        </div>

        {/* 底部导航 + 记账 FAB */}
        <div className="navbar">
          {NAV.slice(0, 2).map((n) => <NavBtn key={n.id} n={n} active={tab === n.id} onClick={() => setTab(n.id)} />)}
          <div style={{ width: 64, position: 'relative' }}>
            <button className="om-tap fab" onClick={() => setRecording(true)}>
              <UiIcon name="plus" size={28} stroke={2.6} />
            </button>
          </div>
          {NAV.slice(2).map((n) => <NavBtn key={n.id} n={n} active={tab === n.id} onClick={() => setTab(n.id)} />)}
        </div>

        {/* 记一笔 */}
        {recording && <RecordSheet state={state} onClose={() => setRecording(false)} onSaved={onSaved} />}

        {/* 升级庆祝 */}
        {levelUp && <LevelUpOverlay level={levelUp} species={state.pet.species} onClose={() => setLevelUp(null)} />}

        {/* 打卡日历 */}
        {checkin && <CheckinModal state={state} onClose={() => setCheckin(false)} />}

        {/* 一键导入 */}
        {importing && <ImportSheet state={state} onClose={() => setImporting(false)} onImported={onImported} />}

        {/* 首次进入引导 */}
        {onboarding && <Onboarding onDone={finishOnboarding} />}

        {/* 月预算编辑 */}
        {editingBudget && <BudgetEditSheet state={state} onClose={() => setEditingBudget(false)} onSave={saveBudget} />}
        {managingCats && <CategoryManageSheet state={state} setState={setState} onClose={() => setManagingCats(false)} />}

        {/* 月度小结分享卡 */}
        {showReport && <MonthlyReport state={reportState || monthViewState} onClose={() => { setShowReport(false); setReportState(null); }} />}
        {toast && (
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 88, zIndex: 70, background: 'var(--ink)', color: 'var(--paper)', border: '2px solid var(--paper)', borderRadius: 16, padding: '10px 14px', textAlign: 'center', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, boxShadow: '0 4px 0 rgba(0,0,0,.18)' }}>
            {toast}
          </div>
        )}
      </div>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="首页方向" />
        <TweakRadio label="布局" value={t.homeStyle}
          options={[{ value: 'stage', label: '中心剧场' }, { value: 'data', label: '数据优先' }, { value: 'room', label: '存钱罐小屋' }]}
          onChange={(v) => { setTweak('homeStyle', v); setTab('home'); }} />
        <TweakSection label="主题 & 萌点" />
        <TweakRadio label="配色" value={t.palette}
          options={[{ value: 'warm', label: '暖奶油' }, { value: 'mint', label: '薄荷' }, { value: 'berry', label: '莓果' }]}
          onChange={(v) => setTweak('palette', v)} />
        <TweakToggle label="深色模式" value={t.darkMode} onChange={(v) => setTweak('darkMode', v)} />
        <TweakToggle label="腮红萌点" value={t.blush} onChange={(v) => setTweak('blush', v)} />
        <TweakSection label="演示开关" />
        <TweakToggle label="今天还没记账（空状态）" value={t.todayEmpty} onChange={(v) => { setTweak('todayEmpty', v); setTab('home'); }} />
        <TweakToggle label="再看一次首次引导" value={t.showOnboarding} onChange={(v) => setTweak('showOnboarding', v)} />
        <TweakSection label="宠物心情（预览）" />
        <TweakSelect label="表情" value={t.petMood}
          options={[{ value: 'auto', label: '跟随预算（自动）' }, { value: 'excited', label: '超省·兴奋' }, { value: 'happy', label: '开心' }, { value: 'content', label: '悠着点' }, { value: 'sad', label: '超支·难过' }, { value: 'sleeping', label: '没记账·睡觉' }]}
          onChange={(v) => { setTweak('petMood', v); setTab('home'); }} />
      </TweaksPanel>
    </div>
  );
}

function NavBtn({ n, active, onClick }) {
  return (
    <button className="om-tap navbtn" onClick={onClick} style={{ color: active ? 'var(--ink)' : 'var(--ink-soft)' }}>
      <span style={{ opacity: active ? 1 : 0.7 }}><UiIcon name={n.icon} size={23} stroke={active ? 2.4 : 2} /></span>
      <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, fontWeight: active ? 700 : 500, marginTop: 2 }}>{n.label}</span>
    </button>
  );
}

function mergeCats(base, incoming) {
  const map = new Map(base.map((c) => [c.cat, { ...c }]));
  incoming.forEach((c) => {
    const cur = map.get(c.cat) || { cat: c.cat, amt: 0 };
    map.set(c.cat, { ...cur, amt: cur.amt + c.amt });
  });
  return Array.from(map.values());
}

function mergeLearningRules(base, incoming) {
  const map = new Map((base || []).map((r) => [`${r.pattern}|${r.cat}`, r]));
  (incoming || []).forEach((r) => {
    if (!r || !r.pattern || !r.cat) return;
    map.set(`${r.pattern}|${r.cat}`, { ...r, enabled: r.enabled !== false });
  });
  return Array.from(map.values()).slice(-300);
}

// 状态栏小图标
const Sig = () => <svg width="17" height="13" viewBox="0 0 17 13"><g fill="var(--ink)"><rect x="0" y="9" width="3" height="4" rx="1" /><rect x="4.5" y="6" width="3" height="7" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /><rect x="13.5" y="0" width="3" height="13" rx="1" /></g></svg>;
function importBillKey(item) {
  const time = String(item.time || '').trim().slice(0, 19);
  const note = String(item.note || '').trim().replace(/\s+/g, ' ');
  const amt = Number(item.amt || 0).toFixed(2);
  return `${time}|${amt}|${note}`;
}

function rebuildImportSummary(base, entries, skipped = 0) {
  const breakdownMap = entries.reduce((m, e) => {
    if (e.amt > 0) m[e.cat] = (m[e.cat] || 0) + e.amt;
    return m;
  }, {});
  return {
    ...base,
    entries,
    duplicateSkipped: skipped,
    total: entries.length,
    amount: entries.filter((e) => e.amt > 0).reduce((a, e) => a + e.amt, 0),
    income: Math.abs(entries.filter((e) => e.amt < 0).reduce((a, e) => a + e.amt, 0)),
    breakdown: Object.entries(breakdownMap).map(([cat, amt]) => ({ cat, n: entries.filter((e) => e.cat === cat).length, amt })),
  };
}

const Wifi = () => <svg width="16" height="13" viewBox="0 0 16 13"><path d="M8 11.5l7-8a10 10 0 0 0-14 0l7 8Z" fill="var(--ink)" /></svg>;
const Batt = () => <svg width="24" height="13" viewBox="0 0 24 13"><rect x="1" y="1" width="20" height="11" rx="3" fill="none" stroke="var(--ink)" strokeWidth="1.5" /><rect x="3" y="3" width="13" height="7" rx="1.5" fill="var(--ink)" /><rect x="22" y="4.5" width="2" height="4" rx="1" fill="var(--ink)" /></svg>;

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

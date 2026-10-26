// import.jsx — 账单一键导入（来源选择 → 扫描进度 → 结果归类）
// Exports: ImportSheet

const { useState: useStateI, useEffect: useEffectI } = React;

const SOURCES = [
  { id: 'wechat', label: '微信支付', desc: '账单流水',     bg: '#9DD68A', icon: 'wechat' },
  { id: 'alipay', label: '支付宝',   desc: '消费账单',     bg: '#8FB6E0', icon: 'alipay' },
  { id: 'bank',   label: '银行卡',   desc: '银行流水',     bg: '#F2B33D', icon: 'bank'   },
  { id: 'sms',    label: '短信识别', desc: '自动扫描短信', bg: '#E8A4B8', icon: 'sms'    },
  { id: 'excel',  label: 'Excel 表格', desc: '.xls / .xlsx 文件', bg: '#7FB58C', icon: 'excel' },
  { id: 'csv',    label: 'CSV 文件', desc: '账单导出文件', bg: '#A99B86', icon: 'csv'    },
];

// 来源小图标（简单线条）
function SrcIcon({ name }) {
  const p = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const m = {
    wechat: <g {...p}><path d="M9 5C5.5 5 3 7.4 3 10.2c0 1.7 1 3.2 2.5 4.2L5 16.5l2.5-1.5c.5.1 1 .2 1.5.2" /><circle cx="7" cy="10" r=".8" fill="var(--ink)" /><circle cx="11" cy="10" r=".8" fill="var(--ink)" /><path d="M21 16c0-2.5-2.3-4.5-5-4.5s-5 2-5 4.5c0 1.4.7 2.7 1.9 3.5L13 21l1.8-1c.4.1.8.1 1.2.1" /><circle cx="14" cy="15.5" r=".7" fill="var(--ink)" /><circle cx="18" cy="15.5" r=".7" fill="var(--ink)" /></g>,
    alipay: <g {...p}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7 9h10M8 12h6c2 0 2 3-1 3.5-3 .5-5-1-5-3M14 8v9" strokeWidth="1.8" /></g>,
    bank:   <g {...p}><path d="M3 9l9-5 9 5" /><path d="M5 9v10h14V9" /><path d="M8 12v5M12 12v5M16 12v5M3 20h18" /></g>,
    sms:    <g {...p}><path d="M4 5h16v11H8l-4 4V5Z" /><circle cx="9" cy="11" r=".8" fill="var(--ink)" /><circle cx="12" cy="11" r=".8" fill="var(--ink)" /><circle cx="15" cy="11" r=".8" fill="var(--ink)" /></g>,
    excel:  <g {...p}><path d="M7 3h7l5 5v13H7V3Z" /><path d="M14 3v5h5" /><path d="M9.5 12l5 5M14.5 12l-5 5" strokeWidth="2.2" /></g>,
    csv:    <g {...p}><path d="M7 3h7l5 5v13H7V3Z" /><path d="M14 3v5h5" /><path d="M9 14h6M9 17h6M9 11h3" strokeWidth="1.8" /></g>,
  };
  return <svg width="32" height="32" viewBox="0 0 24 24">{m[name]}</svg>;
}

function guessCustomCategoryLegacy(text, amount) {
  const s = String(text || '').toLowerCase();
  const cats = window.__CUNZAI_CATEGORIES || [];
  for (const c of cats) {
    if (!c || !c.id || c.visible === false) continue;
    if (amount < 0 && !c.income) continue;
    if (amount > 0 && c.income) continue;
    const words = String(c.keywords || '').split(/[,，、\s\n]+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (words.some((w) => s.includes(w))) return c.id;
  }
  return null;
}

function activeImportCategories(categories) {
  return categories || window.__CUNZAI_CATEGORIES || [];
}

function activeLearningRules(rules) {
  return (rules || window.__CUNZAI_LEARNING_RULES || []).filter((r) => r && r.enabled !== false && r.pattern && r.cat);
}

function normalizeMatchText(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, '');
}

function extractRulePattern(text) {
  const raw = String(text || '').split(/[·|｜\-—]/)[0].trim();
  const cleaned = raw.replace(/\s+/g, '').slice(0, 24);
  return cleaned.length >= 2 ? cleaned : String(text || '').trim().slice(0, 24);
}

function guessLearningRuleCategory(text, amount, rules, categories) {
  const s = normalizeMatchText(text);
  const cats = new Map(activeImportCategories(categories).map((c) => [c.id, c]));
  for (const rule of activeLearningRules(rules)) {
    const cat = cats.get(rule.cat);
    if (!cat || cat.visible === false) continue;
    if (amount < 0 && !cat.income) continue;
    if (amount > 0 && cat.income) continue;
    if (s.includes(normalizeMatchText(rule.pattern))) return rule.cat;
  }
  return null;
}

function splitCategoryWords(c) {
  return [
    c.label,
    c.id && String(c.id).startsWith('custom_') ? '' : c.id,
    c.keywords,
  ].filter(Boolean).join(',').split(/[,，、;\s\n]+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
}

function guessCustomCategory(text, amount, categories) {
  const s = String(text || '').toLowerCase();
  const cats = activeImportCategories(categories);
  for (const c of cats) {
    if (!c || !c.id || c.visible === false) continue;
    if (amount < 0 && !c.income) continue;
    if (amount > 0 && c.income) continue;
    const words = splitCategoryWords(c);
    if (words.some((w) => s.includes(w))) return c.id;
  }
  return null;
}

function ImportSheet({ state, onClose, onImported }) {
  const [step, setStep] = useStateI('pick');    // pick → scanning → result
  const [source, setSource] = useStateI(null);
  const [progress, setProgress] = useStateI(0);
  const [phase, setPhase] = useStateI(0);
  const [parsed, setParsed] = useStateI(null);

  const PHASES = ['连接来源', '识别交易', '智能归类', '喂给存崽'];

  // 扫描进度模拟
  useEffectI(() => {
    if (step !== 'scanning') return;
    let p = 0, ph = 0;
    const id = setInterval(() => {
      p += 4 + Math.random() * 5;
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(() => setStep('result'), 350); }
      setProgress(p);
      setPhase(Math.min(3, Math.floor(p / 25)));
    }, 90);
    return () => clearInterval(id);
  }, [step]);

  const start = (src) => {
    setSource(src);
    setParsed(null);
    if (src.id === 'csv' || src.id === 'excel') setStep('file');
    else setStep('scanning');
    setProgress(0);
    setPhase(0);
  };

  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px 14px' }}>
          <button className="om-tap icon-btn" onClick={onClose}><UiIcon name="close" size={22} /></button>
          <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>
            {step === 'pick' && '一键导入账单'}
            {step === 'scanning' && '正在导入…'}
            {step === 'result' && '导入完成'}
          </span>
          <div style={{ width: 38 }} />
        </div>

        {step === 'pick' && <Pick state={state} onPick={start} />}
        {step === 'file' && <FileImport state={state} source={source} onParsed={(summary) => { setParsed(summary); setStep('result'); }} />}
        {step === 'scanning' && <Scanning state={state} source={source} progress={progress} phase={phase} phases={PHASES} />}
        {step === 'result' && <Result state={state} source={source} parsed={parsed} onClose={onClose} onImported={onImported} />}
      </div>
    </div>
  );
}

function Pick({ state, onPick }) {
  return (
    <div style={{ padding: '0 2px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 18 }}>
        <div style={{ flexShrink: 0, marginBottom: -6 }}><Pet species={state.pet.species} mood="excited" size={70} /></div>
        <div style={{ flex: 1, marginBottom: 6 }}>
          <SpeechBubble tail="left" tone="happy">
            <span style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 13.5, color: 'var(--ink)' }}>选个来源，我帮你扫干净！</span>
          </SpeechBubble>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
        {SOURCES.map((s) => (
          <button key={s.id} className="om-tap" onClick={() => onPick(s)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
            border: '2px solid var(--ink)', borderRadius: 16, background: 'var(--paper)', cursor: 'pointer', boxShadow: '0 3px 0 var(--ink)' }}>
            <span style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', flexShrink: 0 }}>
              <SrcIcon name={s.icon} />
            </span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{s.label}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>{s.desc}</div>
            </div>
            <span style={{ color: 'var(--ink-soft)' }}><UiIcon name="arrow" size={18} /></span>
          </button>
        ))}
      </div>
      <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)', textAlign: 'center', padding: '8px 16px 4px', lineHeight: 1.5 }}>
        所有账单都在本地处理 · 存崽不会偷看 🤫
      </div>
    </div>
  );
}

function parseCsvLine(line) {
  const out = [];
  let cur = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function guessCat(text, amount) {
  const s = String(text || '').toLowerCase();
  if (amount < 0 || /工资|薪|收入|转入|到账|salary/.test(s)) return 'salary';
  if (/咖啡|奶茶|coffee/.test(s)) return 'coffee';
  if (/餐|饭|吃|外卖|food/.test(s)) return 'food';
  if (/地铁|公交|打车|交通|taxi|metro/.test(s)) return 'transit';
  if (/衣|买|购物|shop|store/.test(s)) return 'shop';
  if (/电影|娱乐|游戏|fun/.test(s)) return 'fun';
  if (/房|水电|居家|home/.test(s)) return 'home';
  if (/课|书|学习|study/.test(s)) return 'study';
  return 'other';
}

function parseAmountCell(value) {
  const text = String(value ?? '').trim();
  const negative = /^\(.*\)$/.test(text) || /^-/.test(text);
  const n = Number(text.replace(/[()¥￥,\s]/g, ''));
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : Math.abs(n);
}

function buildRowsSummary(rows, sourceName) {
  rows = rows.map((r) => r.map((v) => String(v ?? '').trim())).filter((r) => r.some(Boolean));
  if (!rows.length) throw new Error(`${sourceName} 文件是空的`);
  const first = rows[0].map((h) => h.toLowerCase());
  const hasHeader = first.some((h) => /amount|金额|交易金额|money|日期|date|time|note|备注|描述|商户|分类|category|收支|类型|type/.test(h));
  const body = hasHeader ? rows.slice(1) : rows;
  const idx = (names, fallback) => {
    if (!hasHeader) return fallback;
    const i = first.findIndex((h) => names.some((n) => h.includes(n)));
    return i >= 0 ? i : fallback;
  };
  const dateIdx = idx(['date', '日期', '时间', 'time'], 0);
  const noteIdx = idx(['note', '备注', '描述', '商户', '对方', '商品', 'title'], 1);
  const amountIdx = idx(['amount', '交易金额', '金额', 'money', 'amt'], 2);
  const catIdx = idx(['category', '分类', 'cat'], -1);
  const typeIdx = idx(['收支', '类型', 'type', '方向'], -1);
  const flowIdx = headers.findIndex((h) => h.includes('收/支') || h.includes('收支') || h.includes('方向'));
  const transactionTypeIdx = headers.findIndex((h) => h.includes('交易类型'));

  const entries = body.map((r, i) => {
    const rawAmount = parseAmountCell(r[amountIdx]);
    if (!Number.isFinite(rawAmount) || rawAmount === 0) return null;
    const note = r[noteIdx] || `${sourceName} 导入 ${i + 1}`;
    const typeText = String(flowIdx >= 0 ? r[flowIdx] : (typeIdx >= 0 ? r[typeIdx] : ''));
    const transactionTypeText = String(transactionTypeIdx >= 0 ? r[transactionTypeIdx] : '');
    const catText = String(catIdx >= 0 ? r[catIdx] : '');
    const cat = catText ? guessCat(catText + note, rawAmount) : guessCat(note, rawAmount);
    const isIncome = /收入|入账|收款|转入|credit|income/i.test(typeText) || (!/支出|付款|转出|debit|expense/i.test(typeText) && cat === 'salary');
    const amount = isIncome ? -Math.abs(rawAmount) : Math.abs(rawAmount);
    return {
      id: sourceName.toLowerCase() + Date.now() + '-' + i,
      cat,
      note,
      amt: amount,
      time: r[dateIdx] || '导入',
    };
  }).filter(Boolean);
  if (!entries.length) throw new Error(`没有识别到有效金额，请确认 ${sourceName} 至少包含 金额/amount 列`);
  const breakdownMap = entries.reduce((m, e) => {
    if (e.amt > 0) m[e.cat] = (m[e.cat] || 0) + e.amt;
    return m;
  }, {});
  return {
    total: entries.length,
    amount: entries.filter((e) => e.amt > 0).reduce((a, e) => a + e.amt, 0),
    income: Math.abs(entries.filter((e) => e.amt < 0).reduce((a, e) => a + e.amt, 0)),
    days: 1,
    entries,
    breakdown: Object.entries(breakdownMap).map(([cat, amt]) => ({ cat, n: entries.filter((e) => e.cat === cat).length, amt })),
  };
}

function guessCatV2(text, amount) {
  const s = String(text || '').toLowerCase();
  if (amount < 0 || /工资|薪|收入|转入|到账|退款|退货|salary|income|refund/.test(s)) return 'salary';
  if (/咖啡|奶茶|茶饮|星巴克|瑞幸|蜜雪|coffee/.test(s)) return 'coffee';
  if (/餐|饭|吃|外卖|美团|饿了么|烧烤|面|粉|食品|food/.test(s)) return 'food';
  if (/地铁|公交|打车|停车|高速|加油|交通|顺易通|taxi|metro/.test(s)) return 'transit';
  if (/衣|买|购物|拼多多|淘宝|京东|唯品会|超市|shop|store/.test(s)) return 'shop';
  if (/电影|娱乐|游戏|心跳顽家|fun/.test(s)) return 'fun';
  if (/房|水电|物业|居家|家政|home/.test(s)) return 'home';
  if (/课|书|学习|教育|培训|study/.test(s)) return 'study';
  return 'other';
}

function guessCatSmart(text, amount, fallback = 'other', categories, rules) {
  const learned = guessLearningRuleCategory(text, amount, rules, categories);
  if (learned) return learned;
  const custom = guessCustomCategory(text, amount, categories);
  if (custom) return custom;
  const s = String(text || '').toLowerCase();
  if (amount < 0 || /工资|薪资|收入|入账|转入|到账|退款|退货|salary|income|refund/.test(s)) return 'salary';
  if (/咖啡|奶茶|茶饮|星巴克|瑞幸|蜜雪|糖水|凉茶|鲜啤|煲珠公|coffee|drink/.test(s)) return 'coffee';
  if (/地铁|公交|打车|停车|停车场|临停|高速|加油|交通|顺易通|pp停车|粤bhb|安宏基|taxi|metro/.test(s)) return 'transit';
  if (/燃气|供电|水务|电费|水费|话费|手机充值|生活缴费|物业|房租|宽带|充电|充电宝|润诚达|龙和苑|home/.test(s)) return 'home';
  if (/拼多多|淘宝|天猫|京东|唯品会|微信小店|开市客|costco|超市|服装|专卖|批发|库存|古玩|商品付款|洗发|石斛|清货|购物|shop|store/.test(s)) return 'shop';
  if (/电影|影院|影城|游戏|娱乐|ktv|心跳顽家|fun/.test(s)) return 'fun';
  if (/美团|外卖|饿了么|餐饮|烧烤|砂锅粥|粥|面馆|抻面|牛肉汤|中餐馆|小馆|粉|包子|鲜包|面包|小面|烧鸡|大牌档|麻辣|点餐|堂食|收银|饭|菜|食|food/.test(s)) return 'food';
  if (/医院|药|医疗|门诊|诊所|杏林|health/.test(s)) return 'health';
  if (/课程|学习|教育|培训|书|study/.test(s)) return 'study';
  if (/红包|转账|群收款|二维码收款|扫二维码付款/.test(s)) return 'transfer';
  return fallback || 'other';
}

function parseAmountCellV2(value) {
  const text = String(value ?? '').trim();
  const negative = /^\(.*\)$/.test(text) || /^-/.test(text);
  const n = Number(text.replace(/[()¥￥元,\s]/g, ''));
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : Math.abs(n);
}

function buildRowsSummaryV2(rows, sourceName) {
  rows = rows.map((r) => r.map((v) => String(v ?? '').trim())).filter((r) => r.some(Boolean));
  if (!rows.length) throw new Error(`${sourceName} 文件是空的`);

  const headerPattern = /amount|金额|交易金额|金额\(元\)|money|日期|交易时间|date|time|note|备注|描述|商户|交易对方|商品|分类|category|收\/支|收支|类型|交易类型|type/;
  const headerRow = rows.findIndex((r) => r.map((h) => h.toLowerCase()).filter((h) => headerPattern.test(h)).length >= 2);
  const headers = headerRow >= 0 ? rows[headerRow].map((h) => h.toLowerCase()) : rows[0].map((h) => h.toLowerCase());
  const hasHeader = headerRow >= 0;
  const body = hasHeader ? rows.slice(headerRow + 1) : rows;
  const idx = (names, fallback) => {
    if (!hasHeader) return fallback;
    const i = headers.findIndex((h) => names.some((n) => h.includes(n)));
    return i >= 0 ? i : fallback;
  };

  const dateIdx = idx(['date', '日期', '时间', '交易时间', 'time'], 0);
  const noteIdx = idx(['note', '备注', '描述', '商户', '交易对方', '对方', '商品', 'title'], 1);
  const productIdx = idx(['商品', '描述', '说明'], -1);
  const amountIdx = idx(['amount', '交易金额', '金额', '金额(元)', 'money', 'amt'], 2);
  const catIdx = idx(['category', '分类', 'cat'], -1);
  const typeIdx = idx(['收/支', '收支', '类型', '交易类型', 'type', '方向'], -1);

  const entries = body.map((r, i) => {
    const rawAmount = parseAmountCellV2(r[amountIdx]);
    if (!Number.isFinite(rawAmount) || rawAmount === 0) return null;
    const typeText = String(typeIdx >= 0 ? r[typeIdx] : '');
    if (/中性|不计收支|neutral/i.test(typeText)) return null;

    const noteParts = [transactionTypeText, r[noteIdx], productIdx >= 0 ? r[productIdx] : ''].filter(Boolean);
    const note = noteParts.join(' · ') || `${sourceName} 导入 ${i + 1}`;
    const catText = String(catIdx >= 0 ? r[catIdx] : '');
    const cat = catText ? guessCatV2(catText + note, rawAmount) : guessCatV2(`${typeText} ${transactionTypeText} ${note}`, rawAmount);
    const isIncome = /收入|入账|收款|转入|credit|income/i.test(typeText) || (!/支出|付款|转出|debit|expense/i.test(typeText) && cat === 'salary');
    return {
      id: sourceName.toLowerCase() + Date.now() + '-' + i,
      cat,
      note,
      amt: isIncome ? -Math.abs(rawAmount) : Math.abs(rawAmount),
      time: r[dateIdx] || '导入',
    };
  }).filter(Boolean);

  if (!entries.length) throw new Error(`没有识别到有效金额，请确认 ${sourceName} 至少包含 金额/amount 列`);
  const breakdownMap = entries.reduce((m, e) => {
    if (e.amt > 0) m[e.cat] = (m[e.cat] || 0) + e.amt;
    return m;
  }, {});
  return {
    total: entries.length,
    amount: entries.filter((e) => e.amt > 0).reduce((a, e) => a + e.amt, 0),
    income: Math.abs(entries.filter((e) => e.amt < 0).reduce((a, e) => a + e.amt, 0)),
    days: new Set(entries.map((e) => String(e.time).slice(0, 10))).size || 1,
    entries,
    breakdown: Object.entries(breakdownMap).map(([cat, amt]) => ({ cat, n: entries.filter((e) => e.cat === cat).length, amt })),
  };
}

function orderBreakdownByCategories(breakdown, categories) {
  const order = new Map(activeImportCategories(categories).map((c, i) => [c.id, i]));
  return [...breakdown].sort((a, b) => (order.get(a.cat) ?? 999) - (order.get(b.cat) ?? 999));
}

function buildRowsSummaryV3(rows, sourceName, categories, rules) {
  rows = rows.map((r) => r.map((v) => String(v ?? '').trim())).filter((r) => r.some(Boolean));
  if (!rows.length) throw new Error(`${sourceName} 文件是空的`);

  const headerPattern = /amount|金额|交易金额|金额\(元\)|money|日期|交易时间|date|time|note|备注|描述|商户|交易对方|商品|分类|category|收\/支|收支|类型|交易类型|type/;
  const headerRow = rows.findIndex((r) => r.map((h) => h.toLowerCase()).filter((h) => headerPattern.test(h)).length >= 2);
  const headers = headerRow >= 0 ? rows[headerRow].map((h) => h.toLowerCase()) : rows[0].map((h) => h.toLowerCase());
  const body = headerRow >= 0 ? rows.slice(headerRow + 1) : rows;
  const idx = (names, fallback) => {
    const i = headers.findIndex((h) => names.some((n) => h.includes(n)));
    return i >= 0 ? i : fallback;
  };

  const dateIdx = idx(['date', '日期', '时间', '交易时间', 'time'], 0);
  const noteIdx = idx(['note', '备注', '描述', '商户', '交易对方', '对方', '商品', 'title'], 1);
  const productIdx = idx(['商品', '描述', '说明'], -1);
  const amountIdx = idx(['amount', '交易金额', '金额', '金额(元)', 'money', 'amt'], 2);
  const catIdx = idx(['category', '分类', 'cat'], -1);
  const flowIdx = headers.findIndex((h) => h.includes('收/支') || h.includes('收支') || h.includes('方向'));
  const genericTypeIdx = idx(['类型', 'type'], -1);
  const transactionTypeIdx = headers.findIndex((h) => h.includes('交易类型'));

  const entries = body.map((r, i) => {
    const rawAmount = parseAmountCellV2(r[amountIdx]);
    if (!Number.isFinite(rawAmount) || rawAmount === 0) return null;
    const flowText = String(flowIdx >= 0 ? r[flowIdx] : (genericTypeIdx >= 0 ? r[genericTypeIdx] : ''));
    if (/中性|不计收支|neutral/i.test(flowText) || /^\/+$/.test(flowText)) return null;

    const transactionTypeText = String(transactionTypeIdx >= 0 ? r[transactionTypeIdx] : '');
    const noteParts = [r[noteIdx], productIdx >= 0 ? r[productIdx] : ''].filter(Boolean);
    const note = noteParts.join(' · ') || `${sourceName} 导入 ${i + 1}`;
    const catText = String(catIdx >= 0 ? r[catIdx] : '');
    const guessText = catText ? catText + note : `${flowText} ${transactionTypeText} ${note}`;
    const cat = guessCatSmart(guessText, rawAmount, 'other', categories, rules);
    const isIncome = /收入|入账|收款|转入|credit|income/i.test(flowText) || (!/支出|付款|转出|debit|expense/i.test(flowText) && cat === 'salary');
    return {
      id: sourceName.toLowerCase() + Date.now() + '-' + i,
      cat,
      originalCat: cat,
      note,
      amt: isIncome ? -Math.abs(rawAmount) : Math.abs(rawAmount),
      time: r[dateIdx] || '导入',
    };
  }).filter(Boolean);

  if (!entries.length) throw new Error(`没有识别到有效金额，请确认 ${sourceName} 至少包含 金额/amount 列`);
  const breakdownMap = entries.reduce((m, e) => {
    if (e.amt > 0) m[e.cat] = (m[e.cat] || 0) + e.amt;
    return m;
  }, {});
  return {
    total: entries.length,
    amount: entries.filter((e) => e.amt > 0).reduce((a, e) => a + e.amt, 0),
    income: Math.abs(entries.filter((e) => e.amt < 0).reduce((a, e) => a + e.amt, 0)),
    days: new Set(entries.map((e) => String(e.time).slice(0, 10))).size || 1,
    entries,
    breakdown: orderBreakdownByCategories(Object.entries(breakdownMap).map(([cat, amt]) => ({ cat, n: entries.filter((e) => e.cat === cat).length, amt })), categories),
  };
}

function buildCsvSummary(text, categories, rules) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return buildRowsSummaryV3(lines.map(parseCsvLine), 'CSV', categories, rules);
}

function buildExcelSummary(buffer, categories, rules) {
  if (!window.XLSX) throw new Error('Excel 解析库还没有加载完成，请检查网络后重试');
  const book = XLSX.read(buffer, { type: 'array' });
  const sheetName = book.SheetNames[0];
  if (!sheetName) throw new Error('Excel 文件里没有工作表');
  const rows = XLSX.utils.sheet_to_json(book.Sheets[sheetName], { header: 1, raw: false, defval: '' });
  return buildRowsSummaryV3(rows, 'Excel', categories, rules);
}

function FileImport({ state, source, onParsed }) {
  const [error, setError] = useStateI('');
  const load = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const summary = source.id === 'excel'
          ? buildExcelSummary(reader.result, state.categories, state.learningRules)
          : buildCsvSummary(String(reader.result || ''), state.categories, state.learningRules);
        onParsed(summary);
      }
      catch (e) { setError(e.message || '解析失败'); }
    };
    reader.onerror = () => setError('读取文件失败');
    if (source.id === 'excel') reader.readAsArrayBuffer(file);
    else reader.readAsText(file, 'utf-8');
  };
  const isExcel = source.id === 'excel';
  return (
    <div style={{ padding: '10px 4px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 18 }}>
        <Pet species="pig" mood="excited" size={76} />
        <SpeechBubble tail="left" tone="happy">选择 {isExcel ? 'Excel' : 'CSV'} 文件，我会按金额和备注帮你归类。</SpeechBubble>
      </div>
      <label className="om-tap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        minHeight: 150, border: '2px dashed var(--ink)', borderRadius: 18, background: 'var(--paper-2)', cursor: 'pointer',
        fontFamily: "'Noto Sans SC'", color: 'var(--ink)', textAlign: 'center', padding: 18 }}>
        <UiIcon name="arrow" size={28} />
        <strong>选择 {source.label} 文件</strong>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>支持列名：日期/时间、备注/描述/商户、金额/交易金额、分类、收支/类型；没有表头时默认前三列为日期/备注/金额。</span>
        <input type="file" accept={isExcel ? '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' : '.csv,text/csv'} onChange={(e) => load(e.target.files && e.target.files[0])} style={{ display: 'none' }} />
      </label>
      {error && <div style={{ marginTop: 12, border: '2px solid var(--ink)', borderRadius: 14, padding: 10, background: 'var(--coral-tint)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontSize: 12.5 }}>{error}</div>}
    </div>
  );
}

function Scanning({ state, source, progress, phase, phases }) {
  return (
    <div style={{ padding: '8px 8px 22px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 18px' }}>
        <div style={{ position: 'relative' }}>
          <Pet species={state.pet.species} mood="excited" size={150} />
          {/* 扫描的硬币雨 */}
          <span className="scan-coin scan-coin-1">¥</span>
          <span className="scan-coin scan-coin-2">¥</span>
          <span className="scan-coin scan-coin-3">¥</span>
        </div>
      </div>
      <div style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 17, color: 'var(--ink)' }}>正在从{source.label}导入</div>
      <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>{phases[phase]}…</div>

      <div style={{ margin: '20px 4px 14px' }}>
        <Bar value={progress} max={100} color="var(--honey)" h={14} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
        {phases.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: i <= phase ? 1 : 0.4 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--ink)',
              background: i <= phase ? 'var(--honey)' : 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
              {i < phase ? <UiIcon name="check" size={13} /> : <span style={{ fontFamily: "'Baloo 2'", fontSize: 11, fontWeight: 800 }}>{i + 1}</span>}
            </span>
            <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 10.5, fontWeight: 700, color: 'var(--ink-soft)' }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Result({ state, source, parsed, onClose, onImported }) {
  const initialSummary = parsed || {
    total: 23, amount: 1248, days: 12,
    breakdown: [
      { cat: 'food', n: 8, amt: 432 },
      { cat: 'shop', n: 4, amt: 360 },
      { cat: 'transit', n: 4, amt: 88 },
      { cat: 'other', n: 2, amt: 170 },
    ],
  };
  const [summary, setSummary] = useStateI(initialSummary);
  const [learnRules, setLearnRules] = useStateI(true);
  const catOptions = (state.categories || []).filter((c) => c.visible !== false);
  const rebuildSummary = (entries) => {
    const breakdownMap = entries.reduce((m, e) => {
      if (e.amt > 0) m[e.cat] = (m[e.cat] || 0) + e.amt;
      return m;
    }, {});
    return {
      ...summary,
      entries,
      amount: entries.filter((e) => e.amt > 0).reduce((a, e) => a + e.amt, 0),
      income: Math.abs(entries.filter((e) => e.amt < 0).reduce((a, e) => a + e.amt, 0)),
      breakdown: orderBreakdownByCategories(Object.entries(breakdownMap).map(([cat, amt]) => ({ cat, n: entries.filter((e) => e.cat === cat).length, amt })), state.categories),
    };
  };
  const changeGroupCat = (fromCat, toCat) => {
    if (!summary.entries || fromCat === toCat) return;
    const entries = summary.entries.map((e) => e.cat === fromCat ? { ...e, cat: toCat, adjusted: e.originalCat !== toCat } : e);
    setSummary(rebuildSummary(entries));
  };
  const buildLearnedRules = () => {
    if (!learnRules || !summary.entries) return [];
    const seen = new Set();
    return summary.entries
      .filter((e) => e.adjusted && e.amt > 0)
      .map((e) => ({ pattern: extractRulePattern(e.note), cat: e.cat }))
      .filter((r) => {
        const key = `${r.pattern}|${r.cat}`;
        if (!r.pattern || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((r) => ({ id: 'lr' + Date.now() + Math.random().toString(36).slice(2, 7), ...r, enabled: true, createdAt: Date.now() }));
  };
  return (
    <div style={{ padding: '0 2px 6px' }}>
      <div style={{ background: 'var(--coral-tint)', border: '2px solid var(--ink)', borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ flexShrink: 0 }}><Pet species={state.pet.species} mood="excited" size={64} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>导入完成，识别到 {summary.total} 笔</div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>支出 ¥{fmt(summary.amount)}{summary.income ? ` · 收入 ¥${fmt(summary.income)}` : ''} · 可先调整再导入</div>
        </div>
      </div>

      <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', padding: '0 2px 10px' }}>归类预览</div>
      <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 16, padding: 6 }}>
        {(summary.breakdown || []).map((b, i) => (
          <div key={b.cat} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderBottom: i === summary.breakdown.length - 1 ? 'none' : '2px dashed var(--hair)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 11, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (CATS[b.cat] || CATS.other).tint, flexShrink: 0 }}>
              <CatIcon name={b.cat} size={20} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{(CATS[b.cat] || CATS.other).label}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>{b.n} 笔 · ¥{fmt(b.amt)}</div>
            </div>
            {summary.entries && (
              <select value={b.cat} onChange={(e) => changeGroupCat(b.cat, e.target.value)} style={{ border: '2px solid var(--ink)', borderRadius: 12, padding: '7px 8px', background: 'var(--paper)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 12, maxWidth: 94 }}>
                {catOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>

      {summary.entries && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontFamily: "'Noto Sans SC'", fontSize: 12.5, fontWeight: 700, color: 'var(--ink-soft)' }}>
          <input type="checkbox" checked={learnRules} onChange={(e) => setLearnRules(e.target.checked)} />
          记住我调整过的商户/备注，下次自动归类
        </label>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="om-tap" onClick={onClose} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: '13px', background: 'var(--paper)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>重新选择</button>
        <button className="om-tap" onClick={() => { onImported && onImported({ ...summary, learnedRules: buildLearnedRules() }); onClose(); }} style={{ flex: 1.4, border: '2px solid var(--ink)', borderRadius: 16, padding: '13px', background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)' }}>
          <UiIcon name="check" size={16} /> 全部导入
        </button>
      </div>
    </div>
  );
}

function ResultLegacy({ state, source, parsed, onClose, onImported }) {
  // 模拟解析结果
  const initialSummary = parsed || {
    total: 23, amount: 1248, days: 12,
    breakdown: [
      { cat: 'food',   n: 8, amt: 432 },
      { cat: 'coffee', n: 5, amt: 198 },
      { cat: 'shop',   n: 4, amt: 360 },
      { cat: 'transit',n: 4, amt: 88 },
      { cat: 'other',  n: 2, amt: 170 },
    ],
  };
  const [summary, setSummary] = useStateI(initialSummary);
  const [learnRules, setLearnRules] = useStateI(true);
  const catOptions = (state.categories || []).filter((c) => c.visible !== false);
  const rebuildSummary = (entries) => {
    const breakdownMap = entries.reduce((m, e) => {
      if (e.amt > 0) m[e.cat] = (m[e.cat] || 0) + e.amt;
      return m;
    }, {});
    return {
      ...summary,
      entries,
      amount: entries.filter((e) => e.amt > 0).reduce((a, e) => a + e.amt, 0),
      income: Math.abs(entries.filter((e) => e.amt < 0).reduce((a, e) => a + e.amt, 0)),
      breakdown: orderBreakdownByCategories(Object.entries(breakdownMap).map(([cat, amt]) => ({ cat, n: entries.filter((e) => e.cat === cat).length, amt })), state.categories),
    };
  };
  const changeGroupCat = (fromCat, toCat) => {
    if (!summary.entries || fromCat === toCat) return;
    const entries = summary.entries.map((e) => e.cat === fromCat ? { ...e, cat: toCat, adjusted: e.originalCat !== toCat } : e);
    setSummary(rebuildSummary(entries));
  };
  const buildLearnedRules = () => {
    if (!learnRules || !summary.entries) return [];
    const seen = new Set();
    return summary.entries
      .filter((e) => e.adjusted && e.amt > 0)
      .map((e) => ({ pattern: extractRulePattern(e.note), cat: e.cat }))
      .filter((r) => {
        const key = `${r.pattern}|${r.cat}`;
        if (!r.pattern || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((r) => ({ id: 'lr' + Date.now() + Math.random().toString(36).slice(2, 7), ...r, enabled: true, createdAt: Date.now() }));
  };
  return (
    <div style={{ padding: '0 2px 6px' }}>
      <div style={{ background: 'var(--coral-tint)', border: '2px solid var(--ink)', borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ flexShrink: 0 }}><Pet species={state.pet.species} mood="excited" size={64} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>哇！吃饱啦，扫到 {summary.total} 笔</div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>共 ¥{fmt(summary.amount)} · {summary.income ? `收入 ¥${fmt(summary.income)} · ` : ''}跨 {summary.days} 天 · 已自动归类</div>
        </div>
      </div>

      <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', padding: '0 2px 10px' }}>归类预览</div>
      <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 16, padding: 6 }}>
        {summary.breakdown.map((b, i) => (
          <div key={b.cat} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px', borderBottom: i === summary.breakdown.length - 1 ? 'none' : '2px dashed var(--hair)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 11, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATS[b.cat].tint, flexShrink: 0 }}>
              <CatIcon name={b.cat} size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{CATS[b.cat].label}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>{b.n} 笔</div>
            </div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 16, color: 'var(--ink)', whiteSpace: 'nowrap' }}>¥{fmt(b.amt)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="om-tap" onClick={onClose} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: '13px', background: 'var(--paper)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>调整后导入</button>
        <button className="om-tap" onClick={() => { onImported && onImported(summary); onClose(); }} style={{ flex: 1.4, border: '2px solid var(--ink)', borderRadius: 16, padding: '13px', background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)' }}>
          <UiIcon name="check" size={16} /> 全部导入
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ImportSheet, guessCatSmart });

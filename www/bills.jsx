// bills.jsx — 账单流水 + 统计图表
// Exports: Bills

const { useState: useStateB } = React;

function Bills({ state, go, monthOffset: externalMonthOffset, setMonthOffset: setExternalMonthOffset }) {
  const [tab, setTab] = useStateB('flow');
  const [localMonthOffset, setLocalMonthOffset] = useStateB(0);
  const monthOffset = typeof externalMonthOffset === 'number' ? externalMonthOffset : localMonthOffset;
  const setMonthOffset = setExternalMonthOffset || setLocalMonthOffset;
  const viewState = buildMonthViewReal(state, monthOffset);
  return (
    <div style={{ padding: '4px 0 24px' }}>
      {/* 切换 */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 18px 4px' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 999, padding: 3 }}>
          {[['flow', '流水'], ['stats', '统计']].map(([k, l]) => (
            <button key={k} className="om-tap" onClick={() => setTab(k)} style={{
              border: 'none', borderRadius: 999, padding: '7px 26px', cursor: 'pointer',
              background: tab === k ? 'var(--ink)' : 'transparent', color: tab === k ? 'var(--paper)' : 'var(--ink-soft)',
              fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14 }}>{l}</button>
          ))}
        </div>
      </div>
      {tab === 'flow'
        ? <Flow key={viewState.budget.month} state={viewState} go={go} onPrev={() => setMonthOffset((m) => Math.min(11, m + 1))} onNext={() => setMonthOffset((m) => Math.max(0, m - 1))} canNext={monthOffset > 0} />
        : <Stats state={viewState} allState={state} monthOffset={monthOffset} go={go} />}
    </div>
  );
}

function buildMonthView(state, offset) {
  if (!offset) return state;
  const factor = Math.max(0.42, 1 - offset * 0.08);
  const monthNum = Math.max(1, 5 - offset);
  const scaled = (n) => Math.max(0, Math.round(n * factor));
  const days = state.days.map((d, idx) => ({
    ...d,
    label: idx === 0 ? `${monthNum}月${Math.max(1, 28 - idx)}日` : `${monthNum}月${Math.max(1, 28 - idx * 3)}日`,
    date: idx === 0 ? '历史账单' : d.date,
    total: d.isIncome ? -scaled(Math.abs(d.total)) : scaled(d.total),
    items: d.items.map((it) => ({ ...it, id: `m${offset}-${it.id}`, amt: it.amt < 0 ? -scaled(Math.abs(it.amt)) : scaled(it.amt) })),
  }));
  return {
    ...state,
    budget: {
      ...state.budget,
      month: `${monthNum} 月`,
      spent: scaled(state.budget.spent),
      todaySpent: 0,
      income: scaled(state.budget.income),
    },
    days,
    byCat: state.byCat.map((c) => ({ ...c, amt: scaled(c.amt) })),
    week: state.week.map((w) => ({ ...w, v: scaled(w.v) })),
  };
}

function buildMonthViewReal(state, offset) {
  const base = new Date();
  const target = new Date(base.getFullYear(), base.getMonth() - offset, 1);
  const grouped = new Map();

  (state.days || []).forEach((day) => {
    (day.items || []).forEach((it) => {
      const parsed = parseBillDate(it.time);
      if (!parsed) return;
      if (parsed.getFullYear() !== target.getFullYear() || parsed.getMonth() !== target.getMonth()) {
        return;
      }
      const key = formatDateKey(parsed);
      if (!grouped.has(key)) {
        grouped.set(key, {
          label: parsed ? `${parsed.getMonth() + 1}月${parsed.getDate()}日` : day.label,
          date: parsed ? weekdayName(parsed) : (day.date || '未记录日期'),
          sort: parsed.getTime(),
          items: [],
        });
      }
      grouped.get(key).items.push(it);
    });
  });

  const days = Array.from(grouped.values()).map((d) => {
    const spent = d.items.filter((it) => it.amt > 0).reduce((a, it) => a + it.amt, 0);
    const income = d.items.filter((it) => it.amt < 0).reduce((a, it) => a + Math.abs(it.amt), 0);
    return {
      ...d,
      total: spent || -income,
      isIncome: spent === 0 && income > 0,
      items: d.items.sort((a, b) => (parseBillDate(b.time)?.getTime() || 0) - (parseBillDate(a.time)?.getTime() || 0)),
    };
  }).sort((a, b) => b.sort - a.sort);

  const spent = days.reduce((a, d) => a + d.items.filter((it) => it.amt > 0).reduce((s, it) => s + it.amt, 0), 0);
  const income = days.reduce((a, d) => a + d.items.filter((it) => it.amt < 0).reduce((s, it) => s + Math.abs(it.amt), 0), 0);
  const latestDay = days[0] || null;
  const latestDaySpent = latestDay
    ? latestDay.items.filter((it) => it.amt > 0).reduce((s, it) => s + it.amt, 0)
    : 0;
  return {
    ...state,
    budget: { ...state.budget, month: `${target.getMonth() + 1} 月`, dateLabel: latestDay ? latestDay.label : `${target.getMonth() + 1}月`, spent, todaySpent: latestDaySpent, income },
    days,
    byCat: catsFromDays(days),
    week: weekFromDays(days, target),
  };
}

function parseBillDate(value) {
  const text = String(value || '');
  const m = text.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekdayName(d) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
}

function catsFromDays(days) {
  const map = {};
  days.forEach((day) => (day.items || []).forEach((it) => {
    if (!(it.amt > 0)) return;
    const cat = CATS[it.cat] ? it.cat : 'other';
    map[cat] = (map[cat] || 0) + it.amt;
  }));
  return Object.entries(map).map(([cat, amt]) => ({ cat, amt }));
}

function weekFromDays(days, target) {
  const map = new Map();
  days.forEach((day) => (day.items || []).forEach((it) => {
    if (!(it.amt > 0)) return;
    const d = parseBillDate(it.time);
    if (!d) return;
    const k = `${d.getMonth() + 1}/${d.getDate()}`;
    map.set(k, (map.get(k) || 0) + it.amt);
  }));
  const arr = Array.from(map.entries()).map(([d, v]) => ({ d, v: Math.round(v) })).slice(-7);
  return arr.length ? arr : [{ d: `${target.getMonth() + 1}月`, v: 0 }];
}

function Flow({ state, go, onPrev, onNext, canNext }) {
  const [filter, setFilter] = useStateB('all');
  const [detail, setDetail] = useStateB(null); // { item, dayLabel }
  const totalSpent = state.budget.spent, totalIncome = state.budget.income;
  const openCategoryManager = () => go && go('manageCategories');
  const filterCats = (state.categories || []).filter((c) => c.visible !== false && !c.income);
  return (
    <div style={{ padding: '14px 18px 0' }}>
      {/* 月汇总 */}
      <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="om-tap icon-btn-sm" onClick={onPrev} title="上个月"><UiIcon name="back" size={18} /></button>
          <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{state.budget.month}</span>
          <button className="om-tap icon-btn-sm" onClick={onNext} disabled={!canNext} title="下个月" style={{ opacity: canNext ? 1 : 0.35, cursor: canNext ? 'pointer' : 'default' }}>
            <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><UiIcon name="back" size={18} /></span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'right' }}><div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>支出</div><div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>¥{fmt(totalSpent)}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>收入</div><div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 18, color: 'var(--leaf)' }}>¥{fmt(totalIncome)}</div></div>
        </div>
      </Card>
      {/* 一键导入入口 */}
      <button className="om-tap" onClick={() => go && go('import')} style={{ width: '100%', marginTop: 12, border: '2px dashed var(--ink)', borderRadius: 16, padding: '12px 14px', background: 'var(--paper-2)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--honey)', border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UiIcon name="arrow" size={18} stroke={2.4} />
        </span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>一键导入账单</div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>从微信 / 支付宝 / 银行卡 / 短信</div>
        </div>
        <UiIcon name="arrow" size={18} />
      </button>
      {/* 筛选 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 12px' }}>
        <div className="noscroll" style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, overflowX: 'auto', overflowY: 'hidden', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
          {[{ id: 'all', label: '全部' }, ...filterCats].map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} style={{ flexShrink: 0 }}>{c.label}</Chip>
          ))}
        </div>
        <button className="om-tap" onClick={openCategoryManager} style={{ border: '2px dashed var(--ink)', borderRadius: 999, padding: '7px 12px', background: 'var(--paper)', color: 'var(--ink-soft)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 0 rgba(49,39,29,.18)' }}>
          管理
        </button>
      </div>
      {/* 分组流水 */}
      {state.days.map((day) => {
        const items = filter === 'all' ? day.items : day.items.filter((i) => i.cat === filter);
        if (!items.length) return null;
        return (
          <div key={day.label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 7px' }}>
              <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{day.label} <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--ink-soft)' }}>{day.date}</span></span>
              <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{day.isIncome ? '收 ¥' + fmt(Math.abs(day.total)) : '支 ¥' + fmt(day.total)}</span>
            </div>
            <Card pad={6}>
              {items.map((t, i) => <BillRow key={t.id} t={t} last={i === items.length - 1} onClick={() => setDetail({ item: t, dayLabel: day.label + ' · ' + day.date })} />)}
            </Card>
          </div>
        );
      })}
      {state.days.every((day) => !(filter === 'all' ? day.items : day.items.filter((i) => i.cat === filter)).length) && (
        <Card style={{ textAlign: 'center', color: 'var(--ink-soft)', fontFamily: "'Noto Sans SC'", fontWeight: 700, padding: '26px 14px' }}>
          这个月份没有匹配的账单
        </Card>
      )}
      {detail && (
        <BillDetailSheet state={state} item={detail.item} dayLabel={detail.dayLabel}
          onClose={() => setDetail(null)}
          onUpdate={(it) => go && go('updateBill', it)}
          onDelete={(it) => go && go('deleteBill', it)} />
      )}
    </div>
  );
}

function rebuildCatsFromBills(state) {
  const map = {};
  (state.days || []).forEach((day) => {
    (day.items || []).forEach((it) => {
      if (!(it.amt > 0)) return;
      const imported = /^(excel|csv)/i.test(String(it.id || ''));
      const shouldGuess = imported || it.cat === 'other' || !CATS[it.cat];
      const guessed = shouldGuess
        ? guessCatForStats(`${it.note || ''} ${it.time || ''}`, it.amt, it.cat)
        : it.cat;
      const cat = CATS[guessed] ? guessed : 'other';
      map[cat] = (map[cat] || 0) + it.amt;
    });
  });
  const result = Object.entries(map).map(([cat, amt]) => ({ cat, amt }));
  return result.length ? result : state.byCat;
}

function guessCatForStats(text, amount, fallback = 'other') {
  const learned = guessLearningRuleCategoryForBills(text, amount);
  if (learned) return learned;
  const custom = guessCustomCategoryForBills(text, amount);
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

function guessLearningRuleCategoryForBills(text, amount) {
  const s = String(text || '').toLowerCase().replace(/\s+/g, '');
  const cats = new Map((window.__CUNZAI_CATEGORIES || []).map((c) => [c.id, c]));
  for (const rule of (window.__CUNZAI_LEARNING_RULES || [])) {
    if (!rule || rule.enabled === false || !rule.pattern || !rule.cat) continue;
    const cat = cats.get(rule.cat);
    if (!cat || cat.visible === false) continue;
    if (amount < 0 && !cat.income) continue;
    if (amount > 0 && cat.income) continue;
    if (s.includes(String(rule.pattern).toLowerCase().replace(/\s+/g, ''))) return rule.cat;
  }
  return null;
}

function guessCustomCategoryForBills(text, amount) {
  const s = String(text || '').toLowerCase();
  const cats = window.__CUNZAI_CATEGORIES || [];
  for (const c of cats) {
    if (!c || !c.id || c.visible === false) continue;
    if (amount < 0 && !c.income) continue;
    if (amount > 0 && c.income) continue;
    const words = [c.label, c.id && String(c.id).startsWith('custom_') ? '' : c.id, c.keywords]
      .filter(Boolean).join(',').split(/[,，、;\s\n]+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (words.some((w) => s.includes(w))) return c.id;
  }
  return null;
}

function buildStatsPeriodView(allState, monthState, monthOffset, range) {
  if (range === 'month') return monthState;
  const base = new Date();
  const anchorMonth = new Date(base.getFullYear(), base.getMonth() - monthOffset, 1);
  const start = range === 'year'
    ? new Date(anchorMonth.getFullYear(), 0, 1)
    : new Date(anchorMonth.getFullYear(), anchorMonth.getMonth() + 1, 0);
  const end = range === 'year'
    ? new Date(anchorMonth.getFullYear(), 11, 31, 23, 59, 59)
    : new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59);
  const weekStart = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
  const from = range === 'week' ? weekStart : start;
  const picked = [];

  (allState.days || []).forEach((day) => (day.items || []).forEach((it) => {
    const parsed = parseBillDate(it.time);
    if (!parsed || parsed < from || parsed > end) return;
    picked.push(it);
  }));

  const dayMap = new Map();
  picked.forEach((it) => {
    const parsed = parseBillDate(it.time);
    const key = formatDateKey(parsed);
    if (!dayMap.has(key)) {
      dayMap.set(key, {
        label: `${parsed.getMonth() + 1}月${parsed.getDate()}日`,
        date: weekdayName(parsed),
        sort: parsed.getTime(),
        items: [],
      });
    }
    dayMap.get(key).items.push(it);
  });
  const days = Array.from(dayMap.values()).map((d) => {
    const spent = d.items.filter((it) => it.amt > 0).reduce((a, it) => a + it.amt, 0);
    const income = d.items.filter((it) => it.amt < 0).reduce((a, it) => a + Math.abs(it.amt), 0);
    return { ...d, total: spent || -income, isIncome: spent === 0 && income > 0 };
  }).sort((a, b) => b.sort - a.sort);
  const spent = picked.filter((it) => it.amt > 0).reduce((a, it) => a + it.amt, 0);
  const income = picked.filter((it) => it.amt < 0).reduce((a, it) => a + Math.abs(it.amt), 0);
  return {
    ...monthState,
    days,
    budget: { ...monthState.budget, spent, income, todaySpent: 0 },
    byCat: catsFromDays(days),
    week: range === 'year' ? monthsFromItems(picked) : weekFromDays(days, anchorMonth),
  };
}

function monthsFromItems(items) {
  const map = new Map(Array.from({ length: 12 }, (_, i) => [`${i + 1}`, 0]));
  items.forEach((it) => {
    if (!(it.amt > 0)) return;
    const d = parseBillDate(it.time);
    if (!d) return;
    const k = `${d.getMonth() + 1}`;
    map.set(k, (map.get(k) || 0) + it.amt);
  });
  return Array.from(map.entries()).map(([d, v]) => ({ d, v: Math.round(v) }));
}

function Stats({ state, allState, monthOffset = 0, go }) {
  const [range, setRange] = useStateB('month');
  // 按时间维度切换数据（演示：本月真实数据，本周/本年按比例缩放）
  const periodState = buildStatsPeriodView(allState || state, state, monthOffset, range);
  const sourceCats = rebuildCatsFromBills(periodState);
  const data = sourceCats.map((c) => ({ ...c, amt: Math.round(c.amt) })).sort((a, b) => b.amt - a.amt);
  const totalSpent = Math.round(periodState.budget.spent);
  const lastTotal = Math.round((range === 'week' ? 540 : range === 'year' ? 24500 : 2150));
  const maxCat = Math.max(...data.map((d) => d.amt), 1);
  // 时间维度切换：图表显示
  const chartData = range === 'week'
    ? periodState.week
    : range === 'year'
      ? [{ d: '1', v: 1820 }, { d: '2', v: 2140 }, { d: '3', v: 1960 }, { d: '4', v: 2580 }, { d: '5', v: 1862 }, { d: '6', v: 0 }, { d: '7', v: 0 }, { d: '8', v: 0 }, { d: '9', v: 0 }, { d: '10', v: 0 }, { d: '11', v: 0 }, { d: '12', v: 0 }]
      : periodState.week;
  const chartRows = periodState.week;
  const maxChart = Math.max(...chartRows.map((w) => w.v), 1);
  const rangeLabel = { week: '本周', month: '本月', year: '本年' }[range];
  const chartTitle = { week: '近 7 日支出', month: '近 7 日支出', year: '12 月支出' }[range];
  return (
    <div style={{ padding: '14px 18px 0' }}>
      {/* 时间维度切换 */}
      <div style={{ display: 'flex', gap: 6, background: 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 999, padding: 3, marginBottom: 14 }}>
        {[['week', '本周'], ['month', '本月'], ['year', '本年']].map(([k, l]) => (
          <button key={k} className="om-tap" onClick={() => setRange(k)} style={{
            flex: 1, border: 'none', borderRadius: 999, padding: '7px 10px', cursor: 'pointer',
            background: range === k ? 'var(--ink)' : 'transparent', color: range === k ? 'var(--paper)' : 'var(--ink-soft)',
            fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5 }}>{l}</button>
        ))}
      </div>

      {/* 智能分析（核心洞察） */}
      <Insights state={{ ...periodState, byCat: sourceCats }} go={go} />

      {/* 月报分享入口 */}
      <button className="om-tap" onClick={() => go && go('report', { ...periodState, byCat: sourceCats })} style={{ width: '100%', marginTop: 14, border: '2px solid var(--ink)', borderRadius: 16, padding: '12px 14px', background: 'var(--mist-tint)', cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--coral)', border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper)', flexShrink: 0 }}>
          <UiIcon name="gift" size={20} />
        </span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>看看{rangeLabel}小报告</div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>存崽帮你做的总结 · 可保存分享</div>
        </div>
        <UiIcon name="arrow" size={18} />
      </button>

      {/* 7 日趋势 */}
      <Card style={{ marginTop: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>{chartTitle}</div>
        <div className="noscroll" style={{ display: 'flex', alignItems: 'flex-end', height: 110, gap: 6, overflowX: range === 'year' ? 'auto' : 'visible', justifyContent: range === 'year' ? 'flex-start' : 'space-between' }}>
          {chartRows.map((w, i) => {
            const cur = (range === 'month' && i === 5) || (range === 'year' && i === 4) || (range === 'week' && i === 4);
            return (
              <div key={i} style={{ flex: range === 'year' ? '0 0 32px' : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 10.5, color: 'var(--ink-soft)' }}>{w.v || ''}</span>
                <div style={{ width: range === 'year' ? '70%' : '70%', height: `${Math.max(4, (w.v / maxChart) * 84)}px`, background: cur ? 'var(--coral)' : 'var(--honey)', border: '2px solid var(--ink)', borderRadius: 7 }} />
                <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>{w.d}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 分类排行 */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>分类支出</span>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 15, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>共 ¥{fmt(totalSpent)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {data.map((d) => (
            <div key={d.cat} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATS[d.cat].tint, flexShrink: 0 }}>
                <CatIcon name={d.cat} size={19} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{CATS[d.cat].label}</span>
                  <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>¥{fmt(d.amt)} · {Math.round(d.amt / totalSpent * 100)}%</span>
                </div>
                <Bar value={d.amt} max={maxCat} color={CATS[d.cat].tint} h={10} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { Bills });

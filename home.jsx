// home.jsx — 首页 3 个方向 + 可戳互动宠物
// Exports: Home, PokeablePet

const { useState, useRef, useEffect } = React;

// ── 可互动宠物：点一下会弹跳、冒爱心/星星、说一句话 ──────────
function PokeablePet({ species, mood, accessory, size = 200, lines, defaultLine, tone }) {
  const [poke, setPoke] = useState(false);
  const [speech, setSpeech] = useState(defaultLine || null);
  const [sparks, setSparks] = useState([]);
  const idRef = useRef(0);
  const tRef = useRef(null);

  const tap = () => {
    setPoke(false);
    requestAnimationFrame(() => setPoke(true));
    const pool = (lines && lines.poke) || [];
    if (pool.length) setSpeech(pool[Math.floor(Math.random() * pool.length)]);
    // 冒出 3 个小星星/爱心
    const burst = Array.from({ length: 4 }).map((_, i) => ({
      id: idRef.current++, x: 30 + Math.random() * 40, kind: Math.random() > 0.5 ? '♥' : '✦',
      dx: (Math.random() - 0.5) * 60, delay: i * 60,
    }));
    setSparks((s) => [...s, ...burst]);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => { setPoke(false); setSpeech(defaultLine || null); }, 2200);
    burst.forEach((b) => setTimeout(() => setSparks((s) => s.filter((x) => x.id !== b.id)), 1100 + b.delay));
  };

  useEffect(() => () => clearTimeout(tRef.current), []);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {speech && (
        <div key={speech} style={{ marginBottom: 6 }} className="bubble-in">
          <SpeechBubble tone={tone}>{speech}</SpeechBubble>
        </div>
      )}
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={tap} className="om-tap">
        <Pet species={species} mood={poke ? 'happy' : mood} accessory={accessory} size={size} poke={poke} />
        {sparks.map((s) => (
          <span key={s.id} className="spark" style={{ left: `${s.x}%`, '--dx': `${s.dx}px`, animationDelay: `${s.delay}ms`,
            color: s.kind === '♥' ? 'var(--coral)' : 'var(--honey)' }}>{s.kind}</span>
        ))}
      </div>
    </div>
  );
}

function Greeting({ state, go }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>下午好，小存</div>
        <div onClick={() => go && go('checkin')} className="om-tap" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2, cursor: 'pointer' }}>
          <span style={{ color: 'var(--coral)', display: 'flex' }}><UiIcon name="flame" size={14} /></span>{state.budget.dateLabel || '今天'} · 已坚持记账 48 天 ›
        </div>
      </div>
      <Tag rotate={-3} bg="var(--paper)"><span style={{ color: 'var(--honey)', fontWeight: 800 }}>◎</span>{fmt(state.pet.coins)}</Tag>
    </div>
  );
}

// 共用：本月数据
function useDerived(state) {
  const { total, spent, todaySpent, income } = state.budget;
  return { remain: total - spent, total, spent, todaySpent, income, ratio: spent / total };
}

function MonthSwitcher({ month, onPrev, onNext, canNext }) {
  return (
    <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <button className="om-tap icon-btn-sm" onClick={onPrev} title="上个月" style={{ width: 24, height: 24 }}>
        <UiIcon name="back" size={14} />
      </button>
      <span style={{ minWidth: 34, textAlign: 'center' }}>{month}</span>
      <button className="om-tap icon-btn-sm" onClick={onNext} disabled={!canNext} title="下个月" style={{ width: 24, height: 24, opacity: canNext ? 1 : 0.35, cursor: canNext ? 'pointer' : 'default' }}>
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><UiIcon name="back" size={14} /></span>
      </button>
    </span>
  );
}

// 今日空状态：存崽饿了，催你记第一笔
function FeedReminder({ species, go }) {
  return (
    <Card style={{ background: 'var(--coral-tint)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: 12 }}>
      <div style={{ flexShrink: 0, marginBottom: -4 }}><Pet species={species} mood="sleeping" size={52} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>存崽睡着了，肚子空空的</div>
        <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>记今天第一笔，喂它一口饱饱～</div>
      </div>
      <button className="om-tap" onClick={() => go('record')} style={{ flexShrink: 0, border: '2px solid var(--ink)', borderRadius: 12, padding: '8px 14px',
        background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, boxShadow: '0 3px 0 var(--ink)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
        去喂食
      </button>
    </Card>
  );
}

// ════════ 方向 A：中心剧场 ════════
function HomeStage({ state, mood, lines, go, onPrevMonth, onNextMonth, canNextMonth }) {
  const d = useDerived(state);
  const empty = d.todaySpent === 0;
  const m = empty ? 'sleeping' : mood;
  const sp = state.pet.species;
  return (
    <div className="home-page home-stage" style={{ padding: '4px 18px 24px' }}>
      <Greeting state={state} go={go} />
      {empty && <FeedReminder species={sp} go={go} />}
      {/* 剧场舞台 */}
      <div className="home-hero home-stage-hero" style={{ position: 'relative', background: 'var(--coral-tint)', border: '2px solid var(--ink)',
        borderRadius: '120px 120px 26px 26px', padding: '26px 18px 22px', boxShadow: '0 4px 0 var(--ink)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
        <div className="stage-dots" />
        <PokeablePet species={sp} mood={m} accessory={state.pet.accessory} size={200} lines={lines} defaultLine={lines[m] ? lines[m][0] : null} tone="happy" />
        <div style={{ marginTop: 6, fontFamily: "'ZCOOL KuaiLe'", fontSize: 15, color: 'var(--ink)' }}>
          {state.pet.name} · Lv.{state.pet.level}
        </div>
      </div>
      {/* 预算总览 */}
      <Card className="home-budget-card" style={{ marginTop: 16, cursor: 'pointer' }} onClick={() => go('editBudget')}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>本月还能花</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>
            <MonthSwitcher month={state.budget.month} onPrev={onPrevMonth} onNext={onNextMonth} canNext={canNextMonth} />
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '2px 0 12px' }}>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: 'var(--ink)' }}>¥</span>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 40, color: 'var(--ink)', lineHeight: 1 }}>{fmt(d.remain)}</span>
        </div>
        <Bar value={d.spent} max={d.total} color={d.ratio < 0.8 ? 'var(--leaf)' : 'var(--coral)'} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
          <Mini label="今日支出" value={`¥${fmt(d.todaySpent)}`} />
          <Mini label="本月已花" value={`¥${fmt(d.spent)}`} />
          <Mini label="月预算" value={`¥${fmt(d.total)}`} />
        </div>
      </Card>
      <div className="home-shortcuts" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Card style={{ flex: 1, boxShadow: '0 4px 0 var(--ink)' }} onClick={() => go('goals')} pad={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--coral)' }}><UiIcon name="target" size={20} /><span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>攒钱目标</span></div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>3 个进行中 ›</div>
        </Card>
        <Card style={{ flex: 1, boxShadow: '0 4px 0 var(--ink)' }} onClick={() => go('pet')} pad={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--honey)' }}><UiIcon name="gift" size={20} /><span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>装扮存崽</span></div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>2 件待解锁 ›</div>
        </Card>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ════════ 方向 B：数据优先 ════════
function HomeData({ state, mood, lines, go, onPrevMonth, onNextMonth, canNextMonth }) {
  const d = useDerived(state);
  const empty = d.todaySpent === 0;
  const m = empty ? 'sleeping' : mood;
  const sp = state.pet.species;
  const todays = state.days[0].items.slice(0, 3);
  return (
    <div className="home-page home-data" style={{ padding: '4px 18px 24px' }}>
      {/* 顶栏 + 小宠物挂件 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div onClick={() => go('pet')} className="om-tap" style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--ink)', background: 'var(--coral-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
          <div style={{ marginTop: 10 }}><Pet species={sp} mood={m} accessory={state.pet.accessory} size={62} /></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>下午好，小存</div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>{state.pet.name}正等你记一笔</div>
        </div>
        <Tag rotate={2}><span style={{ color: 'var(--honey)', fontWeight: 800 }}>◎</span>{fmt(state.pet.coins)}</Tag>
      </div>
      {empty && <FeedReminder species={sp} go={go} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-4px 2px 8px' }}>
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>
          <MonthSwitcher month={state.budget.month} onPrev={onPrevMonth} onNext={onNextMonth} canNext={canNextMonth} />
        </span>
      </div>
      {/* 大圆环 */}
      <Card className="home-budget-card" style={{ display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }} onClick={() => go('editBudget')}>
        <Ring value={d.remain} max={d.total} color={d.ratio < 0.8 ? 'var(--leaf)' : 'var(--coral)'}>
          <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>剩余</span>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 26, color: 'var(--ink)', lineHeight: 1.1 }}>¥{fmt(d.remain)}</span>
        </Ring>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>今日支出</div><div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: 'var(--coral)' }}>-¥{fmt(d.todaySpent)}</div></div>
          <div style={{ borderTop: '2px dashed var(--hair)', paddingTop: 10 }}><div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>本月结余</div><div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: 'var(--leaf)' }}>+¥{fmt(d.income - d.spent)}</div></div>
        </div>
      </Card>
      {/* 宠物一句话 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 4px 14px', }}>
        <UiIcon name="spark" size={16} /> <span style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 14, color: 'var(--ink)' }}>“{lines[m] ? lines[m][0] : ''}”</span>
      </div>
      {/* 今日流水预览 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 4px 10px' }}>
        <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>今天</span>
        <span onClick={() => go('bills')} className="om-tap" style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer' }}>全部 ›</span>
      </div>
      {empty ? (
        <button className="om-tap" onClick={() => go('record')} style={{ width: '100%', border: '2px dashed var(--ink)', borderRadius: 16, padding: '18px 14px', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ink-soft)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5 }}>
          <UiIcon name="plus" size={18} /> 今天还没有记录，点这里喂存崽
        </button>
      ) : (
        <Card pad={6}>
          {todays.map((t, i) => <Row key={t.id} t={t} last={i === todays.length - 1} />)}
        </Card>
      )}
    </div>
  );
}

// 流水行（首页/账单共用）
function Row({ t, last, onClick }) {
  const c = CATS[t.cat];
  const income = t.amt < 0;
  return (
    <div onClick={onClick} className={onClick ? 'om-tap' : ''} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderBottom: last ? 'none' : '2px dashed var(--hair)', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.tint, background: 'var(--paper-2)', flexShrink: 0 }}>
        <CatIcon name={t.cat} size={21} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{t.note}</div>
        <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>{c.label} · {t.time}</div>
      </div>
      <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: income ? 'var(--leaf)' : 'var(--ink)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {income ? '+' : '-'}¥{fmt(Math.abs(t.amt))}
      </div>
    </div>
  );
}

// ════════ 方向 C：存钱罐小屋 ════════
function HomeRoom({ state, mood, lines, go, onPrevMonth, onNextMonth, canNextMonth }) {
  const d = useDerived(state);
  const empty = d.todaySpent === 0;
  const m = empty ? 'sleeping' : mood;
  const sp = state.pet.species;
  return (
    <div className="home-page home-room" style={{ padding: '4px 18px 24px' }}>
      <Greeting state={state} go={go} />
      {empty && <FeedReminder species={sp} go={go} />}
      {/* 场景小屋 */}
      <div className="home-hero home-room-hero" style={{ position: 'relative', background: 'var(--mist-tint)', border: '2px solid var(--ink)', borderRadius: 26, boxShadow: '0 4px 0 var(--ink)', overflow: 'hidden', height: 320 }}>
        {/* 背景线条房间 */}
        <svg viewBox="0 0 360 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* 地板线 */}
          <line x1="0" y1="232" x2="360" y2="232" stroke="var(--ink)" strokeWidth="2.5" />
          {/* 窗 */}
          <g fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round">
            <rect x="40" y="56" width="78" height="64" rx="6" />
            <path d="M40 88h78M79 56v64" />
            {/* 太阳 */}
            <circle cx="62" cy="78" r="7" fill="var(--honey)" />
          </g>
          {/* 盆栽 */}
          <g fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M286 232v-18h28v18Z" fill="var(--paper)" />
            <path d="M300 214c0-16 14-20 14-30M300 214c0-12-12-16-12-24" />
            <path d="M288 184c8 0 12 6 12 12M312 178c-8 1-12 7-12 14" fill="var(--leaf)" stroke="var(--ink)" />
          </g>
          {/* 地毯 */}
          <ellipse cx="180" cy="246" rx="120" ry="16" fill="var(--coral-tint)" stroke="var(--ink)" strokeWidth="2.5" />
          {/* 金币堆 */}
          <g stroke="var(--ink)" strokeWidth="2.2">
            <ellipse cx="296" cy="252" rx="20" ry="7" fill="var(--honey)" />
            <ellipse cx="296" cy="246" rx="16" ry="6" fill="var(--honey)" />
            <ellipse cx="296" cy="240" rx="11" ry="5" fill="var(--honey)" />
          </g>
        </svg>
        {/* 浮动手写标签 */}
        <div style={{ position: 'absolute', top: 16, right: 14 }}>
          <Tag rotate={4} bg="var(--paper)" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '7px 11px' }}>
            <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>本月还能花</span>
            <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 19, color: 'var(--ink)' }}>¥{fmt(d.remain)}</span>
          </Tag>
        </div>
        <div style={{ position: 'absolute', top: 150, left: 14 }}>
          {empty
            ? <Tag rotate={-5} bg="var(--paper)"><span style={{ color: 'var(--coral)', fontWeight: 800 }}>今天</span> 待记录</Tag>
            : <Tag rotate={-5} bg="var(--coral-tint)"><span style={{ color: 'var(--coral)', fontWeight: 800 }}>今日</span> -¥{fmt(d.todaySpent)}</Tag>}
        </div>
        {/* 宠物站在地毯上 */}
        <div style={{ position: 'absolute', left: '50%', bottom: 44, transform: 'translateX(-50%)' }}>
          <PokeablePet species={sp} mood={m} accessory={state.pet.accessory} size={150} lines={lines} defaultLine={lines[m] ? lines[m][0] : null} tone="happy" />
        </div>
      </div>
      {/* 预算条 */}
      <Card className="home-budget-card" style={{ marginTop: 14, cursor: 'pointer' }} onClick={() => go('editBudget')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>
            本月预算 <MonthSwitcher month={state.budget.month} onPrev={onPrevMonth} onNext={onNextMonth} canNext={canNextMonth} />
          </span>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>¥{fmt(d.spent)} / {fmt(d.total)}</span>
        </div>
        <Bar value={d.spent} max={d.total} color={d.ratio < 0.8 ? 'var(--leaf)' : 'var(--coral)'} />
      </Card>
    </div>
  );
}

function Home({ state, variant, go, onPrevMonth, onNextMonth, canNextMonth }) {
  const mood = petMood(state.budget);
  const map = { stage: HomeStage, data: HomeData, room: HomeRoom };
  const C = map[variant] || HomeStage;
  return <C state={state} mood={mood} lines={petLines} go={go} onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} canNextMonth={canNextMonth} />;
}

Object.assign(window, { Home, PokeablePet, BillRow: Row });

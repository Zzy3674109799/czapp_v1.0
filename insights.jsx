// insights.jsx — 智能消费分析（基于账单算出洞察 + 改进建议）
// Exports: Insights, buildInsights

// ── 计算洞察 ─────────────────────────────────────────────
function buildInsights(state) {
  const byCat = state.byCat;
  const totalSpent = byCat.reduce((a, c) => a + c.amt, 0);
  // 假设的"历史均值"（让对比有意义）
  const prevAvg = { food: 480, shop: 280, fun: 200, coffee: 90, transit: 120, home: 110, study: 100, health: 60, transfer: 100, other: 80 };
  // 健康占比建议
  const healthy = { food: 0.30, shop: 0.18, fun: 0.10, coffee: 0.05, transit: 0.08, home: 0.10, study: 0.08, health: 0.06, transfer: 0.08, other: 0.05 };

  const list = byCat.map((c) => {
    const share = c.amt / totalSpent;
    const prev = prevAvg[c.cat] || 100;
    const delta = (c.amt - prev) / prev;
    const overShare = share - (healthy[c.cat] || 0.1);
    return { ...c, share, delta, overShare, prev };
  });

  // 排序：找出问题项 (按超出健康占比 × 金额 排序)
  const problems = [...list].filter((c) => c.delta > 0.2 || c.overShare > 0.05)
    .sort((a, b) => (b.overShare * b.amt) - (a.overShare * a.amt));
  // 表现好的
  const good = [...list].filter((c) => c.delta < -0.1 || c.overShare < -0.03)
    .sort((a, b) => a.delta - b.delta);

  // 整体健康分（粗略：根据占比偏差打分）
  const score = Math.max(40, Math.min(98, 100 - problems.reduce((a, p) => a + Math.max(0, p.overShare) * 100, 0)));

  // 月度趋势：本月支出环比上月
  const lastMonth = 2150;
  const momDelta = (state.budget.spent - lastMonth) / lastMonth;

  // 可节省金额估算（top 2 问题项压回健康占比）
  const savable = problems.slice(0, 2).reduce((a, p) => a + Math.max(0, p.overShare) * totalSpent * 0.7, 0);

  return { list, problems, good, score, totalSpent, momDelta, lastMonth, savable };
}

// ── 单条改进建议生成器 ───────────────────────────────────
function tipFor(cat, info) {
  const tips = {
    food: { title: '外卖偏多', body: `${info.n || ''}本月「餐饮」${info.over}，试试一周做 2 顿饭、外卖每单设个 ¥30 上限`, icon: 'food' },
    coffee:{title: '咖啡奶茶有点超', body: `咖啡 ¥${Math.round(info.amt)}，平均一天小一杯。买杯挂耳，每月约可省 ¥${Math.round(info.amt * 0.6)}`, icon: 'coffee' },
    shop:  { title: '购物冲动消费', body: `购物 ¥${Math.round(info.amt)}，比常态多 ${Math.round(info.delta * 100)}%。试试加购 24 小时后再付款`, icon: 'shop' },
    fun:   { title: '娱乐项偏高', body: `电影/KTV 等花了 ¥${Math.round(info.amt)}。每周挑 1 项，约可省 ¥${Math.round(info.amt * 0.4)}`, icon: 'fun' },
    transit:{title: '通勤可优化', body: `交通 ¥${Math.round(info.amt)}。看看月卡或共享单车，能省一些`, icon: 'transit' },
    home:  { title: '居家可批量', body: `日用 ¥${Math.round(info.amt)}。集中到月初一次买齐，能少买冲动品`, icon: 'home' },
    transfer:{title: '转账偏多', body: `转账 ¥${Math.round(info.amt)}，这里多是个人转账、二维码付款或人情往来，可以再手动细分几笔大额`, icon: 'transfer' },
    other: { title: '杂项偏多', body: `「其他」¥${Math.round(info.amt)}，建议补全分类，让我们看清钱去哪了`, icon: 'other' },
  };
  return tips[cat] || tips.other;
}

function descOver(d) {
  if (d > 0.5) return '比常态多了一半还多';
  if (d > 0.2) return `比常态多了 ${Math.round(d * 100)}%`;
  return '占比偏高';
}

// ── 主组件 ──────────────────────────────────────────────
function Insights({ state, go }) {
  const ins = buildInsights(state);
  const top = ins.problems[0];
  const ringColor = ins.score >= 85 ? 'var(--leaf)' : ins.score >= 70 ? 'var(--honey)' : 'var(--coral)';

  return (
    <div>
      {/* 宠物点评 + 健康分 */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Ring value={ins.score} max={100} size={104} stroke={11} color={ringColor}>
            <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 30, color: 'var(--ink)', lineHeight: 1 }}>{Math.round(ins.score)}</span>
            <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 700, marginTop: 1 }}>消费健康分</span>
          </Ring>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, color: 'var(--ink)', marginBottom: 4 }}>
              {ins.score >= 85 ? '本月表现很棒！' : ins.score >= 70 ? '整体还行，有几处可改' : '稍微有点超啦'}
            </div>
            <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              {top ? <>「{CATS[top.cat].label}」{descOver(top.delta)}，是本月最大开销</> : '没有明显超支项'}
            </div>
            {ins.savable > 50 && (
              <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--honey)', border: '2px solid var(--ink)', borderRadius: 10, padding: '4px 9px',
                fontFamily: "'Noto Sans SC'", fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>
                <UiIcon name="spark" size={13} /> 还能省 ¥{Math.round(ins.savable)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 月环比 */}
      <Card style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>对比上月（¥{fmt(ins.lastMonth)}）</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 26, color: ins.momDelta > 0 ? 'var(--coral)' : 'var(--leaf)' }}>
              {ins.momDelta > 0 ? '+' : ''}{Math.round(ins.momDelta * 100)}%
            </span>
            <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>
              {ins.momDelta > 0 ? `多花 ¥${fmt(state.budget.spent - ins.lastMonth)}` : `少花 ¥${fmt(ins.lastMonth - state.budget.spent)}`}
            </span>
          </div>
        </div>
        <ArrowTrend up={ins.momDelta > 0} />
      </Card>

      {/* 改进建议 */}
      {ins.problems.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 4px 12px' }}>
          <UiIcon name="spark" size={18} />
          <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>存崽的小建议</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ins.problems.slice(0, 3).map((p) => {
          const info = { amt: p.amt, delta: p.delta, n: '', over: descOver(p.delta) };
          const tip = tipFor(p.cat, info);
          return (
            <div key={p.cat} style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 18, boxShadow: '0 4px 0 var(--ink)', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATS[p.cat].tint, background: 'var(--coral-tint)', flexShrink: 0 }}>
                  <CatIcon name={tip.icon} size={22} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{tip.title}</span>
                    <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 14, color: 'var(--coral)', whiteSpace: 'nowrap' }}>+{Math.round(p.delta * 100)}%</span>
                  </div>
                  <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.55 }}>
                    {tip.body}
                  </div>
                </div>
              </div>
              {/* 对比条 */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink-soft)', width: 50, flexShrink: 0 }}>常态</span>
                <div style={{ flex: 1 }}><Bar value={p.prev} max={p.amt} color="var(--paper-2)" h={8} /></div>
                <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 11, color: 'var(--ink-soft)', width: 50, textAlign: 'right' }}>¥{fmt(p.prev)}</span>
              </div>
              <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink)', fontWeight: 700, width: 50, flexShrink: 0 }}>本月</span>
                <div style={{ flex: 1 }}><Bar value={p.amt} max={p.amt} color={CATS[p.cat].tint} h={8} /></div>
                <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 11, color: 'var(--ink)', width: 50, textAlign: 'right' }}>¥{fmt(p.amt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 表现好的 */}
      {ins.good.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 4px 10px' }}>
            <span style={{ color: 'var(--leaf)' }}><UiIcon name="check" size={18} /></span>
            <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>这些做得不错</span>
          </div>
          <Card pad={10}>
            {ins.good.slice(0, 3).map((g, i, arr) => (
              <div key={g.cat} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 6px', borderBottom: i === arr.length - 1 ? 'none' : '2px dashed var(--hair)' }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATS[g.cat].tint, flexShrink: 0 }}>
                  <CatIcon name={g.cat} size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{CATS[g.cat].label} 比常态少 {Math.round(Math.abs(g.delta) * 100)}%</div>
                  <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 1 }}>继续保持就很棒</div>
                </div>
                <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 13, color: 'var(--leaf)', whiteSpace: 'nowrap' }}>-{Math.round(Math.abs(g.delta) * 100)}%</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function ArrowTrend({ up }) {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" style={{ flexShrink: 0 }}>
      <path d={up ? "M4 32 L20 22 L32 28 L52 8" : "M4 8 L20 18 L32 12 L52 32"}
        fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={up ? "M44 8 L52 8 L52 16" : "M44 32 L52 32 L52 24"} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

Object.assign(window, { Insights, buildInsights });

// checkin.jsx — 记账打卡日历（小猪鼻印章 + 连续天数 + 周奖励）
// Exports: CheckinModal

const WD = ['一', '二', '三', '四', '五', '六', '日'];

// 小猪鼻印章
function Snout({ size = 15 }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 20 16">
      <ellipse cx="10" cy="8" rx="7.5" ry="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="7" cy="8" rx="1.4" ry="2.2" fill="var(--ink)" />
      <ellipse cx="13" cy="8" rx="1.4" ry="2.2" fill="var(--ink)" />
    </svg>
  );
}

function CheckinModal({ state, onClose }) {
  const c = state.checkin;
  const cells = [];
  for (let i = 0; i < c.firstOffset; i++) cells.push(null);
  for (let d = 1; d <= c.monthDays; d++) cells.push(d);

  const recordedSet = new Set(c.recorded);
  const weekPos = c.streak % 7 === 0 ? 7 : c.streak % 7;   // 本周已打卡格数
  const toReward = 7 - weekPos;

  return (
    <div className="lvl-overlay" onClick={onClose}>
      <div className="checkin-card" onClick={(e) => e.stopPropagation()}>
        <button className="om-tap icon-btn" onClick={onClose} style={{ position: 'absolute', top: 10, right: 8 }}><UiIcon name="close" size={20} /></button>

        {/* 连续天数 hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ flexShrink: 0, marginBottom: -8 }}><Pet species={state.pet.species} mood="excited" accessory={state.pet.accessory} size={68} /></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ color: 'var(--coral)', display: 'flex', marginBottom: 4 }}><UiIcon name="flame" size={22} /></span>
              <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 38, color: 'var(--ink)', lineHeight: 1 }}>{c.streak}</span>
              <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 6 }}>天连续坚持</span>
            </div>
            <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>本月已喂存崽 {c.recorded.length} 次 · 真棒！</div>
          </div>
        </div>

        {/* 日历 */}
        <div style={{ background: 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 18, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{c.month}打卡墙</span>
            <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>记一笔 = 喂一次</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 }}>
            {WD.map((w) => <div key={w} style={{ textAlign: 'center', fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>{w}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {cells.map((n, i) => {
              if (n === null) return <div key={'e' + i} />;
              const checked = recordedSet.has(n);
              const today = n === c.today;
              const future = n > c.today;
              return (
                <div key={n} style={{
                  aspectRatio: '1', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                  border: today ? '2px solid var(--coral)' : checked ? '2px solid var(--ink)' : '2px solid transparent',
                  background: checked ? 'var(--honey)' : 'transparent',
                  boxShadow: today ? '0 2px 0 var(--coral)' : 'none',
                }}>
                  {checked && <Snout size={15} />}
                  <span style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 10, color: future ? 'var(--ink-soft)' : 'var(--ink)', opacity: future ? 0.5 : 1 }}>{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 周奖励进度 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 2px 4px' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid var(--ink)', background: i < weekPos ? 'var(--honey)' : 'var(--paper)' }} />
            ))}
          </div>
          <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>
            {toReward === 0 ? '本周全勤！' : `再坚持 ${toReward} 天`}得 <span style={{ color: 'var(--honey)', fontWeight: 800 }}>◎50</span>
          </span>
        </div>

        <div style={{ marginTop: 14 }}>
          <Btn kind="honey" onClick={onClose} disabled><UiIcon name="check" size={18} /> 今天已喂过存崽啦</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CheckinModal });

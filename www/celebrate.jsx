// celebrate.jsx — 升级庆祝弹层（彩带 + 宠物长大 + 新称号）
// Exports: LevelUpOverlay

const CONFETTI_COLORS = ['var(--honey)', 'var(--coral)', 'var(--mist)', 'var(--leaf)', '#E5A4C4'];

function Confetti() {
  const pieces = React.useMemo(() => Array.from({ length: 22 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 1.6 + Math.random() * 1.2,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rot: Math.random() * 360,
    w: 7 + Math.random() * 6,
    h: 9 + Math.random() * 8,
    round: Math.random() > 0.6,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map((p) => (
        <span key={p.id} className="confetti" style={{
          left: `${p.left}%`, width: p.w, height: p.h, background: p.color,
          borderRadius: p.round ? '50%' : 2, border: '1.5px solid var(--ink)',
          animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          '--rot': `${p.rot}deg`,
        }} />
      ))}
    </div>
  );
}

function LevelUpOverlay({ level, species, onClose }) {
  // 等级越高，宠物长得越大一点点
  const petSize = 150 + Math.min(level, 8) * 8;
  return (
    <div className="lvl-overlay" onClick={onClose}>
      <Confetti />
      <div className="lvl-card" onClick={(e) => e.stopPropagation()}>
        <div className="lvl-spark"><UiIcon name="spark" size={26} /></div>
        <div style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 25, color: 'var(--ink)', whiteSpace: 'nowrap', lineHeight: 1.1 }}>升级啦！</div>
        <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 5, lineHeight: 1.4 }}>存崽因为你的坚持，又长大了一点点</div>

        <div className="lvl-pet">
          <Pet species={species} mood="excited" size={petSize} />
          <span className="lvl-ribbon">Lv.{level}</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 999, padding: '7px 16px', whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)' }}>新称号</span>
          <span style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 16, color: 'var(--ink)' }}>{petTitle(level)}</span>
        </div>

        <div className="lvl-reward">
          <span style={{ color: 'var(--honey)', fontWeight: 800 }}>◎ +20</span>
          <span style={{ color: 'var(--ink-soft)' }}>升级奖励金币已入罐</span>
        </div>

        <div style={{ width: '100%', marginTop: 16 }}>
          <Btn kind="honey" onClick={onClose}><UiIcon name="spark" size={18} /> 继续加油</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LevelUpOverlay });

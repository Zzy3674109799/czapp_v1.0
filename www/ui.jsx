// ui.jsx — 共享 UI 基元
// Exports: Card, Bar, Ring, Chip, Btn, Tag, Divider, Sticker

function Card({ children, style, className = '', onClick, pad = 18 }) {
  return (
    <div className={`om-card ${className}`} onClick={onClick}
      style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 22,
        padding: pad, boxShadow: '0 4px 0 var(--ink)', ...style }}>
      {children}
    </div>
  );
}

// 线条进度条
function Bar({ value, max = 100, color = 'var(--honey)', h = 14 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ height: h, borderRadius: h, border: '2px solid var(--ink)', background: 'var(--paper-2)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRight: pct > 2 && pct < 99 ? '2px solid var(--ink)' : 'none', transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
    </div>
  );
}

// 预算圆环（SVG，手绘端点）
function Ring({ value, max = 100, size = 132, stroke = 13, color = 'var(--honey)', children }) {
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink)" strokeWidth={stroke + 4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  );
}

function Chip({ children, active, onClick, style }) {
  return (
    <button onClick={onClick} className="om-tap" style={{
      border: '2px solid var(--ink)', borderRadius: 999, padding: '7px 14px',
      background: active ? 'var(--ink)' : 'var(--paper)', color: active ? 'var(--paper)' : 'var(--ink)',
      fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer',
      whiteSpace: 'nowrap', ...style }}>
      {children}
    </button>
  );
}

function Btn({ children, onClick, kind = 'primary', style, disabled }) {
  const bg = disabled ? 'var(--paper-2)' : kind === 'primary' ? 'var(--ink)' : kind === 'honey' ? 'var(--honey)' : 'var(--paper)';
  const fg = disabled ? 'var(--ink-soft)' : kind === 'primary' ? 'var(--paper)' : 'var(--ink)';
  return (
    <button onClick={disabled ? undefined : onClick} className="om-tap" disabled={disabled} style={{
      border: '2px solid var(--ink)', borderRadius: 16, padding: '13px 18px', width: '100%',
      background: bg, color: fg, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 700, fontSize: 16,
      cursor: disabled ? 'default' : 'pointer', boxShadow: disabled ? 'none' : '0 4px 0 var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style }}>
      {children}
    </button>
  );
}

// 手写感小标签（贴纸）
function Tag({ children, rotate = 0, bg = 'var(--paper)', style }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg,
      border: '2px solid var(--ink)', borderRadius: 12, padding: '5px 10px', transform: `rotate(${rotate}deg)`, whiteSpace: 'nowrap',
      fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 700, fontSize: 12.5, boxShadow: '0 3px 0 var(--ink)', ...style }}>
      {children}
    </span>
  );
}

function Divider({ dashed = true, style }) {
  return <div style={{ borderTop: `2px ${dashed ? 'dashed' : 'solid'} var(--hair)`, margin: '12px 0', ...style }} />;
}

Object.assign(window, { Card, Bar, Ring, Chip, Btn, Tag, Divider });

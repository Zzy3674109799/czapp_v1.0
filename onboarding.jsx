// onboarding.jsx — 首次进入引导（4 步：欢迎/选伙伴/起名/设预算）
// Exports: Onboarding

const { useState: useStateO } = React;

function Onboarding({ onDone }) {
  const [step, setStep] = useStateO(0);
  const [species, setSpecies] = useStateO('pig');
  const [name, setName] = useStateO('');
  const [budget, setBudget] = useStateO(3000);
  const [variant, setVariant] = useStateO('stage');

  const total = 5; // 0 welcome, 1 species, 2 name, 3 budget, 4 home
  const defaultName = SPECIES[species].name;
  const finalName = (name || '').trim() || defaultName;

  const next = () => setStep((s) => Math.min(total - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = () => onDone({ species, name: finalName, budget, variant });

  return (
    <div className="ob-overlay">
      {/* 进度指示器 */}
      <div className="ob-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`ob-dot ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} />
        ))}
      </div>

      <div className="ob-stage" key={step}>
        {step === 0 && <Welcome />}
        {step === 1 && <PickSpecies value={species} onChange={setSpecies} />}
        {step === 2 && <PickName species={species} value={name} onChange={setName} placeholder={defaultName} />}
        {step === 3 && <PickBudget value={budget} onChange={setBudget} species={species} finalName={finalName} />}
        {step === 4 && <PickVariant value={variant} onChange={setVariant} species={species} />}
      </div>

      <div className="ob-actions">
        {step > 0 ? (
          <button className="om-tap ob-back" onClick={back}><UiIcon name="back" size={18} /> 上一步</button>
        ) : <span style={{ width: 88 }} />}
        {step < total - 1 ? (
          <button className="om-tap ob-next" onClick={next}>下一步 <UiIcon name="arrow" size={18} /></button>
        ) : (
          <button className="om-tap ob-next ob-go" onClick={finish}>带我进存崽屋 <UiIcon name="check" size={18} /></button>
        )}
      </div>
    </div>
  );
}

// ── Step 0：欢迎 ────────────────────────────────────────
function Welcome() {
  return (
    <div className="ob-card" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: -16, marginBottom: 18 }}>
        <span style={{ transform: 'rotate(-10deg)' }}><Pet species="pig" mood="happy" size={86} /></span>
        <span style={{ transform: 'translateY(-8px) rotate(2deg)', marginLeft: -22 }}><Pet species="cat" mood="content" size={86} /></span>
        <span style={{ transform: 'rotate(8deg)', marginLeft: -22 }}><Pet species="rabbit" mood="happy" size={86} /></span>
      </div>
      <div style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 26, color: 'var(--ink)', whiteSpace: 'nowrap' }}>嗨呀，主人！</div>
      <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.7 }}>
        我是会陪你记账的存钱小宠物。<br />
        你记一笔，我就吃一口，<br />
        攒钱越多，我长得越壮~
      </div>
      <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--coral-tint)', border: '2px solid var(--ink)', borderRadius: 12, padding: '6px 12px',
        fontFamily: "'ZCOOL KuaiLe'", fontSize: 13, color: 'var(--ink)' }}>
        <UiIcon name="spark" size={14} /> 接下来花 30 秒认识一下吧
      </div>
    </div>
  );
}

// ── Step 1：选伙伴 ──────────────────────────────────────
function PickSpecies({ value, onChange }) {
  return (
    <div className="ob-card">
      <h3 className="ob-title">选一个喜欢的伙伴</h3>
      <p className="ob-sub">不同的伙伴有不同的性格，可以随时换哦</p>
      <div className="ob-species-grid">
        {['pig', 'cat', 'dog', 'rabbit'].map((sid) => {
          const sel = value === sid;
          return (
            <button key={sid} className="om-tap" onClick={() => onChange(sid)} style={{
              position: 'relative', border: '2px solid var(--ink)', borderRadius: 18,
              background: sel ? 'var(--coral-tint)' : 'var(--paper)', cursor: 'pointer',
              boxShadow: sel ? '0 4px 0 var(--coral)' : '0 4px 0 var(--ink)',
              padding: '10px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {sel && <span style={{ position: 'absolute', top: 6, right: 6, color: 'var(--coral)' }}><UiIcon name="check" size={18} /></span>}
              <div style={{ height: 86, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pet species={sid} mood={sel ? 'excited' : 'happy'} size={90} />
              </div>
              <div style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 15, color: 'var(--ink)', marginTop: 4, whiteSpace: 'nowrap' }}>{SPECIES[sid].name}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink-soft)', marginTop: 1, whiteSpace: 'nowrap' }}>{SPECIES[sid].desc}</div>
            </button>
          );
        })}
      </div>
      <div className="ob-tagline" style={{ marginTop: 16 }}>
        <UiIcon name="spark" size={14} /> 「{SPECIES[value].tagline}」
      </div>
    </div>
  );
}

// ── Step 2：起名 ────────────────────────────────────────
function PickName({ species, value, onChange, placeholder }) {
  return (
    <div className="ob-card">
      <h3 className="ob-title">给它起个名字吧</h3>
      <p className="ob-sub">叫什么都行，喊一声它就抬头</p>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 18px' }}>
        <Pet species={species} mood="content" size={130} />
      </div>
      <div className="ob-input-wrap">
        <UiIcon name="edit" size={18} />
        <input className="ob-input" maxLength={8} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        {value && <button className="om-tap" onClick={() => onChange('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-soft)' }}><UiIcon name="close" size={16} /></button>}
      </div>
      <div className="ob-suggest">
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)' }}>试试：</span>
        {['贝贝', '球球', '小金', placeholder].map((s) => (
          <button key={s} className="om-tap" onClick={() => onChange(s)} style={{ border: '2px solid var(--ink)', borderRadius: 999, padding: '4px 12px', background: 'var(--paper)', cursor: 'pointer',
            fontFamily: "'ZCOOL KuaiLe'", fontSize: 13, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ── Step 3：设预算 ──────────────────────────────────────
function PickBudget({ value, onChange, species, finalName }) {
  const presets = [1500, 3000, 5000, 8000];
  return (
    <div className="ob-card">
      <h3 className="ob-title">本月想花多少？</h3>
      <p className="ob-sub">设个目标，{finalName}会帮你看着</p>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, margin: '14px 0 6px' }}>
        <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>¥</span>
        <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 52, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-1px' }}>{fmt(value)}</span>
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginLeft: 6 }}>/ 月</span>
      </div>

      {/* 自定义刻度滑块 */}
      <input type="range" className="ob-range" min="500" max="15000" step="100" value={value} onChange={(e) => onChange(parseInt(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', fontFamily: "'Baloo 2'", fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>
        <span>¥500</span><span>¥15,000</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
        {presets.map((p) => (
          <button key={p} className="om-tap" onClick={() => onChange(p)} style={{
            border: '2px solid var(--ink)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
            background: value === p ? 'var(--ink)' : 'var(--paper)', color: value === p ? 'var(--paper)' : 'var(--ink)',
            fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>¥{fmt(p)}</button>
        ))}
      </div>

      <div className="ob-tagline" style={{ marginTop: 18 }}>
        <span><Pet species={species} mood="happy" size={36} /></span>
        <span style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 13, color: 'var(--ink)' }}>
          "每天大约 ¥{fmt(Math.round(value / 30))} —— 我帮你数着！"
        </span>
      </div>
    </div>
  );
}

// ── Step 4：选首页方向 ──────────────────────────────────
function PickVariant({ value, onChange, species }) {
  const items = [
    { id: 'stage', label: '中心剧场', desc: '宠物大图，C 位出道' },
    { id: 'data',  label: '数据优先', desc: '圆环预算 + 流水预览' },
    { id: 'room',  label: '存钱罐小屋', desc: '宠物在线条小屋里' },
  ];
  return (
    <div className="ob-card">
      <h3 className="ob-title">喜欢哪种首页？</h3>
      <p className="ob-sub">随时可以在设置里换</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {items.map((it) => {
          const sel = value === it.id;
          return (
            <button key={it.id} className="om-tap" onClick={() => onChange(it.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              border: '2px solid var(--ink)', borderRadius: 16, background: sel ? 'var(--coral-tint)' : 'var(--paper)',
              boxShadow: sel ? '0 4px 0 var(--coral)' : '0 4px 0 var(--ink)', cursor: 'pointer' }}>
              <VariantThumb id={it.id} species={species} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{it.label}</div>
                <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 1 }}>{it.desc}</div>
              </div>
              {sel && <span style={{ color: 'var(--coral)' }}><UiIcon name="check" size={20} /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VariantThumb({ id, species }) {
  return (
    <div style={{ width: 64, height: 78, border: '2px solid var(--ink)', borderRadius: 10, background: 'var(--paper)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      {id === 'stage' && (<g>
        <div style={{ position: 'absolute', inset: 0, top: 8, background: 'var(--coral-tint)', borderRadius: '40px 40px 0 0' }} />
        <div style={{ position: 'absolute', left: '50%', top: 14, transform: 'translateX(-50%)' }}><Pet species={species} mood="happy" size={48} /></div>
      </g>)}
      {id === 'data' && (<g>
        <div style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--coral)' }} />
        <div style={{ position: 'absolute', top: 6, left: 30, right: 4, height: 6, background: 'var(--paper-2)', borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: 16, left: 30, right: 4, height: 6, background: 'var(--paper-2)', borderRadius: 3 }} />
        <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, height: 30, border: '1.5px solid var(--ink)', borderRadius: 5 }} />
      </g>)}
      {id === 'room' && (<g>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--mist-tint)' }} />
        <div style={{ position: 'absolute', top: 4, left: 4, width: 16, height: 12, border: '1.5px solid var(--ink)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)' }}><Pet species={species} mood="content" size={38} /></div>
        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, borderBottom: '2px solid var(--ink)' }} />
      </g>)}
    </div>
  );
}

Object.assign(window, { Onboarding });

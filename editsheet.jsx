// editsheet.jsx — 通用编辑底部弹层：宠物改名 / 月预算 / 账单条详情编辑
// Exports: NameEditSheet, BudgetEditSheet, BillDetailSheet

const { useState: useStateE } = React;

// ── 通用：底部 sheet 框架 ───────────────────────────────
function EditSheet({ title, onClose, children, actions }) {
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px 14px' }}>
          <button className="om-tap icon-btn" onClick={onClose}><UiIcon name="close" size={22} /></button>
          <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{title}</span>
          <div style={{ width: 38 }} />
        </div>
        <div style={{ padding: '0 2px 8px' }}>{children}</div>
        {actions && <div style={{ padding: '14px 2px 4px', display: 'flex', gap: 10 }}>{actions}</div>}
      </div>
    </div>
  );
}

// ── 宠物改名 ────────────────────────────────────────────
function NameEditSheet({ state, onClose, onSave }) {
  const [name, setName] = useStateE(state.pet.name);
  const placeholder = SPECIES[state.pet.species].name;
  const save = () => { onSave((name || '').trim() || placeholder); onClose(); };

  return (
    <EditSheet title="给宝贝改个名字" onClose={onClose} actions={
      <button className="om-tap" onClick={save} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)' }}>
        <UiIcon name="check" size={16} /> 就叫这个名字
      </button>
    }>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 16px' }}>
        <Pet species={state.pet.species} mood="content" accessory={state.pet.accessory} size={130} />
      </div>
      <div className="ob-input-wrap">
        <UiIcon name="edit" size={18} />
        <input className="ob-input" maxLength={8} value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} autoFocus />
        {name && <button className="om-tap" onClick={() => setName('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-soft)' }}><UiIcon name="close" size={16} /></button>}
      </div>
    </EditSheet>
  );
}

// ── 月预算编辑 ──────────────────────────────────────────
function BudgetEditSheet({ state, onClose, onSave }) {
  const [val, setVal] = useStateE(state.budget.total);
  const spent = state.budget.spent;
  const presets = [1500, 3000, 5000, 8000, 12000];
  const tooLow = val < spent;

  return (
    <EditSheet title="调整月预算" onClose={onClose} actions={
      <button className="om-tap" onClick={() => { onSave(val); onClose(); }} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)' }}>
        <UiIcon name="check" size={16} /> 保存
      </button>
    }>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, margin: '6px 0 4px' }}>
        <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>¥</span>
        <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 50, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-1px' }}>{fmt(val)}</span>
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginLeft: 6 }}>/ 月</span>
      </div>
      <input type="range" className="ob-range" min="500" max="15000" step="100" value={val} onChange={(e) => setVal(parseInt(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', fontFamily: "'Baloo 2'", fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>
        <span>¥500</span><span>¥15,000</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
        {presets.map((p) => (
          <button key={p} className="om-tap" onClick={() => setVal(p)} style={{
            border: '2px solid var(--ink)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
            background: val === p ? 'var(--ink)' : 'var(--paper)', color: val === p ? 'var(--paper)' : 'var(--ink)',
            fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 13 }}>¥{fmt(p)}</button>
        ))}
      </div>
      <div style={{ marginTop: 14, background: tooLow ? 'var(--coral-tint)' : 'var(--mist-tint)', border: '2px solid var(--ink)', borderRadius: 12, padding: '10px 12px',
        fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink)' }}>
        {tooLow
          ? <>⚠️ 本月已花 ¥{fmt(spent)}，会立刻超支</>
          : <>本月剩余 <b>¥{fmt(val - spent)}</b> · 平均每天 <b>¥{fmt(Math.round((val - spent) / 7))}</b></>}
      </div>
    </EditSheet>
  );
}

// ── 账单条详情/编辑/删除 ────────────────────────────────
function BillDetailSheet({ state, item, dayLabel, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useStateE(false);
  const [cat, setCat] = useStateE(item.cat);
  const [note, setNote] = useStateE(item.note);
  const [amt, setAmt] = useStateE(Math.abs(item.amt));

  if (!item) return null;
  const income = item.amt < 0;

  const save = () => {
    onUpdate({ ...item, cat, note: note || CATS[cat].label, amt: income ? -Math.abs(parseFloat(amt) || 0) : Math.abs(parseFloat(amt) || 0) });
    setEditing(false);
    onClose();
  };

  if (editing) {
    const cats = income ? ['salary', 'redpack', 'other'] : ['food', 'transit', 'shop', 'fun', 'coffee', 'home', 'health', 'study', 'other'];
    return (
      <EditSheet title="编辑这笔账" onClose={() => setEditing(false)} actions={
        <button className="om-tap" onClick={save} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)' }}>
          <UiIcon name="check" size={16} /> 保存修改
        </button>
      }>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, padding: '4px 0 16px' }}>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 24, color: income ? 'var(--leaf)' : 'var(--ink)' }}>{income ? '+¥' : '-¥'}</span>
          <input value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" style={{
            border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', width: 180,
            fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 46, color: income ? 'var(--leaf)' : 'var(--ink)', letterSpacing: '-1px' }} />
        </div>
        <div className="cat-grid" style={{ marginBottom: 14 }}>
          {cats.map((k) => (
            <button key={k} className="om-tap" onClick={() => setCat(k)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, border: 'none', background: 'none', cursor: 'pointer' }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: cat === k ? CATS[k].tint : 'var(--paper)', color: cat === k ? 'var(--paper)' : CATS[k].tint, boxShadow: cat === k ? '0 3px 0 var(--ink)' : 'none' }}>
                <CatIcon name={k} size={24} />
              </span>
              <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, fontWeight: 700, color: cat === k ? 'var(--ink)' : 'var(--ink-soft)' }}>{CATS[k].label}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '2px solid var(--hair)', borderRadius: 14, padding: '10px 14px' }}>
          <UiIcon name="edit" size={17} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--ink)' }} />
        </div>
      </EditSheet>
    );
  }

  return (
    <EditSheet title="账单详情" onClose={onClose} actions={<>
      <button className="om-tap" onClick={() => { onDelete(item); onClose(); }} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--paper)', color: 'var(--coral)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <UiIcon name="close" size={16} /> 删除
      </button>
      <button className="om-tap" onClick={() => setEditing(true)} style={{ flex: 1.4, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <UiIcon name="edit" size={16} /> 编辑
      </button>
    </>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <span style={{ width: 64, height: 64, borderRadius: 18, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATS[item.cat].tint, background: 'var(--paper-2)', flexShrink: 0 }}>
          <CatIcon name={item.cat} size={34} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{item.note}</div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{CATS[item.cat].label}</div>
        </div>
        <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 26, color: income ? 'var(--leaf)' : 'var(--ink)', whiteSpace: 'nowrap' }}>
          {income ? '+' : '-'}¥{fmt(Math.abs(item.amt))}
        </div>
      </div>

      <div style={{ background: 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 14, padding: '6px 14px' }}>
        <Info label="日期" value={dayLabel || '今天'} />
        <Info label="时间" value={item.time} divider />
        <Info label="分类" value={CATS[item.cat].label} divider />
        <Info label="类型" value={income ? '收入' : '支出'} divider />
      </div>
    </EditSheet>
  );
}

function Info({ label, value, divider }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 2px', borderTop: divider ? '2px dashed var(--hair)' : 'none' }}>
      <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 13.5, color: 'var(--ink)', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

Object.assign(window, { NameEditSheet, BudgetEditSheet, BillDetailSheet });

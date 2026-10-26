// record.jsx 鈥?璁颁竴绗旓紙閲戦閿洏 + 鍒嗙被 + 鍠傞鍔ㄧ敾锛?// Exports: RecordSheet

const { useState: useStateR } = React;

const EXP_CATS = ['food', 'transit', 'shop', 'fun', 'coffee', 'home', 'health', 'study', 'other'];
const INC_CATS = ['salary', 'redpack', 'other'];

function RecordSheet({ state, onClose, onSaved }) {
  const todayValue = new Date().toISOString().slice(0, 10);
  const [type, setType] = useStateR('expense');
  const [cat, setCat] = useStateR('food');
  const [amount, setAmount] = useStateR('0');
  const [note, setNote] = useStateR('');
  const [date, setDate] = useStateR(todayValue);
  const [feeding, setFeeding] = useStateR(false);
  const [warning, setWarning] = useStateR(false);

  const configuredCats = (state.categories || []).filter((c) => c.visible !== false && (type === 'income' ? c.income : !c.income)).map((c) => c.id);
  const cats = configuredCats.length ? configuredCats : (type === 'expense' ? EXP_CATS : INC_CATS);
  const num = parseFloat(amount) || 0;

  React.useEffect(() => {
    if (!cats.includes(cat)) setCat(cats[0] || 'other');
  }, [type, state.categories]);

  // 瓒呮敮棰勫垽锛氭湰娆¤璐﹀悗浼氳鏈堟敮鍑鸿秴杩囬绠??
  const willOverspend = type === 'expense' && (state.budget.spent + num > state.budget.total);
  const willPushClose = type === 'expense' && !willOverspend && (state.budget.spent + num) / state.budget.total > 0.9;

  const press = (k) => {
    setAmount((a) => {
      if (k === 'del') return a.length <= 1 ? '0' : a.slice(0, -1);
      if (k === '.') return a.includes('.') ? a : a + '.';
      if (a === '0' && k !== '.') return k;
      if (a.includes('.') && a.split('.')[1].length >= 2) return a;
      return a + k;
    });
  };

  const save = () => {
    if (num <= 0) return;
    if (willOverspend) { setWarning(true); return; }
    confirmSave();
  };
  const confirmSave = () => {
    setWarning(false);
    setFeeding(true);
    setTimeout(() => { onSaved && onSaved({ cat, amt: num, note: note || CATS[cat].label, type, date }); }, 1700);
  };

  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {/* 澶撮儴 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px 14px' }}>
          <button className="om-tap icon-btn" onClick={onClose}><UiIcon name="close" size={22} /></button>
          <div style={{ display: 'flex', gap: 4, background: 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 999, padding: 3 }}>
            {[['expense', '支出'], ['income', '收入']].map(([k, l]) => (
              <button key={k} className="om-tap" onClick={() => { setType(k); setCat(k === 'expense' ? 'food' : 'salary'); }}
                style={{ border: 'none', borderRadius: 999, padding: '6px 18px', cursor: 'pointer',
                  background: type === k ? 'var(--ink)' : 'transparent', color: type === k ? 'var(--paper)' : 'var(--ink-soft)',
                  fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14 }}>{l}</button>
            ))}
          </div>
          <div style={{ width: 38 }} />
        </div>

        {/* 閲戦 */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, padding: '4px 0 16px' }}>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 26, color: 'var(--ink)' }}>¥</span>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 52, color: num > 0 ? 'var(--ink)' : 'var(--ink-soft)', lineHeight: 1, letterSpacing: '-1px' }}>{amount}</span>
        </div>

        {/* 鍒嗙被 */}
        <label className="om-tap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: 'fit-content', maxWidth: '100%', margin: '-8px auto 14px', border: '2px solid var(--ink)', borderRadius: 999, padding: '7px 13px', background: 'var(--paper-2)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <UiIcon name="cal" size={16} />
          <span>记账日期</span>
          <input type="date" value={date} max={todayValue} onChange={(e) => setDate(e.target.value || todayValue)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Baloo 2'", fontSize: 14, fontWeight: 800, color: 'var(--ink)', width: 120 }} />
        </label>

        <div className="cat-grid">
          {cats.map((k) => (
            <button key={k} className="om-tap" onClick={() => setCat(k)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, border: 'none', background: 'none', cursor: 'pointer' }}>
              <span style={{ width: 50, height: 50, borderRadius: 16, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: cat === k ? CATS[k].tint : 'var(--paper)', color: cat === k ? 'var(--paper)' : CATS[k].tint,
                boxShadow: cat === k ? '0 3px 0 var(--ink)' : 'none', transition: 'all .12s' }}>
                <CatIcon name={k} size={26} />
              </span>
              <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, fontWeight: 700, color: cat === k ? 'var(--ink)' : 'var(--ink-soft)' }}>{CATS[k].label}</span>
            </button>
          ))}
        </div>

        {/* 澶囨敞 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 2px 12px', border: '2px solid var(--hair)', borderRadius: 14, padding: '10px 14px' }}>
          <UiIcon name="edit" size={17} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={`给这笔${CATS[cat].label}加个备注...`}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Noto Sans SC'", fontSize: 14, color: 'var(--ink)' }} />
        </div>

        {/* 甯哥敤閲戦蹇嵎 */}

        <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto' }} className="noscroll">
          {[10, 20, 50, 100, 200, 500].map((v) => (
            <button key={v} className="om-tap" onClick={() => setAmount(String(v))} style={{
              flexShrink: 0, border: '2px solid var(--ink)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
              background: 'var(--paper)', color: 'var(--ink)', fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 13.5 }}>¥{v}</button>
          ))}
        </div>

        {/* 閿洏 */}
        <div className="keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map((k) => (
            <button key={k} className="om-tap keypad-key" onClick={() => press(k)}>
              {k === 'del' ? <UiIcon name="back" size={22} /> : k}
            </button>
          ))}
        </div>
        <div style={{ padding: '6px 2px 4px' }}>
          <Btn kind="honey" onClick={save} disabled={num <= 0}>
            <UiIcon name="check" size={20} /> 喂给{state.pet.name} · 记一笔
          </Btn>
        </div>
      </div>

      {/* 鍠傞鍔ㄧ敾 */}
      {feeding && <FeedOverlay state={state} cat={cat} amt={num} />}

      {/* 瓒呮敮浜屾纭 */}
      {warning && <OverspendOverlay state={state} amount={num} over={state.budget.spent + num - state.budget.total}
        onCancel={() => setWarning(false)} onConfirm={confirmSave} />}
    </div>
  );
}

// 瓒呮敮鎷︽埅锛氬疇鐗╂帰澶存壇琛ｈ
function OverspendOverlay({ state, amount, over, onCancel, onConfirm }) {
  const lines = [
    '主人，先别花啦，钱包要瘦了。',
    '这笔会冲破预算线，要不要再想想？',
    '我帮你守一下钱罐，真的要记这笔吗？',
  ];
  const line = lines[Math.floor(Math.random() * lines.length)];
  return (
    <div className="over-overlay" onClick={onCancel}>
      <div className="over-card" onClick={(e) => e.stopPropagation()}>
        <div className="over-tag"><span style={{ color: 'var(--coral)' }}>!</span> 这笔会超出本月预算</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, margin: '12px 0 6px' }}>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 18, color: 'var(--coral)' }}>超出</span>
          <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 38, color: 'var(--coral)', lineHeight: 1 }}>¥{fmt(over)}</span>
        </div>
        <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', marginBottom: 16 }}>
          月预算 ¥{fmt(state.budget.total)} · 已花 ¥{fmt(state.budget.spent)} · 本次 ¥{fmt(amount)}
        </div>

        {/* 瀹犵墿 + 姘旀场 */}
        <div className="over-pet-wrap">
          <div className="over-bubble"><SpeechBubble tail="down" tone="sad">{line}</SpeechBubble></div>
          <div className="over-pet"><Pet species={state.pet.species} mood="sad" size={140} /></div>
          {/* 琛ｈ灏忓浘锛氫粠椤堕儴鍨備笅 */}
          <svg className="over-cloth" width="80" height="80" viewBox="0 0 80 80">
            <path d="M10,0 L70,0 L66,40 Q40,52 14,40 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
            <line x1="20" y1="0" x2="22" y2="38" stroke="var(--ink)" strokeWidth="1.5" opacity="0.4" />
            <line x1="40" y1="0" x2="40" y2="46" stroke="var(--ink)" strokeWidth="1.5" opacity="0.4" />
            <line x1="60" y1="0" x2="58" y2="38" stroke="var(--ink)" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="om-tap" onClick={onConfirm} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: '12px', background: 'var(--paper)', color: 'var(--ink-soft)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            还是要花 ¥{fmt(amount)}
          </button>
          <button className="om-tap" onClick={onCancel} style={{ flex: 1.3, border: '2px solid var(--ink)', borderRadius: 16, padding: '12px', background: 'var(--leaf)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <UiIcon name="check" size={16} /> 先忍一下
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedOverlay({ state, cat, amt }) {
  const line = petLines.feed[Math.floor(Math.random() * petLines.feed.length)];
  return (
    <div className="feed-overlay" onClick={(e) => e.stopPropagation()}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="feed-coin"><Coin size={40} /></div>
        <div className="feed-pet"><Pet species={state.pet.species} mood="excited" accessory={state.pet.accessory} size={180} /></div>
        <div className="feed-bubble"><SpeechBubble tone="happy">{line}</SpeechBubble></div>
        <div className="feed-gain">
          <span style={{ color: 'var(--honey)' }}>鈼?+1</span>
          <span style={{ color: 'var(--coral)' }}>鈾?+5 exp</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RecordSheet });

// goals.jsx — 攒钱目标
// Exports: Goals

function Goals({ state, setState }) {
  const [adding, setAdding] = React.useState(false);
  const [detail, setDetail] = React.useState(null);
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);

  const deposit = (id) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + 200) } : g),
    }));
  };

  const removeGoal = (id) => {
    setState((s) => ({
      ...s,
      goals: s.goals.filter((g) => g.id !== id),
    }));
    setDetail(null);
  };

  return (
    <div style={{ padding: '4px 18px 24px' }}>
      {/* 总览 + 宠物 */}
      <div style={{ position: 'relative', background: 'var(--coral-tint)', border: '2px solid var(--ink)', borderRadius: 26, boxShadow: '0 4px 0 var(--ink)', padding: '18px', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>已为梦想攒下</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, margin: '2px 0 8px' }}>
            <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: 'var(--ink)' }}>¥</span>
            <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 36, color: 'var(--ink)', lineHeight: 1 }}>{fmt(totalSaved)}</span>
          </div>
          <Tag rotate={-2} bg="var(--paper)">距离全部目标还差 ¥{fmt(totalTarget - totalSaved)}</Tag>
        </div>
        <div style={{ marginBottom: -22, marginRight: -6 }}>
          <Pet species={state.pet.species} mood="excited" accessory={state.pet.accessory} size={120} />
        </div>
      </div>

      {/* 目标卡片 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 4px 12px' }}>
        <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>我的小目标</span>
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, color: 'var(--ink-soft)' }}>{state.goals.length} 个进行中</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {state.goals.map((g) => {
          const pct = Math.round(g.saved / g.target * 100);
          const done = g.saved >= g.target;
          return (
            <Card key={g.id} pad={16} onClick={() => setDetail(g)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.color, background: 'var(--paper-2)', flexShrink: 0 }}>
                  <CatIcon name={g.emoji} size={24} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 15.5, color: 'var(--ink)' }}>{g.title}</div>
                  <div style={{ fontFamily: "'Baloo 2'", fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700, marginTop: 1 }}>¥{fmt(g.saved)} <span style={{ color: 'var(--ink-soft)' }}>/ {fmt(g.target)}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: done ? 'var(--leaf)' : g.color }}>{pct}%</div>
                </div>
              </div>
              <Bar value={g.saved} max={g.target} color={done ? 'var(--leaf)' : g.color} h={12} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>
                  {done ? '🎉 目标达成啦！' : `每天存 ¥20，约 ${Math.ceil((g.target - g.saved) / 20)} 天达成`}
                </span>
                <button className="om-tap" onClick={(e) => { e.stopPropagation(); deposit(g.id); }} disabled={done} style={{
                  border: '2px solid var(--ink)', borderRadius: 12, padding: '7px 16px', cursor: done ? 'default' : 'pointer',
                  background: done ? 'var(--paper-2)' : 'var(--ink)', color: done ? 'var(--ink-soft)' : 'var(--paper)',
                  fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, boxShadow: done ? 'none' : '0 3px 0 var(--honey)' }}>
                  {done ? '已完成' : '+ 存 ¥200'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 新建目标 */}
      <button className="om-tap" onClick={() => setAdding(true)} style={{ width: '100%', marginTop: 14, border: '2px dashed var(--ink)', borderRadius: 18, padding: 16, background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ink-soft)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5 }}>
        <UiIcon name="plus" size={20} /> 立个新的小目标
      </button>

      {adding && <NewGoalSheet onClose={() => setAdding(false)} onCreate={(goal) => {
        setState((s) => ({ ...s, goals: [goal, ...s.goals] }));
        setAdding(false);
      }} />}
      {detail && (
        <GoalDetailSheet
          goal={state.goals.find((g) => g.id === detail.id) || detail}
          onClose={() => setDetail(null)}
          onDeposit={deposit}
          onDelete={removeGoal}
        />
      )}
    </div>
  );
}

function GoalDetailSheet({ goal, onClose, onDeposit, onDelete }) {
  const [confirming, setConfirming] = React.useState(false);
  const pct = Math.round(goal.saved / goal.target * 100);
  const done = goal.saved >= goal.target;
  const remain = Math.max(0, goal.target - goal.saved);

  return (
    <EditSheet title="攒钱目标详情" onClose={onClose}
      actions={confirming ? (
        <>
          <button className="om-tap" onClick={() => setConfirming(false)} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--paper)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
            取消
          </button>
          <button className="om-tap" onClick={() => onDelete(goal.id)} style={{ flex: 1.2, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--coral)', color: 'var(--paper)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)' }}>
            确认删除
          </button>
        </>
      ) : (
        <>
          <button className="om-tap" onClick={() => setConfirming(true)} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--paper)', color: 'var(--coral)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
            删除目标
          </button>
          <button className="om-tap" onClick={() => { if (!done) onDeposit(goal.id); }} disabled={done} style={{ flex: 1.3, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: done ? 'var(--paper-2)' : 'var(--honey)', color: done ? 'var(--ink-soft)' : 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: done ? 'default' : 'pointer', boxShadow: done ? 'none' : '0 4px 0 var(--ink)' }}>
            {done ? '已完成' : '+ 存 ¥200'}
          </button>
        </>
      )}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '2px 0 16px' }}>
        <span style={{ width: 62, height: 62, borderRadius: 18, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: goal.color, background: 'var(--paper-2)', flexShrink: 0 }}>
          <CatIcon name={goal.emoji} size={32} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>{goal.title}</div>
          <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 24, color: 'var(--ink)', marginTop: 2 }}>
            ¥{fmt(goal.saved)} <span style={{ color: 'var(--ink-soft)', fontSize: 16 }}>/ {fmt(goal.target)}</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 28, color: done ? 'var(--leaf)' : goal.color }}>{pct}%</div>
      </div>
      <Bar value={goal.saved} max={goal.target} color={done ? 'var(--leaf)' : goal.color} h={13} />
      <div style={{ marginTop: 14, background: confirming ? 'var(--coral-tint)' : 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 14, padding: '12px 14px', fontFamily: "'Noto Sans SC'", fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
        {confirming
          ? `确定删除「${goal.title}」吗？已攒金额记录也会一起移除。`
          : done
            ? '这个目标已经达成啦，可以删除或继续保留做纪念。'
            : `还差 ¥${fmt(remain)}，按每天 ¥20 计算，约 ${Math.ceil(remain / 20)} 天达成。`}
      </div>
    </EditSheet>
  );
}

function NewGoalSheet({ onClose, onCreate }) {
  const [title, setTitle] = React.useState('');
  const [target, setTarget] = React.useState(5000);
  const [saved, setSaved] = React.useState(0);
  const [emoji, setEmoji] = React.useState('shop');
  const [color, setColor] = React.useState('var(--coral)');
  const cleanTitle = title.trim();
  const safeTarget = Math.max(1, Number(target) || 0);
  const safeSaved = Math.max(0, Math.min(safeTarget, Number(saved) || 0));
  const canSave = cleanTitle && safeTarget > 0;
  const iconOptions = [
    ['shop', '购物'], ['home', '居家'], ['salary', '收入'], ['study', '学习'], ['fun', '娱乐'],
  ];
  const colorOptions = ['var(--coral)', 'var(--mist)', 'var(--leaf)', 'var(--honey)'];

  const save = () => {
    if (!canSave) return;
    onCreate({
      id: 'g' + Date.now(),
      title: cleanTitle,
      emoji,
      target: safeTarget,
      saved: safeSaved,
      color,
    });
  };

  return (
    <EditSheet title="新建攒钱目标" onClose={onClose}
      actions={
        <button className="om-tap" onClick={save} disabled={!canSave} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13,
          background: canSave ? 'var(--honey)' : 'var(--paper-2)', color: canSave ? 'var(--ink)' : 'var(--ink-soft)',
          fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: canSave ? 'pointer' : 'default', boxShadow: canSave ? '0 4px 0 var(--ink)' : 'none' }}>
          <UiIcon name="check" size={16} /> 保存目标
        </button>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
          目标名称
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={12} placeholder="比如：旅行基金" autoFocus
            style={{ marginTop: 8, width: '100%', border: '2px solid var(--ink)', borderRadius: 14, padding: '12px 14px', background: 'var(--paper)', outline: 'none',
              fontFamily: "'Noto Sans SC'", fontSize: 15, color: 'var(--ink)' }} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
            目标金额
            <input type="number" min="1" value={target} onChange={(e) => setTarget(e.target.value)}
              style={{ marginTop: 8, width: '100%', border: '2px solid var(--ink)', borderRadius: 14, padding: '12px 14px', background: 'var(--paper)', outline: 'none',
                fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }} />
          </label>
          <label style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
            已攒金额
            <input type="number" min="0" max={safeTarget} value={saved} onChange={(e) => setSaved(e.target.value)}
              style={{ marginTop: 8, width: '100%', border: '2px solid var(--ink)', borderRadius: 14, padding: '12px 14px', background: 'var(--paper)', outline: 'none',
                fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }} />
          </label>
        </div>
        <div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>图标</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {iconOptions.map(([id, label]) => (
              <button key={id} className="om-tap" onClick={() => setEmoji(id)} style={{ border: '2px solid var(--ink)', borderRadius: 14, padding: '8px 10px',
                background: emoji === id ? 'var(--ink)' : 'var(--paper)', color: emoji === id ? 'var(--paper)' : 'var(--ink)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 12 }}>
                <CatIcon name={id} size={18} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>颜色</div>
          <div style={{ display: 'flex', gap: 9 }}>
            {colorOptions.map((c) => (
              <button key={c} className="om-tap" onClick={() => setColor(c)} aria-label={c}
                style={{ width: 34, height: 34, borderRadius: 12, border: '2px solid var(--ink)', background: c, cursor: 'pointer', boxShadow: color === c ? '0 3px 0 var(--ink)' : 'none' }}>
                {color === c && <UiIcon name="check" size={17} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </EditSheet>
  );
}

Object.assign(window, { Goals });

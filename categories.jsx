// categories.jsx - 分类管理
// Exports: CategoryManageSheet

function CategoryManageSheet({ state, setState, onClose }) {
  const firstId = state.categories && state.categories[0] && state.categories[0].id;
  const [selectedId, setSelectedId] = React.useState(firstId || 'food');
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [dragId, setDragId] = React.useState(null);
  const categories = state.categories || [];
  const selected = categories.find((c) => c.id === selectedId) || categories[0];
  const colors = ['#F08A6E', '#E0A4C4', '#B98C6A', '#C7A86B', '#8FB6C7', '#D39A62', '#8FB87A', '#7FA9D9', '#C99A52', '#7FB58C', '#E08A7A', '#A99B86'];
  const iconOptions = ['food', 'shop', 'coffee', 'fun', 'transit', 'transfer', 'home', 'health', 'study', 'salary', 'redpack', 'other'];

  const updateCat = (id, patch) => {
    setState((s) => ({
      ...s,
      categories: (s.categories || []).map((c) => c.id === id ? { ...c, ...patch } : c),
    }));
  };

  const reorderCategory = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setState((s) => {
      const list = [...(s.categories || [])];
      const from = list.findIndex((c) => c.id === fromId);
      const to = list.findIndex((c) => c.id === toId);
      if (from < 0 || to < 0) return s;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { ...s, categories: list };
    });
  };

  const moveSelected = (dir) => {
    if (!selected) return;
    setState((s) => {
      const list = [...(s.categories || [])];
      const index = list.findIndex((c) => c.id === selected.id);
      const next = index + dir;
      if (index < 0 || next < 0 || next >= list.length) return s;
      [list[index], list[next]] = [list[next], list[index]];
      return { ...s, categories: list };
    });
  };

  const addCategory = () => {
    const id = `custom_${Date.now()}`;
    const cat = {
      id,
      label: '新分类',
      tint: '#A99B86',
      icon: 'other',
      visible: true,
      income: false,
      keywords: '',
      custom: true,
    };
    setState((s) => ({ ...s, categories: [...(s.categories || []), cat] }));
    setSelectedId(id);
    setConfirmDelete(false);
  };

  const deleteSelected = () => {
    if (!selected || !selected.custom) return;
    const fallbackId = (categories.find((c) => c.id !== selected.id && c.id === 'other') || categories.find((c) => c.id !== selected.id) || {}).id || 'other';
    setState((s) => ({
      ...s,
      categories: (s.categories || []).filter((c) => c.id !== selected.id),
      days: (s.days || []).map((d) => ({
        ...d,
        items: (d.items || []).map((it) => it.cat === selected.id ? { ...it, cat: fallbackId } : it),
      })),
      byCat: (s.byCat || []).map((c) => c.cat === selected.id ? { ...c, cat: fallbackId } : c),
    }));
    setSelectedId(fallbackId);
    setConfirmDelete(false);
  };

  if (!selected) return null;

  return (
    <EditSheet title="分类管理" onClose={onClose}
      actions={
        <button className="om-tap" onClick={onClose} style={{ flex: 1, border: '2px solid var(--ink)', borderRadius: 16, padding: 13, background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)' }}>
          完成
        </button>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="noscroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map((c) => (
            <button key={c.id} className="om-tap" draggable
              onDragStart={(e) => { setDragId(c.id); e.dataTransfer.effectAllowed = 'move'; }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDrop={(e) => { e.preventDefault(); reorderCategory(dragId, c.id); setDragId(null); }}
              onDragEnd={() => setDragId(null)}
              onClick={() => { setSelectedId(c.id); setConfirmDelete(false); }} style={{
              flex: '0 0 auto', border: '2px solid var(--ink)', borderRadius: 14, padding: '8px 10px',
              background: selected.id === c.id ? 'var(--ink)' : 'var(--paper)',
              color: selected.id === c.id ? 'var(--paper)' : 'var(--ink)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 12,
              opacity: c.visible === false ? 0.55 : (dragId === c.id ? 0.65 : 1),
            }}>
              <CatIcon name={c.icon || c.id} size={18} /> {c.label || '未命名'}
            </button>
          ))}
          <button className="om-tap" onClick={addCategory} style={{
            flex: '0 0 auto', border: '2px dashed var(--ink)', borderRadius: 14, padding: '8px 12px',
            background: 'var(--paper-2)', color: 'var(--ink)', cursor: 'pointer',
            fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 12,
          }}>
            + 新增
          </button>
        </div>

        <div style={{ border: '2px solid var(--ink)', borderRadius: 18, padding: 14, background: 'var(--paper-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ width: 50, height: 50, borderRadius: 16, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selected.tint, background: 'var(--paper)', flexShrink: 0 }}>
              <CatIcon name={selected.icon || selected.id} size={28} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{selected.label || '未命名'}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>{selected.income ? '收入分类' : '支出分类'}{selected.custom ? ' · 自定义' : ''}</div>
            </div>
            <button className="om-tap" onClick={() => updateCat(selected.id, { visible: selected.visible === false })} style={{
              border: '2px solid var(--ink)', borderRadius: 999, padding: '7px 12px', background: selected.visible === false ? 'var(--paper)' : 'var(--ink)',
              color: selected.visible === false ? 'var(--ink)' : 'var(--paper)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>
              {selected.visible === false ? '已隐藏' : '显示中'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <button className="om-tap" onClick={() => moveSelected(-1)} style={{
              border: '2px solid var(--ink)', borderRadius: 14, padding: '10px 8px',
              background: 'var(--paper)', color: 'var(--ink)',
              fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              ↑ 前移
            </button>
            <button className="om-tap" onClick={() => moveSelected(1)} style={{
              border: '2px solid var(--ink)', borderRadius: 14, padding: '10px 8px',
              background: 'var(--paper)', color: 'var(--ink)',
              fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
              ↓ 后移
            </button>
          </div>

          <label style={{ display: 'block', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 12 }}>
            分类名称
            <input value={selected.label || ''} onChange={(e) => updateCat(selected.id, { label: e.target.value.slice(0, 8) })}
              onBlur={(e) => { if (!e.target.value.trim()) updateCat(selected.id, { label: '新分类' }); }}
              style={{ marginTop: 8, width: '100%', border: '2px solid var(--ink)', borderRadius: 14, padding: '11px 12px', background: 'var(--paper)', outline: 'none', fontFamily: "'Noto Sans SC'", fontSize: 14.5, color: 'var(--ink)' }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { income: false, label: '支出' },
              { income: true, label: '收入' },
            ].map((opt) => (
              <button key={opt.label} className="om-tap" onClick={() => updateCat(selected.id, { income: opt.income })} style={{
                border: '2px solid var(--ink)', borderRadius: 14, padding: '10px 8px',
                background: selected.income === opt.income ? 'var(--ink)' : 'var(--paper)',
                color: selected.income === opt.income ? 'var(--paper)' : 'var(--ink)',
                fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                {opt.label}分类
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>图标</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {iconOptions.map((icon) => (
                <button key={icon} className="om-tap" onClick={() => updateCat(selected.id, { icon })} style={{
                  width: 34, height: 34, borderRadius: 11, border: '2px solid var(--ink)',
                  background: (selected.icon || selected.id) === icon ? 'var(--honey)' : 'var(--paper)',
                  color: CATS[icon] ? CATS[icon].tint : 'var(--ink)', cursor: 'pointer',
                  boxShadow: (selected.icon || selected.id) === icon ? '0 3px 0 var(--ink)' : 'none',
                }}>
                  <CatIcon name={icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>颜色</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {colors.map((color) => (
                <button key={color} className="om-tap" onClick={() => updateCat(selected.id, { tint: color })} style={{ width: 30, height: 30, borderRadius: 10, border: '2px solid var(--ink)', background: color, cursor: 'pointer', boxShadow: selected.tint === color ? '0 3px 0 var(--ink)' : 'none' }}>
                  {selected.tint === color && <UiIcon name="check" size={14} />}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'block', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
            自动归类关键词
            <textarea value={selected.keywords || ''} onChange={(e) => updateCat(selected.id, { keywords: e.target.value })}
              placeholder="例如：美团 饿了么 烧烤"
              style={{ marginTop: 8, width: '100%', minHeight: 78, resize: 'vertical', border: '2px solid var(--ink)', borderRadius: 14, padding: '11px 12px', background: 'var(--paper)', outline: 'none', fontFamily: "'Noto Sans SC'", fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.5 }} />
          </label>
          <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)', lineHeight: 1.5, marginTop: 8 }}>
            导入账单时会优先按这里的关键词匹配；多个关键词用逗号、空格或换行分隔。
          </div>

          {selected.custom && (
            <div style={{ borderTop: '1px dashed rgba(49,39,29,.3)', marginTop: 14, paddingTop: 12 }}>
              {!confirmDelete ? (
                <button className="om-tap" onClick={() => setConfirmDelete(true)} style={{
                  width: '100%', border: '2px solid var(--ink)', borderRadius: 14, padding: '11px 12px',
                  background: 'var(--paper)', color: 'var(--coral)', fontFamily: "'Noto Sans SC'", fontWeight: 800, fontSize: 13.5, cursor: 'pointer',
                }}>
                  删除这个自定义分类
                </button>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button className="om-tap" onClick={() => setConfirmDelete(false)} style={{ border: '2px solid var(--ink)', borderRadius: 14, padding: '11px 12px', background: 'var(--paper)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                    取消
                  </button>
                  <button className="om-tap" onClick={deleteSelected} style={{ border: '2px solid var(--ink)', borderRadius: 14, padding: '11px 12px', background: 'var(--coral)', color: 'var(--paper)', fontFamily: "'Noto Sans SC'", fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>
                    确认删除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </EditSheet>
  );
}

Object.assign(window, { CategoryManageSheet });

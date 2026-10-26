// petpage.jsx — 宠物养成 / 装扮
// Exports: PetPage

function PetPage({ state, setState }) {
  const pet = state.pet;
  const nextLv = pet.level + 1;
  const [renaming, setRenaming] = React.useState(false);
  const [restoreMsg, setRestoreMsg] = React.useState('');
  const restoreRef = React.useRef(null);
  const equip = (id, owned) => {
    if (owned) { setState((s) => ({ ...s, pet: { ...s.pet, accessory: id } })); return; }
  };
  const unlock = (item) => {
    if (pet.coins < item.cost) return;
    setState((s) => ({
      ...s,
      pet: { ...s.pet, coins: s.pet.coins - item.cost, accessory: item.id },
      shop: s.shop.map((x) => x.id === item.id ? { ...x, owned: true } : x),
    }));
  };
  const choose = (sid) => {
    if (sid === pet.species) return;
    setState((s) => ({ ...s, pet: { ...s.pet, species: sid, name: SPECIES[sid].name } }));
  };
  const saveName = (n) => setState((s) => ({ ...s, pet: { ...s.pet, name: n } }));
  const exportBackup = () => {
    const payload = { app: '存崽记账', version: 1, exportedAt: new Date().toISOString(), state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `存崽记账备份-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setRestoreMsg('已导出备份文件');
  };
  const restoreBackup = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || ''));
        const nextState = data && data.state ? data.state : data;
        if (!nextState || !nextState.pet || !Array.isArray(nextState.days) || !nextState.budget) throw new Error('invalid backup');
        setState(nextState);
        setRestoreMsg('恢复成功，数据已写入本机');
      } catch (e) {
        setRestoreMsg('恢复失败：请选择存崽记账导出的 JSON 备份');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div style={{ padding: '4px 18px 24px' }}>
      {/* 宠物展示台 */}
      <div style={{ position: 'relative', background: 'var(--mist-tint)', border: '2px solid var(--ink)', borderRadius: 26, boxShadow: '0 4px 0 var(--ink)', padding: '18px 18px 22px', overflow: 'hidden' }}>
        <div className="stage-dots" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="om-tap" onClick={() => setRenaming(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 12, padding: '5px 12px', transform: 'rotate(-3deg)', cursor: 'pointer', fontFamily: "'ZCOOL KuaiLe', sans-serif", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', boxShadow: '0 3px 0 var(--ink)' }}>
            {pet.name} <span style={{ color: 'var(--ink-soft)' }}><UiIcon name="edit" size={12} /></span>
          </button>
          <Tag rotate={3} bg="var(--paper)"><span style={{ color: 'var(--honey)', fontWeight: 800 }}>◎</span>{fmt(pet.coins)}</Tag>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 4px' }}>
          <PokeablePet species={pet.species} mood="happy" accessory={pet.accessory} size={180} lines={petLines} tone="happy" />
        </div>
        {/* 等级 + 经验 */}
        <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 16, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Lv.{pet.level} {petTitle(pet.level)}</span>
            <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 11.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>再记 {Math.max(1, Math.ceil((100 - pet.exp) / 8))} 笔升到 Lv.{nextLv}</span>
          </div>
          <Bar value={pet.exp} max={100} color="var(--coral)" h={12} />
        </div>
      </div>

      {/* 选择伙伴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 4px 12px' }}>
        <UiIcon name="spark" size={20} />
        <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>选择伙伴</span>
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>· 喜欢哪只就选哪只</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {['pig', 'cat', 'dog', 'rabbit'].map((sid) => {
          const chosen = pet.species === sid;
          return (
            <div key={sid} className="om-tap" onClick={() => choose(sid)}
              style={{ position: 'relative', background: chosen ? 'var(--coral-tint)' : 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 18,
                boxShadow: chosen ? '0 4px 0 var(--coral)' : '0 4px 0 var(--ink)', padding: '10px 6px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {chosen && <span style={{ position: 'absolute', top: 6, right: 6, color: 'var(--coral)' }}><UiIcon name="check" size={16} /></span>}
              <div style={{ height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pet species={sid} mood="happy" size={80} />
              </div>
              <div style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 14, color: 'var(--ink)', marginTop: 2, whiteSpace: 'nowrap' }}>{SPECIES[sid].name}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 1, whiteSpace: 'nowrap' }}>{SPECIES[sid].desc}</div>
            </div>
          );
        })}
      </div>

      {/* 装扮商店 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 4px 12px' }}>
        <UiIcon name="gift" size={20} />
        <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>装扮衣橱</span>
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>· 用攒下的金币解锁</span>
      </div>
      <div className="shop-grid">
        {state.shop.map((item) => {
          const equipped = pet.accessory === item.id;
          const affordable = pet.coins >= item.cost;
          return (
            <div key={item.id} className="om-tap" onClick={() => item.owned ? equip(item.id, true) : unlock(item)}
              style={{ position: 'relative', background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 18,
                boxShadow: equipped ? '0 4px 0 var(--coral)' : '0 4px 0 var(--ink)', padding: 12, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {equipped && <span style={{ position: 'absolute', top: 8, right: 8, color: 'var(--coral)' }}><UiIcon name="check" size={18} /></span>}
              <div style={{ height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: item.owned ? 'none' : 'grayscale(.6) opacity(.85)' }}>
                <Pet species={pet.species} mood="content" accessory={item.id} size={96} />
              </div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', marginTop: 2 }}>{item.label}</div>
              <div style={{ marginTop: 6 }}>
                {item.owned ? (
                  <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, fontWeight: 700, color: equipped ? 'var(--coral)' : 'var(--ink-soft)' }}>{equipped ? '穿着中' : '点击穿上'}</span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Baloo 2'", fontSize: 13, fontWeight: 800, color: affordable ? 'var(--ink)' : 'var(--ink-soft)' }}>
                    {!affordable && <UiIcon name="lock" size={13} />}<span style={{ color: 'var(--honey)' }}>◎</span>{fmt(item.cost)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 数据保险箱 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 4px 12px' }}>
        <UiIcon name="save" size={20} />
        <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>数据保险箱</span>
        <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>· 换手机前先备份</span>
      </div>
      <Card pad={14}>
        <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12.5, lineHeight: 1.55, color: 'var(--ink-soft)', marginBottom: 12 }}>
          导出会保存账单、预算、目标、存崽等级和装扮；恢复会覆盖当前本机数据。
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="om-tap" onClick={exportBackup} style={{ border: '2px solid var(--ink)', borderRadius: 14, background: 'var(--honey)', color: 'var(--ink)', boxShadow: '0 3px 0 var(--ink)', padding: '11px 8px', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            导出备份
          </button>
          <button className="om-tap" onClick={() => restoreRef.current && restoreRef.current.click()} style={{ border: '2px solid var(--ink)', borderRadius: 14, background: 'var(--paper)', color: 'var(--ink)', boxShadow: '0 3px 0 var(--ink)', padding: '11px 8px', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            恢复备份
          </button>
        </div>
        <input ref={restoreRef} type="file" accept="application/json,.json" onChange={(e) => restoreBackup(e.target.files && e.target.files[0])} style={{ display: 'none' }} />
        {restoreMsg && <div style={{ marginTop: 10, fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)' }}>{restoreMsg}</div>}
      </Card>

      {/* 成长里程碑 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 4px 12px' }}>
        <UiIcon name="spark" size={20} />
        <span style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>成长之路</span>
      </div>
      <Card pad={16}>
        {[
          { lv: 1, t: '蛋壳期', d: '第一次记账，破壳而出', done: true },
          { lv: 3, t: '储蓄学徒', d: '连续记账 30 天', done: true, now: true },
          { lv: 5, t: '理财小能手', d: '达成 3 个攒钱目标', done: false },
          { lv: 8, t: '存钱罐大师', d: '攒满 ¥10000', done: false },
        ].map((m, i, arr) => (
          <div key={m.lv} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: m.done ? (m.now ? 'var(--coral)' : 'var(--honey)') : 'var(--paper-2)', flexShrink: 0,
                fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 13, color: m.done ? 'var(--paper)' : 'var(--ink-soft)' }}>{m.lv}</span>
              {i < arr.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 22, background: 'var(--hair)', borderRadius: 2 }} />}
            </div>
            <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
              <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, color: m.done ? 'var(--ink)' : 'var(--ink-soft)' }}>{m.t} {m.now && <span style={{ color: 'var(--coral)', fontSize: 11 }}>· 当前</span>}</div>
              <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 12, color: 'var(--ink-soft)', marginTop: 1 }}>{m.d}</div>
            </div>
          </div>
        ))}
      </Card>
      {renaming && <NameEditSheet state={state} onClose={() => setRenaming(false)} onSave={saveName} />}
    </div>
  );
}

Object.assign(window, { PetPage });

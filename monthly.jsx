// monthly.jsx — 月度小结分享卡（可截图保存）
// Exports: MonthlyReport

function MonthlyReport({ state, onClose }) {
  const totalSpent = state.byCat.reduce((a, c) => a + c.amt, 0);
  const top = [...state.byCat].sort((a, b) => b.amt - a.amt).slice(0, 3);
  const days = state.days.length;
  const saved = state.budget.total - state.budget.spent;
  const ins = buildInsights(state);
  const [savedTip, setSavedTip] = React.useState(false);

  const saveImage = (e) => {
    e.stopPropagation();
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = 540 * scale;
    canvas.height = 760 * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const ink = '#332A20';
    const paper = '#FBF6EA';
    const paper2 = '#F0E6D2';
    const honey = '#F2B33D';
    const coral = '#F08A6E';
    const mist = '#8FB6C7';
    const leaf = '#8FB87A';
    const money = (n) => `¥${fmt(Math.abs(n))}`;
    const round = (x, y, w, h, r, fill, stroke = ink) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
    };
    const text = (value, x, y, size, weight = 700, color = ink, align = 'left') => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = align;
      ctx.fillText(value, x, y);
    };

    ctx.fillStyle = '#E7DAC0';
    ctx.fillRect(0, 0, 540, 760);
    round(34, 34, 472, 692, 28, paper);
    text(`${state.pet.name} · ${state.budget.month}小报告`, 270, 82, 20, 700, ink, 'center');
    text('这个月我陪你存到啦', 270, 122, 30, 800, ink, 'center');
    round(72, 154, 396, 130, 22, '#FCE3DB');
    text('本月结余', 104, 196, 18, 700, '#8A7A65');
    text(`${saved >= 0 ? '+' : '-'}${money(saved)}`, 104, 246, 44, 800, saved >= 0 ? leaf : coral);
    text(`预算 ${money(state.budget.total)}`, 350, 246, 18, 700, '#8A7A65');

    const stats = [
      ['收入', money(state.budget.income), leaf],
      ['支出', money(state.budget.spent), coral],
      ['记账', `${days} 天`, honey],
      ['健康分', `${Math.round(ins.score)}`, mist],
    ];
    stats.forEach((s, i) => {
      const x = 72 + i * 99;
      round(x, 306, 82, 76, 14, paper2);
      text(s[1], x + 41, 338, 19, 800, s[2], 'center');
      text(s[0], x + 41, 366, 13, 700, '#8A7A65', 'center');
    });

    text('钱花在哪里 Top 3', 72, 426, 18, 800);
    top.forEach((c, i) => {
      const y = 454 + i * 58;
      round(72, y, 396, 44, 13, paper);
      text(`${i + 1}. ${CATS[c.cat].label}`, 94, y + 29, 17, 700);
      text(money(c.amt), 446, y + 29, 18, 800, ink, 'right');
    });

    round(72, 642, 396, 48, 16, '#E0EDF1');
    text(saved >= 0 ? '比上月更稳啦，下个月继续保持。' : '这个月有点超支，下个月一起加油。', 270, 673, 17, 700, ink, 'center');
    text('存崽记账', 270, 710, 16, 800, '#8A7A65', 'center');

    const link = document.createElement('a');
    link.download = `存崽记账-${state.budget.month.replace(/\s/g, '')}-月报.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setSavedTip(true);
    setTimeout(() => setSavedTip(false), 1800);
  };

  return (
    <div className="report-overlay" onClick={onClose}>
      <button className="om-tap report-close" onClick={onClose}><UiIcon name="close" size={22} /></button>

      <div className="report-card" onClick={(e) => e.stopPropagation()}>
        {/* 头部彩带 */}
        <div className="report-header">
          <span className="report-conf c1" />
          <span className="report-conf c2" />
          <span className="report-conf c3" />
          <span className="report-conf c4" />
          <div style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 16, color: 'var(--ink)', opacity: 0.7 }}>{state.pet.name} · {state.budget.month}小报告</div>
          <div style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 28, color: 'var(--ink)', marginTop: 2, whiteSpace: 'nowrap' }}>这个月我陪你存到啦</div>
        </div>

        {/* 宠物 + 关键数字 */}
        <div className="report-pet-row">
          <div style={{ flexShrink: 0 }}><Pet species={state.pet.species} mood="excited" accessory={state.pet.accessory} size={120} /></div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>本月结余</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 40, color: saved >= 0 ? 'var(--leaf)' : 'var(--coral)', lineHeight: 1 }}>
              {saved >= 0 ? '+' : ''}¥{fmt(Math.abs(saved))}
            </div>
            <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>预算 ¥{fmt(state.budget.total)}</div>
          </div>
        </div>

        {/* 4 宫格关键数据 */}
        <div className="report-stats">
          <Stat label="收入" value={`¥${fmt(state.budget.income)}`} color="var(--leaf)" />
          <Stat label="支出" value={`¥${fmt(state.budget.spent)}`} color="var(--coral)" />
          <Stat label="记账" value={`${days} 天`} color="var(--honey)" />
          <Stat label="健康分" value={Math.round(ins.score)} color="var(--mist)" />
        </div>

        {/* Top 3 分类 */}
        <div style={{ fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: '14px 2px 8px' }}>钱花在了哪里 Top 3</div>
        <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 14, padding: 4 }}>
          {top.map((c, i) => (
            <div key={c.cat} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderBottom: i === 2 ? 'none' : '2px dashed var(--hair)' }}>
              <span style={{ width: 28, height: 28, borderRadius: 9, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CATS[c.cat].tint, flexShrink: 0 }}>
                <CatIcon name={c.cat} size={17} />
              </span>
              <span style={{ flex: 1, fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{i + 1}. {CATS[c.cat].label}</span>
              <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 14, color: 'var(--ink)', whiteSpace: 'nowrap' }}>¥{fmt(c.amt)}</span>
            </div>
          ))}
        </div>

        {/* 宠物寄语 */}
        <div className="report-quote">
          <SpeechBubble tone="happy">
            {saved >= 0
              ? `比上月少花 ${Math.abs(Math.round(ins.momDelta * 100))}%，真乖！\n下个月继续呀~`
              : `本月超支 ¥${fmt(Math.abs(saved))}，呜…\n下个月我们一起加油！`}
          </SpeechBubble>
        </div>

        {/* 底部 logo */}
        <div className="report-footer">
          <Pet species={state.pet.species} mood="content" size={22} />
          <span style={{ fontFamily: "'ZCOOL KuaiLe'", fontSize: 13, color: 'var(--ink-soft)' }}>存崽记账</span>
          <span style={{ fontFamily: "'Noto Sans SC'", fontSize: 10.5, color: 'var(--ink-soft)' }}>{state.budget.month} · 由存崽生成</span>
        </div>
      </div>

      {/* 分享按钮 */}
      <div className="report-actions" onClick={(e) => e.stopPropagation()}>
        <button className="om-tap" onClick={onClose} style={{ flex: 1, border: '2px solid var(--paper)', borderRadius: 16, padding: '12px', background: 'transparent', color: 'var(--paper)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          关闭
        </button>
        <button className="om-tap" onClick={saveImage} style={{ flex: 1.4, border: '2px solid var(--ink)', borderRadius: 16, padding: '12px', background: 'var(--honey)', color: 'var(--ink)', fontFamily: "'Noto Sans SC'", fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 0 var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <UiIcon name="arrow" size={16} /> {savedTip ? '已保存' : '保存图片'}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: 'var(--paper)', border: '2px solid var(--ink)', borderRadius: 13, padding: '8px 4px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 18, color, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{value}</div>
      <div style={{ fontFamily: "'Noto Sans SC'", fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { MonthlyReport });

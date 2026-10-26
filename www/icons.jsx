// icons.jsx — 手绘线条小图标（分类 + 界面）
// Exports: CatIcon, UiIcon, CATS

const CATS = {
  transfer:{ label: '转账', tint: '#D39A62' },
  food:    { label: '餐饮', tint: '#F08A6E' },
  transit: { label: '交通', tint: '#8FB6C7' },
  shop:    { label: '购物', tint: '#E0A4C4' },
  fun:     { label: '娱乐', tint: '#C7A86B' },
  home:    { label: '居家', tint: '#8FB87A' },
  coffee:  { label: '咖啡', tint: '#B98C6A' },
  health:  { label: '医疗', tint: '#7FA9D9' },
  study:   { label: '学习', tint: '#C99A52' },
  salary:  { label: '工资', tint: '#7FB58C', income: true },
  redpack: { label: '红包', tint: '#E08A7A', income: true },
  other:   { label: '其他', tint: '#A99B86' },
};

// 24x24 线条图标，stroke 用 currentColor
function CatIcon({ name, size = 24 }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const iconName = (CATS[name] && CATS[name].icon) || name;
  const paths = {
    transfer: <g {...p}><path d="M7 7h10M13 3l4 4-4 4" /><path d="M17 17H7M11 13l-4 4 4 4" /></g>,
    food: <g {...p}><path d="M5 3v7a2 2 0 0 0 4 0V3M7 3v18" /><path d="M17 3c-1.5 1-2.5 3-2.5 5.5S15 13 17 14v7" /></g>,
    transit: <g {...p}><rect x="5" y="3" width="14" height="13" rx="2" /><path d="M5 11h14M9 19l-2 2M15 19l2 2" /><circle cx="8.5" cy="13.5" r=".6" fill="currentColor" /><circle cx="15.5" cy="13.5" r=".6" fill="currentColor" /></g>,
    shop: <g {...p}><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></g>,
    fun: <g {...p}><rect x="3" y="8" width="18" height="9" rx="4.5" /><path d="M7 11v3M5.5 12.5h3" /><circle cx="16" cy="12" r=".8" fill="currentColor" /><circle cx="18" cy="14" r=".8" fill="currentColor" /></g>,
    home: <g {...p}><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></g>,
    coffee: <g {...p}><path d="M5 8h12v5a5 5 0 0 1-10 0V8Z" /><path d="M17 9h2a2 2 0 0 1 0 5h-2" /><path d="M8 3v2M11 3v2" /></g>,
    health: <g {...p}><rect x="4" y="8" width="16" height="11" rx="2" /><path d="M9 8V5h6v3M12 11v5M9.5 13.5h5" /></g>,
    study: <g {...p}><path d="M12 6c-2-1.5-5-1.5-7 0v12c2-1.5 5-1.5 7 0M12 6c2-1.5 5-1.5 7 0v12c-2-1.5-5-1.5-7 0M12 6v12" /></g>,
    salary: <g {...p}><ellipse cx="12" cy="7" rx="6" ry="2.5" /><path d="M6 7v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7M6 12v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5" /></g>,
    redpack: <g {...p}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M5 9c3 2.5 11 2.5 14 0" /><circle cx="12" cy="11" r="1.6" /></g>,
    other: <g {...p}><circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{paths[iconName] || paths.other}</svg>;
}

// 通用界面图标
function UiIcon({ name, size = 24, stroke = 2 }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <g {...p}><path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" /></g>,
    list: <g {...p}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></g>,
    chart: <g {...p}><path d="M4 20V4M4 20h16" /><rect x="7" y="12" width="3" height="5" /><rect x="12" y="8" width="3" height="9" /><rect x="17" y="14" width="3" height="3" /></g>,
    target: <g {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".8" fill="currentColor" /></g>,
    pet: <g {...p}><path d="M48 0" /><circle cx="12" cy="13" r="7" /><path d="M7 6.5 6 3M17 6.5 18 3" /></g>,
    plus: <g {...p}><path d="M12 6v12M6 12h12" /></g>,
    back: <g {...p}><path d="M15 5l-7 7 7 7" /></g>,
    close: <g {...p}><path d="M6 6l12 12M18 6L6 18" /></g>,
    check: <g {...p}><path d="M5 13l4 4L19 7" /></g>,
    edit: <g {...p}><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="M14 6l4 4" /></g>,
    gift: <g {...p}><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M4 13h16M12 9v11" /><path d="M12 9c-1-3-5-4-5-1.5S10 9 12 9ZM12 9c1-3 5-4 5-1.5S14 9 12 9Z" /></g>,
    cal: <g {...p}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></g>,
    lock: <g {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
    spark: <g {...p}><path d="M12 4l1.6 5.4L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-1.6L12 4Z" /></g>,
    arrow: <g {...p}><path d="M5 12h14M13 6l6 6-6 6" /></g>,
    coin: <g {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 10.5h3.5a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3h3" strokeWidth="1.6" /></g>,
    flame: <g {...p}><path d="M12 3c1 3 5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3 1.5-4 .5 2 1.5 2.5 2 2.5C10 9 11 6 12 3Z" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{paths[name] || null}</svg>;
}

Object.assign(window, { CatIcon, UiIcon, CATS });

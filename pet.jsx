// pet.jsx — 手绘线条存钱宠物（小猪 / 招财猫 / 柴犬）
// Exports: Pet, SpeechBubble, Coin, PetStar
// 同样的蛋形身体 + 投币口；耳朵/鼻嘴/尾巴按物种切换；表情由 mood 控制。

const INK = 'var(--pet-line)';

// ── 通用：眼睛 / 腮红 / 头顶装饰（按情绪） ─────────────────
function Eyes({ mood }) {
  const ew = { stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round', fill: 'none' };
  switch (mood) {
    case 'happy':
      return (<g>
        <path d="M78,103 Q85,95 92,103" {...ew} />
        <path d="M108,103 Q115,95 122,103" {...ew} />
      </g>);
    case 'excited':
      return (<g><PetStar cx={85} cy={101} r={7} /><PetStar cx={115} cy={101} r={7} /></g>);
    case 'sad':
      return (<g>
        <path d="M78,100 Q85,107 92,100" {...ew} />
        <path d="M108,100 Q115,107 122,100" {...ew} />
      </g>);
    case 'sleeping':
      return (<g>
        <path d="M78,102 h14" {...ew} />
        <path d="M108,102 h14" {...ew} />
      </g>);
    default:
      return (<g><circle cx={85} cy={102} r={4} fill={INK} /><circle cx={115} cy={102} r={4} fill={INK} /></g>);
  }
}

function Blush({ l = 76, r = 124 }) {
  const s = { opacity: 'var(--blush-op,.55)' };
  return (<g>
    <ellipse cx={l} cy={119} rx={8} ry={5} fill="var(--coral)" style={s} />
    <ellipse cx={r} cy={119} rx={8} ry={5} fill="var(--coral)" style={s} />
  </g>);
}

function Decor({ mood }) {
  switch (mood) {
    case 'excited':
      return <path d="M58,58 L52,50 M100,46 L100,37 M142,58 L148,50" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />;
    case 'sleeping':
      return (<g>
        <text x={140} y={70} fontFamily="'Baloo 2',sans-serif" fontSize="20" fontWeight="700" fill={INK} opacity={0.7}>z</text>
        <text x={152} y={56} fontFamily="'Baloo 2',sans-serif" fontSize="15" fontWeight="700" fill={INK} opacity={0.5}>z</text>
      </g>);
    case 'sad':
      return <path d="M80,108 q-3,8 0,11 q3,-3 0,-11" fill="var(--mist)" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />;
    default:
      return null;
  }
}

function PetStar({ cx, cy, r }) {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI / 2) + (i * 2 * Math.PI / 5);
    pts.push(`${cx + r * Math.cos(a)},${cy - r * Math.sin(a)}`);
    const a2 = a + Math.PI / 5;
    pts.push(`${cx + r * 0.45 * Math.cos(a2)},${cy - r * 0.45 * Math.sin(a2)}`);
  }
  return <polygon points={pts.join(' ')} fill="var(--honey)" stroke={INK} strokeWidth={2} strokeLinejoin="round" />;
}

// ── 物种部件：耳朵 / 鼻嘴 / 尾巴 ───────────────────────────
const earCommon = { fill: 'var(--pet-body)', stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' };

function EarsPig() {
  return (<g>
    <path d="M64,72 L60,50 L80,64 Z" {...earCommon} />
    <path d="M136,72 L140,50 L120,64 Z" {...earCommon} />
  </g>);
}

function EarsCat() {
  return (<g>
    <path d="M60,70 L48,28 L82,60 Z" {...earCommon} />
    <path d="M140,70 L152,28 L118,60 Z" {...earCommon} />
    <path d="M64,60 L54,38 L76,56 Z" fill="var(--coral-tint)" />
    <path d="M136,60 L146,38 L124,56 Z" fill="var(--coral-tint)" />
  </g>);
}

function EarsDog() {
  return (<g>
    <path d="M58,72 L50,38 L84,62 Z" {...earCommon} />
    <path d="M142,72 L150,38 L116,62 Z" {...earCommon} />
    <path d="M64,62 L56,46 L76,58 Z" fill="var(--coral-tint)" />
    <path d="M136,62 L144,46 L124,58 Z" fill="var(--coral-tint)" />
  </g>);
}

function EarsRabbit() {
  // 长竖耳
  return (<g>
    <path d="M76,72 C70,40 78,18 86,18 C94,18 94,46 90,72 Z" {...earCommon} />
    <path d="M124,72 C130,40 122,18 114,18 C106,18 106,46 110,72 Z" {...earCommon} />
    {/* 耳朵内粉 */}
    <path d="M80,68 C76,46 82,30 86,30 C90,30 89,50 86,68 Z" fill="var(--coral-tint)" />
    <path d="M120,68 C124,46 118,30 114,30 C110,30 111,50 114,68 Z" fill="var(--coral-tint)" />
  </g>);
}

function FacePig({ mood }) {
  const ms = { stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round', fill: 'none' };
  let mouth = null;
  if (mood === 'happy') mouth = <path d="M92,128 Q100,138 108,128" {...ms} />;
  else if (mood === 'excited') mouth = <path d="M90,129 Q100,141 110,129" {...ms} />;
  else if (mood === 'sad') mouth = <path d="M93,134 Q100,127 107,134" {...ms} />;
  else if (mood !== 'sleeping') mouth = <path d="M96,130 Q100,134 104,130" {...ms} />;
  return (<g>
    <ellipse cx={100} cy={123} rx={15} ry={11} fill="var(--paper-2)" stroke={INK} strokeWidth={3.5} />
    <ellipse cx={94} cy={123} rx={2.4} ry={3.4} fill={INK} />
    <ellipse cx={106} cy={123} rx={2.4} ry={3.4} fill={INK} />
    {mouth}
  </g>);
}

function FaceCat({ mood }) {
  const ms = { stroke: INK, strokeWidth: 3, strokeLinecap: 'round', fill: 'none' };
  let mouth;
  if (mood === 'happy' || mood === 'excited') mouth = (<g>
    <path d="M100,124 q-4,5 -8,2" {...ms} /><path d="M100,124 q4,5 8,2" {...ms} />
  </g>);
  else if (mood === 'sad') mouth = <path d="M93,131 q7,-5 14,0" {...ms} />;
  else if (mood === 'sleeping') mouth = <path d="M95,127 h10" {...ms} />;
  else mouth = (<g>
    <path d="M100,124 q-3,3 -6,1" {...ms} /><path d="M100,124 q3,3 6,1" {...ms} />
  </g>);
  return (<g>
    {/* whiskers */}
    <g stroke={INK} strokeWidth={1.8} strokeLinecap="round">
      <line x1={72} y1={122} x2={52} y2={119} />
      <line x1={72} y1={126} x2={50} y2={126} />
      <line x1={72} y1={130} x2={52} y2={133} />
      <line x1={128} y1={122} x2={148} y2={119} />
      <line x1={128} y1={126} x2={150} y2={126} />
      <line x1={128} y1={130} x2={148} y2={133} />
    </g>
    {/* triangle nose + chin */}
    <path d="M95,116 L105,116 L100,122 Z" fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    <line x1={100} y1={122} x2={100} y2={125} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    {mouth}
  </g>);
}

function FaceDog({ mood }) {
  const ms = { stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round', fill: 'none' };
  let mouth, tongue = null;
  if (mood === 'happy' || mood === 'excited') {
    mouth = (<g>
      <path d="M100,128 q-5,5 -9,2" {...ms} /><path d="M100,128 q5,5 9,2" {...ms} />
    </g>);
    tongue = <path d="M96,132 q4,5 8,0 Z" fill="var(--coral)" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />;
  }
  else if (mood === 'sad') mouth = <path d="M93,133 q7,-5 14,0" {...ms} />;
  else if (mood === 'sleeping') mouth = <path d="M95,128 h10" {...ms} />;
  else mouth = (<g>
    <path d="M100,128 q-4,4 -7,1" {...ms} /><path d="M100,128 q4,4 7,1" {...ms} />
  </g>);
  return (<g>
    <ellipse cx={100} cy={124} rx={14} ry={10} fill="var(--paper-2)" stroke={INK} strokeWidth={3.5} />
    <ellipse cx={100} cy={118} rx={5} ry={3.5} fill={INK} />
    <line x1={100} y1={121} x2={100} y2={126} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    {mouth}
    {tongue}
  </g>);
}

function TailPig() { return <path d="M152,118 q12,-2 8,8 q-2,6 -8,3" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />; }
function TailCat() { return <path d="M152,118 q22,-12 14,-44 q-4,-6 -8,0" fill="var(--pet-body)" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />; }
function TailDog() { return <path d="M148,86 c8,-14 30,-8 24,12 c-3,12 -18,12 -22,4" fill="var(--pet-body)" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />; }
function TailRabbit() {
  return (<g>
    <circle cx={156} cy={134} r={11} fill="var(--pet-body)" stroke={INK} strokeWidth={4} />
    <circle cx={153} cy={131} r={3} fill="var(--paper-2)" opacity={0.7} />
  </g>);
}

function FaceRabbit({ mood }) {
  const ms = { stroke: INK, strokeWidth: 3, strokeLinecap: 'round', fill: 'none' };
  let mouth;
  if (mood === 'happy' || mood === 'excited') mouth = (<g>
    <path d="M100,124 v3" {...ms} />
    <path d="M100,127 q-4,4 -7,2" {...ms} />
    <path d="M100,127 q4,4 7,2" {...ms} />
  </g>);
  else if (mood === 'sad') mouth = (<g>
    <path d="M100,124 v3" {...ms} />
    <path d="M93,134 q7,-4 14,0" {...ms} />
  </g>);
  else if (mood === 'sleeping') mouth = (<g>
    <path d="M100,124 v3" {...ms} />
    <path d="M96,128 h8" {...ms} />
  </g>);
  else mouth = (<g>
    <path d="M100,124 v3" {...ms} />
    <path d="M100,127 q-3,3 -6,1" {...ms} />
    <path d="M100,127 q3,3 6,1" {...ms} />
  </g>);
  return (<g>
    {/* 三角粉鼻 */}
    <path d="M95,118 L105,118 L100,124 Z" fill="var(--coral)" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    {/* 兔门牙（开心时露出） */}
    {(mood === 'happy' || mood === 'excited') && (<g>
      <rect x="97" y="131" width="3" height="5" rx="1" fill="var(--pet-body)" stroke={INK} strokeWidth={1.6} />
      <rect x="100" y="131" width="3" height="5" rx="1" fill="var(--pet-body)" stroke={INK} strokeWidth={1.6} />
    </g>)}
    {mouth}
  </g>);
}

// ── 装扮配件 ──────────────────────────────────────────────
function Accessory({ kind }) {
  switch (kind) {
    case 'hat':
      return (<g stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" fill="var(--coral)">
        <path d="M82,52 Q100,30 118,52 Z" />
        <line x1={76} y1={52} x2={124} y2={52} />
        <circle cx={100} cy={30} r={4} fill="var(--paper)" />
      </g>);
    case 'crown':
      return (<g stroke={INK} strokeWidth={4} strokeLinejoin="round" fill="var(--honey)">
        <path d="M80,52 L80,34 L90,44 L100,30 L110,44 L120,34 L120,52 Z" />
      </g>);
    case 'scarf':
      return (<g stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" fill="var(--mist)">
        <path d="M70,140 Q100,152 130,140 L128,150 Q100,160 72,150 Z" />
        <path d="M120,148 L124,170 L132,166 L128,146 Z" />
      </g>);
    default:
      return null;
  }
}

// ── 宠物主体 ──────────────────────────────────────────────
const EARS = { pig: EarsPig, cat: EarsCat, dog: EarsDog, rabbit: EarsRabbit };
const FACE = { pig: FacePig, cat: FaceCat, dog: FaceDog, rabbit: FaceRabbit };
const TAIL = { pig: TailPig, cat: TailCat, dog: TailDog, rabbit: TailRabbit };

function Pet({ species = 'pig', mood = 'content', accessory = 'none', size = 220, poke = false, className = '' }) {
  const E = EARS[species] || EarsPig;
  const F = FACE[species] || FacePig;
  const T = TAIL[species] || TailPig;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
      className={`pet-svg ${poke ? 'pet-poke' : ''} ${className}`} style={{ overflow: 'visible' }}>
      <g className="pet-body-anim">
        {/* 影子 */}
        <ellipse cx={100} cy={172} rx={46} ry={9} fill={INK} opacity={0.08} />
        {/* 尾巴（绘制在身体后） */}
        <T />
        {/* 耳朵（绘制在身体后） */}
        <E />
        {/* 身体 */}
        <path
          d="M48,112 C48,72 76,56 100,56 C124,56 152,72 152,112 C152,148 126,164 100,164 C74,164 48,148 48,112 Z"
          fill="var(--pet-body)" stroke={INK} strokeWidth={4.5}
        />
        {/* 投币口 */}
        <line x1={88} y1={64} x2={112} y2={64} stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
        {/* 脚 */}
        <path d="M80,162 q-2,8 6,8" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d="M120,162 q2,8 -6,8" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {/* 表情 */}
        <Blush />
        <Eyes mood={mood} />
        <F mood={mood} />
        <Decor mood={mood} />
        {/* 配件 */}
        <Accessory kind={accessory} />
      </g>
    </svg>
  );
}

// ── 说话气泡 ──────────────────────────────────────────────
function SpeechBubble({ children, tail = 'down', tone = 'normal' }) {
  const bg = tone === 'happy' ? 'var(--coral-tint)' : tone === 'sad' ? 'var(--mist-tint)' : 'var(--paper)';
  return (
    <div className="speech-bubble" style={{ background: bg }}>
      {children}
      <span className={`speech-tail speech-tail-${tail}`} style={{ background: bg }} />
    </div>
  );
}

// ── 金币 ──────────────────────────────────────────────────
function Coin({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={16} fill="var(--honey)" stroke={INK} strokeWidth={3} />
      <circle cx={20} cy={20} r={11} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
      <text x={20} y={26} textAnchor="middle" fontFamily="'Baloo 2',sans-serif" fontSize="16" fontWeight="800" fill={INK}>¥</text>
    </svg>
  );
}

Object.assign(window, { Pet, SpeechBubble, Coin, PetStar });

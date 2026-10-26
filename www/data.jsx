// data.jsx — 模拟数据 + 宠物逻辑 + 文案
// Exports: INITIAL, petMood, petLines, fmt

// 金额格式化
function fmt(n) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// 等级称号
const PET_TITLES = ['蛋壳期', '储蓄萌新', '储蓄学徒', '理财小能手', '理财能手', '攒钱达人', '储蓄罐大师'];
function petTitle(level) { return PET_TITLES[Math.min(level - 1, PET_TITLES.length - 1)] || '储蓄罐大师'; }

// 宠物物种
const SPECIES = {
  pig:    { id: 'pig',    name: '存崽', desc: '存钱罐小猪', tagline: '把每一分都吃进肚子里' },
  cat:    { id: 'cat',    name: '招崽', desc: '招财猫',     tagline: '招你财源滚滚来' },
  dog:    { id: 'dog',    name: '旺崽', desc: '理财柴犬',   tagline: '帮你看紧每一笔' },
  rabbit: { id: 'rabbit', name: '攒崽', desc: '攒钱兔兔',   tagline: '蹦蹦跳跳攒满罐' },
};

const today = '今天';

const INITIAL = {
  pet: {
    name: '存崽',
    species: 'pig',
    level: 3,
    exp: 88,            // 0-100
    coins: 1240,       // 储蓄罐攒下的金币（= 解锁装扮的货币）
    accessory: 'none',
  },
  budget: {
    month: '6 月',
    total: 3000,
    spent: 0,
    todaySpent: 0,
    income: 0,
  },
  categories: [
    { id: 'food', label: '餐饮', tint: '#F08A6E', icon: 'food', visible: true, keywords: '美团,饿了么,餐饮,饭店,餐厅,烧烤,小吃,面,饭,食堂,收银,堂食,外卖,点餐' },
    { id: 'home', label: '房租', tint: '#8FB87A', icon: 'home', visible: true, keywords: '房租,租金,租房,公寓,住房,物业,管理费,宽带,水费,电费,燃气' },
    { id: 'public_fee', label: '公费', tint: '#C7A86B', icon: 'salary', visible: true, keywords: '公费,报销,公司,办公,差旅,企业,对公,公务,团建,会议' },
    { id: 'shop', label: '购物', tint: '#E0A4C4', icon: 'shop', visible: true, keywords: '淘宝,天猫,京东,拼多多,抖音商城,超市,购物,商品,便利店,商场,服饰' },
    { id: 'transit', label: '交通', tint: '#8FB6C7', icon: 'transit', visible: true, keywords: '地铁,公交,打车,停车,高铁,火车,机票,顺易通,滴滴,加油,高速,通行费' },
    { id: 'other', label: '其他', tint: '#A99B86', icon: 'other', visible: true, keywords: '' },
    { id: 'telecom', label: '通讯', tint: '#7FA9D9', icon: 'coffee', visible: true, keywords: '通讯,话费,手机费,手机充值,流量,套餐,中国移动,中国联通,中国电信,宽带' },
    { id: 'transfer', label: '往来', tint: '#D39A62', icon: 'transfer', visible: true, keywords: '往来,转账,二维码,扫码,收款,付款,红包,群收款,朋友,亲属,人情' },
    { id: 'wellness', label: '养生', tint: '#7FB58C', icon: 'health', visible: true, keywords: '养生,按摩,推拿,理疗,足疗,中医,保健,健身,瑜伽,药店,药房,体检' },
    { id: 'parenting', label: '养娃', tint: '#E08A7A', icon: 'study', visible: true, keywords: '养娃,母婴,奶粉,尿不湿,纸尿裤,孩子,儿童,幼儿园,学校,玩具,绘本,培训,教育' },
    { id: 'fun', label: '娱乐', tint: '#C7A86B', icon: 'fun', visible: true, keywords: '电影,游戏,娱乐,KTV,影院,演出,门票,会员,视频,音乐' },
    { id: 'coffee', label: '咖啡', tint: '#B98C6A', icon: 'coffee', visible: false, keywords: '咖啡,奶茶,茶饮,瑞幸,星巴克' },
    { id: 'health', label: '医疗', tint: '#7FA9D9', icon: 'health', visible: false, keywords: '医院,药,医疗,门诊' },
    { id: 'study', label: '学习', tint: '#C99A52', icon: 'study', visible: false, keywords: '课程,学习,教育,培训,书' },
    { id: 'salary', label: '工资', tint: '#7FB58C', icon: 'salary', visible: true, income: true, keywords: '工资,薪资,收入,到账,入账' },
    { id: 'redpack', label: '红包', tint: '#E08A7A', icon: 'redpack', visible: false, income: true, keywords: '红包' },
  ],
  learningRules: [],
  // 打卡（5 月 · 今天 30 号；5/1 是周五 → 周一起始偏移 4）
  checkin: {
    streak: 48,
    month: '5 月',
    monthDays: 31,
    firstOffset: 4,
    today: 30,
    recorded: Array.from({ length: 30 }, (_, i) => i + 1), // 1–30 都已记账
  },
  // 装扮商店
  shop: [
    { id: 'none',  label: '素颜',   cost: 0,    owned: true,  kind: 'accessory' },
    { id: 'hat',   label: '贝雷帽', cost: 300,  owned: true,  kind: 'accessory' },
    { id: 'scarf', label: '小围巾', cost: 480,  owned: false, kind: 'accessory' },
    { id: 'crown', label: '小皇冠', cost: 1500, owned: false, kind: 'accessory' },
  ],
  // 攒钱目标
  goals: [
    { id: 'g1', title: '换新手机', emoji: 'shop',   target: 6000, saved: 2400, color: 'var(--coral)' },
    { id: 'g2', title: '旅行基金', emoji: 'home',   target: 8000, saved: 5200, color: 'var(--mist)' },
    { id: 'g3', title: '应急备用金', emoji: 'salary', target: 10000, saved: 9100, color: 'var(--leaf)' },
  ],
  // 账单流水（按天分组）
  days: [],
  // 统计：本月分类占比
  byCat: [],
  // 近 7 日支出折线
  week: [
    { d: '一', v: 0 }, { d: '二', v: 0 }, { d: '三', v: 0 },
    { d: '四', v: 0 }, { d: '五', v: 0 }, { d: '六', v: 0 }, { d: '日', v: 0 },
  ],
};

// 根据预算使用率决定宠物情绪
function petMood(budget) {
  const r = budget.spent / budget.total;
  if (budget.todaySpent === 0) return 'sleeping';
  if (r < 0.55) return 'excited';
  if (r < 0.78) return 'happy';
  if (r < 1) return 'content';
  return 'sad';
}

// 宠物台词库（按情绪 + 场景）
const petLines = {
  happy: [
    '今天也很乖呢，离预算还很远～',
    '钱包鼓鼓的，我也开心！',
    '继续保持，奖励你戳我一下！',
  ],
  excited: [
    '哇！这个月超省的，我要长大啦！',
    '存钱罐又重了一点点，嘿嘿。',
    '主人最棒了，金币哗啦啦！',
  ],
  content: [
    '预算用了一大半啦，悠着点哦。',
    '这周有点小手抖，注意一下～',
    '再忍住几杯奶茶就稳了。',
  ],
  sad: [
    '呜…这个月超支了，我饿瘪了。',
    '钱包君瘦了，我也跟着瘦…',
    '抱抱我，下个月一起加油好不好。',
  ],
  sleeping: [
    '今天还没记账，我先睡会儿 zZ',
    '戳戳我，喂我记一笔嘛～',
  ],
  poke: [
    '哎呀！别戳啦，痒痒的～',
    '呼噜呼噜…再戳就要笑啦！',
    '嘿嘿，最喜欢主人了！',
    '咕…刚吃饱，别晃我金币。',
  ],
  feed: [
    '记好啦！金币 +1，谢谢投喂～',
    '嗯嗯，又记了一笔，真乖！',
    '叮——入账成功，我饱啦！',
  ],
};

Object.assign(window, { INITIAL, petMood, petLines, fmt, petTitle, SPECIES });


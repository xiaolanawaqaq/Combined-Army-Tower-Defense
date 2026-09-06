"use strict";

(function(){
const TOTAL_LEVELS = 40;
const WAVE_SIZE = 20;
const START_CRYSTALS = 10;
const PREP_SECONDS = 120;
const WAVE_START_DELAY = 5.0;
const START_TROOPS = 5;
// 每过一关至少发 5 个兵（Boss 击杀/事件奖励在保底之上叠加）
const TROOPS_PER_STAGE = 6;
const MAX_LEVEL = 6;
const RULES_VERSION = 1;
// 等级成长：兵种 1 级差异只保留攻速/射程/特效，属性按等级绝对值表取
const LEVEL_HP_MUL = [1.0, 1.4, 1.96, 2.7436, 3.8407, 5.3771];
const LEVEL_DAMAGE_MUL = [1.0, 1.15, 1.3225, 1.520875, 1.749006, 2.011357];
const LEVEL_DEF_MUL = [1.0, 1.2, 1.4333, 1.7, 2.0333, 2.4333];
const LEVEL_ARMOR = [0.10, 0.12, 0.14, 0.16, 0.19, 0.22];
// 攻速随兵等级平缓成长：合成升攻速只是辅助价值，主力仍是伤害倍率，
// 给全军攻速升级（RATE_PER_LEVEL）与电羁绊（BOND_SHOCK_RATE）留出收益空间
const LEVEL_RATE_MUL = [1.0, 1.15, 1.3, 1.45, 1.6, 1.75];
// 金币换兵：过关每人 +5 金币，5 金币换 1 个兵进待命区
const COINS_PER_STAGE = 5;
const COIN_TROOP_COST = 5;
const UPGRADE_POINTS_PER_STAGE = 3;
const BOSS_REWARD_POINTS = 4;
const BOSS_REWARD_TROOPS = 3;
const SKIP_PENALTY_HP_MUL = 1.5;
const SKIP_PENALTY_DEF_BONUS = 15;
const SKIP_PENALTY_SPEED_MUL = 1.15;
// ---------- 虫巢督军（光环精英怪） ----------
// 每波概率混在虫群中的金冠精英：持续加速光环内的友军怪物，逼玩家优先集火；
// 督军一死光环即刻消失。击杀奖励全场金币（金币换兵系统）。
const OVERLORD_CHANCE = 0.14;         // 每只新生怪晋升概率
const OVERLORD_CHANCE_LEVEL = 2;      // 从第几关开始可能出现
const OVERLORD_AURA_RADIUS = 110.0;   // 光环半径（px）
const OVERLORD_AURA_SPEED_MUL = 1.35; // 光环内友军移速倍率
const OVERLORD_HP_MUL = 4.5;          // 督军血量倍率（远低于 Boss）
const OVERLORD_DEF_BONUS = 12;        // 督军额外防御
const OVERLORD_BODY_R_MUL = 1.5;      // 督军体型倍率
const OVERLORD_COIN_REWARD = 2;       // 击杀督军：每位玩家金币
const OVERLORD_ENERGY_REWARD = 18.0;  // 击杀督军：大招能量
// ---------- 敌方合兵（Enemy Merge） ----------
// 同种小怪贴太近时自动融合成高一阶怪：血量合并、体型变大——镜像玩家的核心玩法。
const ENEMY_MERGE_LEVEL_MIN = 2;      // 从第几关开始生效
const ENEMY_MERGE_RADIUS = 26.0;      // 两只怪中心距多近算"贴上"
const ENEMY_MERGE_MAX_TIER = 2;       // 最多融合到 2 阶（不再连环合）
const ENEMY_MERGE_HP_MUL = 1.15;      // 融合体血量 = 两只血量之和 × 1.15
const ENEMY_MERGE_DEF_ADD = 4;        // 融合体额外防御
const ENEMY_MERGE_BODY_R_MUL = 1.4;   // 融合体体型倍率
const ENEMY_MERGE_SPEED_MUL = 0.92;   // 融合体移速（略慢）
const ENEMY_MERGE_BOUNTY_MUL = 1.6;   // 融合体击杀奖励倍率
// ---------- 虫后（Queen，产卵精英怪） ----------
// 慢速爬行的精英：周期性在身后孵出小螨虫，杀不尽会越滚越多。
const QUEEN_CHANCE = 0.10;            // 每只新生怪晋升概率（督军之后独立判定）
const QUEEN_CHANCE_LEVEL = 3;         // 从第几关开始可能出现
const QUEEN_HP_MUL = 7.0;             // 虫后血量倍率
const QUEEN_DEF_BONUS = 20;           // 虫后额外防御
const QUEEN_BODY_R_MUL = 1.8;         // 虫后体型倍率
const QUEEN_SPEED_MUL = 0.55;         // 虫后移速倍率（慢爬）
const QUEEN_SPAWN_INTERVAL = 4.5;     // 产卵间隔（秒）
const QUEEN_SPAWN_COUNT = 2;          // 每窝数量
const QUEEN_BABY_HP_MUL = 0.35;       // 幼虫血量倍率（脆皮）
const QUEEN_BABY_BODY_R_MUL = 0.7;    // 幼虫体型
const QUEEN_MAX_BABIES_ALIVE = 8;     // 虫后存活幼虫上限（全场，防爆屏）
const QUEEN_COIN_REWARD = 3;          // 击杀虫后：每位玩家金币
const QUEEN_ENERGY_REWARD = 22.0;     // 击杀虫后：大招能量
// ---------- Boss 激怒（多阶段） ----------
// Boss 血量过半后激怒：提速 + 防御上浮 + 当场召唤护卫。
const BOSS_ENRAGE_HP_RATIO = 0.5;     // 血量低于此比例触发
const BOSS_ENRAGE_SPEED_MUL = 1.4;    // 激怒后移速倍率
const BOSS_ENRAGE_DEF_ADD = 40;       // 激怒后额外防御
const BOSS_ENRAGE_GUARDS = 3;         // 激怒时召唤护卫数量
const BOSS_ENRAGE_GUARD_HP_MUL = 0.4; // 护卫血量倍率（相对本关怪）

// Boss 周期技能（召唤护卫 / 能量护盾）——与客户端 game_engine.gd 同步
const BOSS_SUMMON_INTERVAL = 9.0;          // 每 9 秒召唤一次护卫
const BOSS_SUMMON_COUNT = 2;               // 每次 2 只
const BOSS_SUMMON_HP_MUL = 0.5;            // 护卫血量倍率（相对本关普通怪）
const BOSS_SUMMON_ENRAGED_INTERVAL = 5.0;  // 激怒后的召唤间隔（秒）
const BOSS_SHIELD_INTERVAL = 12.0;         // 每 12 秒上一次盾
const BOSS_SHIELD_HP_RATIO = 0.08;         // 每次上盾量 = Boss 最大生命 8%
const BOSS_SHIELD_MAX_RATIO = 0.25;        // 盾上限 = Boss 最大生命 25%
const WEAPON_UPGRADE_MAX = 10;
const WEAPON_UPGRADE_COSTS = [1, 2, 3];
const WEAPON_DAMAGE_PER_LEVEL = 0.25;
const RATE_UPGRADE_MAX = 10;
const RATE_UPGRADE_COSTS = [1, 2, 3];
const RATE_PER_LEVEL = 0.18;
const ARMOR_UPGRADE_MAX = 10;
const ARMOR_UPGRADE_COSTS = [1, 2, 3];
const ARMOR_PER_LEVEL = 0.18;
const TROOP_BASE_HP = 1400.0;
// 兵攻击绝对值：1级统一 80，合成每级 +15% 复利（92/106/122/140/161）。
// 兵种差异只保留攻速/射程/特效，攻击统一按等级取值。
const TROOP_BASE_DMG = 80.0;
const TROOP_HP_PER_LEVEL = 14.0;
const TROOP_DEF_PER_ARMOR_LEVEL = 1.5;
const MERGE_COSTS = [0,0,0,0,0];
const DAMAGE_DEALT_MUL = 1.35;
const EVENT_SWIFT_SPEED_MUL = 1.35;
const EVENT_RETALIATE_INTERVAL = 1.15;
const EVENT_RETALIATE_DAMAGE = 1.0;
const EVENT_ARMORED_DEF_BONUS = 18;
const EVENT_LEAK_MUL = 2.0;
const EVENT_REWARD_TROOPS = 1;
const MAP_EVENT_IDS = ["swift_march","retaliate_wave","armored_tide","leak_tax"];
const MAP_EVENT_NAMES = {swift_march:"疾行潮", retaliate_wave:"还击潮", armored_tide:"厚甲潮", leak_tax:"漏怪加倍"};
const DEFENSE_UPGRADE_MAX = 5;
const DEFENSE_UPGRADE_COSTS = [2, 3, 4, 5, 6];
const DEFENSE_HP_PER_LEVEL = 2;
// Boss 数值：血量倍率随关卡增长（45+关卡×5），防御保底防融毁削穿（与客户端 game_types.gd 一致）
const BOSS_HP_BASE_MUL = 45;
const BOSS_HP_MUL_PER_LEVEL = 5;
const BOSS_DEFENSE_BASE = 25;
const BOSS_DEFENSE_PER_LEVEL = 2;
const BOSS_DEFENSE_FLOOR = 8;
const BOSS_SPEED_MULTIPLIER = 1.30;
const BOSS_SPEED_FLAT_BONUS = 42;
const BOSS_BODY_RADIUS_MULTIPLIER = 2.1;

// 失败重开费：合作/独立模式失败后重开，从上局金币扣 5、剩余带进新局（与客户端 main.gd 一致）
const RESTART_COIN_COST = 5;
const CANVAS_WIDTH = 576;
const CANVAS_HEIGHT = 960;
const CELL = 52;
const SLOT_PATH_CLEARANCE = 42;
const ENEMY_SPRITE_COUNT = 7;
const ELEMENTS = ["fire","ice","shock","nature"];
const ELEMENT_STRONG = {fire:"nature", nature:"shock", shock:"ice", ice:"fire"};
const ELEMENT_ADV_MUL = 1.35;
const ELEMENT_WEAK_MUL = 0.75;
const ENEMY_KIND_ELEMENT = {mite:"nature", beetle:"fire", spider:"ice", flyer:"shock", boss:"fire"};
  const AFFIX_IDS = ["swift","armored","regenerator"];
  // ---------- 敌人词缀（与客户端 game_types.gd 保持一致） ----------
  const AFFIX_CHANCE = 0.30;          // 普通怪携带概率
  const AFFIX_SWIFT_SPEED_MUL = 1.50; // 疾行：移速倍率
  const AFFIX_ARMORED_DEF_MUL = 1.80; // 厚甲：防御倍率
  const AFFIX_REGEN_PER_SEC = 0.022;  // 再生：每秒回血比例

  const AFFIX_NAMES = {swift:"疾行", armored:"厚甲", regenerator:"再生"};
  const AFFIX_DESCS = {swift:"移速 +40%", armored:"防御 +60%", regenerator:"每秒回复 1.5% 最大生命"};
  const AFFIX_COLORS = {swift:"#4fd1ff", armored:"#c9a227", regenerator:"#84cc16"};
  const AFFIX_BOSS_CHANCE = 1.0;   // Boss 必带词缀


  // ---------- 元素复合反应与合兵爆发 ----------
  const REACTION_OVERLOAD_DAMAGE = 1.45;  // 火 + 电: 超载爆发倍率
  const REACTION_MELT_DAMAGE = 1.50;      // 火 + 冰: 融毁暴击倍率
  const REACTION_MELT_DEF_SHRED = 15.0;   // 火 + 冰: 削减护甲
  const REACTION_SUPERCONDUCT_MUL = 1.25; // 电 + 冰: 超导感电易伤
  const REACTION_PYROTOXIN_MUL = 1.35;    // 火 + 木: 剧毒引燃倍率
  const REACTION_QUICKEN_MUL = 1.20;      // 电 + 木: 激化电离倍率
  const REACTION_CRYSTALLIZE_FREEZE = 0.6;// 冰 + 木: 晶化定身时间(s)

  const MERGE_BURST_RADIUS = {
    fire: 130.0,
    ice: 150.0,
    shock: 200.0,
    nature: 120.0,
  };
  const MERGE_BURST_DAMAGE_MUL = 1.6;

  const METAL_TROOPS = ["tank","robot","artillery","cannon","aegis"];
  const WATER_TROOPS = ["ice","poison","radar"];
  const EARTH_TROOPS = ["miner","core","laser","medic"];
  const WIND_TROOPS = ["plane","shotgun","tesla","missile"];
  const BOND_IDS = ["fire","ice","nature","metal","water","earth","wind","shock","hydro","bulwark","gale","prism"];
  const BOND_NAMES = {fire:"烈焰军团", ice:"寒霜领域", nature:"荒野新生", metal:"锐金之锋", water:"静水流深", earth:"厚土壁垒", wind:"疾风迅矢", shock:"雷霆万钧", hydro:"冰火协奏", bulwark:"厚土锋锐", gale:"疾风怒涛", prism:"四象归一"};
  const BOND_SHORT = {fire:"火", ice:"冰", nature:"木", metal:"金", water:"水", earth:"土", wind:"风", shock:"电", hydro:"协", bulwark:"锐", gale:"怒", prism:"象"};
  const BOND_COLORS = {fire:"#fb923c", ice:"#7dd3fc", nature:"#84cc16", metal:"#c0c8d4", water:"#38bdf8", earth:"#d97706", wind:"#a7f3d0", shock:"#fde047", hydro:"#a5f3fc", bulwark:"#fbbf24", gale:"#6ee7b7", prism:"#c084fc"};
  const BOND_STEPS = {fire:[3,5,7], ice:[3,5,7], shock:[3,5,7], nature:[3,5,7], metal:[3,5,7], water:[3,5,7], earth:[3,5,7], wind:[3,5,7], prism:[1], duo:[1], storm:[1], forge:[1]};
  // ---------- 新版羁绊数值（两段效果：基础 + 触发型） ----------
  // 风：全军攻速+15%；击杀敌人后攻速额外+30%（持续3秒）
  const BOND_WIND_RATE = 0.15;
  const BOND_WIND_KILL_RATE = 0.30;
  const BOND_WIND_KILL_DURATION = 3.0;
  // 水：攻击 30% 概率削弱目标攻速 30%（3秒）；被削弱的敌人每秒受 5% 攻击力伤害
  const BOND_WATER_SLOW_CHANCE = 0.30;
  const BOND_WATER_SLOW_RATE = 0.30;
  const BOND_WATER_SLOW_DURATION = 3.0;
  const BOND_WATER_DOT = 0.05;
  // 木：全军最大生命+25%；低血时每秒回 3% 最大生命（5秒，CD15秒）
  const BOND_WOOD_HP = 0.25;
  const BOND_WOOD_LOW_THRESHOLD = 0.30;
  const BOND_WOOD_REGEN = 0.03;
  const BOND_WOOD_REGEN_DURATION = 5.0;
  const BOND_WOOD_REGEN_CD = 15.0;
  // 土：全军防御+25%；受击叠反应装甲（每层+5防，上限5）
  const BOND_EARTH_DEF = 0.25;
  const BOND_EARTH_ARMOR_PER_STACK = 5;
  const BOND_EARTH_ARMOR_MAX = 5;
  // 金：全军护甲+20%（减伤）；护甲生效反弹 15% 伤害
  const BOND_METAL_DEF = 0.20;
  const BOND_METAL_REFLECT = 0.15;
  // 火：全军攻击+20%；攻击 25% 概率灼烧（每秒2%伤害，3秒）
  const BOND_FIRE_DAMAGE = 0.20;
  const BOND_FIRE_BURN_CHANCE = 0.25;
  const BOND_FIRE_BURN_DPS = 0.02;
  const BOND_FIRE_BURN_DURATION = 3.0;
  // 电：全属性+8%；攻击 20% 概率连锁弹跳（附近敌人受 50% 伤害）
  const BOND_SHOCK_ALL = 0.08;
  const BOND_SHOCK_CHAIN_CHANCE = 0.20;
  const BOND_SHOCK_CHAIN_MUL = 0.50;
  const BOND_SHOCK_CHAIN_RADIUS = 90.0;
  // 冰火协奏：灼烧伤害翻倍 + 水削攻速概率升至 50%
  const BOND_HYDRO_BURN_MUL = 2.0;
  const BOND_HYDRO_SLOW_CHANCE = 0.50;
  // 厚土锋锐：装甲上限 10 层 + 反弹 25%
  const BOND_BULWARK_ARMOR_MAX = 10;
  const BOND_BULWARK_REFLECT = 0.25;
  // 疾风怒涛：击杀 Buff 延 6 秒 + 成长上限 5
  const BOND_GALE_KILL_DURATION = 6.0;
  const BOND_GALE_STACK_MAX = 5;
  // 自然：全属性+10%；开战每5秒再+5%（上限3次）
  const BOND_NAT_ALL = 0.10;
  const BOND_NAT_STACK = 0.05;
  const BOND_NAT_STACK_INTERVAL = 5.0;
  const BOND_NAT_STACK_MAX = 3;
  const BOND_PRISM_RANGE = 0.15;
  const BOND_PRISM_ALL = 0.15;
  const BOND_PRISM_MIN_EACH = 3;
  const BOND_PAIR_MIN = 3;
  const BOND_DUO_SPLASH = 0.18;
  const BOND_STORM_DAMAGE = 0.12;
  const BOND_FORGE_LEAK = 0.30;
  // 炮弹鲜艳配色（按兵种/元素）：紫/橙/蓝/红/黄/粉
  const BULLET_TYPE_COLORS = {gun:"#ff7bd5", tank:"#ff9f43", plane:"#5fd0ff", cannon:"#ff6b6b", sniper:"#c06bff", flame:"#ff7a1f", tesla:"#ffe93c", laser:"#ff4fd8", ice:"#4fc3ff", poison:"#a06bff", artillery:"#ff8c3c", missile:"#ffd23c", shotgun:"#ff9be0", robot:"#ffd0f0", core:"#7be0ff", railgun:"#ff4f6b", miner:"#c98cff", radar:"#8fa8ff"};
  const BULLET_ELEMENT_COLORS = {fire:"#ff5f3c", ice:"#4fc3ff", shock:"#ffe93c", nature:"#b56bff"};
const COOP_SKILLS = {
  focus: {cooldown:30, duration:6, mul:1.25},
  shield: {cooldown:45, crystals:1, usesPerStage:1},
};

function elementMul(atk, def){
  if(!atk || !def) return 1;
  if(ELEMENT_STRONG[atk]===def) return ELEMENT_ADV_MUL;
  if(ELEMENT_STRONG[def]===atk) return ELEMENT_WEAK_MUL;
  return 1;
}

const PATH = [
  {x:70,y:40}, {x:70,y:860},
  {x:180,y:860}, {x:180,y:100},
  {x:290,y:100}, {x:290,y:860},
  {x:400,y:860}, {x:400,y:100},
  {x:520,y:100}, {x:520,y:520},
];

const INDEPENDENT_PATH = [
  {x:80,y:60}, {x:80,y:850},
  {x:288,y:850}, {x:288,y:100},
  {x:496,y:100}, {x:496,y:710},
];
const INDEPENDENT_PATHS = Array.from({length:3},()=>
  INDEPENDENT_PATH.map(point=>({...point}))
);

function pointToSegment(px,py,ax,ay,bx,by){
  const dx=bx-ax, dy=by-ay;
  const lenSq=dx*dx+dy*dy;
  let t=0;
  if(lenSq>0) t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/lenSq));
  return Math.hypot(px-(ax+dx*t), py-(ay+dy*t));
}

function tooCloseToPath(x,y,path,clearance){
  for(let i=0;i<path.length-1;i++){
    if(pointToSegment(x,y,path[i].x,path[i].y,path[i+1].x,path[i+1].y)<clearance) return true;
  }
  return false;
}

function packSlots(path, step, left, top, rightPad, bottom){
  const slots=[];
  for(let x=left; x<=CANVAS_WIDTH-rightPad; x+=step){
    for(let y=top; y<=bottom; y+=step){
      if(!tooCloseToPath(x,y,path,SLOT_PATH_CLEARANCE)) slots.push({x,y});
    }
  }
  return slots;
}

function scalingUpgradeCost(level, table){
  if(!table || !table.length) return Math.max(1, level+1);
  if(level < table.length) return table[level];
  return table[table.length-1] + (level - table.length + 1);
}

function nearCrystalBase(x,y){
  return x >= 420 && y >= 620;
}
function laneSlots(path, xs, top, bottom, step){
  const out=[];
  for(let y=top; y<=bottom; y+=step){
    for(const x of xs){
      if(!nearCrystalBase(x,y)) out.push({x,y});
    }
  }
  return out;
}
function buildSlots(){
  return laneSlots(PATH, [125,235,345,455], 150, 700, 52);
}

const SLOT_META = buildSlots();
const SLOT_COUNT = SLOT_META.length;

function buildIndependentSlots(){
  const packed=laneSlots(INDEPENDENT_PATH, [184,392], 150, 700, 52);
  return Array.from({length:3},()=>packed.map(slot=>({...slot})));
}

const INDEPENDENT_SLOT_META = buildIndependentSlots();
const INDEPENDENT_SLOT_COUNT = INDEPENDENT_SLOT_META[0].length;

// ============ 兵团对战竞技场 ============
// 左右两边各自一条垂直战线；开战后双方原地站桩对射，子弹飞越中线造成伤害。
// 几何与客户端 game_types.gd 的 ARENA_* 完全一致。
const ARENA_PLAYER_X = 144.0;
const ARENA_AI_X = 432.0;
const ARENA_CENTER_X = 288.0;
const ARENA_TOP = 132.0;
const ARENA_BOTTOM = 742.0;
const ARENA_ROW_STEP = 76.0;
const ARENA_BULLET_SPEED = 420.0;
// 对战节奏：血量已按等级表绝对值（1400~7528），不再整体放大；
// 伤害倍率让均势局在 PK 加速下约 5~7 秒内分出胜负
const ARENA_HP_MUL = 1.0;
const ARENA_DAMAGE_MUL = 3.0;
// PK 节奏：3 秒后伤害逐秒 +120%，配合攻速下限让所有对局 4~7 秒内分胜负；
// 羁绊多/等级高的碾压局在 3~4 秒档就终结。
const ARENA_PK_RAMP_START = 3.0;
const ARENA_PK_RAMP_PER_SEC = 1.2;
function arenaPkDamageMul(battleTime){
  if(battleTime <= ARENA_PK_RAMP_START) return 1.0;
  return 1.0 + (battleTime - ARENA_PK_RAMP_START) * ARENA_PK_RAMP_PER_SEC;
}
// 每方 10 个阵位（5 行 × 2 列）
function arenaSlotMeta(team){
  const xs = team === 0 ? [ARENA_PLAYER_X - 42.0, ARENA_PLAYER_X + 42.0] : [ARENA_AI_X - 42.0, ARENA_AI_X + 42.0];
  const centerY = (ARENA_TOP + ARENA_BOTTOM) * 0.5;
  const out = [];
  for(let row = 0; row < 5; row++){
    const y = centerY + (row - 2.0) * ARENA_ROW_STEP;
    for(const x of xs) out.push({x, y});
  }
  return out;
}
const ARENA_SLOT_COUNT = arenaSlotMeta(0).length;

// ============ 兵种定义 ============
const TROOP_TYPES = [
  {key:"gun",      name:"铁壁突击兵", icon:"🔫", style:"rapid",   mode:"single", tag:"磁轨连射", element:"shock", desc:"铁壁军团重装步兵，磁轨步枪高速连射", rateMul:2.2, dmgMul:0.42, rangeMul:0.95, burst:3},
  {key:"tank",     name:"重装攻城炮", icon:"🛡", style:"heavy",   mode:"single", tag:"重炮轰击", element:"nature", desc:"铁壁军团重装战车，双联重炮高额单发伤害", rateMul:0.42, dmgMul:2.2,  rangeMul:1.0},
  {key:"plane",    name:"苍穹掠空机", icon:"✈", style:"splash",  mode:"aoe",    tag:"战机轰炸", element:"shock", desc:"苍穹议会悬浮战机，对地范围轰炸群伤", rateMul:0.7,  dmgMul:0.9,  rangeMul:1.25, splash:70},
  {key:"cannon",   name:"聚能炮塔", icon:"💣", style:"splash",  mode:"aoe",    tag:"聚能爆弹", element:"fire", desc:"苍穹议会能量防御塔，大范围超重聚能爆弹", rateMul:0.32, dmgMul:1.7,  rangeMul:1.4,  splash:95},
  {key:"sniper",   name:"暗影猎手", icon:"🎯", style:"sniper",  mode:"single", tag:"暗影狙击", element:"ice", desc:"铁壁军团潜行猎手，磁轨狙击瞬间高伤", rateMul:0.38, dmgMul:2.9,  rangeMul:1.55},
  {key:"flame",    name:"烈焰喷射者", icon:"🔥", style:"cone",    mode:"aoe",    tag:"烈焰风暴", element:"fire", desc:"铁壁军团重甲喷射兵，双臂扇形锥面烈焰", rateMul:1.35, dmgMul:0.5,  rangeMul:0.78, cone:58},
  {key:"tesla",    name:"雷暴贤者", icon:"⚡", style:"chain",   mode:"aoe",    tag:"连锁电弧", element:"shock", desc:"苍穹议会雷暴方尖碑，多重连锁电弧", rateMul:0.85, dmgMul:0.72, range:810,  chain:3, chainR:95},
  {key:"laser",    name:"棱镜光舰", icon:"🔺", style:"beam",    mode:"single", tag:"棱镜光束", element:"fire", desc:"苍穹议会棱镜战舰，持续对焦热能死光", rateMul:1.45, dmgMul:0.8,  rangeMul:1.2},
  {key:"ice",      name:"极寒晶塔", icon:"❄", style:"freeze",  mode:"single", tag:"永冻领域", element:"ice", desc:"苍穹议会寒霜晶塔，制造极寒并大幅减速", rateMul:0.8,  dmgMul:0.65, rangeMul:1.05, slow:0.38},
  {key:"poison",   name:"蚀骨潜伏兽", icon:"☣", style:"poison",  mode:"aoe",    tag:"生化毒云", element:"nature", desc:"蚀骨兽群潜伏异化兽，留下腐蚀毒区持续伤害", rateMul:0.5,  dmgMul:0.45, rangeMul:1.0,  splash:72, poison:3.2},
  {key:"artillery",name:"圣甲重炮",   icon:"🚛", style:"heavy",   mode:"single", tag:"重装圣甲炮", element:"fire", desc:"苍穹议会重型甲兽，发射反物质重甲巨弹", rateMul:0.32, dmgMul:2.7,  rangeMul:1.25},
  {key:"missile",  name:"飞弹防空塔", icon:"📡", style:"missile", mode:"aoe",    tag:"追踪飞弹", element:"fire", desc:"铁壁军团地空雷达飞弹巢，追踪轰炸", rateMul:0.55, dmgMul:1.15, rangeMul:1.35, splash:55},
  {key:"shotgun",  name:"光刃武士",   icon:"✳", style:"shotgun", mode:"aoe",    tag:"多重光刃", element:"shock", desc:"苍穹议会冲锋武士，双臂多重光刃斩击", rateMul:1.05, dmgMul:0.38, rangeMul:0.82, pellets:5},
  {key:"robot",    name:"双足突击机甲", icon:"🤖", style:"rapid",   mode:"single", tag:"双联机炮", element:"shock", desc:"铁壁军团全地形双足机甲，30mm双联机炮", rateMul:0.95, dmgMul:0.90, rangeMul:1.0,  burst:2},
  {key:"core",     name:"等离子巨像", icon:"🔵", style:"pulse",   mode:"aoe",    tag:"能量脉冲", element:"shock", desc:"苍穹议会纯等离子生命体，以自身为中心爆发能量震波", rateMul:0.55, dmgMul:0.95, rangeMul:1.05},
  {key:"railgun",  name:"旗舰磁轨炮", icon:"➤",  style:"rail",    mode:"line",   tag:"磁轨贯穿", element:"fire", desc:"铁壁军团旗舰主炮，强力直线贯穿四个目标", rateMul:0.34, dmgMul:2.35, range:810, pierceCount:4},
  {key:"miner",    name:"布雷侦察车", icon:"◆", style:"mine",    mode:"aoe",    tag:"智能地雷", element:"nature", desc:"铁壁军团悬浮战车布设自走智能雷，接近引爆", rateMul:0.44, dmgMul:1.35, rangeMul:1.1, mineRadius:62},
  {key:"radar",    name:"战场侦察艇", icon:"◎", style:"vulnerable", mode:"support", tag:"弱点标记", element:"ice", desc:"铁壁军团战场侦察艇，标记敌人使其承受易伤", rateMul:0.72, dmgMul:0.42, rangeMul:1.28, vulnerable:4},
  {key:"medic",    name:"协同医疗机", icon:"✚", style:"heal",    mode:"support", tag:"维修脉冲", element:"nature", desc:"铁壁军团协同医疗机，周期修复范围内友军", rateMul:0.55, dmgMul:0.0,  rangeMul:1.0, heal:1.0},
  {key:"aegis",    name:"圣盾力场塔", icon:"⬢", style:"shield",  mode:"support", tag:"圣盾力场", element:"shock", desc:"苍穹议会圣盾方尖塔，为范围内友军张开吸收力场", rateMul:0.35, dmgMul:0.0,  rangeMul:1.0, shield:1.0},
];

// ---------- 辅助兵种参数（医疗机 / 圣盾塔，与客户端 game_types.gd 保持一致） ----------
const SUPPORT_HEAL_RADIUS = 150.0;
const SUPPORT_HEAL_PER_PULSE = 0.06;
const SUPPORT_SHIELD_RADIUS = 170.0;
const SUPPORT_SHIELD_RATIO = 0.20;
const SUPPORT_SHIELD_MAX_RATIO = 0.45;
const SUPPORT_HEAL_MINI_SHIELD = 0.08;

// ============ 路径工具函数 ============
function pathLength(path){
  path = path || PATH;
  let len=0;
  for(let i=0;i<path.length-1;i++){
    len += Math.hypot(path[i+1].x-path[i].x, path[i+1].y-path[i].y);
  }
  return len;
}
const PATH_LEN = pathLength();

function posOnPath(dist, path){
  path = path || PATH;
  let left = Math.max(0, dist);
  for(let i=0;i<path.length-1;i++){
    const a=path[i], b=path[i+1];
    const seg=Math.hypot(b.x-a.x,b.y-a.y);
    if(left <= seg){
      const t = seg>0 ? left/seg : 0;
      return {x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t, seg:i, t};
    }
    left -= seg;
  }
  const last=path[path.length-1];
  return {x:last.x, y:last.y, seg:path.length-2, t:1};
}

// 获取独立模式下某条路径的信息
function getIndependentPath(pathIndex){
  return INDEPENDENT_PATHS[pathIndex] || INDEPENDENT_PATHS[0];
}
function getIndependentSlots(pathIndex){
  return INDEPENDENT_SLOT_META[pathIndex] || INDEPENDENT_SLOT_META[0];
}
function getIndependentPathLen(pathIndex){
  return pathLength(getIndependentPath(pathIndex));
}

  function bondTier(bondId,count){
    const steps=BOND_STEPS[bondId]||[];
    let tier=0;
    for(let i=0;i<steps.length;i++) if(count>=steps[i]) tier=i+1;
    return tier;
  }

  // ========== 指挥官大招（Ultimate）——与客户端 game_types.gd 一致 ==========
  const ULT_ENERGY_MAX = 100.0;
  const ULT_KILL_ENERGY = 6.0;
  const ULT_BOSS_ENERGY = 40.0;
  const ULT_LEAK_ENERGY = 4.0;
  const ULT_MAX_LOADOUT = 2;
  const ULT_IDS = ["thunder","blizzard","carpet","goldrush"];
  const ULT_NAMES = {thunder:"天雷轰顶", blizzard:"全屏冰封", carpet:"地毯轰炸", goldrush:"金币雨"};
  const ULT_ICONS = {thunder:"⚡", blizzard:"❄", carpet:"💥", goldrush:"🪙"};
  const ULT_COLORS = {thunder:"#fde047", blizzard:"#7dd3fc", carpet:"#ff8c3c", goldrush:"#fbbf24"};
  const ULT_DESCS = {thunder:"全场 8 道落雷，重创命中敌人并麻痹减速", blizzard:"冻结全场敌人 3 秒（Boss 减半）", carpet:"沿路径投放 5 枚高伤溅射炸弹", goldrush:"立刻获得 8 金币，5 秒内击杀额外掉 1 金币"};
  const ULT_THUNDER_BOLTS = 8;
  const ULT_THUNDER_RADIUS = 80.0;
  const ULT_THUNDER_DAMAGE = 260.0;
  const ULT_THUNDER_SLOW = 3.0;
  const ULT_BLIZZARD_FREEZE = 3.0;
  const ULT_BLIZZARD_BOSS_FREEZE = 1.5;
  const ULT_BLIZZARD_DAMAGE = 60.0;
  const ULT_CARPET_BOMBS = 5;
  const ULT_CARPET_SPLASH = 92.0;
  const ULT_CARPET_DAMAGE = 300.0;
  const ULT_GOLDRUSH_COINS = 8;
  const ULT_GOLDRUSH_DURATION = 5.0;
  const ULT_GOLDRUSH_PER_KILL = 1;

  // ========== 兵种觉醒（三合一进化） ==========
  const AWAKEN_SCALE = 1.55;
  const AWAKEN_DMG_MUL = 2.2;
  const AWAKEN_HP_MUL = 2.4;
  const AWAKEN_RATE_MUL = 1.25;
  const AWAKEN_RANGE_MUL = 1.1;
  const AWAKEN_KILL_ENERGY = 2.0;

  // ========== 无尽模式强化 ==========
  const ENDLESS_AFFIX_EVERY = 4;
  const ENDLESS_CHEST_EVERY = 10;
  const ENDLESS_AFFIXES = [
    {id:"frenzy", name:"狂暴", desc:"移速 +12%", speedMul:1.12, hpMul:1.0, defAdd:0, split:false, leech:false},
    {id:"tough", name:"厚血", desc:"血量 +25%", speedMul:1.0, hpMul:1.25, defAdd:0, split:false, leech:false},
    {id:"ironhide", name:"铁壳", desc:"防御 +12", speedMul:1.0, hpMul:1.0, defAdd:12, split:false, leech:false},
    {id:"splitter", name:"分裂", desc:"死后分裂 2 只小怪", speedMul:1.0, hpMul:1.0, defAdd:0, split:true, leech:false},
    {id:"vampire", name:"吸血", desc:"漏怪时偷 1 城防", speedMul:1.0, hpMul:1.0, defAdd:0, split:false, leech:true},
  ];
  const ENDLESS_CHESTS = [
    {name:"神秘军备箱", a:{text:"全体待命兵 +1 级", levelUp:1}, b:{text:"下一波敌量 +30%，得 8 金币", waveMul:1.3, coins:8}},
    {name:"远古祭坛", a:{text:"得 4 升级点", points:4}, b:{text:"敌人血量 +20%，得 2 个 4 级兵", hpMul:1.2, troops:2, troopLevel:4}},
    {name:"流浪商人", a:{text:"得 10 金币", coins:10}, b:{text:"敌速 +15%，大招能量 +50", speedMul:1.15, energy:50}},
    {name:"被诅咒的宝箱", a:{text:"得 3 个 5 级兵", troops:3, troopLevel:5}, b:{text:"本关敌人全强化，得 6 升级点", allAffix:true, points:6}},
  ];
  const ENDLESS_EXTRA_TROOP_EVERY = 3;
  const ENDLESS_EXTRA_TROOP_CAP = 6;

  // ========== 成就系统（服务端只做统计透传，判定在客户端） ==========
  const ACHIEVEMENT_IDS = ["first_blood","wave10","wave20","boss_slayer","overlord_hunter","queen_slayer","merge_killer","flawless","no_leak_stage","rich","bond_master","awakened","endless10","arena_first_win","daily_challenge"];
  const ACH_BOSSES_NEEDED = 5;
  const ACH_OVERLORDS_NEEDED = 10;
  const ACH_QUEENS_NEEDED = 3;
  const ACH_MERGES_PER_RUN = 3;
  const ACH_COINS_AT_ONCE = 30;
  const ACH_BONDS_AT_ONCE = 6;
  const ACH_ENDLESS_WAVES = 10;
  const ACH_NO_LEAK_STREAK = 3;

  // ========== 战利品图鉴 ==========
  const LOOT_KINDS = ["mite","beetle","spider","flyer","boss"];
  const LOOT_DROP_CHANCE = 0.18;
  const LOOT_HIDDEN_TROOP_AT = 60;
  const HIDDEN_TROOP_KEY = "guardian";

  // ========== 对战多关卡（与客户端 ARENA_STAGES 一致） ==========
  const ARENA_STAGES = [
    {name:"第 1 关 · 初试锋芒", aiLevels:[2,2,3,3,3,4,4], meLevels:[2,2,3,3,3,4,4], points:10},
    {name:"第 2 关 · 精锐压境", aiLevels:[3,3,3,4,4,4,5], meLevels:[2,2,3,3,3,4,4], points:10},
    {name:"第 3 关 · 铁壁军团", aiLevels:[3,4,4,4,5,5,5], meLevels:[2,3,3,3,4,4,4], points:11},
    {name:"第 4 关 · 深渊先锋", aiLevels:[4,4,5,5,5,6,6], meLevels:[3,3,4,4,4,5,5], points:12},
    {name:"第 5 关 · 神话之巅", aiLevels:[5,5,5,6,6,6,6], meLevels:[3,4,4,5,5,5,6], points:14},
  ];

  const GameTypes = {
  REACTION_OVERLOAD_DAMAGE,REACTION_MELT_DAMAGE,REACTION_MELT_DEF_SHRED,
  REACTION_SUPERCONDUCT_MUL,REACTION_PYROTOXIN_MUL,REACTION_QUICKEN_MUL,
  REACTION_CRYSTALLIZE_FREEZE,MERGE_BURST_RADIUS,MERGE_BURST_DAMAGE_MUL,
  TOTAL_LEVELS,WAVE_SIZE,START_CRYSTALS,PREP_SECONDS,WAVE_START_DELAY,START_TROOPS,
  TROOPS_PER_STAGE,MAX_LEVEL,RULES_VERSION,LEVEL_DAMAGE_MUL,LEVEL_RATE_MUL,
  LEVEL_HP_MUL,LEVEL_DEF_MUL,LEVEL_ARMOR,
  UPGRADE_POINTS_PER_STAGE,BOSS_REWARD_POINTS,BOSS_REWARD_TROOPS,
  SKIP_PENALTY_HP_MUL,SKIP_PENALTY_DEF_BONUS,SKIP_PENALTY_SPEED_MUL,
  OVERLORD_CHANCE,OVERLORD_CHANCE_LEVEL,OVERLORD_AURA_RADIUS,OVERLORD_AURA_SPEED_MUL,
  OVERLORD_HP_MUL,OVERLORD_DEF_BONUS,OVERLORD_BODY_R_MUL,OVERLORD_COIN_REWARD,OVERLORD_ENERGY_REWARD,
  ENEMY_MERGE_LEVEL_MIN,ENEMY_MERGE_RADIUS,ENEMY_MERGE_MAX_TIER,ENEMY_MERGE_HP_MUL,
  ENEMY_MERGE_DEF_ADD,ENEMY_MERGE_BODY_R_MUL,ENEMY_MERGE_SPEED_MUL,ENEMY_MERGE_BOUNTY_MUL,
  QUEEN_CHANCE,QUEEN_CHANCE_LEVEL,QUEEN_HP_MUL,QUEEN_DEF_BONUS,QUEEN_BODY_R_MUL,QUEEN_SPEED_MUL,
  QUEEN_SPAWN_INTERVAL,QUEEN_SPAWN_COUNT,QUEEN_BABY_HP_MUL,QUEEN_BABY_BODY_R_MUL,QUEEN_MAX_BABIES_ALIVE,
  QUEEN_COIN_REWARD,QUEEN_ENERGY_REWARD,
  BOSS_ENRAGE_HP_RATIO,BOSS_ENRAGE_SPEED_MUL,BOSS_ENRAGE_DEF_ADD,BOSS_ENRAGE_GUARDS,BOSS_ENRAGE_GUARD_HP_MUL,
  BOSS_SUMMON_INTERVAL,BOSS_SUMMON_COUNT,BOSS_SUMMON_HP_MUL,BOSS_SUMMON_ENRAGED_INTERVAL,BOSS_SHIELD_INTERVAL,BOSS_SHIELD_HP_RATIO,BOSS_SHIELD_MAX_RATIO,
  WEAPON_UPGRADE_MAX,WEAPON_UPGRADE_COSTS,WEAPON_DAMAGE_PER_LEVEL,DAMAGE_DEALT_MUL,
  RATE_UPGRADE_MAX,RATE_UPGRADE_COSTS,RATE_PER_LEVEL,
  ARMOR_UPGRADE_MAX,ARMOR_UPGRADE_COSTS,ARMOR_PER_LEVEL,scalingUpgradeCost,
  TROOP_BASE_HP,TROOP_BASE_DMG,TROOP_HP_PER_LEVEL,TROOP_DEF_PER_ARMOR_LEVEL,MERGE_COSTS,
  EVENT_SWIFT_SPEED_MUL,EVENT_RETALIATE_INTERVAL,EVENT_RETALIATE_DAMAGE,
  EVENT_ARMORED_DEF_BONUS,EVENT_LEAK_MUL,EVENT_REWARD_TROOPS,
  DEFENSE_UPGRADE_MAX,DEFENSE_UPGRADE_COSTS,DEFENSE_HP_PER_LEVEL,
  BOSS_HP_BASE_MUL,BOSS_HP_MUL_PER_LEVEL,BOSS_DEFENSE_BASE,BOSS_DEFENSE_PER_LEVEL,BOSS_DEFENSE_FLOOR,BOSS_SPEED_MULTIPLIER,BOSS_SPEED_FLAT_BONUS,BOSS_BODY_RADIUS_MULTIPLIER,RESTART_COIN_COST,
  CANVAS_WIDTH,CANVAS_HEIGHT,SLOT_COUNT,CELL,SLOT_PATH_CLEARANCE,ENEMY_SPRITE_COUNT,
  ELEMENTS,ELEMENT_STRONG,ELEMENT_ADV_MUL,ELEMENT_WEAK_MUL,ENEMY_KIND_ELEMENT,elementMul,BULLET_TYPE_COLORS,BULLET_ELEMENT_COLORS,
  AFFIX_IDS,AFFIX_CHANCE,AFFIX_SWIFT_SPEED_MUL,AFFIX_ARMORED_DEF_MUL,AFFIX_REGEN_PER_SEC,BOND_IDS,COIN_TROOP_COST,COINS_PER_STAGE,BOND_NAMES,BOND_SHORT,BOND_COLORS,BOND_STEPS,METAL_TROOPS,WATER_TROOPS,EARTH_TROOPS,WIND_TROOPS,BOND_WIND_RATE,BOND_WIND_KILL_RATE,BOND_WIND_KILL_DURATION,BOND_WATER_SLOW_CHANCE,BOND_WATER_SLOW_RATE,BOND_WATER_SLOW_DURATION,BOND_WATER_DOT,BOND_WOOD_HP,BOND_WOOD_LOW_THRESHOLD,BOND_WOOD_REGEN,BOND_WOOD_REGEN_DURATION,BOND_WOOD_REGEN_CD,BOND_EARTH_DEF,BOND_EARTH_ARMOR_PER_STACK,BOND_EARTH_ARMOR_MAX,BOND_METAL_DEF,BOND_METAL_REFLECT,BOND_FIRE_BURN_CHANCE,BOND_FIRE_BURN_DPS,BOND_FIRE_BURN_DURATION,BOND_NAT_ALL,BOND_NAT_STACK,BOND_NAT_STACK_INTERVAL,BOND_NAT_STACK_MAX,BOND_SHOCK_ALL,BOND_SHOCK_CHAIN_CHANCE,BOND_SHOCK_CHAIN_MUL,BOND_SHOCK_CHAIN_RADIUS,BOND_HYDRO_BURN_MUL,BOND_HYDRO_SLOW_CHANCE,BOND_BULWARK_ARMOR_MAX,BOND_BULWARK_REFLECT,BOND_GALE_KILL_DURATION,BOND_GALE_STACK_MAX,BOND_PRISM_ALL,
  BOND_FIRE_DAMAGE,
  BOND_PRISM_RANGE,BOND_PRISM_MIN_EACH,BOND_PAIR_MIN,BOND_DUO_SPLASH,BOND_STORM_DAMAGE,BOND_FORGE_LEAK,
  bondTier,MAP_EVENT_IDS,MAP_EVENT_NAMES,COOP_SKILLS,
  AFFIX_NAMES,AFFIX_DESCS,AFFIX_COLORS,AFFIX_BOSS_CHANCE,
  ULT_ENERGY_MAX,ULT_KILL_ENERGY,ULT_BOSS_ENERGY,ULT_LEAK_ENERGY,ULT_MAX_LOADOUT,ULT_IDS,ULT_NAMES,ULT_ICONS,ULT_COLORS,ULT_DESCS,
  ULT_THUNDER_BOLTS,ULT_THUNDER_RADIUS,ULT_THUNDER_DAMAGE,ULT_THUNDER_SLOW,
  ULT_BLIZZARD_FREEZE,ULT_BLIZZARD_BOSS_FREEZE,ULT_BLIZZARD_DAMAGE,
  ULT_CARPET_BOMBS,ULT_CARPET_SPLASH,ULT_CARPET_DAMAGE,
  ULT_GOLDRUSH_COINS,ULT_GOLDRUSH_DURATION,ULT_GOLDRUSH_PER_KILL,
  AWAKEN_SCALE,AWAKEN_DMG_MUL,AWAKEN_HP_MUL,AWAKEN_RATE_MUL,AWAKEN_RANGE_MUL,AWAKEN_KILL_ENERGY,
  ENDLESS_AFFIX_EVERY,ENDLESS_CHEST_EVERY,ENDLESS_AFFIXES,ENDLESS_CHESTS,ENDLESS_EXTRA_TROOP_EVERY,ENDLESS_EXTRA_TROOP_CAP,
  ACHIEVEMENT_IDS,ACH_BOSSES_NEEDED,ACH_OVERLORDS_NEEDED,ACH_QUEENS_NEEDED,ACH_MERGES_PER_RUN,
  ACH_COINS_AT_ONCE,ACH_BONDS_AT_ONCE,ACH_ENDLESS_WAVES,ACH_NO_LEAK_STREAK,
  LOOT_KINDS,LOOT_DROP_CHANCE,LOOT_HIDDEN_TROOP_AT,HIDDEN_TROOP_KEY,
  ARENA_STAGES,
  PATH,PATH_LEN,TROOP_TYPES,SLOT_META,posOnPath,pathLength,
  INDEPENDENT_PATHS,INDEPENDENT_SLOT_META,INDEPENDENT_SLOT_COUNT,
  ARENA_PLAYER_X,ARENA_AI_X,ARENA_CENTER_X,ARENA_TOP,ARENA_BOTTOM,ARENA_ROW_STEP,
  ARENA_BULLET_SPEED,ARENA_HP_MUL,ARENA_DAMAGE_MUL,ARENA_SLOT_COUNT,arenaSlotMeta,
  ARENA_PK_RAMP_START,ARENA_PK_RAMP_PER_SEC,arenaPkDamageMul,
  getIndependentPath,getIndependentSlots,getIndependentPathLen,
  SUPPORT_HEAL_RADIUS,SUPPORT_HEAL_PER_PULSE,SUPPORT_SHIELD_RADIUS,SUPPORT_SHIELD_RATIO,SUPPORT_SHIELD_MAX_RATIO,SUPPORT_HEAL_MINI_SHIELD
};

if(typeof module!=="undefined" && module.exports) module.exports=GameTypes;
if(typeof window!=="undefined") window.GameTypes=GameTypes;
})();

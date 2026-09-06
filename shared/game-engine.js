"use strict";

const {
  REACTION_OVERLOAD_DAMAGE,REACTION_MELT_DAMAGE,REACTION_MELT_DEF_SHRED,
  REACTION_SUPERCONDUCT_MUL,REACTION_PYROTOXIN_MUL,REACTION_QUICKEN_MUL,
  REACTION_CRYSTALLIZE_FREEZE,MERGE_BURST_RADIUS,MERGE_BURST_DAMAGE_MUL,
  TOTAL_LEVELS,WAVE_SIZE,START_CRYSTALS,PREP_SECONDS,WAVE_START_DELAY,START_TROOPS,
  TROOPS_PER_STAGE,MAX_LEVEL,RULES_VERSION,LEVEL_DAMAGE_MUL,LEVEL_RATE_MUL,
  LEVEL_HP_MUL,LEVEL_DEF_MUL,LEVEL_ARMOR,
  UPGRADE_POINTS_PER_STAGE,BOSS_REWARD_POINTS,BOSS_REWARD_TROOPS,COINS_PER_STAGE,COIN_TROOP_COST,
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
  BOSS_HP_MULTIPLIER,BOSS_DEFENSE_BONUS,BOSS_SPEED_MULTIPLIER,BOSS_SPEED_FLAT_BONUS,BOSS_BODY_RADIUS_MULTIPLIER,
  BOSS_HP_BASE_MUL,BOSS_HP_MUL_PER_LEVEL,BOSS_DEFENSE_BASE,BOSS_DEFENSE_PER_LEVEL,BOSS_DEFENSE_FLOOR,
  ENEMY_SPRITE_COUNT,ENEMY_KIND_ELEMENT,elementMul,AFFIX_IDS,AFFIX_CHANCE,AFFIX_SWIFT_SPEED_MUL,AFFIX_ARMORED_DEF_MUL,AFFIX_REGEN_PER_SEC,MAP_EVENT_IDS,COOP_SKILLS,
  ELEMENTS,BULLET_TYPE_COLORS,BULLET_ELEMENT_COLORS,
  BOND_IDS,BOND_STEPS,BOND_FIRE_DAMAGE,
  BOND_WIND_RATE,BOND_WIND_KILL_RATE,BOND_WIND_KILL_DURATION,BOND_WATER_SLOW_CHANCE,BOND_WATER_SLOW_RATE,BOND_WATER_SLOW_DURATION,BOND_WATER_DOT,BOND_WOOD_HP,BOND_WOOD_LOW_THRESHOLD,BOND_WOOD_REGEN,BOND_WOOD_REGEN_DURATION,BOND_WOOD_REGEN_CD,BOND_EARTH_DEF,BOND_EARTH_ARMOR_PER_STACK,BOND_EARTH_ARMOR_MAX,BOND_METAL_DEF,BOND_METAL_REFLECT,BOND_FIRE_BURN_CHANCE,BOND_FIRE_BURN_DPS,BOND_FIRE_BURN_DURATION,BOND_NAT_ALL,BOND_NAT_STACK,BOND_NAT_STACK_INTERVAL,BOND_NAT_STACK_MAX,BOND_SHOCK_ALL,BOND_SHOCK_CHAIN_CHANCE,BOND_SHOCK_CHAIN_MUL,BOND_SHOCK_CHAIN_RADIUS,BOND_HYDRO_BURN_MUL,BOND_HYDRO_SLOW_CHANCE,BOND_BULWARK_ARMOR_MAX,BOND_BULWARK_REFLECT,BOND_GALE_KILL_DURATION,BOND_GALE_STACK_MAX,BOND_PRISM_ALL,
  BOND_PRISM_RANGE,BOND_PRISM_MIN_EACH,BOND_PAIR_MIN,BOND_DUO_SPLASH,BOND_STORM_DAMAGE,BOND_FORGE_LEAK,
  ULT_ENERGY_MAX,ULT_KILL_ENERGY,ULT_BOSS_ENERGY,ULT_LEAK_ENERGY,ULT_MAX_LOADOUT,ULT_IDS,
  ULT_THUNDER_BOLTS,ULT_THUNDER_RADIUS,ULT_THUNDER_DAMAGE,ULT_THUNDER_SLOW,
  ULT_BLIZZARD_FREEZE,ULT_BLIZZARD_BOSS_FREEZE,ULT_BLIZZARD_DAMAGE,
  ULT_CARPET_BOMBS,ULT_CARPET_SPLASH,ULT_CARPET_DAMAGE,
  ULT_GOLDRUSH_COINS,ULT_GOLDRUSH_DURATION,ULT_GOLDRUSH_PER_KILL,
  AWAKEN_DMG_MUL,AWAKEN_HP_MUL,AWAKEN_RATE_MUL,AWAKEN_RANGE_MUL,
  ENDLESS_CHESTS,ENDLESS_AFFIXES,
  METAL_TROOPS,WATER_TROOPS,EARTH_TROOPS,WIND_TROOPS,
  CANVAS_WIDTH,CANVAS_HEIGHT,
  SLOT_COUNT,PATH,PATH_LEN,TROOP_TYPES,SLOT_META,posOnPath,pathLength,
  INDEPENDENT_PATHS,INDEPENDENT_SLOT_META,INDEPENDENT_SLOT_COUNT,
  ARENA_BULLET_SPEED,ARENA_HP_MUL,ARENA_DAMAGE_MUL,ARENA_SLOT_COUNT,arenaSlotMeta,
  ARENA_PK_RAMP_START,ARENA_PK_RAMP_PER_SEC,arenaPkDamageMul,
  getIndependentPath,getIndependentSlots,getIndependentPathLen,
  SUPPORT_HEAL_RADIUS,SUPPORT_HEAL_PER_PULSE,SUPPORT_SHIELD_RADIUS,SUPPORT_SHIELD_RATIO,SUPPORT_SHIELD_MAX_RATIO,SUPPORT_HEAL_MINI_SHIELD
} = require("./game-types");

function createRng(seed){
  let value = seed >>> 0;
  return ()=>{
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function typeByKey(key){
  return TROOP_TYPES.find(t=>t.key===key) || TROOP_TYPES[0];
}

function baseStats(level){
  const idx=Math.max(0,Math.min(MAX_LEVEL-1,level-1));
  return {
    range: 104 + idx*14,
    dmg:   TROOP_BASE_DMG * LEVEL_DAMAGE_MUL[idx],
    rate:  LEVEL_RATE_MUL[idx],
    hpMul: LEVEL_HP_MUL[idx],
    def:   30.0 * LEVEL_DEF_MUL[idx],
    armor: LEVEL_ARMOR[idx],
  };
}

function weaponUpgradeLevel(state,playerId){
  const owner=(state&&state._owner)||state||{};
  return Number(((owner.weaponUpgradeLevel)||{})[playerId]||0);
}
function rateUpgradeLevel(state,playerId){
  const owner=(state&&state._owner)||state||{};
  return Number(((owner.rateUpgradeLevel)||{})[playerId]||0);
}
function armorUpgradeLevel(state,playerId){
  const owner=(state&&state._owner)||state||{};
  return Number(((owner.armorUpgradeLevel)||{})[playerId]||0);
}
function weaponDamageMul(troop,state){ return 1 + weaponUpgradeLevel(state,troop.ownerId)*WEAPON_DAMAGE_PER_LEVEL; }

function wuxingCount(slots,list){
  let n=0;
  for(const troop of slots||[]){ if(troop && list.includes(troop.typeKey)) n++; }
  return n;
}
function computeBonds(slots){
  const counts={fire:0,ice:0,shock:0,nature:0};
  for(const troop of slots||[]){
    const element=troop&&troop.element;
    if(Object.prototype.hasOwnProperty.call(counts,element)) counts[element]++;
  }
  const bonds={_counts:counts};
  for(const element of ELEMENTS) bonds[element]=bondTier(element,counts[element]);
  const metalN=wuxingCount(slots,METAL_TROOPS);
  const waterN=wuxingCount(slots,WATER_TROOPS);
  const earthN=wuxingCount(slots,EARTH_TROOPS);
  const windN=wuxingCount(slots,WIND_TROOPS);
  const woodN=counts.ice;
  bonds.metal=bondTier("metal",metalN);
  bonds.water=bondTier("water",waterN);
  bonds.earth=bondTier("earth",earthN);
  bonds.wind=bondTier("wind",windN);
  bonds.prism=ELEMENTS.every(element=>counts[element]>=BOND_PRISM_MIN_EACH)?1:0;
  bonds.hydro=(counts.fire>=3 && woodN>=3)?1:0;
  bonds.bulwark=(earthN>=3 && metalN>=3)?1:0;
  bonds.gale=(windN>=3 && woodN>=3)?1:0;
  return bonds;
}
function bondTier(bondId,count){
  const steps=BOND_STEPS[bondId]||[];
  let tier=0;
  for(let i=0;i<steps.length;i++) if(count>=steps[i]) tier=i+1;
  return tier;
}
function stateBonds(state){
  if(state&&state.bonds) return state.bonds;
  if(state&&state._owner&&state._owner.bonds) return state._owner.bonds;
  return {};
}
function pathViewState(ps,state){
  if(!ps || !state || state.mode!=="independent") return state;
  return {...state,bonds:ps.bonds||state.bonds||emptyBonds()};
}
function emptyBonds(){
  return {_counts:{fire:0,ice:0,shock:0,nature:0},fire:0,ice:0,shock:0,nature:0,metal:0,water:0,earth:0,wind:0,prism:0,duo:0,storm:0,forge:0};
}
function allAttrMul(state,kind){
  let mul=1;
  if(Number(stateBonds(state).shock||0)>0) mul*=1+BOND_SHOCK_ALL;
  if(Number(stateBonds(state).nature||0)>0) mul*=1+BOND_NAT_ALL+natStackMul(state);
  if(Number(stateBonds(state).prism||0)>0) mul*=1+BOND_PRISM_ALL;
  if(kind==="dmg" && Number(stateBonds(state).fire||0)>0) mul*=1+BOND_FIRE_DAMAGE;
  if(kind==="rate" && Number(stateBonds(state).wind||0)>0){
    mul*=1+BOND_WIND_RATE;
    const dur=Number(stateBonds(state).gale||0)>0?BOND_GALE_KILL_DURATION:BOND_WIND_KILL_DURATION;
    if(Number((state._owner||state).windKillTimer||0)>0) mul*=1+BOND_WIND_KILL_RATE;
  }
  if(kind=="hp" && Number(stateBonds(state).ice||0)>0) mul*=1+BOND_WOOD_HP;
  return mul;
}
function bondDamageMul(state){ return allAttrMul(state,"dmg"); }
function natStackMul(state){
  const max=Number(stateBonds(state).gale||0)>0?BOND_GALE_STACK_MAX:BOND_NAT_STACK_MAX;
  return Math.min(Number(stateBonds(state)._natStacks||0), max)*BOND_NAT_STACK;
}
function bondRateMul(state){ return allAttrMul(state,"rate"); }
function bondRangeMul(state){ return Number(stateBonds(state).prism||0)>0 ? 1+BOND_PRISM_RANGE : 1; }
function bondSlowMul(state){ return 1; }
function bondHpMul(state){ return allAttrMul(state,"hp"); }
function bondDefAdd(state){
  return Number(stateBonds(state).earth||0)>0 ? BOND_EARTH_DEF : 0;
}
function bondArmorMul(state){
  return Number(stateBonds(state).metal||0)>0 ? BOND_METAL_DEF : 0;
}
function bondSplashMul(state){
  return Number(stateBonds(state).duo||0)>0 ? 1+BOND_DUO_SPLASH : 1;
}
function bondMetalPierce(state){ return 0; }
function bondWaterRetaliateMul(state){ return 1; }
function bondEarthRegen(state){ return 0; }
function bondWindBulletMul(state){ return 1; }
function bondLeakMul(state){
  return Number(stateBonds(state).forge||0)>0 ? 1-BOND_FORGE_LEAK : 1;
}
function bondStormMul(state,enemy){
  if(Number(stateBonds(state).storm||0)<=0) return 1;
  if((enemy&&Number(enemy.slowMul||1)<1) || (enemy&&Number(enemy.shockTimer||0)>0)) return 1+BOND_STORM_DAMAGE;
  return 1;
}
function troopSplash(troop,state){
  return (troop.splash||0)*bondSplashMul(state);
}
function refreshBonds(state){
  if(state.mode==="independent" || state.mode==="versus"){
    for(const ps of state.paths||[]) ps.bonds=computeBonds(ps.slots||[]);
    state.bonds=computeBonds((state.paths||[]).flatMap(ps=>ps.slots||[]));
  } else {
    state.bonds=computeBonds(state.slots||[]);
  }
}
function troopDamage(troop,state){ return (troop.dmg||1)*weaponDamageMul(troop,state)*bondDamageMul(state); }
function troopRate(troop,state){ return (troop.rate||1)*(1+rateUpgradeLevel(state,troop.ownerId)*RATE_PER_LEVEL)*bondRateMul(state); }
function troopRange(troop,state){ return (troop.range||0)*bondRangeMul(state); }
function troopHpMax(level){
  const idx=Math.max(0,Math.min(MAX_LEVEL-1,level-1));
  return TROOP_BASE_HP * LEVEL_HP_MUL[idx];
}
function troopDef(state,ownerId,troop){
  const base=troop&&troop.defBase!==undefined ? Number(troop.defBase)
    : 30.0 * LEVEL_DEF_MUL[Math.max(0,Math.min(MAX_LEVEL-1,((troop&&troop.level)||1)-1))];
  return base + armorUpgradeLevel(state,ownerId)*TROOP_DEF_PER_ARMOR_LEVEL;
}
function mergeCost(_level){ return 0; }

function makeTroop(level, ownerId, nextId, rng, typeKey, weaponLevel=0){
  const type = typeKey ? typeByKey(typeKey) : TROOP_TYPES[(rng()*TROOP_TYPES.length)|0];
  const b = baseStats(level);
  const key = type.key;

  let burst = type.burst || 1;
  let splash = type.splash || 0;
  let slow = type.slow || 0;
  let cone = type.cone || 0;
  let chain = type.chain || 0;
  let chainR = type.chainR || 0;
  let pellets = type.pellets || 0;
  let poison = type.poison || 0;
  let pierceCount = type.pierceCount || 0;
  let mineRadius = type.mineRadius || 0;
  let vulnerable = type.vulnerable || 0;
  let armorPierce = 0.0;
  let heal = type.heal || 0;
  let shield = type.shield || 0;
  let supportRadius = 0;
  if(heal > 0){
    supportRadius = SUPPORT_HEAL_RADIUS;
    if(level >= 5) supportRadius *= 1.25;
  } else if(shield > 0){
    supportRadius = SUPPORT_SHIELD_RADIUS;
    if(level >= 5) supportRadius *= 1.25;
  }

  // 1~6 星梯度进阶专属特质
  if (level >= 3) {
    if (key === "gun") burst += 1;
    else if (key === "tank") armorPierce = 0.30;
    else if (key === "plane") splash *= 1.25;
    else if (key === "cannon") splash *= 1.20;
    else if (key === "flame") cone += 12.0;
    else if (key === "tesla") chain += 1;
    else if (key === "ice") slow = Math.min(0.60, slow + 0.10);
    else if (key === "poison") poison += 1.5;
    else if (key === "artillery") splash = 75.0;
    else if (key === "missile") burst = 2;
    else if (key === "shotgun") pellets += 2;
    else if (key === "robot") burst += 1;
    else if (key === "railgun") pierceCount += 2;
    else if (key === "miner") mineRadius *= 1.3;
    else if (key === "radar") vulnerable += 2.0;
    else if (key === "medic") shield = Math.max(shield, SUPPORT_HEAL_MINI_SHIELD);
    else if (key === "aegis") heal = Math.max(heal, SUPPORT_HEAL_PER_PULSE * 0.5);
  }

  if (level >= 5) {
    if (key === "gun") burst += 1;
    else if (key === "tank") armorPierce = 0.60;
    else if (key === "plane") splash *= 1.30;
    else if (key === "cannon") splash *= 1.35;
    else if (key === "flame") cone += 18.0;
    else if (key === "tesla") chain += 2;
    else if (key === "ice") slow = Math.min(0.75, slow + 0.15);
    else if (key === "poison") poison += 2.5;
    else if (key === "artillery") splash = 110.0;
    else if (key === "missile") burst = 3;
    else if (key === "shotgun") pellets += 3;
    else if (key === "robot") burst += 1;
    else if (key === "railgun") pierceCount += 3;
    else if (key === "miner") mineRadius *= 1.5;
    else if (key === "radar") vulnerable += 3.0;
    else if (key === "medic") heal += SUPPORT_HEAL_PER_PULSE * 0.5;
    else if (key === "aegis") shield += 0.10;
  }

  return {
    id: nextId(),
    ownerId,
    level,
    typeKey: type.key,
    name: type.name,
    icon: type.icon,
    tag: type.tag,
    desc: type.desc,
    style: type.style,
    mode: type.mode || "single",
    range: type.range ?? (b.range * (type.rangeMul || 1)),
    dmg:   b.dmg,
    rate:  b.rate * (type.rateMul || 1),
    defBase: b.def,
    armor: b.armor,
    splash,
    slow,
    burst,
    cone,
    chain,
    chainR,
    pellets,
    poison,
    pierceCount,
    mineRadius,
    vulnerable,
    armorPierce,
    heal,
    shield,
    supportRadius,
    element: ELEMENTS[(rng()*ELEMENTS.length)|0],
    weaponLevel: Math.max(0,Math.min(WEAPON_UPGRADE_MAX,weaponLevel|0)),
    hpMax: troopHpMax(level), hp: troopHpMax(level),
    cd: 0,
  };
}

const BUG_KINDS = ["mite","beetle","spider","flyer"];
const BUG_PAL = {
  mite:   {body:"#7a3f6a", shell:"#5a2850", eye:"#c4f042"},
  beetle: {body:"#a86a3a", shell:"#6e4020", eye:"#ffd36b"},
  spider: {body:"#c9a227", shell:"#8b1e1e", eye:"#4fd1ff"},
  flyer:  {body:"#6b4ea3", shell:"#3d2a6e", eye:"#7ee787"},
};

function makeEnemy(level, nextId, rng, spawnPath, bossSkipped=false, forBoss=false, endlessAffixes=[]){
  // 每过一关怪物全面加强：血量指数成长 + 防御/速度线性成长
  // 每过一关怪物全面加强：指数 1.5（平缓）+ 平方项 26 扛后期（与客户端 game_engine.gd 一致）
  let hp = Math.round(50 * Math.pow(1.5, level-1) + level*level*26);
  let def = Math.floor((level-1)*4.4 + (level>=3 ? (level-2)*3.2 : 0));
  let speed = 46 + (level-1)*3.9 + (level>=6 ? (level-5)*2.2 : 0);
  if(bossSkipped){
    hp = Math.round(hp * SKIP_PENALTY_HP_MUL);
    def += SKIP_PENALTY_DEF_BONUS;
    speed *= SKIP_PENALTY_SPEED_MUL;
  }
  const kind = BUG_KINDS[(rng()*BUG_KINDS.length)|0];
  const spriteId = (rng()*ENEMY_SPRITE_COUNT)|0;
  const pal = BUG_PAL[kind];
  const bodyR = 9 + Math.min(5, (level-1)*0.2) + (kind==="spider"?1:0);
  const p0 = spawnPath ? spawnPath[0] : PATH[0];
  // 无尽模式词缀：乘法叠加血/速，加法叠防（与客户端 make_enemy 一致）
  let endlessSplit=false, endlessLeech=false;
  if(endlessAffixes && endlessAffixes.length){
    let eHpMul=1, eSpeedMul=1, eDefAdd=0;
    for(const ea of endlessAffixes){ eHpMul*=ea.hpMul||1; eSpeedMul*=ea.speedMul||1; eDefAdd+=ea.defAdd||0; endlessSplit=endlessSplit||!!ea.split; endlessLeech=endlessLeech||!!ea.leech; }
    hp=Math.round(hp*eHpMul); speed*=eSpeedMul; def+=eDefAdd;
  }
  let elite=false, affix=null;
  // 词缀：普通怪按概率携带一个，直接落在基础属性上（与客户端 game_engine.gd 一致）
  if(rng()<AFFIX_CHANCE){
    elite=true;
    affix=AFFIX_IDS[(rng()*AFFIX_IDS.length)|0];
    if(affix==="swift"){ speed*=AFFIX_SWIFT_SPEED_MUL; }
    else if(affix==="armored"){ def=Math.round(def*AFFIX_ARMORED_DEF_MUL); }
  }
  // 虫巢督军：概率晋升的精英怪——金冠金壳，带加速光环（光环 tick 见 stepPath）。
  // Boss 生成路径跳过晋升：Boss 自带倍率，叠上督军 4.5 倍血会让血量随机膨胀（历史 bug）。
  const isOverlord = !forBoss && level>=OVERLORD_CHANCE_LEVEL && rng()<OVERLORD_CHANCE;
  if(isOverlord){
    hp = Math.round(hp * OVERLORD_HP_MUL);
    def += OVERLORD_DEF_BONUS;
  }
  // 虫后：慢速产卵精英（督军之后独立判定，两者互斥——各司其职）
  const isQueen = !forBoss && !isOverlord && level>=QUEEN_CHANCE_LEVEL && rng()<QUEEN_CHANCE;
  if(isQueen){
    hp = Math.round(hp * QUEEN_HP_MUL);
    def += QUEEN_DEF_BONUS;
    speed *= QUEEN_SPEED_MUL;
  }
  const finalBodyR = isOverlord ? bodyR*OVERLORD_BODY_R_MUL : (isQueen ? bodyR*QUEEN_BODY_R_MUL : bodyR);
  return {
    id: nextId(),
    hpMax: hp, hp, def, speed, bodyR: finalBodyR, kind, spriteId,
    element: ELEMENTS[(rng()*ELEMENTS.length)|0],
    elite, affix, isOverlord, hiveBuffed: false, endlessSplit, endlessLeech,
    isQueen, isQueenBaby: false, queenSpawnAcc: 0, mergeTier: 0, enraged: false,
    dist: 0,
    x: p0.x, y: p0.y,
    slowMul: 1, slowTimer: 0,
    poisonTimer: 0, poisonDps: 0, poisonElement: null,
    vulnerableTimer: 0, vulnerableMul: 1,
    shockTimer: 0, burnTimer: 0, retaliateCd: 0,
    walk: rng()*Math.PI*2,
    color: pal.body, shell: pal.shell, eye: pal.eye,
    dead: false, reached: false,
  };
}

function makeBoss(level, nextId, rng, spawnPath){
  const boss=makeEnemy(level,nextId,rng,spawnPath,false,true);
  const baseSpeed=boss.speed;
  // 血量倍率随关卡增长：后期玩家 DPS 滚雪球（羁绊/星级），固定倍率会被秒（与客户端一致）
  boss.hpMax*=BOSS_HP_BASE_MUL+level*BOSS_HP_MUL_PER_LEVEL; boss.hp=boss.hpMax;
  boss.def+=BOSS_DEFENSE_BASE+level*BOSS_DEFENSE_PER_LEVEL;
  // 护甲保底：融毁削甲等效果最多削到这里（防被削穿后 Boss 变纸糊）
  boss.defFloor=BOSS_DEFENSE_FLOOR;
  boss.speed=Math.min(baseSpeed*BOSS_SPEED_MULTIPLIER,baseSpeed+BOSS_SPEED_FLAT_BONUS);
  boss.bodyR*=BOSS_BODY_RADIUS_MULTIPLIER;
  boss.kind="boss"; boss.spriteId=null; boss.element=ELEMENTS[(rng()*ELEMENTS.length)|0]; boss.color="#b91c1c"; boss.shell="#581c87"; boss.eye="#fde047"; boss.isBoss=true;
  // Boss 必带词缀（生成时若未抽到，这里强制补一个并生效；与客户端 game_engine.gd 一致）
  if(!boss.affix){
    boss.affix=AFFIX_IDS[(rng()*AFFIX_IDS.length)|0];
    if(boss.affix==="swift"){ boss.speed*=AFFIX_SWIFT_SPEED_MUL; }
    else if(boss.affix==="armored"){ boss.def=Math.round(boss.def*AFFIX_ARMORED_DEF_MUL); }
  }
  boss.elite=!!boss.affix; boss.isOverlord=false; boss.hiveBuffed=false;
  boss.isQueen=false; boss.isQueenBaby=false; boss.mergeTier=0; boss.enraged=false;
  // 周期技能计时器：召唤护卫 / 能量护盾（与客户端 game_engine.gd 一致）
  boss.summonTimer=BOSS_SUMMON_INTERVAL; boss.shieldTimer=BOSS_SHIELD_INTERVAL; boss.shield=0;
  return boss;
}

// ---------- 敌方合兵：同种小怪贴太近时融合成高一阶怪 ----------
// 血量合并 ×1.15、体型变大、防御上浮、移速略降；一帧最多合 3 对防抖动。
// 确定性：遍历顺序固定 + 无随机，联机两端结果一致。
function stepEnemyMerges(ps, state){
  if(state.level < ENEMY_MERGE_LEVEL_MIN) return;
  let mergesDone = 0;
  let i = 0;
  while(i < ps.enemies.length && mergesDone < 3){
    const a = ps.enemies[i];
    if(a.dead || a.mergeTier >= ENEMY_MERGE_MAX_TIER || a.isBoss || a.isOverlord || a.isQueen){ i++; continue; }
    let mergedIdx = -1;
    for(let j=i+1; j<ps.enemies.length; j++){
      const b = ps.enemies[j];
      if(b.dead || b.mergeTier >= ENEMY_MERGE_MAX_TIER || b.isBoss || b.isOverlord || b.isQueen) continue;
      if(b.kind !== a.kind) continue;
      if(Math.abs(b.dist - a.dist) > 8.0) continue;
      if(Math.hypot(b.x-a.x, b.y-a.y) <= ENEMY_MERGE_RADIUS){ mergedIdx = j; break; }
    }
    if(mergedIdx < 0){ i++; continue; }
    const b2 = ps.enemies[mergedIdx];
    const host = a.dist >= b2.dist ? a : b2;
    const other = host === a ? b2 : a;
    host.hpMax = Math.round((a.hpMax + b2.hpMax) * ENEMY_MERGE_HP_MUL);
    host.hp = Math.min(Math.max(1, a.hp + b2.hp), host.hpMax);
    host.def = Math.round((a.def + b2.def) * 0.6) + ENEMY_MERGE_DEF_ADD;
    host.bodyR = Math.max(a.bodyR, b2.bodyR) * ENEMY_MERGE_BODY_R_MUL;
    host.speed = Math.max(a.speed, b2.speed) * ENEMY_MERGE_SPEED_MUL;
    host.mergeTier = (a.mergeTier||0) + 1;
    host.hiveBuffed = false;
    other.dead = true; // 走正常过滤移除，不加 killed（没真正被击杀）
    addEffect(ps, {kind:"ring", x:other.x, y:other.y, r:34, life:0.35, max:0.35, color:"#c084fc"});
    addEffect(ps, {kind:"boom", x:host.x, y:host.y, r:26, life:0.3, max:0.3, color:"#a78bfa"});
    mergesDone++;
    i++;
  }
}

// ---------- 虫后产卵：周期在身后孵幼虫 ----------
// 幼虫是缩小版（脆皮），继承虫后位置；全场幼虫有上限防滚雪球。
function stepQueenSpawns(ps, state, dt){
  let babiesAlive = 0;
  for(const e of ps.enemies){ if(e.isQueenBaby && !e.dead) babiesAlive++; }
  for(const e of ps.enemies){
    if(e.dead || !e.isQueen) continue;
    e.queenSpawnAcc = (e.queenSpawnAcc||0) + dt;
    if(e.queenSpawnAcc < QUEEN_SPAWN_INTERVAL) continue;
    e.queenSpawnAcc = 0;
    const room = Math.max(0, QUEEN_MAX_BABIES_ALIVE - babiesAlive);
    const spawns = Math.min(QUEEN_SPAWN_COUNT, room);
    for(let k=0;k<spawns;k++){
      const baby = makeEnemy(state.level, state.nextId, state.rng, ps.path, !!state.bossSkipped, false, state.endlessAffixes||[]);
      baby.isQueen = false; baby.isOverlord = false; baby.isQueenBaby = true;
      baby.hpMax = Math.max(6, baby.hpMax * QUEEN_BABY_HP_MUL);
      baby.hp = baby.hpMax;
      baby.bodyR = baby.bodyR * QUEEN_BABY_BODY_R_MUL;
      baby.dist = Math.max(0, e.dist - 18.0*(k+1));
      const pos = posOnPath(baby.dist, ps.path);
      baby.x = pos.x; baby.y = pos.y;
      baby.mergeTier = ENEMY_MERGE_MAX_TIER; // 幼虫不参与敌方合兵（防虫后无限喂融合）
      ps.enemies.push(baby);
      babiesAlive++;
    }
    addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:40, life:0.45, max:0.45, color:"#f472b6"});
    addEffect(ps, {kind:"boom", x:e.x, y:e.y, r:24, life:0.35, max:0.35, color:"#fb7185"});
  }
}

// ---------- Boss 激怒：血量过半触发，一次性 ----------
// 提速 + 防御上浮 + 召唤护卫；enraged 标记保证只触发一次。
function stepBossEnrage(ps, state){
  for(const e of ps.enemies){
    if(e.dead || !e.isBoss || e.enraged) continue;
    if(e.hp > e.hpMax * BOSS_ENRAGE_HP_RATIO) continue;
    e.enraged = true;
    e.speed *= BOSS_ENRAGE_SPEED_MUL;
    e.def += BOSS_ENRAGE_DEF_ADD;
    for(let k=0;k<BOSS_ENRAGE_GUARDS;k++){
      const guard = makeEnemy(state.level, state.nextId, state.rng, ps.path, !!state.bossSkipped, false, state.endlessAffixes||[]);
      guard.hpMax = Math.max(10, guard.hpMax * BOSS_ENRAGE_GUARD_HP_MUL);
      guard.hp = guard.hpMax;
      guard.isOverlord = false; guard.isQueen = false;
      guard.mergeTier = ENEMY_MERGE_MAX_TIER; // 护卫不参与合兵
      guard.dist = Math.max(0, e.dist - 30.0*(k+1));
      const pos = posOnPath(guard.dist, ps.path);
      guard.x = pos.x; guard.y = pos.y;
      ps.enemies.push(guard);
    }
    addEffect(ps, {kind:"boom", x:e.x, y:e.y, r:90, life:0.6, max:0.6, color:"#ef4444"});
    addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:130, life:0.8, max:0.8, color:"#f97316"});
  }
}

// ---------- Boss 周期技能：召唤护卫 / 能量护盾（与客户端 game_engine.gd 同步） ----------
// 激怒之外的常驻压力：召唤让小怪源源不断，护盾让爆发伤害打折。
function spawnBossGuard(ps, state, boss, hpMul, offset){
  const guard = makeEnemy(state.level, state.nextId, state.rng, ps.path, !!state.bossSkipped, false, state.endlessAffixes||[]);
  guard.hpMax = Math.max(10, guard.hpMax * hpMul);
  guard.hp = guard.hpMax;
  guard.isOverlord = false; guard.isQueen = false;
  guard.mergeTier = ENEMY_MERGE_MAX_TIER; // 护卫不参与合兵
  guard.enraged = false;
  guard.dist = Math.max(0, boss.dist - offset);
  const pos = posOnPath(guard.dist, ps.path);
  guard.x = pos.x; guard.y = pos.y;
  ps.enemies.push(guard);
}

function stepBossSkills(ps, state, dt){
  for(const e of ps.enemies){
    if(e.dead || !e.isBoss) continue;
    // 召唤护卫：激怒后间隔缩短
    const interval = e.enraged ? BOSS_SUMMON_ENRAGED_INTERVAL : BOSS_SUMMON_INTERVAL;
    e.summonTimer = (e.summonTimer == null ? interval : e.summonTimer) - dt;
    if(e.summonTimer <= 0){
      e.summonTimer = interval;
      for(let k=0;k<BOSS_SUMMON_COUNT;k++){
        spawnBossGuard(ps, state, e, BOSS_SUMMON_HP_MUL, 34.0*(k+1));
      }
      addEffect(ps, {kind:"boom", x:e.x, y:e.y, r:52, life:0.4, max:0.4, color:"#a78bfa"});
      addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:70, life:0.5, max:0.5, color:"#c4b5fd"});
    }
    // 能量护盾：周期充能，上限 25% 最大生命
    e.shieldTimer = (e.shieldTimer == null ? BOSS_SHIELD_INTERVAL : e.shieldTimer) - dt;
    if(e.shieldTimer <= 0){
      e.shieldTimer = BOSS_SHIELD_INTERVAL;
      const cap = e.hpMax * BOSS_SHIELD_MAX_RATIO;
      const before = e.shield || 0;
      if(before < cap){
        e.shield = Math.min(cap, before + e.hpMax * BOSS_SHIELD_HP_RATIO);
        addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:(e.bodyR||20)*1.8, life:0.5, max:0.5, color:"#8fd2ff"});
      }
    }
  }
}

function makeVariedTroops(count, ownerId, state){
  let pool=TROOP_TYPES.slice();
  const result=[];
  // 开局保底：待命兵 ≥4 个时，其中 1 个从辅助兵（医疗机/圣盾塔）里出（与客户端 game_engine.gd 一致）
  const supportKeys=["medic","aegis"];
  if(count>=4 && !state.arena){
    const key=supportKeys[(state.rng()*supportKeys.length)|0];
    const supIdx=pool.findIndex(t=>t.key===key);
    if(supIdx>=0){
      result.push(makeTroop(1,ownerId,state.nextId,state.rng,key));
      pool.splice(supIdx,1);
    }
  }
  while(result.length<count){
    if(!pool.length) pool=TROOP_TYPES.slice();
    const idx=Math.min(pool.length-1,(state.rng()*pool.length)|0);
    const type=pool.splice(idx,1)[0];
    result.push(makeTroop(1,ownerId,state.nextId,state.rng,type.key));
  }
  return result;
}

function waveSizeFor(level){
  return WAVE_SIZE + Math.floor((level-1)/2) + (level>=6 ? level-5 : 0);
}
function spawnIntervalFor(level){
  return Math.max(0.62, 1.05 - (level-1)*0.032);
}

// ============ 创建会话 ============
function createSession(playerIds, seed=Date.now()>>>0, mode="coop"){
  const rng = createRng(seed);
  let idSeq = 0;
  const nextId = ()=> "e"+(++idSeq);

  const state = {
    revision: 0,
    tick: 0,
    seed,
    rulesVersion: RULES_VERSION,
    rng,
    nextId,
    started: false,
    over: false,
    result: null,
    level: 1,
    phase: "lobby",
    mode, // "coop" | "independent"
    prepTimer: PREP_SECONDS,
    bossEnabled: false, bossPending: false, bossSpawned: false, bossKilled: false, bossEscaped: false, bossSkipped: false,
    hostId: playerIds[0] || null,
    coins: {}, // 过关金币（金币换兵系统）
    players: playerIds.map((id,i)=>({
      id, name:"玩家"+(i+1), ready:false, connected:true,
      pathIndex: (mode==="independent" || mode==="versus") ? i : -1, // 独立/对战模式下每人一条路
    })),
    upgradePoints: Object.fromEntries(playerIds.map(id=>[id,0])),
    weaponUpgradeLevel: Object.fromEntries(playerIds.map(id=>[id,0])),
    rateUpgradeLevel: Object.fromEntries(playerIds.map(id=>[id,0])),
    armorUpgradeLevel: Object.fromEntries(playerIds.map(id=>[id,0])),
    eventSpeedMul: 1, eventRetaliate: false, eventArmored: false, eventLeakMul: 1, eventBonusTroop: false,
    mapEvent: null, mapEventResolved: false, mapEventChoice: null,
    paused: false, pausedBy: null,
    coopSkills: {
      focus: {remaining:0, active:0, targetId:null},
      shield: {remaining:0, uses:0},
    },
  };

  if(mode === "independent"){
    // 独立路径模式：每人一条路，独立状态
    state.paths = playerIds.map((id, i)=>{
      const path = getIndependentPath(i);
      const slots = getIndependentSlots(i);
      const pLen = pathLength(path);
      return {
        pathIndex: i,
        ownerId: id,
        path,
        slots: Array.from({length: getIndependentSlots(i).length}, ()=>null),
        pathLen: pLen,
        crystals: START_CRYSTALS,
        crystalsMax: START_CRYSTALS,
        defenseUpgradeLevel: 0,
        enemies: [], bullets: [], beams: [], clouds: [], mines: [], effects: [],
        spawned: 0, killed: 0, spawnAcc: 0, spawnDelay: 0,
        bossKilled: false, bossEscaped: false,      };
    });
    state.trays = Object.fromEntries(playerIds.map(id=>[id,[]]));
    for(const playerId of playerIds) state.trays[playerId]=makeVariedTroops(START_TROOPS,playerId,state);
  } else if(mode === "versus"){
    // 双人对战（网络）：左右竞技场，setupArena 里铺阵位与待命兵
    setupArena(state);
  } else {
    // 合作模式：共享路径
    state.crystals = START_CRYSTALS;
    state.crystalsMax = START_CRYSTALS;
    state.defenseUpgradeLevel = 0;
    state.spawned = 0; state.killed = 0; state.spawnAcc = 0; state.spawnDelay = 0;
    state.bossKilled = false; state.bossEscaped = false;    state.enemies = []; state.bullets = []; state.beams = [];
    state.clouds = []; state.mines = []; state.effects = [];
    state.slots = Array.from({length: SLOT_META.length}, ()=>null);
    state.trays = Object.fromEntries(playerIds.map(id=>[id,[]]));
    for(const playerId of playerIds) state.trays[playerId]=makeVariedTroops(START_TROOPS,playerId,state);
  }

  refreshBonds(state);
  return state;
}

function serializeTroop(t,state){
  return {
    id:t.id, ownerId:t.ownerId, level:t.level, typeKey:t.typeKey,
    name:t.name, icon:t.icon, tag:t.tag, desc:t.desc,
    style:t.style, mode:t.mode, range:t.range, dmg:t.dmg, rate:t.rate,
    rateFinal:troopRate(t,state),
    rangeFinal:troopRange(t,state),
    weaponLevel:t.weaponLevel||0, element:t.element||"shock", damageFinal:troopDamage(t,state),
    hpMax:t.hpMax||0, hp:t.hp||0,
  };
}

function player(state,id){ return state.players.find(p=>p.id===id); }
function allReady(state){
  const online = state.players.filter(p=>p.connected);
  return online.length>=1 && online.every(p=>p.ready);
}

// 获取玩家所属的路径索引
function getPlayerPathIndex(state, playerId){
  const p = player(state, playerId);
  if(p) return p.pathIndex;
  return -1;
}

// 获取玩家的路径状态（独立模式）
function getPlayerPathState(state, playerId){
  const idx = getPlayerPathIndex(state, playerId);
  if(idx >= 0 && state.paths && state.paths[idx]) return state.paths[idx];
  return null;
}

function findOwnedTroop(state,ownerId,id){
  const trayTroop=(state.trays[ownerId]||[]).find(t=>t.id===id);
  if(trayTroop) return {troop:trayTroop, source:"tray"};

  if(state.mode === "independent"){
    // 独立模式：在自己的路径槽位中查找
    const ps = getPlayerPathState(state, ownerId);
    if(ps){
      const idx=ps.slots.findIndex(t=>t&&t.id===id&&t.ownerId===ownerId);
      if(idx>=0) return {troop:ps.slots[idx], source:"slot", slotIndex:idx, pathIndex:ps.pathIndex};
    }
  } else {
    // 合作模式：在共享槽位中查找
    const idx=state.slots.findIndex(t=>t&&t.id===id&&t.ownerId===ownerId);
    if(idx>=0) return {troop:state.slots[idx], source:"slot", slotIndex:idx};
  }
  return null;
}

function removeFromTray(state,ownerId,id){
  state.trays[ownerId]=(state.trays[ownerId]||[]).filter(t=>t.id!==id);
}
function upgradePoints(state,playerId){ return Number(state.upgradePoints[playerId]||0); }
function spendUpgradePoints(state,playerId,cost){
  if(upgradePoints(state,playerId)<cost) return false;
  state.upgradePoints[playerId]-=cost;
  return true;
}
function defenseState(state,playerId){ return state.mode==="independent"?getPlayerPathState(state,playerId):state; }

function defaultCoopSkills(){
  return {focus:{remaining:0,active:0,targetId:null}, shield:{remaining:0,uses:0}};
}
function ensureCoopSkills(state){
  if(!state.coopSkills) state.coopSkills=defaultCoopSkills();
  return state.coopSkills;
}
function applyMapEvent(state,eventId){
  state.mapEvent=eventId;
  state.mapEventChoice=eventId;
  state.mapEventResolved=true;
  state.eventSpeedMul=1;
  state.eventRetaliate=false;
  state.eventArmored=false;
  state.eventLeakMul=1;
  state.eventBonusTroop=true;
  if(eventId==="swift_march") state.eventSpeedMul=EVENT_SWIFT_SPEED_MUL;
  else if(eventId==="retaliate_wave") state.eventRetaliate=true;
  else if(eventId==="armored_tide") state.eventArmored=true;
  else if(eventId==="leak_tax") state.eventLeakMul=EVENT_LEAK_MUL;
}
function resetStageExtras(state){
  state.mapEvent=null;
  state.mapEventResolved=false;
  state.mapEventChoice=null;
  state.eventSpeedMul=1;
  state.eventRetaliate=false;
  state.eventArmored=false;
  state.eventLeakMul=1;
  state.eventBonusTroop=false;
  state.bossKilled=false;
  state.bossEscaped=false;
  for(const ps of state.paths||[]){ ps.bossKilled=false; ps.bossEscaped=false; }
  const skills=ensureCoopSkills(state);
  skills.focus.targetId=null;
  skills.shield.uses=0;
}
// 清空飞行物与特效（关卡推进时用，怪物与开局延迟留给下一波开场）
function clearProjectiles(ps){
  ps.bullets=[]; ps.beams=[]; ps.clouds=[]; ps.mines=[]; ps.effects=[];
}
// 一波开打前的全场重置（startWave 命令与备战结束共用）；fullBoss 用于 startWave 全重置 Boss 追踪
function resetBattlefield(ps, fullBoss=false){
  ps.spawned=0; ps.killed=0; ps.spawnAcc=0; ps.spawnDelay=WAVE_START_DELAY; ps.bossSpawned=false;
  if(fullBoss){ ps.bossKilled=false; ps.bossEscaped=false; }
  ps.enemies=[]; clearProjectiles(ps);
}
// coop 模式下 stepPath 在包装字典上工作，把数组与标量字段抄回主状态
const COOP_PS_KEYS = ["enemies","bullets","beams","clouds","mines","effects","spawned","killed","spawnAcc","spawnDelay","bossSpawned","bossKilled","bossEscaped","crystals","retaliateCd"];
function syncCoopBack(state, ps){
  for(const k of COOP_PS_KEYS){ state[k]=ps[k]; }
}
function useCoopSkill(state,playerId,skillKey){
  const skills=ensureCoopSkills(state);
  if(skillKey==="focus"){
    if((skills.focus.remaining||0)>0) throw new Error("集火技能冷却中");
    const defense=defenseState(state,playerId);
    const enemies=(defense&&defense.enemies)||state.enemies||[];
    let target=null, best=-1;
    for(const e of enemies){
      if(e.dead || e.isBoss) continue;
      if((e.dist||0)>best){ best=e.dist||0; target=e; }
    }
    if(!target) throw new Error("没有可标记的目标");
    skills.focus.remaining=COOP_SKILLS.focus.cooldown;
    skills.focus.active=COOP_SKILLS.focus.duration;
    skills.focus.targetId=target.id;
    return;
  }
  if(skillKey==="shield"){
    if((skills.shield.remaining||0)>0) throw new Error("护盾技能冷却中");
    if((skills.shield.uses||0)>=COOP_SKILLS.shield.usesPerStage) throw new Error("本关护盾已用完");
    const defense=defenseState(state,playerId);
    if(!defense) throw new Error("城防不存在");
    defense.crystals=Math.min(defense.crystalsMax||START_CRYSTALS,(defense.crystals||0)+COOP_SKILLS.shield.crystals);
    skills.shield.remaining=COOP_SKILLS.shield.cooldown;
    skills.shield.uses=(skills.shield.uses||0)+1;
    return;
  }
  throw new Error("未知技能");
}

// ============ 兵团对战竞技场（versus） ============
// 与客户端 game_engine.gd 的 setup_arena/_arena_*/_step_arena 逻辑镜像；
// 开战前布阵不倒计时，开战后双方原地站桩对射。
const ARENA_VERSUS_STAGE = { meLevels: [2, 2, 3, 3, 3, 4, 4], points: 10, startCoins: 5 };

function setupArena(state){
  state.arena = true;
  state.arenaLaunched = false;
  state.arenaUnits = [];
  state.arenaEffects = [];
  state.arenaBullets = [];
  state.arenaDamageTaken = [0.0, 0.0];
  state.arenaDeployed = {};
  state.arenaFinishing = false;
  state.arenaFinishTimer = 0.0;
  state.arenaSlowmo = false;
  state.phase = "prep";
  state.prepTimer = 0; // 对战布阵不倒计时，等双方点"开战"
  state.trays = {};
  const stage = ARENA_VERSUS_STAGE;
  const teamCount = Math.min(2, state.players.length);
  state.paths = state.players.slice(0, teamCount).map((p, i)=>{
    const path = getIndependentPath(i);
    const ps = {
      pathIndex: i,
      ownerId: p.id,
      path,
      slots: Array.from({length: ARENA_SLOT_COUNT}, ()=>null),
      pathLen: pathLength(path),
      enemies: [], bullets: [], beams: [], clouds: [], mines: [], effects: [],
      spawned: 0, killed: 0, spawnAcc: 0, spawnDelay: 0,
      crystals: 0, crystalsMax: 0, defenseUpgradeLevel: 0,
    };
    state.arenaDeployed[p.id] = 0;
    state.upgradePoints[p.id] = (state.upgradePoints[p.id]||0) + stage.points;
    state.trays[p.id] = [];
    for(const lv of stage.meLevels) state.trays[p.id].push(makeTroop(lv, p.id, state.nextId, state.rng));
    state.coins[p.id] = stage.startCoins; // 开局送 5 金币，可换一次兵
    return ps;
  });
  for(const pid of playerIdsOf(state)){
    if(!(pid in state.arenaDeployed)) state.arenaDeployed[pid] = 0;
  }
  refreshBonds(state);
  return state;
}

function playerIdsOf(state){ return state.players.map(p=>p.id); }

function arenaTeamState(state, team){
  // 队伍视图：升级等级读全局 state（原型链），羁绊读本队 slots（实例覆盖）
  const ps = state.paths[team];
  const view = Object.create(state);
  view.bonds = ps.bonds;
  view.slots = ps.slots;
  return view;
}

function arenaActiveUnits(state, team=-1){
  const out = [];
  for(const unit of state.arenaUnits||[]){
    if(unit.dead || (unit.hp||0) <= 0) continue;
    if(team >= 0 && unit.team !== team) continue;
    out.push(unit);
  }
  return out;
}

function arenaNearestTarget(units, unit){
  let best = null, bestD = Infinity;
  for(const other of units){
    if(other.dead || other.team === unit.team) continue;
    const d = Math.hypot(other.x - unit.x, other.y - unit.y);
    if(d < bestD){ bestD = d; best = other; }
  }
  return best;
}

function arenaAddEffect(state, effect){
  const ef = {...effect};
  ef.id = state.nextId();
  ef.life = ef.life != null ? ef.life : 0.18;
  ef.max = ef.max != null ? ef.max : ef.life;
  state.arenaEffects.push(ef);
}

function arenaQueueDamage(queue, target, dmg, atkElement, armorPierce=0, slow=0, poison=0, vulnerable=0){
  if(!target || target.dead) return;
  queue.push({targetId: target.id, dmg, element: atkElement, armorPierce, slow, poison, vulnerable});
}

function arenaLaunch(state){
  state.arenaUnits = [];
  state.arenaEffects = [];
  state.arenaBullets = [];
  state.arenaDamageTaken = [0.0, 0.0];
  for(let team = 0; team < Math.min(2, state.paths.length); team++){
    const ps = arenaTeamState(state, team);
    ps.bonds = computeBonds(ps.slots||[]);
    const meta = arenaSlotMeta(team);
    (ps.slots||[]).forEach((tr, i)=>{
      if(!tr || i >= meta.length) return;
      state.arenaUnits.push(makeArenaUnit(state, tr, team, meta[i]));
    });
  }
  state.arenaLaunched = true;
}

function makeArenaUnit(state, troop, team, pos){
  const t = JSON.parse(JSON.stringify(troop));
  const hp = (t.hpMax || troopHpMax(t.level||1)) * ARENA_HP_MUL;
  return {
    id: "arena_" + state.nextId(), team, troop: t, ownerId: t.ownerId,
    x: pos.x, y: pos.y, hpMax: hp, hp,
    def: troopDef(state, t.ownerId, t), cd: 0,
    slowMul: 1.0, slowTimer: 0.0, poisonTimer: 0.0, poisonDps: 0.0, poisonElement: "",
    vulnerableTimer: 0.0, vulnerableMul: 1.0, shockTimer: 0.0, burnTimer: 0.0, dead: false,
  };
}

function arenaApplyDamage(state, queued){
  let unit = null;
  for(const candidate of state.arenaUnits){
    if(candidate.id === queued.targetId){ unit = candidate; break; }
  }
  if(!unit || unit.dead) return;
  const ap = queued.armorPierce||0;
  const def = Math.max(0, (unit.def||0) * (1 - ap));
  const factor = 1 / (1 + def * 0.085);
  const vuln = unit.vulnerableTimer > 0 ? (unit.vulnerableMul||1) : 1;
  const elemMulV = elementMul(queued.element||"", unit.troop.element||"");
  // 圣盾力场：先扣吸收盾，再落血
  const real = absorbShield(unit, Math.max(0.25, (queued.dmg||0) * factor * vuln * elemMulV));
  unit.hp -= real;
  const victimTeam = Math.min(1, Math.max(0, unit.team||0));
  if(state.arenaDamageTaken && state.arenaDamageTaken.length >= 2) state.arenaDamageTaken[victimTeam] += real;
  if((queued.slow||0) > 0){
    unit.slowMul = Math.min(unit.slowMul||1, 1 - queued.slow);
    unit.slowTimer = Math.max(unit.slowTimer||0, 1.2);
  }
  if((queued.poison||0) > 0){
    unit.poisonTimer = Math.max(unit.poisonTimer||0, 2.0);
    unit.poisonDps = Math.max(unit.poisonDps||0, queued.poison);
    unit.poisonElement = queued.element || "nature";
  }
  if((queued.vulnerable||0) > 0){
    unit.vulnerableMul = Math.max(unit.vulnerableMul||1, 1 + queued.vulnerable);
    unit.vulnerableTimer = Math.max(unit.vulnerableTimer||0, 2.5);
  }
  if(queued.element === "shock") unit.shockTimer = Math.max(unit.shockTimer||0, 0.7);
  else if(queued.element === "fire") unit.burnTimer = Math.max(unit.burnTimer||0, 0.7);
  if(unit.hp <= 0){
    unit.hp = 0;
    unit.dead = true;
    arenaAddEffect(state, {kind: "boom", x: unit.x, y: unit.y, r: 36, life: 0.35, max: 0.35, color: "#ffcf40"});
  }
}

function arenaStrike(state, unit, target, queue, pkMul = 1.0){
  const troop = unit.troop;
  const teamState = arenaTeamState(state, unit.team);
  const style = troop.style || "basic";
  const element = troop.element || "";
  const damage = troopDamage(troop, teamState) * ARENA_DAMAGE_MUL * pkMul;
  const ap = troop.armorPierce || 0;
  const pos = {x: unit.x, y: unit.y};
  const targetPos = {x: target.x, y: target.y};
  const opponents = arenaActiveUnits(state, 1 - unit.team);
  const color = BULLET_TYPE_COLORS[troop.typeKey] || BULLET_ELEMENT_COLORS[element] || "#ffe58a";
  // 辅助兵种（医疗/圣盾）：支援脉冲照发，同时保留普通攻击。
  // 之前"只支援不开火"会让纯辅助兵对轰时拖成僵局（与客户端 game_engine.gd 一致）
  const healAmt = troop.heal || 0;
  const shieldAmt = troop.shield || 0;
  if(healAmt > 0 || shieldAmt > 0){
    const mates = arenaActiveUnits(state, unit.team);
    const supportR = Math.max(1, troop.supportRadius || SUPPORT_HEAL_RADIUS);
    if(healAmt > 0) arenaAddEffect(state, {kind:"ring", x:pos.x, y:pos.y, r:supportR, life:0.3, max:0.3, color:"#5dfc9a"});
    if(shieldAmt > 0) arenaAddEffect(state, {kind:"ring", x:pos.x, y:pos.y, r:supportR, life:0.35, max:0.35, color:"#8fd2ff"});
    for(const mate of mates){
      if(Math.hypot(mate.x - pos.x, mate.y - pos.y) > supportR) continue;
      if((mate.hpMax||0) <= 0) continue;
      if(healAmt > 0 && mate.hp < mate.hpMax){
        mate.hp = Math.min(mate.hpMax, mate.hp + mate.hpMax * healAmt);
        arenaAddEffect(state, {kind:"boom", x:mate.x, y:mate.y, r:14, life:0.25, max:0.25, color:"#5dfc9a"});
      }
      if(shieldAmt > 0){
        const cap = mate.hpMax * SUPPORT_SHIELD_MAX_RATIO;
        mate.shield = Math.min(cap, (mate.shield||0) + mate.hpMax * shieldAmt);
      }
    }
  }
  const fire = (dmg, el, apv, slow, poison, vulnerable, splash, size, col, speedMul)=>{
    arenaFireBullet(state, unit, target, pos, targetPos, dmg, el, apv, slow, poison, vulnerable, splash, size, col, speedMul);
  };
  if(style === "rapid"){
    for(let i = 0; i < (troop.burst||1); i++) fire(damage, element, ap, 0, 0, 0, 0, 2.0, color, 1.0 + i * 0.14);
  } else if(style === "shotgun"){
    for(let i = 0; i < (troop.pellets||3); i++) fire(damage * 0.72, element, ap, 0, 0, 0, 0, 2.2, color, 1.0 + i * 0.1);
  } else if(style === "splash" || style === "missile" || style === "poison"){
    const splashDmg = damage * (style === "poison" ? 0.4 : 1.0);
    fire(splashDmg, element, ap, 0, style === "poison" ? (troop.poison||0) : 0, 0, troopSplash(troop, teamState), 5.0, color, 0.8);
  } else if(style === "beam"){
    fire(damage * 1.55, element, ap, 0, 0, 0, 0, 4.0, color, 1.3);
  } else if(style === "freeze"){
    fire(damage, element, ap, troop.slow || 0.35, 0, 0, 0, 4.0, "#7dd3fc", 1.1);
  } else if(style === "vulnerable"){
    fire(damage, element, ap, 0, 0, troop.vulnerable || 0.28, 0, 3.0, "#ff4d8d", 1.1);
  } else {
    fire(damage, element, ap, 0, 0, 0, 0, 3.0, color, 1.0);
  }
  if(style === "chain"){
    let current = target;
    const hitIds = {};
    let from = pos;
    for(let hop = 0; hop < (troop.chain||1); hop++){
      if(!current || hitIds[current.id]) break;
      arenaAddEffect(state, {kind: "line", x1: from.x, y1: from.y, x2: current.x, y2: current.y, life: 0.18, max: 0.18, color, width: 2.0});
      arenaQueueDamage(queue, current, damage, element, ap);
      hitIds[current.id] = true;
      from = {x: current.x, y: current.y};
      let next = null, bestD = Infinity;
      for(const other of opponents){
        if(hitIds[other.id]) continue;
        const d = Math.hypot(other.x - from.x, other.y - from.y);
        if(d <= (troop.chainR||95) && d < bestD){ bestD = d; next = other; }
      }
      current = next;
    }
  } else if(style === "pulse" || style === "cone"){
    const radius2 = troopRange(troop, teamState) * (style === "pulse" ? 0.92 : 0.82);
    arenaAddEffect(state, style === "pulse"
      ? {kind: "ring", x: pos.x, y: pos.y, r: radius2, life: 0.28, max: 0.28, color: "#60a5fa"}
      : {kind: "boom", x: pos.x, y: pos.y, r: radius2, life: 0.2, max: 0.2, color});
    for(const other of opponents){
      if(Math.hypot(other.x - pos.x, other.y - pos.y) <= radius2) arenaQueueDamage(queue, other, damage, element, ap);
    }
  } else if(style === "rail"){
    const dx = targetPos.x - pos.x, dy = targetPos.y - pos.y;
    const len = Math.hypot(dx, dy) || 1;
    const dir = {x: dx/len, y: dy/len};
    const end = {x: pos.x + dir.x * troopRange(troop, teamState), y: pos.y + dir.y * troopRange(troop, teamState)};
    arenaAddEffect(state, {kind: "line", x1: pos.x, y1: pos.y, x2: end.x, y2: end.y, life: 0.2, max: 0.2, color: "#ff5f56", width: 4.0});
    const candidates = [];
    for(const other of opponents){
      const hit = segmentHit(pos, end, other, 22.0);
      if(hit && hit.hit) candidates.push({unit: other, t: hit.t||0});
    }
    candidates.sort((a, b)=>a.t - b.t);
    for(let i = 0; i < Math.min(troop.pierceCount||1, candidates.length); i++){
      arenaQueueDamage(queue, candidates[i].unit, damage * Math.max(0.55, 1.0 - i * 0.12), element, ap);
    }
  }
}

function arenaFireBullet(state, unit, target, from, targetPos, dmg, element, ap, slow, poison, vulnerable, splash, size, color, speedMul){
  state.arenaBullets.push({
    id: "ab_" + state.nextId(), targetId: target.id,
    x: from.x, y: from.y - 12.0, tx: targetPos.x, ty: targetPos.y,
    speed: ARENA_BULLET_SPEED * speedMul,
    dmg, element, armorPierce: ap, slow, poison, vulnerable, splash,
    size, color, life: 2.2, fromTeam: unit.team,
  });
}

function arenaBulletImpact(state, bullet, impact){
  const splash = bullet.splash||0;
  const payload = {
    targetId: bullet.targetId, dmg: bullet.dmg||0, element: bullet.element||"",
    armorPierce: bullet.armorPierce||0, slow: bullet.slow||0, poison: bullet.poison||0,
    vulnerable: bullet.vulnerable||0,
  };
  if(splash > 0){
    arenaAddEffect(state, {kind: "ring", x: impact.x, y: impact.y, r: splash, life: 0.25, max: 0.25, color: bullet.color||"#fb923c"});
    for(const unit of arenaActiveUnits(state, 1 - (bullet.fromTeam||0))){
      const d = Math.hypot(unit.x - impact.x, unit.y - impact.y);
      if(d <= splash){
        const mul = unit.id === payload.targetId ? 1.0 : Math.max(0.45, 1.0 - d / splash * 0.55);
        payload.targetId = unit.id;
        payload.dmg = (bullet.dmg||0) * mul;
        arenaApplyDamage(state, payload);
      }
    }
    return;
  }
  let targetAlive = false;
  for(const unit of state.arenaUnits){
    if(unit.id === payload.targetId && !unit.dead){ targetAlive = true; break; }
  }
  if(!targetAlive){
    let best = null, bestD = 26.0;
    for(const unit of arenaActiveUnits(state, 1 - (bullet.fromTeam||0))){
      const d = Math.hypot(unit.x - impact.x, unit.y - impact.y);
      if(d <= bestD){ bestD = d; best = unit; }
    }
    if(!best) return;
    payload.targetId = best.id;
  }
  arenaApplyDamage(state, payload);
}

function stepArena(state, dt){
  if(!state.arenaLaunched) return;
  const units = state.arenaUnits||[];
  const queued = [];
  // PK 节奏：交战计时（不含慢镜头窗口）。3 秒后伤害逐秒递增，
  // 让均势局 4~7 秒内分出胜负，羁绊/等级碾压局在 3~4 秒档终结。
  if(!state.arenaFinishing) state.arenaBattleTime = (state.arenaBattleTime||0) + dt;
  const pkMul = arenaPkDamageMul(state.arenaBattleTime||0);
  // 先更新双方单位并收集攻击；再统一结算伤害，避免遍历顺序造成先手优势。
  for(const unit of units){
    if(unit.dead) continue;
    if((unit.slowTimer||0) > 0){
      unit.slowTimer -= dt;
      if(unit.slowTimer <= 0) unit.slowMul = 1.0;
    }
    if((unit.poisonTimer||0) > 0){
      unit.poisonTimer -= dt;
      arenaQueueDamage(queued, unit, (unit.poisonDps||0) * dt, unit.poisonElement||"nature");
    }
    if((unit.vulnerableTimer||0) > 0){
      unit.vulnerableTimer -= dt;
      if(unit.vulnerableTimer <= 0) unit.vulnerableMul = 1.0;
    }
    const target = arenaNearestTarget(units, unit);
    if(!target) continue;
    const teamState = arenaTeamState(state, unit.team);
    unit.cd = (unit.cd||0) - dt;
    if(unit.cd <= 0){
      // 站桩 PK 攻速下限：任何兵每秒至少开火一次，
      // 避免狙击/重炮类低攻速兵把单局拖出 4~7 秒节奏
      unit.cd = 1.0 / Math.max(1.0, troopRate(unit.troop, teamState));
      arenaStrike(state, unit, target, queued, pkMul);
    }
  }
  for(const hit of queued) arenaApplyDamage(state, hit);
  // 子弹飞行：追踪目标当前位置，到达即结算
  const aliveBullets = [];
  for(const bullet of state.arenaBullets||[]){
    bullet.life = (bullet.life||0) - dt;
    let aim = {x: bullet.tx, y: bullet.ty};
    for(const unit of units){
      if(unit.id === bullet.targetId && !unit.dead){ aim = {x: unit.x, y: unit.y - 10.0}; break; }
    }
    const dx = aim.x - bullet.x, dy = aim.y - bullet.y;
    const dist = Math.hypot(dx, dy);
    const stepSize = (bullet.speed||ARENA_BULLET_SPEED) * dt; // bondWindBulletMul 恒为 1
    if(dist <= stepSize || bullet.life <= 0){
      arenaBulletImpact(state, bullet, aim);
    } else {
      bullet.x += dx / dist * stepSize;
      bullet.y += dy / dist * stepSize;
      aliveBullets.push(bullet);
    }
  }
  state.arenaBullets = aliveBullets;
  state.arenaUnits = (state.arenaUnits||[]).filter(unit=>!unit.dead);
  for(const effect of state.arenaEffects||[]) effect.life -= dt;
  state.arenaEffects = (state.arenaEffects||[]).filter(effect=>effect.life > 0);
  const meAlive = arenaActiveUnits(state, 0).length > 0;
  const foeAlive = arenaActiveUnits(state, 1).length > 0;
  if((!meAlive || !foeAlive) && !state.arenaFinishing){
    // 击杀慢放：一方全灭先进入慢镜头窗口（客户端做屏幕震动）
    state.arenaFinishing = true;
    state.arenaFinishTimer = 1.1;
    state.arenaSlowmo = true;
  }
  if(state.arenaFinishing){
    state.arenaFinishTimer -= dt;
    if(state.arenaFinishTimer <= 0){
      state.arenaSlowmo = false;
      if(!meAlive && !foeAlive){ state.over = true; state.result = "draw"; }
      else if(!foeAlive){ state.over = true; state.result = "win"; }
      else if(!meAlive){ state.over = true; state.result = "lose"; }
      // 金币结算：胜 5 / 负 2，平局各 3
      for(const ps of state.paths){
        const pid = ps.ownerId;
        const gain = state.result === "draw" ? 3 : ((state.result === "win") === (ps.pathIndex === 0) ? 5 : 2);
        state.coins[pid] = (state.coins[pid]||0) + gain;
      }
    }
  }
}


// ---------- 指挥官大招（Ultimate）——与客户端 game_engine.gd 一致 ----------
function ultDamageScale(state){
  // 关卡越高敌人血越厚，大招伤害同步成长：每关 +58%（与怪物血量曲线同步）
  return Math.pow(1.58, (state.level||1) - 1);
}

function ultStrikeThunder(ps, state, target, scale, seedI){
  let x, y;
  if(target){
    x = target.x + (state.rng()-0.5)*30;
    y = target.y + (state.rng()-0.5)*30;
  } else {
    x = state.rng()*CANVAS_WIDTH;
    y = 72 + state.rng()*(CANVAS_HEIGHT-260);
  }
  let hitAny = false;
  for(const e of ps.enemies){
    if(e.dead) continue;
    if(Math.hypot(e.x-x, e.y-y) <= ULT_THUNDER_RADIUS){
      damageEnemy(ps, e, ULT_THUNDER_DAMAGE*scale, 1, true, "shock");
      if(!e.dead && !e.isBoss){
        e.slowMul = Math.min(e.slowMul||1, 0.3);
        e.slowTimer = Math.max(e.slowTimer||0, ULT_THUNDER_SLOW);
      }
      hitAny = true;
    }
  }
  addEffect(ps, {kind:"line", x1:x, y1:y-120, x2:x, y2:y, life:0.22, max:0.22, color:"#fde047", width:5});
  addEffect(ps, {kind:"boom", x:x, y:y, r:ULT_THUNDER_RADIUS, life:0.3, max:0.3, color:"#fde047"});
}

function useUltimate(state, playerId, ultKey){
  if(state.arena) throw new Error("AI对战不使用大招");
  if(!ULT_IDS.includes(ultKey)) throw new Error("未知大招");
  if(!(state.ultLoadout||[]).includes(ultKey)) throw new Error("未携带该大招");
  if((state.ultEnergy||0) < ULT_ENERGY_MAX) throw new Error("能量不足");
  const defense = defenseState(state, playerId);
  if(!defense) throw new Error("城防不存在");
  const enemies = defense.enemies || state.enemies || [];
  const scale = ultDamageScale(state);
  if(ultKey === "thunder"){
    const alive = enemies.filter(e => !e.dead);
    let bolts = ULT_THUNDER_BOLTS, struck = 0;
    for(const e of alive){
      if(bolts <= 0 || struck >= 6) break;
      ultStrikeThunder(defense, state, e, scale);
      bolts--; struck++;
    }
    for(let i=0;i<bolts;i++) ultStrikeThunder(defense, state, null, scale, i);
  } else if(ultKey === "blizzard"){
    for(const e of enemies){
      if(e.dead) continue;
      const freeze = e.isBoss ? ULT_BLIZZARD_BOSS_FREEZE : ULT_BLIZZARD_FREEZE;
      e.slowMul = 0;
      e.slowTimer = Math.max(e.slowTimer||0, freeze);
      damageEnemy(defense, e, ULT_BLIZZARD_DAMAGE*scale, 1, true, "ice");
    }
    addEffect(defense, {kind:"ring", x:288, y:480, r:520, life:0.8, max:0.8, color:"#7dd3fc"});
  } else if(ultKey === "carpet"){
    const path = defense.path || PATH;
    const plen = defense.pathLen || pathLength(path);
    let forwardmost = 0;
    for(const e of enemies){ if(!e.dead) forwardmost = Math.max(forwardmost, e.dist||0); }
    for(let i=0;i<ULT_CARPET_BOMBS;i++){
      const bombDist = Math.min(Math.max(forwardmost + 60 + i*90, 60), plen-30);
      const bp = posOnPath(bombDist, path);
      addEffect(defense, {kind:"boom", x:bp.x, y:bp.y, r:ULT_CARPET_SPLASH, life:0.45, max:0.45, color:"#ff8c3c"});
      for(const e of enemies){
        if(e.dead) continue;
        if(Math.hypot(e.x-bp.x, e.y-bp.y) <= ULT_CARPET_SPLASH){
          damageEnemy(defense, e, ULT_CARPET_DAMAGE*scale, 1, true, "fire");
        }
      }
    }
  } else if(ultKey === "goldrush"){
    for(const pid of Object.keys(state.trays||{})){
      state.coins[pid] = (state.coins[pid]||0) + ULT_GOLDRUSH_COINS;
    }
    state.ultGoldTimer = ULT_GOLDRUSH_DURATION;
    addEffect(defense, {kind:"ring", x:288, y:480, r:420, life:0.6, max:0.6, color:"#fbbf24"});
  }
  state.ultEnergy = 0;
  return {ok:true, ultimate: ultKey};
}

// ---------- 无尽宝箱选项结算（与客户端 _apply_endless_chest 一致） ----------
function applyEndlessChest(state, opt){
  if(opt.levelUp){
    for(const pid of Object.keys(state.trays||{})){
      for(const t of state.trays[pid]){
        t.level = Math.min(MAX_LEVEL, (t.level||1) + opt.levelUp);
      }
    }
  }
  if(opt.points){
    for(const pid of Object.keys(state.upgradePoints||{})) state.upgradePoints[pid] += opt.points;
  }
  if(opt.coins){
    for(const pid of Object.keys(state.trays||{})) state.coins[pid] = (state.coins[pid]||0) + opt.coins;
  }
  if(opt.troops){
    for(const pid of Object.keys(state.trays||{})){
      for(let i=0;i<opt.troops;i++) state.trays[pid].push(makeTroop(opt.troopLevel||4, pid, state.nextId, state.rng));
    }
  }
  if(opt.hpMul) state.endlessHpMul = (state.endlessHpMul||1) * opt.hpMul;
  if(opt.speedMul) state.endlessSpeedMul = (state.endlessSpeedMul||1) * opt.speedMul;
  if(opt.waveMul) state.endlessWaveMul = (state.endlessWaveMul||1) * opt.waveMul;
  if(opt.energy) state.ultEnergy = Math.min(ULT_ENERGY_MAX, (state.ultEnergy||0) + opt.energy);
  if(opt.allAffix){
    for(const ps of (state.paths||[state])){
      for(const e of (ps.enemies||[])){
        if(e.dead) continue;
        e.def += 12; e.speed *= 1.12;
      }
    }
  }
}

// ---------- 兵种觉醒（三合一进化）——与客户端 make_awakened 一致 ----------
function makeAwakened(level, ownerId, state, typeKey){
  const t = makeTroop(level, ownerId, state.nextId, state.rng, typeKey);
  t.awakened = true;
  t.dmg = (t.dmg||1) * AWAKEN_DMG_MUL;
  t.hpMax = (t.hpMax||1) * AWAKEN_HP_MUL;
  t.hp = t.hpMax;
  t.rate = (t.rate||1) * AWAKEN_RATE_MUL;
  t.range = (t.range||100) * AWAKEN_RANGE_MUL;
  t.name = "觉醒·" + (t.name||"");
  return t;
}

function command(state, playerId, message){
  if(!message || typeof message.type!=="string") throw new Error("无效命令");

  if(message.type==="ready"){
    const p=player(state,playerId); if(!p) throw new Error("玩家不存在");
    p.ready=!!message.value; state.revision++; return {ok:true};
  }
  if(message.type==="start"){
    if(state.hostId!==playerId) throw new Error("只有房主可以开始");
    if(state.players.length<1) throw new Error("房间里没有玩家");
    if(!allReady(state)) throw new Error("需要所有在线玩家都准备");
    if(state.started) throw new Error("已经开始");
    state.started=true;
    state.phase="prep";
    state.prepTimer=PREP_SECONDS;
    state.revision++;
    return {ok:true,start:true};
  }
  if(message.type==="togglePause"){
    if(state.hostId!==playerId) throw new Error("只有房主可以暂停");
    if(!state.started || state.over) throw new Error("当前不能暂停");
    state.paused=!state.paused;
    state.pausedBy=state.paused?playerId:null;
    state.revision++;
    return {ok:true,paused:state.paused};
  }
  if(message.type==="chooseMapEvent"){
    if(state.mode==="versus") throw new Error("对战不使用地图事件");
    if(state.hostId!==playerId) throw new Error("只有房主可以选择事件");
    if(!state.started || state.over || state.phase!=="prep") throw new Error("当前不能选择事件");
    if(state.mapEventResolved) throw new Error("本关事件已选择");
    const eventId=String(message.eventId||"");
    if(!MAP_EVENT_IDS.includes(eventId)) throw new Error("事件无效");
    applyMapEvent(state,eventId);
    state.revision++;
    return {ok:true,mapEvent:state.mapEvent};
  }
  if(message.type==="useCoopSkill"){
    if(state.mode==="versus") throw new Error("对战不使用合作技能");
    if(!state.started || state.over) throw new Error("游戏未开始");
    const skillKey=String(message.skillKey||"");
    useCoopSkill(state,playerId,skillKey);
    state.revision++;
    return {ok:true,skillKey};
  }
  if(message.type==="useUltimate"){
    if(!state.started || state.over) throw new Error("游戏未开始");
    if(state.phase!=="battle") throw new Error("只有战斗阶段能放大招");
    const res = useUltimate(state, playerId, String(message.ultKey||""));
    state.revision++;
    return res;
  }
  if(message.type==="toggleUltLoadout"){
    if(!state.started || state.over) throw new Error("游戏未开始");
    if(state.phase!=="prep") throw new Error("只有备战阶段能更换大招");
    if(state.arena) throw new Error("AI对战不使用大招");
    const ultKey = String(message.ultKey||"");
    if(!ULT_IDS.includes(ultKey)) throw new Error("未知大招");
    const loadout = state.ultLoadout || [];
    const idx = loadout.indexOf(ultKey);
    if(idx >= 0){ loadout.splice(idx, 1); }
    else {
      if(loadout.length >= ULT_MAX_LOADOUT) throw new Error("最多携带 " + ULT_MAX_LOADOUT + " 个大招");
      loadout.push(ultKey);
    }
    state.ultLoadout = loadout;
    state.revision++;
    return {ok:true, ultLoadout: loadout.slice()};
  }
  if(message.type==="awaken"){
    if(!state.started || state.over) throw new Error("游戏未开始");
    if(state.arena) throw new Error("AI对战不使用觉醒");
    if(state.phase!=="prep" && state.phase!=="battle") throw new Error("当前不能觉醒");
    const found = findOwnedTroop(state, playerId, message.troopId);
    if(!found) throw new Error("这不是你的兵");
    const troop = found.troop;
    if(troop.awakened) throw new Error("已是觉醒形态");
    if(found.source!=="slot") throw new Error("先把兵上阵再觉醒");
    const awPs = defenseState(state, playerId);
    const awType = troop.typeKey, awLevel = troop.level||1;
    const donors = [];
    for(let i=0;i<awPs.slots.length;i++){
      const t = awPs.slots[i];
      if(!t || i===found.slotIndex) continue;
      if(t.typeKey===awType && (t.level||1)===awLevel && !t.awakened) donors.push(i);
    }
    if(donors.length < 2) throw new Error("需要场上另有 2 个同种同级兵（Lv" + awLevel + " " + (troop.name||"") + "，当前 " + donors.length + " 个）");
    for(const d of donors.slice(0,2)) awPs.slots[d] = null;
    const awakened = makeAwakened(awLevel, playerId, state, awType);
    awakened.element = troop.element || awakened.element || "shock";
    awPs.slots[found.slotIndex] = awakened;
    const awMeta = awPs._slotMeta || SLOT_META;
    if(awMeta[found.slotIndex]){
      const ap = awMeta[found.slotIndex];
      addEffect(awPs, {kind:"ring", x:ap.x, y:ap.y, r:110, life:1.2, max:1.2, color:"#fde047"});
      addEffect(awPs, {kind:"boom", x:ap.x, y:ap.y, r:80, life:0.8, max:0.8, color:"#ff5f3c"});
    }
    refreshBonds(state);
    state.revision++;
    return {ok:true, awakened: awakened.name, level: awLevel};
  }
  if(message.type==="chooseEndlessChest"){
    if(!state.endless) throw new Error("只有无尽模式有宝箱事件");
    if(!state.started || state.over) throw new Error("游戏未开始");
    if(!state.endlessChestPending) throw new Error("当前没有宝箱事件");
    const pick = String(message.option||"a")==="a" ? "a" : "b";
    const chestIdx = state.endlessChestIdx|0;
    if(chestIdx < 0 || chestIdx >= ENDLESS_CHESTS.length) throw new Error("宝箱事件无效");
    const chest = ENDLESS_CHESTS[chestIdx];
    const opt = chest[pick] || {};
    applyEndlessChest(state, opt);
    state.endlessChestPending = false;
    state.endlessChestIdx = -1;
    state.revision++;
    return {ok:true, chest: chest.name, picked: opt.text||""};
  }
    if(message.type==="setBossEnabled"){
    if(state.mode==="versus") throw new Error("对战不使用 Boss");
    if(state.hostId!==playerId || !state.started || state.over || state.phase!=="prep") throw new Error("当前不能设置本关 Boss");
    if(typeof message.value!=="boolean") throw new Error("Boss 设置无效");
    state.bossEnabled=message.value; state.revision++; return {ok:true,bossEnabled:state.bossEnabled};
  }
  if(message.type==="startWave"){
    // 双人对战：任何一方都可开战（自己的兵摆好了就能约战）
    if(state.mode!=="versus" && state.hostId!==playerId) throw new Error("只有房主可以开始进攻");
    if(!state.started || state.over) throw new Error("游戏未开始");
    if(state.phase!=="prep") throw new Error("当前不是备战阶段");
    state.phase="battle";
    state.prepTimer=0;
    state.bossPending=!!state.bossEnabled; state.bossSpawned=false;
    if(state.mode!=="versus") state.bossExchangeUnlocked=false; // 换兵门禁：开战上锁，打死本关 Boss 再解锁
    if(state.mode==="versus"){
      arenaLaunch(state);
    } else if(state.mode==="independent"){
      for(const ps of state.paths){ resetBattlefield(ps, true); }
    } else {
      resetBattlefield(state, true);
    }
    state.revision++;
    return {ok:true,startWave:true};
  }

  if(message.type==="upgradeWeapon"){
    if(!state.started || state.over) throw new Error("游戏未开始");
    const level=weaponUpgradeLevel(state,playerId);
    const cost=scalingUpgradeCost(level,WEAPON_UPGRADE_COSTS);
    if(!spendUpgradePoints(state,playerId,cost)) throw new Error(`升级点不足，需要 ${cost} 点`);
    state.weaponUpgradeLevel[playerId]=level+1;
    state.revision++;
    return {ok:true,weaponUpgradeLevel:state.weaponUpgradeLevel[playerId]};
  }
  if(message.type==="upgradeRate"){
    if(!state.started || state.over) throw new Error("游戏未开始");
    const level=rateUpgradeLevel(state,playerId);
    const cost=scalingUpgradeCost(level,RATE_UPGRADE_COSTS);
    if(!spendUpgradePoints(state,playerId,cost)) throw new Error(`升级点不足，需要 ${cost} 点`);
    state.rateUpgradeLevel[playerId]=level+1;
    state.revision++;
    return {ok:true,rateUpgradeLevel:state.rateUpgradeLevel[playerId]};
  }
  if(message.type==="upgradeArmor"){
    if(!state.started || state.over) throw new Error("游戏未开始");
    const level=armorUpgradeLevel(state,playerId);
    const cost=scalingUpgradeCost(level,ARMOR_UPGRADE_COSTS);
    if(!spendUpgradePoints(state,playerId,cost)) throw new Error(`升级点不足，需要 ${cost} 点`);
    state.armorUpgradeLevel[playerId]=level+1;
    state.revision++;
    return {ok:true,armorUpgradeLevel:state.armorUpgradeLevel[playerId]};
  }
  if(message.type==="upgradeDefense"){
    if(state.mode==="versus") throw new Error("对战不使用城防升级");
    if(!state.started || state.over) throw new Error("游戏未开始");
    const defense=defenseState(state,playerId);
    if(!defense) throw new Error("城防不存在");
    const level=defense.defenseUpgradeLevel||0;
    if(level>=DEFENSE_UPGRADE_MAX) throw new Error("城防已满级");
    const defenseCost=DEFENSE_UPGRADE_COSTS[level];
    if(!spendUpgradePoints(state,playerId,defenseCost)) throw new Error(`升级点不足，需要 ${defenseCost} 点`);
    defense.defenseUpgradeLevel=level+1;
    defense.crystalsMax=(defense.crystalsMax||START_CRYSTALS)+DEFENSE_HP_PER_LEVEL;
    defense.crystals=Math.min(defense.crystalsMax,(defense.crystals||0)+DEFENSE_HP_PER_LEVEL);
    state.revision++;
    return {ok:true,defenseLevel:defense.defenseUpgradeLevel,crystalsMax:defense.crystalsMax};
  }

  if(message.type==="buyTroopWithCoins"){
    // 金币换兵：5 金币随机换 1 个兵进待命区；要打死本关 Boss 才解锁（Boss 死亡另掉 2 个兵）
    if(!state.started || state.over) throw new Error("游戏未开始");
    if(state.mode!=="versus" && !state.bossExchangeUnlocked) throw new Error("先击败本关 Boss 才能换兵");
    const myCoins=(state.coins||{})[playerId]||0;
    if(myCoins<COIN_TROOP_COST) throw new Error("金币不足，换兵需要 "+COIN_TROOP_COST+"（当前 "+myCoins+"）");
    state.coins[playerId]=myCoins-COIN_TROOP_COST;
    const bought=makeTroop(1+((state.rng()*3)|0), playerId, state.nextId, state.rng);
    state.trays[playerId].push(bought);
    state.revision++;
    return {ok:true, name:bought.name, level:bought.level, coins:state.coins[playerId]};
  }

  if(message.type==="deploy" || message.type==="move" || message.type==="merge"){
    if(!state.started || state.over) throw new Error("游戏未开始");
    if(state.mode==="versus" && state.phase!=="prep") throw new Error("对战已开始，不能再布阵或合成");
    if(state.phase!=="prep" && state.phase!=="battle") throw new Error("当前不能部署");
    const found=findOwnedTroop(state,playerId,message.troopId);
    if(!found) throw new Error("这不是你的兵");
    const troop=found.troop;
    const target=message.targetSlot;

    const isPathMode = state.mode==="independent" || state.mode==="versus";
    const ps = isPathMode ? getPlayerPathState(state, playerId) : state;
    if(isPathMode && !ps) throw new Error("路径不存在");
    if(!Number.isInteger(target)||target<0||target>=(ps.slots||[]).length) throw new Error("槽位无效");
    if(found.source==="slot" && found.slotIndex===target) return {ok:true};
    if(state.mode==="versus" && found.source==="tray" && message.type==="deploy"){
      // 12 挑 10：累计上阵硬上限
      if((state.arenaDeployed[playerId]||0) >= ARENA_SLOT_COUNT) throw new Error("最多上阵 10 个兵");
    }
    const existing=ps.slots[target];
    if(!existing){
      if(found.source!=="tray") throw new Error("战场上的兵不能移动，只能合成");
      ps.slots[target]=troop;
      removeFromTray(state,playerId,troop.id);
    } else if(existing.ownerId===playerId && existing.level===troop.level && troop.level<MAX_LEVEL){
      const mcost=mergeCost(troop.level);
      if(upgradePoints(state,playerId)<mcost) throw new Error(`升级点不足，合成到 Lv${troop.level+1} 需要 ${mcost} 点`);
      state.upgradePoints[playerId]=upgradePoints(state,playerId)-mcost;
      if(found.source==="slot") ps.slots[found.slotIndex]=null;
      const mergedT=makeTroop(troop.level+1, playerId, state.nextId, state.rng);
      ps.slots[target]=mergedT;
      if(found.source==="tray") removeFromTray(state,playerId,troop.id);
      const slotMeta = state.mode==="versus" ? arenaSlotMeta(ps.pathIndex||0)
        : (state.mode==="independent" ? getIndependentSlots(ps.pathIndex||0) : SLOT_META);
      if(target<slotMeta.length){
        triggerMergeBurst(state, ps, slotMeta[target], mergedT);
      }
    } else {
      throw new Error("目标槽位不能放置");
    }
    if(state.mode==="versus"){
      if(found.source==="tray" && message.type==="deploy"){
        state.arenaDeployed[playerId]=(state.arenaDeployed[playerId]||0)+1;
        const arenaMeta = arenaSlotMeta(ps.pathIndex||0);
        if(target<arenaMeta.length){
          addEffect(ps, {kind:"ring", x:arenaMeta[target].x, y:arenaMeta[target].y, r:40, life:0.5, max:0.5,
            color: ps.pathIndex===0 ? "#4fd1ff" : "#fb923c"});
        }
      }
      // 合并腾出的坑不回退计数：硬上限 10 不允许再补
    }
    refreshBonds(state);
    state.revision++;
    return {ok:true};
  }
  throw new Error("未知命令");
}

// ============ 合兵爆发机制 (Merge Burst) ============
function triggerMergeBurst(state, ps, slotPos, troop){
  if(!ps) return;
  ps._nextId = ps._nextId || state.nextId;
  ps._rng = ps._rng || state.rng;
  const el = troop.element || "fire";
  const baseDmg = (troop.dmg || 10) * MERGE_BURST_DAMAGE_MUL;
  const radius = MERGE_BURST_RADIUS[el] || 130;
  const burstColors = {fire:"#fb923c", ice:"#7dd3fc", shock:"#fde047", nature:"#84cc16"};

  addEffect(ps, {
    kind: "boom",
    x: slotPos.x,
    y: slotPos.y,
    r: radius,
    life: 1.0,
    max: 1.0,
    color: burstColors[el] || "#fb923c"
  });
  // 合成成功金色光环：与元素爆发叠加，一眼可辨
  addEffect(ps, {
    kind: "ring",
    x: slotPos.x,
    y: slotPos.y,
    r: radius * 0.85,
    life: 1.0,
    max: 1.0,
    color: "#fde047"
  });

  const enemies = ps.enemies || [];
  if(el === "fire"){
    for(const e of enemies){
      if(e.dead) continue;
      if(Math.hypot(e.x - slotPos.x, e.y - slotPos.y) <= radius){
        damageEnemy(ps, e, baseDmg, 1.0, true, "fire");
      }
    }
  } else if(el === "ice"){
    for(const e of enemies){
      if(e.dead) continue;
      if(Math.hypot(e.x - slotPos.x, e.y - slotPos.y) <= radius){
        e.slowMul = 0.0;
        e.slowTimer = Math.max(e.slowTimer || 0, 2.0);
        damageEnemy(ps, e, baseDmg * 0.4, 1.0, true, "ice");
      }
    }
  } else if(el === "shock"){
    const sorted = [...enemies].filter(e => !e.dead).sort((a, b) => b.dist - a.dist);
    const count = Math.min(4, sorted.length);
    for(let i = 0; i < count; i++){
      const e = sorted[i];
      addEffect(ps, {
        kind: "laser",
        x1: slotPos.x,
        y1: slotPos.y,
        x2: e.x,
        y2: e.y,
        life: 0.25,
        max: 0.25,
        color: "#fde047",
        width: 3.0
      });
      damageEnemy(ps, e, baseDmg * 1.25, 1.0, true, "shock");
      e.shockTimer = Math.max(e.shockTimer || 0, 2.5);
    }
  } else if(el === "nature"){
    if(!ps.clouds) ps.clouds = [];
    const nextIdFn = typeof ps._nextId === "function" ? ps._nextId : (typeof state.nextId === "function" ? state.nextId : () => String(Date.now()));
    ps.clouds.push({
      id: nextIdFn(),
      x: slotPos.x,
      y: slotPos.y,
      r: radius,
      life: 4.0,
      dps: baseDmg * 0.55,
      element: "nature"
    });
  }
}

// ============ 战斗逻辑（路径级） ============
function damageEnemy(ps, e, dmg, mul=1, applyFloor=true, atkElement=null, armorPierce=0, srcOwner=null){
  if(!e || e.dead) return;
  const effectiveDef = Math.max(0, (e.def || 0) * (1 - (armorPierce || 0)));
  const factor = 1 / (1 + effectiveDef * 0.085);
  const vulnerableMul=e.vulnerableTimer>0?(e.vulnerableMul||1):1;
  const elemMul=elementMul(atkElement||null, e.element||null);
  const skills=((ps._owner)||{}).coopSkills||{};
  const focusMul=(skills.focus&&skills.focus.active>0&&skills.focus.targetId===e.id)?(COOP_SKILLS.focus.mul||1.25):1;
  const stormMul=bondStormMul(ps._owner||ps, e);

  let reactionMul = 1.0;
  if(atkElement === "fire"){
    if((e.shockTimer || 0) > 0){
      reactionMul *= REACTION_OVERLOAD_DAMAGE;
      addEffect(ps, {kind: "boom", x: e.x, y: e.y, r: 35, life: 0.2, max: 0.2, color: "#fb923c"});
    }
    if((e.slowTimer || 0) > 0){
      reactionMul *= REACTION_MELT_DAMAGE;
      // 削甲护底：Boss 带 defFloor，融毁最多削到保底线（与客户端 game_engine.gd 一致）
      e.def = Math.max(e.defFloor || 0, (e.def || 0) - REACTION_MELT_DEF_SHRED);
    }
    if((e.poisonTimer || 0) > 0){
      reactionMul *= REACTION_PYROTOXIN_MUL;
      e.burnTimer = Math.max(e.burnTimer || 0, 2.0);
    }
  } else if(atkElement === "shock"){
    if((e.slowTimer || 0) > 0){
      reactionMul *= REACTION_SUPERCONDUCT_MUL;
      e.shockTimer = Math.max(e.shockTimer || 0, 1.5);
    }
    if((e.poisonTimer || 0) > 0){
      reactionMul *= REACTION_QUICKEN_MUL;
    }
  } else if(atkElement === "ice"){
    if((e.poisonTimer || 0) > 0 && Number(e.crystalizeCd||0) <= 0){
      e.slowMul = 0;
      e.slowTimer = Math.max(e.slowTimer || 0, REACTION_CRYSTALLIZE_FREEZE);
      e.crystalizeCd = 5.0;
    }
  }

  let real = Math.max(0, Number(dmg||0) * mul * DAMAGE_DEALT_MUL * factor * vulnerableMul * elemMul * focusMul * stormMul * reactionMul);
  if(applyFloor) real=Math.max(0.35,real);
  // 水羁绊：30% 概率削弱目标攻速 + 每秒 5% 攻击力持续伤害（协奏 50%）；DOT tick 不触发
  if(!ps._dotTick && Number(stateBonds(ps._owner||ps).water||0)>0){
    const waterChance=Number(stateBonds(ps._owner||ps).hydro||0)>0?BOND_HYDRO_SLOW_CHANCE:BOND_WATER_SLOW_CHANCE;
    if(Math.random()<waterChance){
      e.slowMul=Math.min(Number(e.slowMul||1),1-BOND_WATER_SLOW_RATE);
      e.slowTimer=Math.max(Number(e.slowTimer||0),BOND_WATER_SLOW_DURATION);
      e.waterWeakTimer=BOND_WATER_SLOW_DURATION;
      e.waterWeakDps=Math.max(Number(e.waterWeakDps||0),Number(dmg||0)*BOND_WATER_DOT);
    }
  }
  // 火羁绊：25% 概率灼烧（每秒 2% 攻击力伤害，3 秒；协奏翻倍）；DOT tick 不触发
  if(!ps._dotTick && Number(stateBonds(ps._owner||ps).fire||0)>0 && Math.random()<BOND_FIRE_BURN_CHANCE){
    const burnDps=Number(dmg||0)*BOND_FIRE_BURN_DPS*(Number(stateBonds(ps._owner||ps).hydro||0)>0?BOND_HYDRO_BURN_MUL:1);
    e.burnTimer=Math.max(Number(e.burnTimer||0),BOND_FIRE_BURN_DURATION);
    e.burnDps=Math.max(Number(e.burnDps||0),burnDps);
  }
  if(srcOwner){ const dmgOwner=ps._owner||ps; dmgOwner.dmgBy=dmgOwner.dmgBy||{}; dmgOwner.dmgBy[srcOwner]=(dmgOwner.dmgBy[srcOwner]||0)+real; }
  // Boss 能量护盾：先扣盾再落血（盾破前本体不掉血，与客户端 game_engine.gd 一致）
  const enemyShield = e.shield || 0;
  if(enemyShield > 0){
    const absorbed = Math.min(enemyShield, real);
    e.shield = enemyShield - absorbed;
    real -= absorbed;
    addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:(e.bodyR||20)*1.4, life:0.2, max:0.2, color:"#8fd2ff"});
    if(real <= 0) return;
  }
  e.hp -= real;
  if(atkElement==="shock") e.shockTimer=Math.max(e.shockTimer||0,0.45);
  else if(atkElement==="fire") e.burnTimer=Math.max(e.burnTimer||0,0.55);
  if(e.hp<=0){
    e.dead=true; ps.killed++;
    // 指挥官大招能量：每杀 +6，Boss/督军/虫后额外加成（与客户端 game_engine.gd 一致）
    {
      const ultState = ps._owner || ps;
      if(!ultState.arena){
        let gain = ULT_KILL_ENERGY;
        if(e.isBoss) gain += ULT_BOSS_ENERGY;
        else if(e.isOverlord) gain += OVERLORD_ENERGY_REWARD;
        else if(e.isQueen) gain += QUEEN_ENERGY_REWARD;
        ultState.ultEnergy = Math.min(ULT_ENERGY_MAX, (ultState.ultEnergy||0) + gain);
      }
    }
    // 虫巢督军击杀奖励：金冠碎裂特效 + 每位玩家金币
    if(e.isOverlord){
      const lordState = ps._owner || ps;
      for(const pid of Object.keys(lordState.trays||{})){
        lordState.coins[pid] = (lordState.coins[pid]||0) + OVERLORD_COIN_REWARD;
      }
      addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:72, life:0.8, max:0.8, color:"#fde047"});
      addEffect(ps, {kind:"boom", x:e.x, y:e.y, r:48, life:0.5, max:0.5, color:"#fbbf24"});
    }
    // 虫后击杀奖励：玫红碎裂 + 每位玩家金币
    if(e.isQueen){
      const queenState = ps._owner || ps;
      for(const pid of Object.keys(queenState.trays||{})){
        queenState.coins[pid] = (queenState.coins[pid]||0) + QUEEN_COIN_REWARD;
      }
      addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:80, life:0.8, max:0.8, color:"#f472b6"});
      addEffect(ps, {kind:"boom", x:e.x, y:e.y, r:52, life:0.5, max:0.5, color:"#fb7185"});
    }
    if(e.isBoss){
      ps.bossKilled=true;
      // Boss 掉落：当场给每位玩家掉 2 个兵进待命区（金币换兵已取消）
      const dropState = ps._owner || ps;
      for(const pid of Object.keys(dropState.trays||{})){
        for(let i=0;i<2;i++) dropState.trays[pid].push(makeTroop(1+((dropState.rng()*3)|0), pid, dropState.nextId, dropState.rng));
      }
      dropState.bossDropped=(dropState.bossDropped||0)+1;
      dropState.bossExchangeUnlocked=true;
      addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:95, life:1.0, max:1.0, color:"#fde047"});
      addEffect(ps, {kind:"ring", x:e.x, y:e.y, r:60, life:0.7, max:0.7, color:"#fff7d6"});
    }
  }
}

function pushBullet(ps, slot, tgt, opts){
  const tx = opts.tx!=null ? opts.tx : (tgt?tgt.x:slot.x);
  const ty = opts.ty!=null ? opts.ty : (tgt?tgt.y:slot.y);
  const nextIdFn = typeof ps._nextId === "function" ? ps._nextId : (typeof ps.nextId === "function" ? ps.nextId : () => String(Date.now()));
  ps.bullets.push({
    id: nextIdFn(),
    sx:slot.x, sy:slot.y, x:slot.x, y:slot.y,
    tx, ty,
    targetId: tgt ? tgt.id : null,
    ownerId: opts.ownerId||null,
    dmg:opts.dmg||1, splash:opts.splash||0, slow:opts.slow||0,
    poison:opts.poison||0, mode:opts.mode||"single",
    style:opts.style||"basic", color:opts.color||"#ffe58a",
    size:opts.size||3, homing:!!opts.homing, pierce:!!opts.pierce,
    element:opts.element||null,
    armorPierce:opts.armorPierce||0,
    life:opts.life||0.2, maxLife:opts.life||0.2, hit:false,
  });
}

function addEffect(ps, ef){
  const nextIdFn = (ps && typeof ps._nextId === "function")
    ? ps._nextId
    : (ps && typeof ps.nextId === "function")
      ? ps.nextId
      : () => String(Date.now() + Math.random());
  if(!ps.effects) ps.effects = [];
  ps.effects.push({id: nextIdFn(), life: 0.2, max: 0.2, ...ef});
}

function findTarget(ps, slot, tr){
  let bestBoss=null,bestBossProg=-1;
  for(const e of ps.enemies){
    if(e.dead || !e.isBoss) continue;
    if(e.dist>bestBossProg){ bestBossProg=e.dist; bestBoss=e; }
  }
  if(bestBoss) return bestBoss;
  let best=null, bestProg=-1;
  for(const e of ps.enemies){
    if(e.dead) continue;
    const d=Math.hypot(e.x-slot.x, e.y-slot.y);
    if(d<=troopRange(tr,ps._owner||ps)){
      if(e.dist>bestProg){ bestProg=e.dist; best=e; }
    }
  }
  return best;
}

// 辅助兵种（医疗机/圣盾塔）：不对敌开火，周期对范围内友军治疗/上盾（与客户端 game_engine.gd 一致）
function supportPulse(ps, slotMetaPos, tr){
  const healAmt = tr.heal || 0;
  const shieldAmt = tr.shield || 0;
  if(healAmt <= 0 && shieldAmt <= 0) return;
  const src = {x: slotMetaPos.x, y: slotMetaPos.y};
  const radius = Math.max(1, tr.supportRadius || SUPPORT_HEAL_RADIUS);
  const metaArr = ps._slotMeta || SLOT_META;
  if(healAmt > 0) addEffect(ps, {kind:"ring", x:src.x, y:src.y, r:radius, life:0.3, max:0.3, color:"#5dfc9a"});
  if(shieldAmt > 0) addEffect(ps, {kind:"ring", x:src.x, y:src.y, r:radius, life:0.35, max:0.35, color:"#8fd2ff"});
  for(let i = 0; i < ps.slots.length; i++){
    const ally = ps.slots[i];
    if(!ally || i >= metaArr.length) continue;
    if(ally.id === tr.id) continue;
    const d = Math.hypot(metaArr[i].x - src.x, metaArr[i].y - src.y);
    if(d > radius) continue;
    const allyHpMax = (ally.hpMax || 0) * bondHpMul(ps._owner || ps);
    if(allyHpMax <= 0) continue;
    if(healAmt > 0){
      const allyHp = ally.hp != null ? ally.hp : allyHpMax;
      if(allyHp < allyHpMax){
        ally.hp = Math.min(allyHpMax, allyHp + allyHpMax * healAmt);
        addEffect(ps, {kind:"boom", x:metaArr[i].x, y:metaArr[i].y, r:14, life:0.25, max:0.25, color:"#5dfc9a"});
      }
    }
    if(shieldAmt > 0){
      const cap = allyHpMax * SUPPORT_SHIELD_MAX_RATIO;
      ally.shield = Math.min(cap, (ally.shield || 0) + allyHpMax * shieldAmt);
    }
  }
}

// 护盾吸收：还击/对战伤害先扣盾再落血，返回穿透后的剩余伤害
function absorbShield(troop, dmg){
  const shield = troop.shield || 0;
  if(shield <= 0 || dmg <= 0) return dmg;
  const absorbed = Math.min(shield, dmg);
  troop.shield = shield - absorbed;
  return dmg - absorbed;
}

function fireByStyle(ps, slot, tr, tgt){
  const srcOwner=tr.ownerId||null;
  const st = tr.style;
  const damage=troopDamage(tr,ps._owner);
  const atkEl=tr.element||null;
  // 五颜六色的炮弹：按兵种/元素配色
  const bulletCol=BULLET_TYPE_COLORS[tr.typeKey] || BULLET_ELEMENT_COLORS[atkEl] || "#ffe58a";
  // 金羁绊：全军穿甲加成（与兵种自带穿甲取较大值）
  const ap=Math.max(tr.armorPierce||0, bondMetalPierce(ps._owner||ps));
  const stateForPath=ps._owner||ps;
  const tRange=troopRange(tr,stateForPath);
  const targetDistance=Math.hypot(tgt.x-slot.x,tgt.y-slot.y);
  if(tgt.isBoss && targetDistance>tRange && ["cone","pulse","shotgun","mine"].includes(st)){
    damageEnemy(ps,tgt,damage,1,true,atkEl,ap,srcOwner);
    addEffect(ps,{kind:"line",x1:slot.x,y1:slot.y,x2:tgt.x,y2:tgt.y,life:0.18,max:0.18,color:"#fde047",width:2});
    return;
  }
  if(st==="rapid"){
    const n=tr.burst||3;
    for(let i=0;i<n;i++){
      const jx=(ps._rng()-0.5)*12, jy=(ps._rng()-0.5)*12;
      pushBullet(ps, slot, tgt, {element:atkEl, armorPierce:ap,
        dmg:damage, life:0.12+i*0.03, color:bulletCol, size:2,
        tx:tgt.x+jx, ty:tgt.y+jy, style:"rapid"
      });
    }
  } else if(st==="heavy"){
    pushBullet(ps, slot, tgt, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage, life:0.2, color:"#fb923c", size:5, style:"heavy"});
  } else if(st==="splash"){
    pushBullet(ps, slot, tgt, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage, splash:troopSplash(tr,stateForPath), life:0.28, color:"#f97316", size:4, style:"splash", mode:"aoe"});
  } else if(st==="sniper"){
    addEffect(ps, {kind:"laser", x1:slot.x, y1:slot.y, x2:tgt.x, y2:tgt.y, color:"#f43f5e", life:0.15, max:0.15, width:2});
    pushBullet(ps, slot, tgt, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage, life:0.05, color:bulletCol, size:3, style:"sniper"});
  } else if(st==="cone"){
    const ang=Math.atan2(tgt.y-slot.y, tgt.x-slot.x);
    const half=(tr.cone||55)*Math.PI/180;
    addEffect(ps, {kind:"cone", x:slot.x, y:slot.y, ang, half, r:tRange*0.95, life:0.18, max:0.18, color:"#fb923c"});
    for(const e of ps.enemies){
      if(e.dead) continue;
      const d=Math.hypot(e.x-slot.x, e.y-slot.y);
      if(d>tRange) continue;
      const a=Math.atan2(e.y-slot.y, e.x-slot.x);
      let da=a-ang; while(da>Math.PI) da-=Math.PI*2; while(da<-Math.PI) da+=Math.PI*2;
      if(Math.abs(da)<=half) damageEnemy(ps, e, damage, 1, true, atkEl, ap, srcOwner);
    }
  } else if(st==="chain"){
    const hits=[]; let cur=tgt;
    const maxHops=tr.chain||3, hopR=tr.chainR||95;
    for(let h=0;h<maxHops && cur;h++){
      hits.push(cur); damageEnemy(ps, cur, damage, 1, true, atkEl, ap, srcOwner);
      let next=null, best=1e9;
      for(const e of ps.enemies){
        if(e.dead || hits.includes(e)) continue;
        const d=Math.hypot(e.x-cur.x, e.y-cur.y);
        if(d<=hopR && d<best){ best=d; next=e; }
      }
      if(next) addEffect(ps, {kind:"laser", x1:cur.x, y1:cur.y, x2:next.x, y2:next.y, color:"#a78bfa", life:0.18, max:0.18, width:2});
      cur=next;
    }
    if(hits[0]) addEffect(ps, {kind:"laser", x1:slot.x, y1:slot.y, x2:hits[0].x, y2:hits[0].y, color:"#c4b5fd", life:0.15, max:0.15, width:2});
  } else if(st==="beam"){
    ps.beams.push({id:ps._nextId(), x:slot.x, y:slot.y, tx:tgt.x, ty:tgt.y, targetId:tgt.id, dps:damage*2.2, life:0.35, color:"#4fd1ff", element:atkEl});
  } else if(st==="freeze"){
    pushBullet(ps, slot, tgt, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage, slow:tr.slow||0.4, life:0.2, color:bulletCol, size:4, style:"freeze"});
  } else if(st==="poison"){
    pushBullet(ps, slot, tgt, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage*0.4, splash:troopSplash(tr,stateForPath), poison:tr.poison||3, life:0.3, color:bulletCol, size:4, style:"poison", mode:"aoe"});
  } else if(st==="missile"){
    pushBullet(ps, slot, tgt, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage, splash:troopSplash(tr,stateForPath), life:0.45, color:bulletCol, size:4, style:"missile", mode:"aoe", homing:true});
  } else if(st==="shotgun"){
    const n=tr.pellets||5;
    const base=Math.atan2(tgt.y-slot.y, tgt.x-slot.x);
    const spread=0.55;
    for(let i=0;i<n;i++){
      const a=base + (i-(n-1)/2)*(spread/(n-1||1));
      const dist=tRange*0.85;
      pushBullet(ps, slot, null, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage, life:0.16, color:bulletCol, size:2.5, tx:slot.x+Math.cos(a)*dist, ty:slot.y+Math.sin(a)*dist, style:"shotgun"});
    }
  } else if(st==="pulse"){
    const r=tRange*0.92;
    addEffect(ps, {kind:"ring", x:slot.x, y:slot.y, r, life:0.28, max:0.28, color:"#60a5fa"});
    for(const e of ps.enemies){
      if(e.dead) continue;
      if(Math.hypot(e.x-slot.x, e.y-slot.y)<=r) damageEnemy(ps, e, damage, 1, true, atkEl, ap, srcOwner);
    }
  } else if(st==="rail"){
    const len=Math.hypot(tgt.x-slot.x,tgt.y-slot.y)||1;
    const end={x:slot.x+(tgt.x-slot.x)/len*tRange,y:slot.y+(tgt.y-slot.y)/len*tRange};
    const candidates=[];
    for(const e of ps.enemies){
      if(e.dead) continue;
      const hit=segmentHit(slot,end,e,(e.bodyR||12)+8);
      if(hit.hit) candidates.push({enemy:e,t:hit.t});
    }
    candidates.sort((a,b)=>a.t-b.t);
    candidates.slice(0,tr.pierceCount||4).forEach((entry,i)=>damageEnemy(ps,entry.enemy,damage,Math.max(0.55,1-i*0.12),true,atkEl,ap));
    addEffect(ps,{kind:"line",x1:slot.x,y1:slot.y,x2:end.x,y2:end.y,life:0.18,max:0.18,color:"#ff5f56",width:6});
  } else if(st==="mine"){
    const pos=posOnPath((tgt.dist||0)+42,ps.path);
    ps.mines.push({id:ps._nextId(),x:pos.x,y:pos.y,r:(tr.mineRadius||62)*bondSplashMul(stateForPath),dmg:damage,life:8,armed:0.35,ownerId:tr.ownerId,element:atkEl});
  } else if(st==="vulnerable"){
    damageEnemy(ps,tgt,damage,1,true,atkEl,ap,srcOwner);
    tgt.vulnerableMul=Math.max(tgt.vulnerableMul||1,1+(tr.vulnerable||0.28));
    tgt.vulnerableTimer=Math.max(tgt.vulnerableTimer||0,2.8);
    addEffect(ps,{kind:"ring",x:tgt.x,y:tgt.y,r:22,life:0.35,max:0.35,color:"#ff4d8d"});
  } else {
    pushBullet(ps, slot, tgt, {ownerId:srcOwner, element:atkEl, armorPierce:ap, dmg:damage, life:0.18, color:bulletCol, size:3});
  }
}

function applyHit(ps, bl){
  const findEnemy = (id)=> ps.enemies.find(e=>e.id===id && !e.dead);
  const ap = bl.armorPierce || 0;

  if(bl.pierce){
    let best=null, bestD=1e9;
    for(const e of ps.enemies){
      if(e.dead) continue;
      const d=Math.hypot(e.x-bl.x, e.y-bl.y);
      if(d<22 && d<bestD){ bestD=d; best=e; }
    }
    if(best) damageEnemy(ps, best, bl.dmg, 1, true, bl.element, ap, bl.ownerId||null);
    return;
  }
  if(bl.style==="poison"){
    const tgt = findEnemy(bl.targetId);
    const cx = tgt ? tgt.x : bl.tx, cy = tgt ? tgt.y : bl.ty;
    const r = bl.splash || 70;
    ps.clouds.push({id:ps._nextId(), x:cx, y:cy, r, life:bl.poison||3, dps:bl.dmg*1.2, element:bl.element||null});
    addEffect(ps, {kind:"ring", x:cx, y:cy, r, life:0.3, max:0.3, color:"#84cc16"});
    for(const e of ps.enemies){
      if(!e.dead && Math.hypot(e.x-cx,e.y-cy)<=r){
        // 中毒：持续流血 3.5 秒，每秒弹伤害（离开毒区也继续流血）
        e.poisonTimer = Math.max(Number(e.poisonTimer||0), 3.5);
        e.poisonDps = Math.max(Number(e.poisonDps||0), bl.dmg);
        e.poisonElement = bl.element||null;
        damageEnemy(ps, e, bl.dmg, 0.6, true, bl.element, ap, bl.ownerId||null);
      }
    }
    return;
  }
  if(bl.mode==="aoe" && bl.splash>0){
    const tgt = findEnemy(bl.targetId);
    const cx = tgt ? tgt.x : bl.tx, cy = tgt ? tgt.y : bl.ty;
    addEffect(ps, {kind:"ring", x:cx, y:cy, r:bl.splash, life:0.25, max:0.25, color:"#fb923c"});
    for(const e of ps.enemies){
      if(e.dead) continue;
      const d=Math.hypot(e.x-cx, e.y-cy);
      if(d<=bl.splash){
        const mul = (tgt && e.id===tgt.id) ? 1 : Math.max(0.45, 1-d/bl.splash*0.55);
        damageEnemy(ps, e, bl.dmg, mul, true, bl.element, ap, bl.ownerId||null);
        if(bl.slow>0){ e.slowMul=bl.slow; e.slowTimer=1.2; }
      }
    }
    return;
  }
  const tgt = findEnemy(bl.targetId);
  if(tgt){
    damageEnemy(ps, tgt, bl.dmg, 1, true, bl.element, ap, bl.ownerId||null);
    if(bl.slow>0){ tgt.slowMul=bl.slow; tgt.slowTimer=1.4; }
  }
}

function segmentHit(a,b,p,r){
  const dx=b.x-a.x, dy=b.y-a.y;
  const lenSq=dx*dx+dy*dy;
  const t=lenSq?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/lenSq)):0;
  return {hit:Math.hypot(p.x-(a.x+dx*t),p.y-(a.y+dy*t))<=r,t};
}

function hitShotgun(ps,bl,from){
  let first=null, firstT=Infinity;
  for(const enemy of ps.enemies){
    if(enemy.dead) continue;
    const result=segmentHit(from,bl,enemy,(enemy.bodyR||12)+(bl.size||2));
    if(result.hit && result.t<firstT){ first=enemy; firstT=result.t; }
  }
  if(!first) return false;
  damageEnemy(ps,first,bl.dmg,1,true,bl.element,bl.armorPierce||0,bl.ownerId||null);
  bl.hit=true;
  bl.life=0;
  return true;
}

// ============ 单路径步进（合作模式 & 独立模式复用） ============
function stepPath(ps, dt, state){
  // Combat modifiers come from this path in independent mode, while upgrades/events remain session-wide.
  ps._owner=pathViewState(ps,state);
  // ps = 路径状态对象，state = 全局状态（用于 rng, nextId 等）
  // spawn
  if((ps.spawnDelay||0)>0){
    ps.spawnDelay=Math.max(0,(ps.spawnDelay||0)-dt);
  }
  const need = waveSizeFor(state.level);
  if((ps.spawnDelay||0)<=0 && ps.spawned < need){
    ps.spawnAcc += dt;
    if(ps.spawnAcc >= spawnIntervalFor(state.level)){
      ps.spawnAcc = 0;
      ps.enemies.push(makeEnemy(state.level, state.nextId, state.rng, ps.path, !!state.bossSkipped, false, state.endlessAffixes||[]));
      const spawned=ps.enemies[ps.enemies.length-1];
      if(spawned){
        spawned.speed*=(state.eventSpeedMul||1);
        if(state.eventArmored) spawned.def+=EVENT_ARMORED_DEF_BONUS;
      }
      ps.spawned++;
    }
  } else if(ps.spawned >= need && state.bossPending && !ps.bossSpawned && ps.enemies.length===0){
    ps.enemies.push(makeBoss(state.level, state.nextId, state.rng, ps.path));
    ps.bossSpawned=true;
  }

  // enemy move
  const pLen = ps.pathLen || PATH_LEN;
  const bondSlow = bondSlowMul(ps._owner);
  // 新机制 tick：Boss 激怒（先判血量）→ 虫后产卵 → 敌方合兵（融合放最后，产出的幼虫当帧不参与）
  stepBossEnrage(ps, state);
  stepBossSkills(ps, state, dt);
  stepQueenSpawns(ps, state, dt);
  stepEnemyMerges(ps, state);
  // 虫巢督军光环：先清上帧标记，再由每个存活督军给半径内的友军怪提速
  let hasOverlord = false;
  for(const e of ps.enemies){
    if(!e.dead && e.isOverlord){ hasOverlord=true; break; }
  }
  if(hasOverlord){
    for(const e of ps.enemies){
      if(e.dead || e.isOverlord) continue;
      e.hiveBuffed = false;
      for(const lord of ps.enemies){
        if(lord.dead || !lord.isOverlord) continue;
        if(Math.hypot(e.x-lord.x, e.y-lord.y) <= OVERLORD_AURA_RADIUS){ e.hiveBuffed=true; break; }
      }
    }
  }
  const natureTier=Number((ps.bonds||state.bonds||{}).nature||0);
  if(natureTier>0){
    const interval=7;
    ps.bondRegenAcc=(ps.bondRegenAcc||0)+dt;
    if(ps.bondRegenAcc>=interval){
      ps.bondRegenAcc-=interval;
      ps.crystals=Math.min(ps.crystalsMax||START_CRYSTALS,(ps.crystals||0)+1);
    }
  }
  for(const e of ps.enemies){
    if(e.dead) continue;
    if(e.slowTimer>0){ e.slowTimer-=dt; if(e.slowTimer<=0) e.slowMul=1; }
    if(e.poisonTimer>0){
      e.poisonTimer-=dt;
      ps._dotTick = true;
      damageEnemy(ps,e,e.poisonDps*dt,1,false);
      ps._dotTick = false;
      if(e.dead) continue;
      if(e.poisonTimer<=0) e.poisonDps=0;
    }
    if(e.vulnerableTimer>0){
      e.vulnerableTimer-=dt;
      if(e.vulnerableTimer<=0) e.vulnerableMul=1;
    }
    if((e.shockTimer||0)>0) e.shockTimer-=dt;
    if((e.burnTimer||0)>0) e.burnTimer-=dt;
    if(e.affix==="regenerator" && e.hp>0 && e.hp<e.hpMax){
      e.hp=Math.min(e.hpMax, e.hp + e.hpMax*AFFIX_REGEN_PER_SEC*dt);
    }
    if(!hasOverlord) e.hiveBuffed=false;
    const hiveMul = e.hiveBuffed ? OVERLORD_AURA_SPEED_MUL : 1;
    e.dist += e.speed * e.slowMul * bondSlow * hiveMul * dt;
    e.walk = (e.walk||0) + dt * 10 * e.slowMul * bondSlow * hiveMul;
    const pos = posOnPath(e.dist, ps.path);
    e.x=pos.x; e.y=pos.y;
    if(e.dist >= pLen){
      e.reached=true; e.dead=true;
      if(e.isBoss) ps.bossEscaped=true;
      ps.crystals -= (state.eventLeakMul||1)*bondLeakMul(ps._owner||ps);
      // 漏怪也回少量大招能量（绝境攒怒，与客户端一致）
      { const us = ps._owner || ps; if(!us.arena){ us.ultEnergy = Math.min(ULT_ENERGY_MAX, (us.ultEnergy||0) + ULT_LEAK_ENERGY); } }
      if(ps.crystals<=0){ ps.crystals=0; ps._lost=true; }
    }
  }

  if(state.eventRetaliate){
    // 水羁绊：敌方还击间隔拉长
    ps.retaliateCd=(ps.retaliateCd||0)-dt/bondWaterRetaliateMul(ps._owner||ps);
    if(ps.retaliateCd<=0){
      ps.retaliateCd=EVENT_RETALIATE_INTERVAL;
      const tmeta=ps._slotMeta||getIndependentSlots(ps.pathIndex||0)||SLOT_META;
      let bestI=-1,bestD=Infinity,shooter=null;
      for(const e2 of ps.enemies){
        if(e2.dead) continue;
        for(let ti=0;ti<ps.slots.length;ti++){
          const tr0=ps.slots[ti];
          if(!tr0||ti>=tmeta.length) continue;
          const dx=e2.x-tmeta[ti].x, dy=e2.y-tmeta[ti].y;
          const d2=dx*dx+dy*dy;
          if(d2<bestD){bestD=d2;bestI=ti;shooter=e2;}
        }
      }
      if(bestI>=0 && shooter){
        const tr=ps.slots[bestI];
        // 圣盾力场：先扣吸收盾，再落血
        const realDmg = absorbShield(tr, EVENT_RETALIATE_DAMAGE/(1+troopDef(state,tr.ownerId||"me",tr)*0.085));
        tr.hp=(tr.hp!=null?tr.hp:(tr.hpMax||1))-realDmg;
        addEffect(ps,{kind:"spit",x1:shooter.x,y1:shooter.y-6,x2:tmeta[bestI].x,y2:tmeta[bestI].y,life:0.32,max:0.32,color:"#84cc16"});
        if(tr.hp<=0){
          ps.slots[bestI]=null;
          refreshBonds(state);
          addEffect(ps,{kind:"boom",x:tmeta[bestI].x,y:tmeta[bestI].y,r:30,life:0.35,max:0.35,color:"#ffcf40"});
        }
      }
    }
  }

  // poison clouds：毒云持续伤害——中毒流血（3.5 秒，每秒固定血量），只延长不重置每秒伤害
  for(const c of ps.clouds){
    c.life -= dt;
    ps._dotTick = true;
    for(const e of ps.enemies){
      if(e.dead) continue;
      if(Math.hypot(e.x-c.x, e.y-c.y)<=c.r){
        e.poisonTimer = Math.max(Number(e.poisonTimer||0), 1.0);
        e.poisonDps = Math.max(Number(e.poisonDps||0), c.dps*0.5);
        e.poisonElement = c.element||null;
      }
    }
    ps._dotTick = false;
  }
  ps.clouds = ps.clouds.filter(c=>c.life>0);

  for(const mine of ps.mines){
    mine.life-=dt;
    mine.armed=Math.max(0,(mine.armed||0)-dt);
    if(mine.life<=0 || mine.armed>0) continue;
    const triggered=ps.enemies.some(e=>!e.dead&&Math.hypot(e.x-mine.x,e.y-mine.y)<=22);
    if(triggered){
      for(const e of ps.enemies) if(!e.dead&&Math.hypot(e.x-mine.x,e.y-mine.y)<=mine.r) damageEnemy(ps,e,mine.dmg,1,true,mine.element);
      addEffect(ps,{kind:"ring",x:mine.x,y:mine.y,r:mine.r,life:0.3,max:0.3,color:"#ffb020"});
      mine.life=0;
    }
  }
  ps.mines=ps.mines.filter(m=>m.life>0);

  // beams
  for(const beam of ps.beams){
    beam.life -= dt;
    const tgt = ps.enemies.find(e=>e.id===beam.targetId && !e.dead);
    if(tgt){ beam.tx=tgt.x; beam.ty=tgt.y; damageEnemy(ps,tgt,beam.dps*dt,1,false,beam.element); }
  }
  ps.beams = ps.beams.filter(b=>b.life>0);

  // troops fire
  const slots = ps.slots;
  // 土羁绊：我方兵持续回血
  const earthRegen = bondEarthRegen(ps._owner||ps);
  for(let i=0;i<slots.length;i++){
    const tr = slots[i]; if(!tr) continue;
    if(earthRegen>0 && tr.hpMax>0 && (tr.hp!=null?tr.hp:tr.hpMax) < tr.hpMax){
      tr.hp = Math.min(tr.hpMax, (tr.hp!=null?tr.hp:tr.hpMax) + earthRegen*dt);
    }
    const slotMeta = (ps._slotMeta || getIndependentSlots(ps.pathIndex||0) || SLOT_META)[i];
    tr.cd -= dt;
    if(tr.cd<=0){
      // 辅助兵种（医疗/圣盾）：不打怪，直接脉冲支援友军
      if((tr.heal||0) > 0 || (tr.shield||0) > 0){
        tr.cd = 1/Math.max(0.12, troopRate(tr,ps._owner));
        supportPulse(ps, slotMeta, tr);
        continue;
      }
      const tgt = findTarget(ps, slotMeta, tr);
      if(tgt){ tr.cd = 1/Math.max(0.12, troopRate(tr,ps._owner)); fireByStyle(ps, slotMeta, tr, tgt); }
    }
  }

  // bullets
  for(const bl of ps.bullets){
    bl.life -= dt;
    const previous={x:bl.x,y:bl.y};
    if(bl.homing && bl.targetId){
      const tgt = ps.enemies.find(e=>e.id===bl.targetId && !e.dead);
      if(tgt){ bl.tx=tgt.x; bl.ty=tgt.y; }
    }
    const t = 1 - Math.max(0, bl.life/bl.maxLife);
    // 风羁绊：子弹飞行速度加成（推进比例加快 = 更快到达）
    const lifeScale = 1/bondWindBulletMul(ps._owner||ps);
    const ease = bl.homing ? Math.min(1, t*1.15*lifeScale) : Math.min(1, t*1.5*lifeScale);
    bl.x = bl.sx + (bl.tx-bl.sx)*ease;
    bl.y = bl.sy + (bl.ty-bl.sy)*ease;
    if(bl.style==="shotgun" && !bl.hit) hitShotgun(ps,bl,previous);
    if(bl.life<=0 && !bl.hit){ bl.hit=true; applyHit(ps, bl); }
  }
  ps.bullets = ps.bullets.filter(b=>b.life>0);
  ps.effects = ps.effects.filter(ef=>{ ef.life-=dt; return ef.life>0; });
  ps.enemies = ps.enemies.filter(e=>!e.dead);

  // 硬上限
  if(ps.bullets.length>220) ps.bullets=ps.bullets.slice(-120);
  if(ps.effects.length>160) ps.effects=ps.effects.slice(-80);
  if(ps.clouds.length>40) ps.clouds=ps.clouds.slice(-20);
  if(ps.beams.length>40) ps.beams=ps.beams.slice(-20);
  if(ps.mines.length>48) ps.mines=ps.mines.slice(-32);
}

function rewardStage(state, bossKilled=false){
  // 过关金币：每位玩家 +5
  for(const pid of Object.keys(state.trays||{})){
    state.coins = state.coins||{};
    state.coins[pid] = (state.coins[pid]||0) + COINS_PER_STAGE;
  }
  for(const id of Object.keys(state.trays)){
    const bonusPoints = bossKilled ? BOSS_REWARD_POINTS : 0;
    state.upgradePoints[id]=upgradePoints(state,id)+UPGRADE_POINTS_PER_STAGE+bonusPoints;
    // Boss 加兵改为死亡当场掉落（见 damageEnemy），过关固定发基础兵
    const troopCount = TROOPS_PER_STAGE + (state.eventBonusTroop ? 1 : 0);
    state.trays[id].push(...makeVariedTroops(troopCount,id,state));
  }
}

// ============ 主步进函数 ============
function step(state, dt){
  if(!state.started || state.over || state.paused) return;
  state.tick++;
  const skills=ensureCoopSkills(state);
  if(skills.focus.remaining>0) skills.focus.remaining=Math.max(0,skills.focus.remaining-dt);
  if(skills.focus.active>0){
    skills.focus.active=Math.max(0,skills.focus.active-dt);
    if(skills.focus.active<=0) skills.focus.targetId=null;
  }
  if(skills.shield.remaining>0) skills.shield.remaining=Math.max(0,skills.shield.remaining-dt);

  if(state.phase==="prep"){
    // 对战模式：布阵不倒计时，等双方点"开战"
    if(state.mode!=="versus"){
      state.prepTimer -= dt;
      if(state.prepTimer<=0){
        state.bossExchangeUnlocked=false; // 换兵门禁：自动开战同样上锁
        state.phase="battle";
        // Keep bossSkipped through the first spawn of this wave.
        if(state.mode==="independent"){
          for(const ps of state.paths){ resetBattlefield(ps); }
        } else {
          resetBattlefield(state);
        }
      }
    }
    // 备战阶段特效同样随时间淡出，避免合兵特效一直挂在场上
    if(state.effects) state.effects = state.effects.filter(ef=>{ ef.life -= dt; return ef.life > 0; });
    if(state.mode==="independent" || state.mode==="versus"){
      for(const ps of state.paths){
        if(ps.effects) ps.effects = ps.effects.filter(ef=>{ ef.life -= dt; return ef.life > 0; });
      }
    }
    state.revision++;
    return;
  }

  if(state.mode === "versus"){
    // 双人对战：站桩对轰步进，胜负由 arenaUnits 决定
    stepArena(state, dt);
    state.revision++;
    return;
  }

  if(state.mode === "independent"){
    // 独立路径模式：每条路径独立步进
    let anyAlive = false;
    for(const ps of state.paths){
      ps._nextId = state.nextId;
      ps._rng = state.rng;
      ps._slotMeta = INDEPENDENT_SLOT_META[ps.pathIndex] || INDEPENDENT_SLOT_META[0];
      ps._lost = false;
      stepPath(ps, dt, state);
      if(ps.crystals > 0) anyAlive = true;
    }
    // 竞技模式：所有路径水晶归零 = 游戏结束
    // 合作模式：所有路径水晶归零 = 游戏结束
    if(!anyAlive){
      state.over = true;
      state.result = "lose";
    }
    // 波次结束检查：所有路径都清完怪
    const need = waveSizeFor(state.level);
    const allCleared = state.paths.every(ps => ps.spawned >= need && ps.enemies.length === 0 && (!state.bossPending || ps.bossSpawned));
    if(!state.over && allCleared){
      if(state.level >= TOTAL_LEVELS){
        state.over = true; state.result = "win";
      } else {
        const bossWasPending = !!state.bossPending;
        const bossWasKilled = bossWasPending && state.paths.every(ps => ps.bossKilled);
        state.bossSkipped = bossWasPending && !bossWasKilled;
        state.level++;
        state.phase = "prep";
        state.prepTimer = PREP_SECONDS;
        state.bossEnabled=false; state.bossPending=false;
        resetStageExtras(state);
        for(const ps of state.paths){
          ps.spawned=0; ps.killed=0; ps.spawnAcc=0; ps.bossSpawned=false;
          clearProjectiles(ps);
        }
        rewardStage(state, bossWasKilled);
      }
    }
  } else {
    // 合作模式：原有逻辑
    const ps = {
      enemies: state.enemies, bullets: state.bullets, beams: state.beams,
      clouds: state.clouds, mines: state.mines, effects: state.effects,
      slots: state.slots,
      spawned: state.spawned, killed: state.killed, spawnAcc: state.spawnAcc, spawnDelay: state.spawnDelay||0, bossSpawned: !!state.bossSpawned,
      bossKilled: !!state.bossKilled, bossEscaped: !!state.bossEscaped,      crystals: state.crystals, crystalsMax:state.crystalsMax, path: PATH, pathLen: PATH_LEN,
      retaliateCd: state.retaliateCd||0,
      _nextId: state.nextId, _rng: state.rng, _slotMeta: SLOT_META,
    };
    stepPath(ps, dt, state);
    syncCoopBack(state, ps);
    if(ps._lost){ state.over=true; state.result="lose"; }

    const need = waveSizeFor(state.level);
    if(!state.over && state.spawned>=need && state.enemies.length===0 && (!state.bossPending || state.bossSpawned)){
      if(state.level >= TOTAL_LEVELS){
        state.over=true; state.result="win";
      } else {
        const bossWasPending = !!state.bossPending;
        const bossWasKilled = bossWasPending && !!state.bossKilled;
        state.bossSkipped = bossWasPending && !bossWasKilled;
        state.level++;
        state.phase="prep";
        state.prepTimer=PREP_SECONDS;
        state.bossEnabled=false; state.bossPending=false;
        resetStageExtras(state);
        state.spawned=0; state.killed=0; state.spawnAcc=0; state.bossSpawned=false;
        clearProjectiles(state);
        rewardStage(state, bossWasKilled);
      }
    }
  }
  state.revision++;
}

// ============ 公开状态 ============
function publicState(state, viewerId){
  const base = {
    revision: state.revision,
    rulesVersion: state.rulesVersion||RULES_VERSION,
    tick: state.tick,
    started: state.started,
    over: state.over,
    result: state.result,
    level: state.level,
    phase: state.phase,
    mode: state.mode||"coop",
    prepTimer: Math.max(0, Number(state.prepTimer.toFixed(2))),
    spawnDelay: Math.max(0, Number((state.spawnDelay||0).toFixed(2))),
    bossEnabled: !!state.bossEnabled, bossPending: !!state.bossPending, bossSpawned: !!state.bossSpawned,
    hostId: state.hostId,
    players: state.players.map(p=>({id:p.id, name:p.name, ready:!!p.ready, connected:!!p.connected, pathIndex:p.pathIndex})),
    tray: (state.trays[viewerId]||[]).map(t=>serializeTroop(t,
      state.mode==="independent" ? pathViewState(getPlayerPathState(state,viewerId),state) : state)),
    upgradePoints: upgradePoints(state,viewerId),
    weaponUpgradeLevel: weaponUpgradeLevel(state,viewerId),
    rateUpgradeLevel: rateUpgradeLevel(state,viewerId),
    armorUpgradeLevel: armorUpgradeLevel(state,viewerId),
    eventRetaliate: !!state.eventRetaliate,
    mapEvent: state.mapEvent||null,
    mapEventResolved: !!state.mapEventResolved,
    mapEventChoice: state.mapEventChoice||null,
    paused: !!state.paused,
    pausedBy: state.pausedBy||null,
    bossDropped: state.bossDropped||0,
    dmgBy: state.dmgBy||{},
    bossExchangeUnlocked: !!state.bossExchangeUnlocked,
    coopSkills: ensureCoopSkills(state),
    bonds: state.mode==="independent"
      ? ((getPlayerPathState(state,viewerId)||{}).bonds||emptyBonds())
      : (state.bonds||emptyBonds()),
    // 双人对战附加字段（versus 分支里会按查看者重写）
    arena: !!state.arena,
    coins: {},
  };

  if(state.mode === "versus"){
    // 双人对战：自己的 slots/tray + 对方阵型摘要 + 全场战斗单位（观战视角）
    const myPs = getPlayerPathState(state, viewerId);
    const myBonds = myPs ? (myPs.bonds||emptyBonds()) : emptyBonds();
    base.bonds = myBonds;
    if(myPs){
      base.slots = myPs.slots.map(t=>t?serializeTroop(t,state):null);
      base.pathIndex = myPs.pathIndex;
    }
    // 客户端对战 HUD 习惯按字典取自己那份（键 "me"）
    base.upgradePoints = {"me": upgradePoints(state,viewerId)};
    base.weaponUpgradeLevel = {"me": weaponUpgradeLevel(state,viewerId)};
    base.rateUpgradeLevel = {"me": rateUpgradeLevel(state,viewerId)};
    base.armorUpgradeLevel = {"me": armorUpgradeLevel(state,viewerId)};
    base.coins = {"me": (state.coins||{})[viewerId]||0};
    const foePs0 = (state.paths||[]).find(ps=>ps.ownerId!==viewerId);
    base.arenaDeployed = {
      "me": (state.arenaDeployed||{})[viewerId]||0,
      "foe": foePs0 ? ((state.arenaDeployed||{})[foePs0.ownerId]||0) : 0,
    };
    // 胜负按查看者翻转：内部 result "win" 永远指 paths[0]（蓝方）获胜
    if(state.over && (state.result==="win"||state.result==="lose") && myPs){
      const iWin = (state.result==="win") === (myPs.pathIndex===0);
      base.result = iWin ? "win" : "lose";
    }
    // 双方阵型摘要（固定按 team 0/1 排序：客户端 paths[下标] == 那一队的阵营）
    base.paths = state.paths.map(ps=>({
      pathIndex: ps.pathIndex,
      ownerId: ps.ownerId,
      bonds: ps.bonds||emptyBonds(),
      slots: ps.slots.map(t=>t?serializeTroop(t,state):null),
      effects: [],
    }));
        // 输出对比按查看者换算：[0]=我方输出 [1]=对方输出（内部 taken 是按 team 0/1 记的承伤）
    const dmgTaken=state.arenaDamageTaken||[0,0];
    const myIdx=myPs?myPs.pathIndex:0;
    base.arenaDealt=[Math.round(dmgTaken[1-myIdx]||0),Math.round(dmgTaken[myIdx]||0)];
base.arenaSlotMeta = state.paths.map(ps=>arenaSlotMeta(ps.pathIndex));
    base.arenaUnits = (state.arenaUnits||[]).filter(u=>!u.dead).map(u=>({
      id:u.id, team:u.team, ownerId:u.ownerId, x:Math.round(u.x*10)/10, y:Math.round(u.y*10)/10,
      hp:Math.max(0,Math.round(u.hp)), hpMax:Math.round(u.hpMax),
      troop:{typeKey:u.troop.typeKey, level:u.troop.level, ownerId:u.troop.ownerId, element:u.troop.element||"", name:u.troop.name||""},
    }));
    base.arenaBullets = (state.arenaBullets||[]).map(b=>({id:b.id, x:Math.round(b.x), y:Math.round(b.y), tx:b.tx, ty:b.ty, color:b.color, size:b.size}));
    base.arenaEffects = (state.arenaEffects||[]).map(ef=>({
      id:ef.id, kind:ef.kind, x:ef.x, y:ef.y, r:ef.r,
      x1:ef.x1, y1:ef.y1, x2:ef.x2, y2:ef.y2, color:ef.color, life:ef.life, max:ef.max, width:ef.width,
    }));
    base.arenaSlowmo = !!state.arenaSlowmo;
    // 对方阵型（布阵阶段看对方摆了什么）
    base.foeSlots = state.paths.filter(ps=>ps.ownerId!==viewerId).map(ps=>({
      pathIndex: ps.pathIndex,
      ownerId: ps.ownerId,
      slots: ps.slots.map(t=>t?{typeKey:t.typeKey, level:t.level, element:t.element||""}:null),
    }));
    return base;
  }

  if(state.mode === "independent"){
    // 独立模式：返回查看者自己路径的完整状态 + 其他路径摘要
    const viewerPs = getPlayerPathState(state, viewerId);
    const viewerPathIdx = getPlayerPathIndex(state, viewerId);

    if(viewerPs){
      base.crystals = viewerPs.crystals;
      base.crystalsMax = viewerPs.crystalsMax||START_CRYSTALS;
      base.defenseUpgradeLevel = viewerPs.defenseUpgradeLevel||0;
      base.spawned = viewerPs.spawned;
      base.killed = viewerPs.killed;
      base.waveSize = waveSizeFor(state.level);
      base.pathIndex = viewerPathIdx;
      base.slots = viewerPs.slots.map(t=>t?serializeTroop(t,pathViewState(viewerPs,state)):null);
      base.enemies = viewerPs.enemies.filter(e=>!e.dead).map(e=>({
        id:e.id, hp:Math.max(0,e.hp), hpMax:e.hpMax,
        x:e.x, y:e.y, color:e.color, shell:e.shell, eye:e.eye,
        bodyR:e.bodyR||12, kind:e.kind||"mite", spriteId:e.spriteId==null?null:e.spriteId, isBoss:!!e.isBoss, element:e.element||null, elite:!!e.elite, affix:e.affix||null, isOverlord:!!e.isOverlord, hiveBuffed:!!e.hiveBuffed, isQueen:!!e.isQueen, isQueenBaby:!!e.isQueenBaby, mergeTier:e.mergeTier||0, enraged:!!e.enraged, shield:e.shield||0, walk:e.walk||0,
        slow:e.slowMul<1, poison:e.poisonTimer>0, vulnerable:e.vulnerableTimer>0, shocked:(e.shockTimer||0)>0, burning:(e.burnTimer||0)>0, def:e.def||0, speed:e.speed||0,
      }));
      base.bullets = viewerPs.bullets.map(b=>({id:b.id, x:b.x, y:b.y, sx:b.sx, sy:b.sy, tx:b.tx, ty:b.ty, color:b.color, size:b.size, style:b.style}));
      base.beams = viewerPs.beams.map(b=>({id:b.id, x:b.x, y:b.y, tx:b.tx, ty:b.ty, color:b.color, life:b.life}));
      base.clouds = viewerPs.clouds.map(c=>({id:c.id, x:c.x, y:c.y, r:c.r, life:c.life}));
      base.mines = viewerPs.mines.map(m=>({id:m.id,x:m.x,y:m.y,r:m.r,life:m.life,armed:m.armed||0}));
      base.effects = viewerPs.effects.map(ef=>({
        id:ef.id, kind:ef.kind, x:ef.x, y:ef.y, r:ef.r,
        x1:ef.x1, y1:ef.y1, x2:ef.x2, y2:ef.y2,
        ang:ef.ang, half:ef.half, color:ef.color, life:ef.life, max:ef.max, width:ef.width,
      }));
    }

    base.pathViews = state.paths.map(ps=>({
      pathIndex: ps.pathIndex,
      ownerId: ps.ownerId,
      crystals: ps.crystals,
      crystalsMax: ps.crystalsMax||START_CRYSTALS,
      defenseUpgradeLevel: ps.defenseUpgradeLevel||0,
      spawned: ps.spawned,
      killed: ps.killed,
      bonds: ps.bonds||emptyBonds(),
      slots: ps.slots.map(t=>t?serializeTroop(t,pathViewState(ps,state)):null),
      enemies: ps.enemies.filter(e=>!e.dead).map(e=>({
        id:e.id, hp:Math.max(0,e.hp), hpMax:e.hpMax,
        x:e.x, y:e.y, color:e.color, shell:e.shell, eye:e.eye,
        bodyR:e.bodyR||12, kind:e.kind||"mite", spriteId:e.spriteId==null?null:e.spriteId, isBoss:!!e.isBoss, element:e.element||null, elite:!!e.elite, affix:e.affix||null, isOverlord:!!e.isOverlord, hiveBuffed:!!e.hiveBuffed, isQueen:!!e.isQueen, isQueenBaby:!!e.isQueenBaby, mergeTier:e.mergeTier||0, enraged:!!e.enraged, shield:e.shield||0, walk:e.walk||0,
        slow:e.slowMul<1, poison:e.poisonTimer>0,
      })),
      bullets: ps.bullets.map(b=>({id:b.id, x:b.x, y:b.y, sx:b.sx, sy:b.sy, tx:b.tx, ty:b.ty, color:b.color, size:b.size, style:b.style})),
      beams: ps.beams.map(b=>({id:b.id, x:b.x, y:b.y, tx:b.tx, ty:b.ty, color:b.color, life:b.life})),
      clouds: ps.clouds.map(c=>({id:c.id, x:c.x, y:c.y, r:c.r, life:c.life})),
      mines: ps.mines.map(m=>({id:m.id,x:m.x,y:m.y,r:m.r,life:m.life,armed:m.armed||0})),
      effects: ps.effects.map(ef=>({
        id:ef.id, kind:ef.kind, x:ef.x, y:ef.y, r:ef.r,
        x1:ef.x1, y1:ef.y1, x2:ef.x2, y2:ef.y2,
        ang:ef.ang, half:ef.half, color:ef.color, life:ef.life, max:ef.max, width:ef.width,
      })),
    }));

    // 其他路径摘要（迷你地图用）
    base.otherPaths = state.paths.filter(ps=>ps.ownerId!==viewerId).map(ps=>({
      pathIndex: ps.pathIndex,
      ownerId: ps.ownerId,
      crystals: ps.crystals,
      crystalsMax: ps.crystalsMax||START_CRYSTALS,
      defenseUpgradeLevel: ps.defenseUpgradeLevel||0,
      spawned: ps.spawned,
      killed: ps.killed,
      enemyCount: ps.enemies.filter(e=>!e.dead).length,
      slotCount: ps.slots.filter(Boolean).length,
    }));
  } else {
    // 合作模式：原有逻辑
    base.crystals = state.crystals;
    base.crystalsMax = state.crystalsMax||START_CRYSTALS;
    base.defenseUpgradeLevel = state.defenseUpgradeLevel||0;
    base.spawned = state.spawned;
    base.killed = state.killed;
    base.waveSize = waveSizeFor(state.level);
    base.slots = state.slots.map(t=>t?serializeTroop(t,state):null);
    base.enemies = state.enemies.filter(e=>!e.dead).map(e=>({
      id:e.id, hp:Math.max(0,e.hp), hpMax:e.hpMax,
      x:e.x, y:e.y, color:e.color, shell:e.shell, eye:e.eye,
      bodyR:e.bodyR||12, kind:e.kind||"mite", spriteId:e.spriteId==null?null:e.spriteId, isBoss:!!e.isBoss, element:e.element||null, isOverlord:!!e.isOverlord, hiveBuffed:!!e.hiveBuffed, isQueen:!!e.isQueen, isQueenBaby:!!e.isQueenBaby, mergeTier:e.mergeTier||0, enraged:!!e.enraged, shield:e.shield||0, walk:e.walk||0,
      slow:e.slowMul<1, poison:e.poisonTimer>0, vulnerable:e.vulnerableTimer>0, shocked:(e.shockTimer||0)>0, burning:(e.burnTimer||0)>0, def:e.def||0, speed:e.speed||0,
    }));
    base.bullets = state.bullets.map(b=>({id:b.id, x:b.x, y:b.y, sx:b.sx, sy:b.sy, tx:b.tx, ty:b.ty, color:b.color, size:b.size, style:b.style}));
    base.beams = state.beams.map(b=>({id:b.id, x:b.x, y:b.y, tx:b.tx, ty:b.ty, color:b.color, life:b.life}));
    base.clouds = state.clouds.map(c=>({id:c.id, x:c.x, y:c.y, r:c.r, life:c.life}));
    base.mines = state.mines.map(m=>({id:m.id,x:m.x,y:m.y,r:m.r,life:m.life,armed:m.armed||0}));
    base.effects = state.effects.map(ef=>({
      id:ef.id, kind:ef.kind, x:ef.x, y:ef.y, r:ef.r,
      x1:ef.x1, y1:ef.y1, x2:ef.x2, y2:ef.y2,
      ang:ef.ang, half:ef.half, color:ef.color, life:ef.life, max:ef.max, width:ef.width,
    }));
  }

  return base;
}

module.exports = {createSession, publicState, command, step, allReady, makeTroop, makeBoss, makeEnemy, damageEnemy, stepPath, waveSizeFor, resetStageExtras, computeBonds, bondSplashMul, bondStormMul, bondLeakMul, troopSplash, allAttrMul, bondMetalPierce, bondWaterRetaliateMul, bondEarthRegen, bondWindBulletMul, bondHpMul, bondDefAdd, bondArmorMul, supportPulse, absorbShield};

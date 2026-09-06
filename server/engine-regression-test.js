"use strict";

const assert=require("assert");
const {PATH_LEN,PATH,MAX_LEVEL,LEVEL_RATE_MUL,LEVEL_DAMAGE_MUL,TROOP_TYPES,UPGRADE_POINTS_PER_STAGE,TROOPS_PER_STAGE,WEAPON_UPGRADE_MAX,BOSS_HP_BASE_MUL,BOSS_HP_MUL_PER_LEVEL,BOSS_DEFENSE_BASE,BOSS_DEFENSE_PER_LEVEL,BOSS_SPEED_MULTIPLIER,BOSS_SPEED_FLAT_BONUS,BOSS_REWARD_POINTS,BOSS_REWARD_TROOPS,SKIP_PENALTY_HP_MUL,SKIP_PENALTY_DEF_BONUS,SKIP_PENALTY_SPEED_MUL,ELEMENTS}=require("../shared/game-types");
const {createSession,command,step,publicState,makeTroop,makeBoss,makeEnemy,damageEnemy,stepPath}=require("../shared/game-engine");

function startSession(mode){
  const state=createSession(["a","b","c"],24680,mode);
  for(const player of state.players) command(state,player.id,{type:"ready",value:true});
  command(state,"a",{type:"start"});
  return state;
}

function expectInvalidSlot(mode,targetSlot,includeTarget=true){
  const state=startSession(mode);
  const deploy={type:"deploy",troopId:state.trays.a[0].id};
  if(includeTarget) deploy.targetSlot=targetSlot;
  assert.throws(()=>command(state,"a",deploy),/槽位无效/,`${mode} accepted targetSlot ${String(targetSlot)}`);
}

function makeTestEnemy(id,dist,speed=10){
  return {
    id,hpMax:100,hp:100,def:0,speed,bodyR:2,kind:"mite",
    dist,x:0,y:0,slowMul:1,slowTimer:0,poisonTimer:0,poisonDps:0,
    walk:0,dead:false,reached:false,
  };
}

for(const mode of ["coop","independent"]){
  expectInvalidSlot(mode,null);
  expectInvalidSlot(mode,false);
  expectInvalidSlot(mode,"");
  expectInvalidSlot(mode,undefined,false);
  expectInvalidSlot(mode,"0");
  expectInvalidSlot(mode,0.5);

  const state=startSession(mode);
  const troop=state.trays.a[0];
  command(state,"a",{type:"deploy",troopId:troop.id,targetSlot:0});
  const slot=mode==="coop"?state.slots[0]:state.paths[0].slots[0];
  assert.strictEqual(slot.id,troop.id,`${mode} rejected numeric targetSlot zero`);
}

{
  const state=startSession("coop");
  state.level=40;
  state.phase="battle";
  state.crystals=1;
  state.spawned=74;
  state.enemies=[makeTestEnemy("final-crystal",PATH_LEN-1)];
  step(state,0.2);
  assert.strictEqual(state.over,true);
  assert.strictEqual(state.result,"lose");
  assert.strictEqual(state.level,40);
  assert.strictEqual(state.enemies.length,0);
}

{
  const state=startSession("coop");
  state.phase="battle";
  state.crystals=1;
  state.spawned=20;
  state.enemies=[makeTestEnemy("early-crystal",PATH_LEN-1)];
  step(state,0.2);
  assert.strictEqual(state.over,true);
  assert.strictEqual(state.result,"lose");
  assert.strictEqual(state.level,1);
  assert.strictEqual(state.phase,"battle");
}

{
  const state=startSession("independent");
  state.phase="battle";
  for(let i=0;i<state.paths.length;i++){
    const pathState=state.paths[i];
    pathState.crystals=1;
    pathState.spawned=20;
    pathState.enemies=[makeTestEnemy(`path-${i}-crystal`,pathState.pathLen-1)];
  }
  step(state,0.2);
  assert.strictEqual(state.over,true);
  assert.strictEqual(state.result,"lose");
  assert.strictEqual(state.level,1);
  assert.strictEqual(state.phase,"battle");
  assert(state.paths.every(pathState=>pathState.enemies.length===0));
}

{
  const state=startSession("independent");
  const troop=state.trays.a[0];
  troop.style="shotgun";
  // 开局保底后第一个待命兵可能是辅助兵（medic/aegis），硬改 style 时须同时清掉 heal/shield，
  // 否则开火循环仍按辅助兵分流、不会开枪。
  delete troop.heal;
  delete troop.shield;
  delete troop.supportRadius;
  troop.pellets=1;
  troop.range=100;
  troop.dmg=10;
  troop.rate=1;
  troop.cd=0;
  command(state,"a",{type:"deploy",troopId:troop.id,targetSlot:0});
  command(state,"a",{type:"startWave"});

  const pathState=state.paths[0];
  const slot0=(require("../shared/game-types").getIndependentSlots(0)||[])[0]||{x:144,y:220};
  pathState.path=[{x:slot0.x,y:slot0.y},{x:slot0.x+356,y:slot0.y}];
  pathState.pathLen=1000;
  const first=makeTestEnemy("shotgun-first",35,0);
  const second=makeTestEnemy("shotgun-second",65,0);
  pathState.enemies=[first,second];

  step(state,0.08);
  assert.strictEqual(first.hp,86.5,"shotgun did not damage the first swept target exactly once");
  assert.strictEqual(second.hp,100,"shotgun passed through the first target");
  assert.strictEqual(pathState.bullets.length,0,"shotgun pellet survived after its first hit");
}

{
  const state=startSession("coop");
  assert.strictEqual(new Set(state.trays.a.map(t=>t.typeKey)).size,5,"opening troops must be varied");
  const rates=[];
  for(let level=1;level<=MAX_LEVEL;level++) rates.push(makeTroop(level,"a",state.nextId,state.rng,"tank").rate);
  assert(Math.abs(rates[1]/rates[0]-LEVEL_RATE_MUL[1])<1e-9,"level 2 rate mismatch");
  assert(Math.abs(rates[5]/rates[0]-LEVEL_RATE_MUL[5])<1e-9,"level 6 rate mismatch");
  for(const typeKey of ["tesla","railgun"]){
    for(let level=1;level<=MAX_LEVEL;level++){
      assert.strictEqual(makeTroop(level,"a",state.nextId,state.rng,typeKey).range,810,`${typeKey} level ${level} must cover the full route`);
    }
  }
  assert.strictEqual(makeTroop(1,"a",state.nextId,state.rng,"tesla").chainR,95,"tesla chain radius changed");

  const troop=state.trays.a[0];
  command(state,"a",{type:"deploy",troopId:troop.id,targetSlot:0});
  state.upgradePoints.a=20;
  command(state,"a",{type:"upgradeWeapon"});
  assert.strictEqual(state.weaponUpgradeLevel.a,1);
  const future=require("../shared/game-engine").makeTroop(1,"a",state.nextId,state.rng,"tank");
  assert.strictEqual(future.weaponLevel,0,"troops must not carry individual weapon upgrades");
  command(state,"a",{type:"upgradeWeapon"});
  command(state,"a",{type:"upgradeWeapon"});
  state.upgradePoints.a=30;
  command(state,"a",{type:"upgradeWeapon"});
  assert.strictEqual(state.weaponUpgradeLevel.a,4);
  command(state,"a",{type:"upgradeRate"});
  assert.strictEqual(state.rateUpgradeLevel.a,1);
  command(state,"a",{type:"upgradeArmor"});
  assert.strictEqual(state.armorUpgradeLevel.a,1);

  state.crystals=7;
  command(state,"a",{type:"upgradeDefense"});
  assert.strictEqual(state.crystalsMax,12);
  assert.strictEqual(state.crystals,9);

  state.phase="battle";
  state.spawned=20;
  state.enemies=[];
  const trayBefore=state.trays.a.length;
  const pointsBefore=state.upgradePoints.a;
  step(state,0.01);
  assert.strictEqual(state.upgradePoints.a,pointsBefore+UPGRADE_POINTS_PER_STAGE);
  assert.strictEqual(state.trays.a.length,trayBefore+TROOPS_PER_STAGE);
}

// Boss killed → extra reward
{
  const state=startSession("coop");
  state.phase="battle";
  state.bossPending=true;
  state.bossSpawned=true;
  state.bossKilled=true;
  state.spawned=20;
  state.enemies=[];
  const trayBefore=state.trays.a.length;
  const pointsBefore=state.upgradePoints.a;
  step(state,0.01);
  assert.strictEqual(state.upgradePoints.a,pointsBefore+UPGRADE_POINTS_PER_STAGE+BOSS_REWARD_POINTS,"boss kill extra points");
  // Boss 加兵改为死亡当场掉落，过关只发基础兵
  assert.strictEqual(state.trays.a.length,trayBefore+TROOPS_PER_STAGE,"stage clear base troops");
}

// Boss death → immediate 2-troop drop + exchange unlock (coin exchange gated by boss)
{
  const state=startSession("coop");
  state.phase="battle";
  state.coins.a=10;
  // 换兵门禁：command 出错是抛异常，用 try/catch 验证
  let locked=false;
  try{ command(state,"a",{type:"buyTroopWithCoins"}); }catch(e){ locked=String(e.message).includes("Boss"); }
  assert.ok(locked,"exchange locked before boss kill");
  const trayBefore=state.trays.a.length;
  const boss=makeBoss(1,state.nextId,state.rng,PATH);
  boss.hp=1;
  damageEnemy(state,boss,1000000);
  assert.strictEqual(state.trays.a.length,trayBefore+2,"boss death drops 2 troops");
  assert.strictEqual(state.bossDropped||0,1,"bossDropped counter");
  assert.strictEqual(state.bossExchangeUnlocked,true,"boss kill unlocks exchange");
  const openBuy=command(state,"a",{type:"buyTroopWithCoins"});
  assert.ok(openBuy.ok,"exchange works after boss kill");
  assert.strictEqual(state.coins.a,5,"exchange costs 5 coins");
  // 解锁保留到过关重置之后；开战后重新上锁（对战模式豁免门禁）
  require("../shared/game-engine").resetStageExtras(state);
  assert.strictEqual(state.bossExchangeUnlocked,true,"unlock persists through stage reset");
  state.phase="prep";
  command(state,"a",{type:"startWave"});
  assert.strictEqual(state.bossExchangeUnlocked,false,"startWave re-locks exchange");
}

// Boss skipped → next stage enemies harder
{
  const state=startSession("coop");
  state.phase="battle";
  state.bossPending=true;
  state.bossSpawned=true;
  state.bossKilled=true;
  state.spawned=20;
  state.enemies=[];
  step(state,0.01);
  assert.strictEqual(state.bossSkipped,false,"boss killed → no skip");
  const normalHp=makeEnemy(1,state.nextId,state.rng,PATH,false).hpMax;
  state.bossSkipped=true;
  const penaltyHp=makeEnemy(1,state.nextId,state.rng,PATH,true).hpMax;
  assert(penaltyHp>normalHp,"penalty enemy has more HP");
  const normalDef=makeEnemy(1,state.nextId,state.rng,PATH,false).def;
  const penaltyDef=makeEnemy(1,state.nextId,state.rng,PATH,true).def;
  assert(penaltyDef>normalDef,"penalty enemy has more defense");
}

{
  const state=startSession("coop");
  state.trays.a=[
    require("../shared/game-engine").makeTroop(1,"a",state.nextId,state.rng,"gun"),
    require("../shared/game-engine").makeTroop(1,"a",state.nextId,state.rng,"tank"),
  ];
  const first=state.trays.a[0],second=state.trays.a[1];
  state.upgradePoints.a=10;
  command(state,"a",{type:"deploy",troopId:first.id,targetSlot:0});
  command(state,"a",{type:"deploy",troopId:second.id,targetSlot:1});
  command(state,"a",{type:"merge",troopId:first.id,targetSlot:1});
  const merged=state.slots[1];
  assert.strictEqual(merged.level,2);
  assert.ok(TROOP_TYPES.some(type=>type.key===merged.typeKey));
  const mergedBase=makeTroop(1,"a",state.nextId,state.rng,merged.typeKey);
  assert.ok(merged.dmg>mergedBase.dmg && merged.range>=mergedBase.range && merged.rate>mergedBase.rate);
  assert.strictEqual(merged.weaponLevel,0);
  assert.strictEqual(state.slots[0],null);
}

{
  const state=createSession(["boss-test"],777,"coop");
  const boss=makeBoss(1,state.nextId,state.rng,PATH);
  assert.strictEqual(boss.hpMax,76*(BOSS_HP_BASE_MUL+BOSS_HP_MUL_PER_LEVEL),"Boss HP multiplier mismatch");
  assert.strictEqual(boss.def,BOSS_DEFENSE_BASE+BOSS_DEFENSE_PER_LEVEL,"Boss defense bonus mismatch");
  assert.strictEqual(boss.speed,Math.min(46*BOSS_SPEED_MULTIPLIER,46+BOSS_SPEED_FLAT_BONUS),"Boss speed mismatch");
  const ps={enemies:[boss],killed:0,effects:[],bullets:[],beams:[],clouds:[],mines:[],path:PATH,_nextId:state.nextId,_rng:state.rng,_owner:state};
  const troop=makeTroop(1,"boss-test",state.nextId,state.rng,"tank");
  troop.range=10;
  const farSlot={x:520,y:860};
  troop.cd=0;
  ps.slots=[troop]; ps._slotMeta=[farSlot]; ps.spawned=20; ps.spawnAcc=0; ps.crystals=10; ps.pathLen=PATH_LEN; ps.bossSpawned=true;
  stepPath(ps,0.01,state);
  assert(troop.cd>0,"out-of-range Boss was not globally targeted");
  const normal=makeTestEnemy("normal-far",0,0);
  normal.x=70; normal.y=40;
  ps.enemies=[normal]; troop.cd=0;
  stepPath(ps,0.01,state);
  assert(troop.cd<=0,"out-of-range normal enemy ignored range rules");
  ps.enemies=[boss]; boss.dead=false; boss.hp=100;
  damageEnemy(ps,boss,1);
  // Boss 防御改为关卡感知（25+lv×2）后：1 点直伤按防御公式约 0.41，仍受 0.35 下限保护
  assert(Math.abs((100-boss.hp)-Math.max(0.35,1*1.35/(1+boss.def*0.085)))<1e-9,"direct damage defense math changed");
  boss.dead=false; boss.hp=100;
  damageEnemy(ps,boss,1,1,false);
  assert(100-boss.hp>0 && 100-boss.hp<=Math.max(0.35,1*1.35/(1+boss.def*0.085))+1e-9,"continuous damage floor was incorrectly applied");
  boss.dead=false; boss.hp=100; troop.style="cone"; troop.cd=0;
  stepPath(ps,0.01,state);
  assert(boss.hp<100,"short-range style failed to damage a distant Boss");
}

// Solo parity: chain damage does not fall off between hops.
{
  const state=startSession("coop");
  const troop=makeTroop(1,"a",state.nextId,state.rng,"tesla");
  troop.range=100; troop.chain=3; troop.chainR=50; troop.dmg=10; troop.rate=1; troop.cd=0;
  const enemies=[makeTestEnemy("chain-1",10,0),makeTestEnemy("chain-2",40,0),makeTestEnemy("chain-3",70,0),makeTestEnemy("chain-4",130,0)];
  const ps={enemies,slots:[troop],_slotMeta:[{x:0,y:0}],path:[{x:0,y:0},{x:200,y:0}],pathLen:200,spawned:20,spawnAcc:0,crystals:10,
    bullets:[],beams:[],clouds:[],mines:[],effects:[],_nextId:state.nextId,_rng:state.rng,_owner:state};
  stepPath(ps,0.01,state);
  assert.strictEqual(enemies[0].hp,86.5,"chain first hop damage changed");
  assert.strictEqual(enemies[1].hp,86.5,"chain second hop must use full damage");
  assert.strictEqual(enemies[2].hp,86.5,"chain third hop must use full damage");
  assert.strictEqual(enemies[3].hp,100,"chain exceeded its hop radius");
}

// Solo parity: sniper and heavy projectile lifetimes match Godot timing.
{
  const state=startSession("coop");
  for(const [typeKey,style,expectedLife] of [["sniper","sniper",0.05],["tank","heavy",0.2]]){
    const troop=makeTroop(1,"a",state.nextId,state.rng,typeKey);
    troop.range=100; troop.dmg=10; troop.rate=1; troop.cd=0;
    const target=makeTestEnemy(`${style}-target`,40,0);
    const ps={enemies:[target],slots:[troop],_slotMeta:[{x:0,y:0}],path:[{x:0,y:0},{x:200,y:0}],pathLen:200,spawned:20,spawnAcc:0,crystals:10,
      bullets:[],beams:[],clouds:[],mines:[],effects:[],_nextId:state.nextId,_rng:state.rng,_owner:state};
    stepPath(ps,0.01,state);
    assert(ps.bullets.length>0,`${style} must remain a projectile until impact`);
    assert(ps.bullets.every(b=>Math.abs(b.maxLife-expectedLife)<1e-9),`${style} projectile lifetime changed`);
  }
}

// Tactical bonds are authoritative and visible to every viewer.
{
  const state=startSession("coop");
  const fireTroops=[
    makeTroop(1,"a",state.nextId,state.rng,"cannon"),
    makeTroop(1,"a",state.nextId,state.rng,"flame"),
    makeTroop(1,"a",state.nextId,state.rng,"laser"),
  ];
  for(const t of fireTroops){ t.element="fire"; }
  state.trays.a=fireTroops.slice();
  for(let i=0;i<fireTroops.length;i++){
    command(state,"a",{type:"deploy",troopId:fireTroops[i].id,targetSlot:i});
  }
  assert.strictEqual(state.bonds.fire,1,"coop fire bond was not recomputed");
  const coopView=publicState(state,"a");
  assert.strictEqual(coopView.bonds.fire,1,"owner snapshot omitted coop bonds");
  assert.strictEqual(publicState(state,"b").bonds.fire,1,"peer snapshot omitted shared coop bonds");
  assert(Math.abs(coopView.slots[0].damageFinal/state.slots[0].dmg-1.20)<1e-9,"coop bond damage was serialized more than once");
}

// Independent paths must keep bond effects and snapshots isolated per player.
{
  const state=startSession("independent");
  const fireTroops=[
    makeTroop(1,"a",state.nextId,state.rng,"cannon"),
    makeTroop(1,"a",state.nextId,state.rng,"flame"),
    makeTroop(1,"a",state.nextId,state.rng,"laser"),
  ];
  for(const t of fireTroops){ t.element="fire"; }
  state.trays.a=fireTroops.slice();
  state.trays.b=[makeTroop(1,"b",state.nextId,state.rng,"sniper")];
  for(let i=0;i<fireTroops.length;i++){
    command(state,"a",{type:"deploy",troopId:fireTroops[i].id,targetSlot:i});
  }
  command(state,"b",{type:"deploy",troopId:state.trays.b[0].id,targetSlot:0});
  assert.strictEqual(state.paths[0].bonds.fire,1,"independent path bond was not recomputed");
  assert.strictEqual(state.paths[1].bonds.fire,0,"independent paths leaked fire bond state");
  const ownerView=publicState(state,"a");
  const peerView=publicState(state,"b");
  assert.strictEqual(ownerView.mode,"independent","independent mode missing from snapshot");
  assert.strictEqual(ownerView.bonds.fire,1,"viewer path bond missing from snapshot");
  assert.strictEqual(peerView.bonds.fire,0,"peer received another path's bond");
  assert.strictEqual(ownerView.pathViews[0].bonds.fire,1,"path view omitted its bond");
  assert.strictEqual(ownerView.pathViews[1].bonds.fire,0,"path view leaked another path's bond");
  assert(Math.abs(ownerView.slots[0].damageFinal/state.paths[0].slots[0].dmg-1.20)<1e-9,"independent bond damage was serialized more than once");
}

// Elements are fully randomized for troops, enemies and bosses (fire/ice/shock/nature).
{
  const state=startSession("coop");
  const troopEls=new Set(), enemyEls=new Set(), bossEls=new Set();
  for(let i=0;i<12;i++){
    troopEls.add(makeTroop(1,"a",state.nextId,state.rng,"cannon").element);
    enemyEls.add(makeEnemy(1,state.nextId,state.rng,PATH).element);
  }
  for(let i=0;i<8;i++) bossEls.add(makeBoss(1,state.nextId,state.rng,PATH).element);
  for(const el of troopEls) assert(ELEMENTS.includes(el),"troop element out of set: "+el);
  for(const el of enemyEls) assert(ELEMENTS.includes(el),"enemy element out of set: "+el);
  for(const el of bossEls) assert(ELEMENTS.includes(el),"boss element out of set: "+el);
  assert(troopEls.size>=2,"troop elements are not randomized");
  assert(enemyEls.size>=2,"enemy elements are not randomized");
  assert(bossEls.size>=2,"boss elements are not randomized");
  // Re-rolling on merge yields a valid element too.
  const merged=makeTroop(2,"a",state.nextId,state.rng,"gun");
  assert(ELEMENTS.includes(merged.element),"merged troop element out of set: "+merged.element);
}

{
  // 新十二羁绊：hydro（火+冰各3）/bulwark（土+金各3）/gale（风+木各3）组合判定
  const {computeBonds,damageEnemy}=require("../shared/game-engine");
  const mk=(el)=>({element:el});
  const hydro=computeBonds([mk("fire"),mk("fire"),mk("fire"),mk("ice"),mk("ice"),mk("ice")]);
  assert.strictEqual(hydro.hydro,1,"fire+ice at 3 should activate hydro");
  const notEnough=computeBonds([mk("fire"),mk("fire"),mk("ice"),mk("ice")]);
  assert.strictEqual(notEnough.hydro,0,"2 each must not activate hydro");
  const bulwark=computeBonds([{typeKey:"miner"},{typeKey:"miner"},{typeKey:"miner"},{typeKey:"tank"},{typeKey:"tank"},{typeKey:"tank"}]);
  assert.strictEqual(bulwark.bulwark,1,"earth+metal at 3 should activate bulwark");
  const gale=computeBonds([{typeKey:"plane"},{typeKey:"plane"},{typeKey:"plane"},mk("ice"),mk("ice"),mk("ice")]);
  assert.strictEqual(gale.gale,1,"wind+wood at 3 should activate gale");
  const prism=computeBonds([mk("fire"),mk("fire"),mk("fire"),mk("ice"),mk("ice"),mk("ice"),mk("shock"),mk("shock"),mk("shock"),mk("nature"),mk("nature"),mk("nature")]);
  assert.strictEqual(prism.prism,1,"four elements at 3 should activate prism");

  const state=startSession("coop");
  const enemy={id:"chain-target",hpMax:1000,hp:1000,def:0,dead:false,slowMul:1,shockTimer:0,vulnerableTimer:0,element:"nature"};
  const ps={_owner:{bonds:{shock:1,fire:0},coopSkills:{}},killed:0};
  damageEnemy(ps,enemy,10,1,false,null);
  assert(enemy.hp<1000,"shock bond all-attr damage must apply once in damageEnemy");
}

{
  // 虫巢督军：晋升门槛、光环提速与解除、击杀金币奖励、序列化字段
  const {makeEnemy,stepPath,damageEnemy,publicState}=require("../shared/game-engine");
  const {OVERLORD_CHANCE_LEVEL,OVERLORD_AURA_RADIUS,OVERLORD_AURA_SPEED_MUL,OVERLORD_HP_MUL,OVERLORD_DEF_BONUS,OVERLORD_BODY_R_MUL,OVERLORD_COIN_REWARD}=require("../shared/game-types");
  const state=startSession("coop");
  state.phase="battle";
  let idSeq=0;
  const nextId=()=>"ov"+(++idSeq);
  const mkEnemy=(lv)=>makeEnemy(lv,nextId,state.rng,PATH);

  // 第 1 关不晋升；第 3 关出现督军且属性按倍率强化
  assert.strictEqual(mkEnemy(1).isOverlord,false,"level 1 must never promote overlord");
  let lords=0, normals=0, lord=null, normal=null;
  for(let i=0;i<400 && (lords<3||normals<3);i++){
    const e=mkEnemy(3);
    if(e.isOverlord){ lords++; if(!lord) lord=e; }
    // 对比基准用无词缀的普通怪（armored 词缀会抬高 def 干扰加成断言）
    else if(!e.isQueen && !e.affix){ normals++; if(!normal) normal=e; }
  }
  assert(lords>0,"level 3 spawns must include overlord within 400 rolls");
  assert(normal,"level 3 spawns include affix-free normal enemies");
  assert(lord.hpMax>normal.hpMax,"overlord hp must exceed normal");
  assert(lord.def-normal.def>=OVERLORD_DEF_BONUS,"overlord def bonus applies");
  assert(lord.bodyR>normal.bodyR,"overlord bodyR scales by "+OVERLORD_BODY_R_MUL);
  assert(lord.hpMax<=Math.round(normal.hpMax*OVERLORD_HP_MUL*1.6),"overlord hp stays in expected band");

  // 光环：半径内友军被标记并按 1.35 倍移速前进；半径外与督军自身不受影响
  const ps={
    _owner:state, enemies:[], bullets:[], beams:[], clouds:[], mines:[], effects:[],
    slots:[], spawned:99, killed:0, spawnAcc:0, spawnDelay:0, bossSpawned:false,
    crystals:10, crystalsMax:10, path:PATH, pathLen:PATH_LEN, retaliateCd:0, _lost:false,
  };
  const arenaLord=mkEnemy(3); arenaLord.isOverlord=true; arenaLord.x=300; arenaLord.y=400; arenaLord.dist=500;
  const nearBug=mkEnemy(3); nearBug.isOverlord=false; nearBug.x=300+60; nearBug.y=400; nearBug.dist=500;
  const farBug=mkEnemy(3); farBug.isOverlord=false; farBug.x=300+200; farBug.y=400; farBug.dist=500;
  ps.enemies.push(arenaLord,nearBug,farBug);
  const d0=nearBug.dist;
  stepPath(ps,1.0,state);
  assert.strictEqual(nearBug.hiveBuffed,true,"bugs inside aura get hiveBuffed");
  assert.ok(Math.abs((nearBug.dist-d0)-nearBug.speed*OVERLORD_AURA_SPEED_MUL)<1e-6,"aura bug moves at 1.35x speed");
  assert.strictEqual(farBug.hiveBuffed,false,"bugs outside aura are untouched");
  assert.strictEqual(arenaLord.hiveBuffed||false,false,"overlord does not buff itself");

  // 督军死亡 → 光环解除
  arenaLord.dead=true;
  stepPath(ps,1.0,state);
  assert.strictEqual(nearBug.hiveBuffed,false,"aura dissipates when overlord dies");

  // 击杀奖励：每位玩家金币 +2（服务端无大招能量系统）
  const killState=startSession("coop");
  killState.phase="battle";
  const killPs={
    _owner:killState, enemies:[], bullets:[], beams:[], clouds:[], mines:[], effects:[],
    slots:[], spawned:99, killed:0, spawnAcc:0, spawnDelay:0, bossSpawned:false,
    crystals:10, crystalsMax:10, path:PATH, pathLen:PATH_LEN, retaliateCd:0, _lost:false,
  };
  let killSeq=0;
  const victim=makeEnemy(3,()=>"kv"+(++killSeq),killState.rng,PATH);
  victim.isOverlord=true; victim.hp=1;
  killPs.enemies.push(victim);
  const coinsBefore={};
  for(const pid of Object.keys(killState.trays||{})) coinsBefore[pid]=(killState.coins||{})[pid]||0;
  damageEnemy(killPs,victim,999,1,true,"fire");
  assert.strictEqual(victim.dead,true,"overlord dies to lethal damage");
  for(const pid of Object.keys(coinsBefore)){
    assert.strictEqual((killState.coins||{})[pid],coinsBefore[pid]+OVERLORD_COIN_REWARD,"overlord kill grants +"+OVERLORD_COIN_REWARD+" coins to "+pid);
  }

  // 序列化：公开状态携带 isOverlord / hiveBuffed（客户端渲染依赖）
  killPs.enemies.length=0;
  const liveLord=makeEnemy(3,()=>"sv"+(++killSeq),killState.rng,PATH);
  liveLord.isOverlord=true; liveLord.x=300; liveLord.y=400;
  killState.enemies=[liveLord]; killState.crystals=10; killState.spawned=0; killState.killed=0;
  const view=publicState(killState,"a");
  assert.strictEqual(view.enemies.length,1,"one enemy serialized");
  assert.strictEqual(view.enemies[0].isOverlord,true,"publicState carries isOverlord");
  assert.strictEqual(view.enemies[0].hiveBuffed,false,"publicState carries hiveBuffed");
}

{
  // 新机制：敌方合兵 / 虫后产卵 / Boss 激怒 / 序列化字段
  const {makeEnemy,makeBoss,stepPath,damageEnemy,publicState}=require("../shared/game-engine");
  const {ENEMY_MERGE_RADIUS,ENEMY_MERGE_MAX_TIER,ENEMY_MERGE_HP_MUL,ENEMY_MERGE_BODY_R_MUL,
         QUEEN_SPAWN_INTERVAL,QUEEN_SPAWN_COUNT,QUEEN_MAX_BABIES_ALIVE,QUEEN_COIN_REWARD,
         BOSS_ENRAGE_HP_RATIO,BOSS_ENRAGE_SPEED_MUL,BOSS_ENRAGE_DEF_ADD,BOSS_ENRAGE_GUARDS,posOnPath}=require("../shared/game-types");
  const state=startSession("coop");
  state.phase="battle"; state.level=5;
  let idSeq=0;
  const nextId=()=>"nm"+(++idSeq);
  const mkBug=(dist)=>{ const e=makeEnemy(5,nextId,state.rng,PATH); e.isOverlord=false; e.isQueen=false; e.dist=dist; const p=posOnPath(dist,PATH); e.x=p.x; e.y=p.y; return e; };
  const mkPs=(enemies)=>({ _owner:state, enemies, bullets:[], beams:[], clouds:[], mines:[], effects:[],
    slots:[], spawned:99, killed:0, spawnAcc:0, spawnDelay:0, bossSpawned:false,
    crystals:10, crystalsMax:10, path:PATH, pathLen:PATH_LEN, retaliateCd:0, _lost:false });

  // 敌方合兵：两只同种贴脸怪 → 一只大一阶融合体
  const a=mkBug(300), b=mkBug(300); b.kind=a.kind;
  const hpSum=a.hpMax+b.hpMax, bodyRMax=Math.max(a.bodyR,b.bodyR);
  const ps=mkPs([a,b]);
  stepPath(ps,0.1,state);
  const alive=ps.enemies.filter(e=>!e.dead);
  assert.strictEqual(alive.length,1,"two touching same-kind bugs merge into one");
  assert(alive[0].mergeTier===1,"merged bug carries mergeTier 1");
  assert(alive[0].hpMax>=hpSum*0.9,"merged hp near sum of both");
  assert(alive[0].bodyR>bodyRMax,"merged bodyR larger by "+ENEMY_MERGE_BODY_R_MUL);
  // 不同种不融合
  const c=mkBug(400), d=mkBug(400);
  while(d.kind===c.kind){ Object.assign(d,mkBug(400)); }
  const ps2=mkPs([c,d]);
  stepPath(ps2,0.1,state);
  assert.strictEqual(ps2.enemies.filter(e=>!e.dead).length,2,"different-kind bugs do not merge");
  // 督军免合
  const lord2=mkBug(500); lord2.isOverlord=true;
  const norm2=mkBug(500); norm2.kind=lord2.kind;
  const ps3=mkPs([lord2,norm2]);
  stepPath(ps3,0.1,state);
  assert.strictEqual(ps3.enemies.filter(e=>!e.dead).length,2,"overlord never merges");

  // 虫后产卵：间隔到点孵幼虫；幼虫不吃光环不计融合；击杀有金币
  const queen=mkBug(300); queen.isQueen=true; queen.hp=queen.hpMax=10000;
  const qps=mkPs([queen]);
  stepPath(qps,0.1,state);
  assert.strictEqual(qps.enemies.filter(e=>!e.dead&&e.isQueenBaby).length,0,"no babies before interval");
  stepPath(qps,QUEEN_SPAWN_INTERVAL+0.1,state);
  const babies=qps.enemies.filter(e=>!e.dead&&e.isQueenBaby);
  assert.strictEqual(babies.length,QUEEN_SPAWN_COUNT,"queen hatches "+QUEEN_SPAWN_COUNT+" babies at interval");
  if(babies.length){
    assert(babies[0].mergeTier===ENEMY_MERGE_MAX_TIER,"queen babies never merge");
    assert(babies[0].hpMax<=queen.hpMax,"babies are squishy");
  }
  const coinsBefore={};
  for(const pid of Object.keys(state.trays||{})) coinsBefore[pid]=(state.coins||{})[pid]||0;
  damageEnemy(qps,queen,1e9,1,true,"fire");
  assert.strictEqual(queen.dead,true,"queen dies to lethal damage");
  for(const pid of Object.keys(coinsBefore)){
    assert.strictEqual((state.coins||{})[pid],coinsBefore[pid]+QUEEN_COIN_REWARD,"queen kill grants +"+QUEEN_COIN_REWARD+" coins");
  }

  // Boss 激怒：半血触发一次性提速+防御+召唤护卫
  const bstate=startSession("coop");
  bstate.phase="battle"; bstate.level=5;
  let bid=0; const bnext=()=>"bs"+(++bid);
  const boss=makeBoss(5,bnext,bstate.rng,PATH);
  boss.dist=300; const bp=posOnPath(300,PATH); boss.x=bp.x; boss.y=bp.y;
  const bps=mkPs([boss]); bps._owner=bstate;
  const speedBefore=boss.speed, defBefore=boss.def;
  stepPath(bps,0.1,bstate);
  assert.strictEqual(boss.enraged||false,false,"full-hp boss not enraged");
  boss.hp=boss.hpMax*0.3;
  stepPath(bps,0.1,bstate);
  assert.strictEqual(boss.enraged,true,"half-hp boss enrages");
  assert(boss.speed>speedBefore,"enraged boss speeds up");
  assert(boss.def>defBefore,"enraged boss gains defense");
  assert.strictEqual(bps.enemies.filter(e=>!e.dead&&!e.isBoss).length,BOSS_ENRAGE_GUARDS,"enrage summons "+BOSS_ENRAGE_GUARDS+" guards");
  boss.hp=boss.hpMax*0.1;
  stepPath(bps,0.1,bstate);
  assert.strictEqual(bps.enemies.filter(e=>!e.dead&&!e.isBoss).length,BOSS_ENRAGE_GUARDS,"enrage triggers exactly once");

  // 序列化：公开状态带新字段
  bps.enemies.length=0;
  const liveQueen=mkBug(300); liveQueen.isQueen=true; liveQueen.x=300; liveQueen.y=400;
  bstate.enemies=[liveQueen]; bstate.crystals=10; bstate.spawned=0; bstate.killed=0;
  const view=publicState(bstate,"a");
  assert.strictEqual(view.enemies.length,1,"one enemy serialized");
  assert.strictEqual(view.enemies[0].isQueen,true,"publicState carries isQueen");
  assert.strictEqual(typeof view.enemies[0].mergeTier,"number","publicState carries mergeTier");
}

console.log("ENGINE REGRESSION OK",{
  targetSlotModes:2,
  lossBranches:3,
  sweptShotgun:true,
  upgrades:true,
  globalWeaponUpgrade:true,
  variedTroops:true,
});

"use strict";

// 双人对战（versus）专项回归：走真实 transport（WebSocket）验证
// 建房(versus) → 加入 → 部署 → 开战 → 战斗步进 → 胜负与金币结算
const http = require("http");
const {attachTransport} = require("./transport");

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function main(){
  const server = http.createServer(()=>{});
  const {wss} = attachTransport(server, false);
  await new Promise(resolve=>server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const url = `ws://127.0.0.1:${port}`;

  const fails = [];
  const check = (name, cond)=>{
    console.log(`[${cond?"PASS":"FAIL"}] ${name}`);
    if(!cond) fails.push(name);
  };

  function client(name){
    return new Promise((resolve,reject)=>{
      const ws = new (require("ws"))(url);
      const bag = {ws, name, msgs:[], byType:{}};
      ws.on("message", raw=>{
        const msg = JSON.parse(raw.toString());
        bag.msgs.push(msg);
        if(!bag.byType[msg.type]) bag.byType[msg.type]=[];
        bag.byType[msg.type].push(msg);
      });
      ws.once("error", reject);
      ws.once("open", ()=>resolve(bag));
    });
  }
  const send = (c, type, payload={})=>c.ws.send(JSON.stringify({type, ...payload}));
  const waitMsg = async (c, type, label, timeoutMs=4000)=>{
    const start = Date.now();
    while(!c.byType[type] && Date.now()-start < timeoutMs) await wait(20);
    if(!c.byType[type]) throw new Error(`等待 ${label||type} 超时`);
    return c.byType[type];
  };

  try{
    const a = await client("玩家A");
    const b = await client("玩家B");
    await Promise.all([waitMsg(a,"hello"), waitMsg(b,"hello")]);

    // A 建 versus 房
    send(a, "create", {name:"玩家A", mode:"versus"});
    await waitMsg(a, "identity");
    await waitMsg(a, "state");
    const roomCode = a.byType.room[a.byType.room.length-1].roomCode;
    check("建房成功 mode=versus", a.byType.room[a.byType.room.length-1].gameMode === "versus");

    // versus 房间限 2 人：A 建 + B 加入后，第三人应被拒
    send(b, "join", {code: roomCode, name:"玩家B"});
    await waitMsg(b, "identity");
    await waitMsg(b, "state");
    check("B 加入成功", (b.byType.room[b.byType.room.length-1].players||[]).length === 2);

    const c = await client("路人C");
    await waitMsg(c, "hello");
    send(c, "join", {code: roomCode, name:"路人C"});
    await waitMsg(c, "error");
    check("第三人加入被拒", c.byType.error[c.byType.error.length-1].message === "房间已满");

    const aState = a.byType.state[a.byType.state.length-1].state;
    const bState = b.byType.state[b.byType.state.length-1].state;
    check("双方各 7 张待命兵", aState.tray.length === 7 && bState.tray.length === 7);
    check("双方各 10 升级点", aState.upgradePoints.me === 10 && bState.upgradePoints.me === 10);
    check("开局送 5 金币", aState.coins.me === 5 && bState.coins.me === 5);
    check("布阵阶段 prep", aState.phase === "prep" && bState.phase === "prep");
    check("我的 pathIndex 归属", aState.pathIndex === 0 && bState.pathIndex === 1);
    check("arenaDeployed 双方 0", aState.arenaDeployed.me === 0 && aState.arenaDeployed.foe === 0);

    // 双方准备 + A 开始游戏（之后才能布阵）
    send(a, "ready", {value:true}); send(b, "ready", {value:true});
    await wait(300);
    send(a, "start");
    const startDeadline = Date.now() + 4000;
    let started = null;
    while(Date.now() < startDeadline){
      await wait(50);
      const s = a.byType.state[a.byType.state.length-1].state;
      if(s.started === true){ started = s; break; }
    }
    check("开局进入 prep", !!started && started.phase === "prep");

    // 各自部署 3 个兵
    const myTray = started.tray;
    for(let i = 0; i < 3; i++){
      send(a, "deploy", {troopId: myTray[i].id, targetSlot: i});
      await wait(120);
    }
    const bTray = b.byType.state[b.byType.state.length-1].state.tray;
    for(let i = 0; i < 3; i++){
      send(b, "deploy", {troopId: bTray[i].id, targetSlot: i});
      await wait(120);
    }
    await wait(300);
    const aErrs = a.byType.error ? a.byType.error.map(e=>e.message).join("|") : "";
    if(aErrs) console.log("[INFO] A errors:", aErrs);
    const bErrs = b.byType.error ? b.byType.error.map(e=>e.message).join("|") : "";
    if(bErrs) console.log("[INFO] B errors:", bErrs);
    const aMid = a.byType.state[a.byType.state.length-1].state;
    check("A 上阵计数 3", aMid.arenaDeployed.me === 3);
    check("A 阵位 3（自己 slots）", aMid.slots.filter(Boolean).length === 3);
    check("对方阵型摘要可见", (aMid.foeSlots[0]||{}).slots ? aMid.foeSlots[0].slots.filter(Boolean).length === 3 : false);

    // B 开战（非房主也能开战）
    send(b, "startWave");
    const deadline = Date.now() + 6000;
    let battle = null;
    while(Date.now() < deadline){
      await wait(50);
      const s = a.byType.state[a.byType.state.length-1].state;
      if(s.phase === "battle"){ battle = s; break; }
    }
    const bErrs2 = b.byType.error ? b.byType.error.map(e=>e.message).join("|") : "";
    if(!battle && bErrs2) console.log("[INFO] B startWave errors:", bErrs2);
    check("B 开战成功（非房主可开战）", !!battle);

    // 战斗步进：等 units 出现并打完
    const battleDeadline = Date.now() + 60000;
    let finalState = null;
    while(Date.now() < battleDeadline){
      await wait(200);
      const s = a.byType.state[a.byType.state.length-1].state;
      if(s.over){ finalState = s; break; }
    }
    check("战斗分出胜负", !!finalState);
    if(finalState){
      check("结算 result 有效", ["win","lose","draw"].includes(finalState.result));
      check("金币结算发放", (finalState.coins.me > 5) || finalState.result === "draw");
      check("战斗单位快照可用", Array.isArray(finalState.arenaUnits));
    }

    // versus 房间禁止 Boss/事件/技能
    const fresh = a.byType.state[a.byType.state.length-1].state;
    check("对战结果已锁定（over）", fresh.over === true);

    [a, b, c].forEach(cl=>{ try{ cl.ws.close(); }catch(_){}});
  }catch(e){
    fails.push("异常: " + e.message);
    console.log("[FAIL] 异常:", e.message);
  }

  // 断线重连场景
  const resumeFails = await resumeScenario(url, check);
  fails.push(...resumeFails);

  await wait(200);
  wss.close();
  server.close();
  console.log(`=== VERSUS 回归: ${fails.length === 0 ? "全部通过" : fails.length + " 项失败"} ===`);
  process.exit(fails.length === 0 ? 0 : 1);
}

// 断线重连场景：战斗中掉线 → resume 恢复座位 → 战斗继续打完
async function resumeScenario(url, check){
  const fails = [];
  function client(name){
    return new Promise((resolve,reject)=>{
      const ws = new (require("ws"))(url);
      const bag = {ws, name, msgs:[], byType:{}};
      ws.on("message", raw=>{
        const msg = JSON.parse(raw.toString());
        bag.msgs.push(msg);
        if(!bag.byType[msg.type]) bag.byType[msg.type]=[];
        bag.byType[msg.type].push(msg);
      });
      ws.once("error", reject);
      ws.once("open", ()=>resolve(bag));
    });
  }
  const send = (c, type, payload={})=>c.ws.send(JSON.stringify({type, ...payload}));
  const lastState = c=>c.byType.state[c.byType.state.length-1].state;

  try{
    const a = await client("甲");
    const b = await client("乙");
    send(a, "create", {name:"甲", mode:"versus"});
    await new Promise(r=>setTimeout(r, 250));
    const roomToken = a.byType.identity[a.byType.identity.length-1].roomToken;
    const room = a.byType.room[a.byType.room.length-1];
    send(b, "join", {code: room.roomCode, name:"乙"});
    await new Promise(r=>setTimeout(r, 350));
    send(a, "ready", {value:true}); send(b, "ready", {value:true});
    await new Promise(r=>setTimeout(r, 350));
    send(a, "start");
    await new Promise(r=>setTimeout(r, 400));
    const st = lastState(a);
    for(let i = 0; i < 3; i++){
      send(a, "deploy", {troopId: st.tray[i].id, targetSlot: i});
      send(b, "deploy", {troopId: lastState(b).tray[i].id, targetSlot: i});
    }
    await new Promise(r=>setTimeout(r, 500));
    send(b, "startWave");
    await new Promise(r=>setTimeout(r, 800));
    check("重连场景：战斗已开始", lastState(a).phase === "battle");

    // B 战斗中掉线
    const bIdentity = b.byType.identity[b.byType.identity.length-1];
    b.ws.close();
    await new Promise(r=>setTimeout(r, 300));

    // B 用 resumeToken 重连回原房间
    const b2 = await client("乙");
    send(b2, "resume", {roomToken, playerId: bIdentity.playerId, resumeToken: bIdentity.resumeToken});
    await new Promise(r=>setTimeout(r, 600));
    check("重连恢复座位", b2.byType.identity && b2.byType.identity.length > 0 && !b2.byType.error);
    check("重连后收到战斗快照", !!lastState(b2) && lastState(b2).phase === "battle");

    // 战斗继续进行至结算
    const deadline = Date.now() + 60000;
    let finalState = null;
    while(Date.now() < deadline){
      await new Promise(r=>setTimeout(r, 200));
      const s = lastState(a);
      if(s.over){ finalState = s; break; }
    }
    check("重连后战斗正常打完", !!finalState && ["win","lose","draw"].includes(finalState.result));

    [a, b2].forEach(cl=>{ try{ cl.ws.close(); }catch(_){}});
  }catch(e){
    fails.push("重连异常: " + e.message);
    console.log("[FAIL] 重连异常:", e.message);
  }
  return fails;
}

main().catch(e=>{ console.error("VERSUS FAIL", e); process.exit(1); });

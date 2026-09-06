"use strict";

const crypto = require("crypto");
const QRCode = require("qrcode");
const authService = require("./services/auth");
const platformAuth = require("./services/platform-auth");
const mailer = require("./services/mailer");
const emailRepo = require("./repositories/email-repo");
const profileRepo = require("./repositories/profile-repo");
const statsRepo = require("./repositories/stats-repo");
const progressRepo = require("./repositories/progress-repo");
const dailyRepo = require("./repositories/daily-repo");
const walletRepo = require("./repositories/wallet-repo");
const db = require("./db");

const MAX_BODY = 4096;
const RATE_WINDOW_MS = 60000;
const RATE_MAX = 20;
const rateMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  let entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    entry = { start: now, count: 0 };
    rateMap.set(ip, entry);
  }
  entry.count++;
  return entry.count <= RATE_MAX;
}

function parseCookies(raw) {
  const map = {};
  if (!raw) return map;
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    map[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return map;
}

function extractBearer(req) {
  const header = req.headers["authorization"];
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  const cookies = parseCookies(req.headers.cookie);
  return cookies["auth_token"] || null;
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let length = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      length += chunk.length;
      if (length > MAX_BODY) { req.destroy(); return resolve(null); }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch (_) { resolve(null); }
    });
    req.on("error", () => resolve(null));
  });
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function errorResponse(res, status, code, message) {
  json(res, status, { code, message });
}

async function apiRouter(req, res) {
  const ip = req.socket.remoteAddress || "unknown";
  if (!rateLimit(ip)) return errorResponse(res, 429, "rate_limited", "请求过于频繁");

  const path = (req.url || "").split("?")[0];
  const method = (req.method || "GET").toUpperCase();

  try {
    if (method === "POST" && path === "/api/auth/guest") {
      const body = await parseBody(req);
      if (!body) return errorResponse(res, 400, "invalid_body", "请求格式错误");
      const result = await authService.guestLogin(body.displayName);
      setAuthCookie(res, result.token);
      return json(res, 200, { user: sanitizeUser(result.user), token: result.token });
    }

    if (method === "POST" && path === "/api/auth/register") {
      const body = await parseBody(req);
      if (!body || !body.email || !body.password) return errorResponse(res, 400, "invalid_body", "请提供邮箱和密码");
      if (body.password.length < 8) return errorResponse(res, 400, "weak_password", "密码至少8位");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return errorResponse(res, 400, "invalid_email", "邮箱格式不正确");
      try {
        const result = await authService.register(body.email, body.password, body.displayName);
        setAuthCookie(res, result.token);
        return json(res, 201, { user: sanitizeUser(result.user), token: result.token });
      } catch (e) {
        if (e.status === 409) return errorResponse(res, 409, e.code, "该邮箱已被注册");
        throw e;
      }
    }

    if (method === "POST" && path === "/api/auth/login") {
      const body = await parseBody(req);
      if (!body || !body.email || !body.password) return errorResponse(res, 400, "invalid_body", "请提供邮箱和密码");
      try {
        const result = await authService.login(body.email, body.password);
        setAuthCookie(res, result.token);
        return json(res, 200, { user: sanitizeUser(result.user), token: result.token });
      } catch (e) {
        if (e.status === 401) return errorResponse(res, 401, "invalid_credentials", "邮箱或密码错误");
        throw e;
      }
    }

    if (method === "POST" && path === "/api/auth/upgrade") {
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const body = await parseBody(req);
      if (!body || !body.email || !body.password) return errorResponse(res, 400, "invalid_body", "请提供邮箱和密码");
      if (!user.guest) return errorResponse(res, 400, "not_guest", "当前不是游客账号");
      try {
        const result = await authService.upgradeGuest(user.id, body.email, body.password, body.displayName);
        return json(res, 200, { user: sanitizeUser(result.user) });
      } catch (e) {
        if (e.status === 409) return errorResponse(res, 409, e.code, "该邮箱已被注册");
        throw e;
      }
    }

    if (method === "POST" && path === "/api/auth/logout") {
      const token = extractBearer(req);
      if (token) await authService.logout(token);
      clearAuthCookie(res);
      return json(res, 200, { ok: true });
    }

    if (method === "GET" && path === "/api/me") {
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      return json(res, 200, sanitizeUser(user));
    }

    if (method === "POST" && path === "/api/me/name") {
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const body = await parseBody(req);
      if (!body || !body.displayName) return errorResponse(res, 400, "invalid_body", "请提供昵称");
      const updated = await authService.updateDisplayName(user.id, body.displayName);
      return json(res, 200, { user: sanitizeUser(updated) });
    }

    if (method === "GET" && path === "/api/me/progress") {
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const p = await progressRepo.getOrCreate(user.id);
      if (!p) return json(res, 200, { gamesPlayed: 0, gamesWon: 0, highestLevel: 1 });
      return json(res, 200, {
        gamesPlayed: p.games_played || 0,
        gamesWon: p.games_won || 0,
        highestLevel: p.highest_level || 1,
      });
    }

    if (method === "POST" && path === "/api/progress/solo") {
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const body = await parseBody(req);
      if (!body || !body.idempotentKey) return errorResponse(res, 400, "invalid_body", "缺少上报凭证");
      await progressRepo.recordSoloResult(user.id, body.level || 1, !!body.won, body.idempotentKey);
      return json(res, 200, { ok: true });
    }

    if (method === "GET" && path === "/api/qr") {
      // 官网下载二维码：?text=<url>，返回 PNG（公开只读）
      const query = new URL(req.url, "http://localhost").searchParams;
      const text = String(query.get("text") || "").slice(0, 512);
      if (!text) return errorResponse(res, 400, "invalid_body", "缺少 text 参数");
      const buf = await QRCode.toBuffer(text, { width: 320, margin: 1, color: { dark: "#1a1408", light: "#fffdf5" } });
      res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
      res.end(buf);
      return;
    }

    if (method === "GET" && path === "/api/codex") {
      // 官网图鉴：兵种 + 羁绊（公开只读，数据与游戏引擎同源，加兵自动跟上）
      const GameTypes = require("../shared/game-types");
      const troops = GameTypes.TROOP_TYPES.map(t => ({
        key: t.key, name: t.name, icon: t.icon, element: t.element || "",
        tag: t.tag || "", desc: t.desc || "", mode: t.mode || "single",
      }));
      const bondEffects = {
        fire: "全军攻击 +20%，25% 概率灼烧",
        ice: "全军生命 +25%，低血时每秒回 3%",
        nature: "全属性 +10%，每 5 秒再 +5%",
        shock: "全属性 +8%，攻击概率连锁弹跳",
        metal: "护甲减伤 20%，反弹 15% 伤害",
        water: "削弱目标攻速，附加持续伤害",
        earth: "防御 +25%，受击叠加反应装甲",
        wind: "攻速 +15%，击杀后攻速再 +30%",
        hydro: "灼烧伤害翻倍，削攻速概率升至 50%",
        bulwark: "反应装甲上限 10 层，反弹 25%",
        gale: "击杀攻速 Buff 6 秒，成长上限 5 层",
        prism: "全属性 +15%",
      };
      const bondReq = {
        fire: "火元素兵 3 / 5 / 7 个", ice: "冰元素兵 3 / 5 / 7 个",
        nature: "自然元素兵 3 / 5 / 7 个", shock: "电元素兵 3 / 5 / 7 个",
        metal: "重装系兵 3 / 5 / 7 个", water: "控场系兵 3 / 5 / 7 个",
        earth: "驻守系兵 3 / 5 / 7 个", wind: "迅击系兵 3 / 5 / 7 个",
        hydro: "火兵 3 + 木系兵 3", bulwark: "土系 3 + 金系 3",
        gale: "风系 3 + 木系 3", prism: "四元素各 3 个",
      };
      const bonds = GameTypes.BOND_IDS.map(id => ({
        id, name: GameTypes.BOND_NAMES[id] || id,
        req: bondReq[id] || "", effect: bondEffects[id] || "",
      }));
      return json(res, 200, { ok: true, troops, bonds, hiddenTroop: { name: "古神守卫", icon: "👁", desc: "远古文明的苏醒守卫，收集 60 枚虫核解锁" } });
    }

    if (method === "GET" && path === "/api/leaderboard") {
      // 公开只读接口：?mode=versus（对战胜场榜）| solo（单人最高关卡榜），各取前 50
      const query = new URL(req.url, "http://localhost").searchParams;
      const mode = query.get("mode") === "versus" ? "versus" : "solo";
      const list = await progressRepo.getLeaderboard(mode);
      return json(res, 200, { ok: true, mode, list });
    }

    if (method === "GET" && path === "/api/daily") {
      // 每日挑战：当日种子 + 我的最好成绩（种子全球统一，登录可选）
      const challenge = await dailyRepo.getOrCreateToday();
      let mine = null;
      const token = extractBearer(req);
      if (token) {
        try {
          const user = await authService.authenticate(token);
          mine = await dailyRepo.myResult(user.id, challenge.date);
        } catch (_) { /* 未登录只发种子 */ }
      }
      return json(res, 200, { ok: true, date: challenge.date, seed: challenge.seed, mine });
    }

    if (method === "POST" && path === "/api/daily/submit") {
      // 每日挑战成绩提交：一人一天一条（服务端幂等），保留当日最好成绩；游客不上榜
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      if (user.guest) return errorResponse(res, 403, "guest_forbidden", "游客成绩不上榜，注册正式账号参与每日排行");
      const body = await parseBody(req);
      if (!body || !Number.isFinite(Number(body.level))) return errorResponse(res, 400, "invalid_body", "成绩无效");
      const result = await dailyRepo.submitResult(user.id, Number(body.level), Number(body.crystals) || 0);
      const mine = await dailyRepo.myResult(user.id, result.date);
      return json(res, 200, { ok: true, ...result, mine });
    }

    if (method === "GET" && path === "/api/daily/leaderboard") {
      // 每日挑战当日排行榜（公开只读，前 50）
      const challenge = await dailyRepo.getOrCreateToday();
      const list = await dailyRepo.leaderboard(challenge.date);
      return json(res, 200, { ok: true, date: challenge.date, list });
    }

    if (method === "GET" && path === "/api/wallet") {
      // 金币钱包余额（登录即自动开户送初始金币）
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const wallet = await walletRepo.getOrCreate(user.id);
      return json(res, 200, { ok: true, coins: wallet.coins });
    }

    if (method === "POST" && path === "/api/wallet/spend") {
      // 开局扣费：幂等（同 idemKey 只扣一次），余额不足拒绝
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const body = await parseBody(req);
      if (!body || !body.idempotentKey) return errorResponse(res, 400, "invalid_body", "缺少上报凭证");
      const result = await walletRepo.spend(user.id, Number(body.amount) || 0, String(body.idempotentKey));
      if (!result.ok) return json(res, 200, { ok: false, error: result.error || "insufficient", coins: result.coins });
      return json(res, 200, result);
    }

    if (method === "POST" && path === "/api/ads/session") {
      // 看广告前领一次性凭据（看完凭据换奖励，防裸刷接口）；placement 决定奖励内容
      // 游客账号不开放广告激励（引导注册正式账号）
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      if (user.guest) return errorResponse(res, 403, "guest_forbidden", "游客账号不能看广告得金币，注册正式账号即可解锁");
      const body = await parseBody(req) || {};
      const session = await walletRepo.createAdSession(user.id, String(body.placement || "energy_refill"));
      if (!session.ok) return json(res, 200, { ok: false, error: session.error || "session_failed" });
      return json(res, 200, session);
    }

    if (method === "POST" && path === "/api/auth/platform") {
      // 平台登录（TapTap 等）：客户端 SDK 拿到 access_token 后交给服务端向平台验证。
      // 首次登录自动建正式账号并绑定；已有绑定直接发会话。
      const body = await parseBody(req);
      const provider = String((body && body.provider) || "");
      const accessToken = String((body && body.accessToken) || "");
      if (!accessToken) return errorResponse(res, 400, "invalid_body", "缺少平台凭证");
      if (!platformAuth.ALLOWED_PROVIDERS.includes(provider)) return errorResponse(res, 400, "unknown_provider", "不支持的平台");
      const identity = await platformAuth.verifyPlatformToken(provider, accessToken);
      const result = await authService.platformLogin(provider, identity.openid, identity.displayName);
      return json(res, 200, {
        ok: true,
        token: result.token,
        created: result.created,
        user: sanitizeUser(result.user),
      });
    }

    if (method === "POST" && path === "/api/auth/platform/bind") {
      // 已登录账号绑定平台身份（游客绑定即完成"升级"，进度保留）
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const body = await parseBody(req);
      const provider = String((body && body.provider) || "");
      const accessToken = String((body && body.accessToken) || "");
      if (!accessToken) return errorResponse(res, 400, "invalid_body", "缺少平台凭证");
      if (!platformAuth.ALLOWED_PROVIDERS.includes(provider)) return errorResponse(res, 400, "unknown_provider", "不支持的平台");
      const identity = await platformAuth.verifyPlatformToken(provider, accessToken);
      const result = await authService.bindPlatform(user.id, provider, identity.openid, identity.displayName);
      if (user.guest) {
        // 游客绑定平台 = 升级为正式账号（解锁广告奖励/上榜）
        const { rows } = await db.query(
          "UPDATE users SET guest = false, updated_at = NOW() WHERE id = $1 RETURNING guest",
          [user.id]
        );
        if (rows.length > 0) user.guest = false;
      }
      return json(res, 200, { ok: true, ...result, user: sanitizeUser(user) });
    }

    if (method === "GET" && path === "/api/auth/platform") {
      // 我的平台绑定列表
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const list = await authService.listIdentities(user.id);
      return json(res, 200, { ok: true, list });
    }

    if (method === "GET" && path === "/api/privacy") {
      const legal = require("./legal-pages");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(legal.PRIVACY_HTML);
      return;
    }

    if (method === "GET" && path === "/api/terms") {
      const legal = require("./legal-pages");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(legal.TERMS_HTML);
      return;
    }

    if (method === "POST" && path === "/api/profile/sync") {
      // 档案云同步：客户端提交本地档案，服务端合并（取最大/并集）后返回权威结果
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      const body = await parseBody(req) || {};
      const merged = await profileRepo.syncMerged(user.id, body);
      return json(res, 200, { ok: true, profile: merged });
    }

    if (method === "POST" && path === "/api/stats/batch") {
      // 埋点批量上报（登录可选：游客也上报）
      const token = extractBearer(req);
      let userId = null;
      try { const user = await authService.authenticate(token); userId = user.id; } catch (_) { /* 匿名事件 */ }
      const body = await parseBody(req) || {};
      const stored = await statsRepo.insertBatch(userId, body.events || []);
      return json(res, 200, { ok: true, stored });
    }

    if (method === "POST" && path === "/api/auth/email/code") {
      // 发送邮箱验证码（登录/注册/绑定通用；同邮箱 60 秒冷却）
      const body = await parseBody(req);
      const email = String((body && body.email) || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse(res, 400, "invalid_email", "邮箱格式不正确");
      if (await emailRepo.inCooldown(email)) return errorResponse(res, 429, "cooldown", "发送太频繁，1 分钟后再试");
      const code = require("crypto").randomInt(0, 1000000).toString().padStart(6, "0");
      await emailRepo.createCode(email, String((body && body.purpose) || "login"), code);
      await mailer.sendLoginCode(email, code);
      return json(res, 200, { ok: true, expiresInSec: 600, ...(mailer.isDevMode() ? { devCode: code } : {}) });
    }

    if (method === "POST" && path === "/api/auth/email/verify") {
      // 验证码校验：带游客 token 且是游客 → 绑定邮箱升级（进度保留）；否则登录即注册
      const body = await parseBody(req);
      const email = String((body && body.email) || "").trim().toLowerCase();
      const code = String((body && body.code) || "").trim();
      if (!email || !code) return errorResponse(res, 400, "invalid_body", "缺少邮箱或验证码");
      const check = await emailRepo.verifyCode(email, code);
      if (!check.ok) return json(res, 200, { ok: false, error: check.error, message: check.message });
      const bearer = extractBearer(req);
      let boundGuest = false;
      try {
        const current = await authService.authenticate(bearer);
        if (current.guest) {
          const result = await authService.bindGuestEmail(current.id, email);
          boundGuest = true;
          return json(res, 200, { ok: true, upgraded: true, user: sanitizeUser(result.user), token: bearer });
        }
      } catch (_) { /* 未登录或会话过期 → 走登录即注册 */ }
      const result = await authService.emailLoginOrRegister(email, String((body && body.displayName) || ""));
      return json(res, 200, { ok: true, created: result.created, token: result.token, user: sanitizeUser(result.user), boundGuest });
    }

    if (method === "POST" && path === "/api/auth/email/magic/send") {
      // 免密登录：发链接到邮箱，游戏侧持 requestId 轮询自动登录
      const body = await parseBody(req);
      const email = String((body && body.email) || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse(res, 400, "invalid_email", "邮箱格式不正确");
      if (await emailRepo.inCooldown(email)) return errorResponse(res, 429, "cooldown", "发送太频繁，1 分钟后再试");
      const magic = await emailRepo.createMagicRequest(email);
      const base = mailer.APP_PUBLIC_URL || "http://localhost:8787";
      const link = `${base}/api/auth/email/magic/consume?token=${magic.linkToken}`;
      await mailer.sendMagicLink(email, link);
      return json(res, 200, { ok: true, requestId: magic.requestId, expiresInSec: 600, ...(mailer.isDevMode() ? { devLink: link } : {}) });
    }

    if (method === "GET" && path.startsWith("/api/auth/email/magic/consume")) {
      // 浏览器点击邮件链接：确认登录（内联 HTML 页，无前端依赖）
      const query = new URL(req.url, "http://localhost").searchParams;
      const result = await emailRepo.approveMagicLink(String(query.get("token") || ""));
      const okHtml = '<meta charset="utf-8"><body style="background:#0a1008;color:#cbd5c5;font-family:sans-serif;text-align:center;padding-top:30vh"><h2 style="color:#7ee787">✔ 登录确认成功</h2><p>请回到游戏，会自动进入主菜单。</p></body>';
      const badHtml = '<meta charset="utf-8"><body style="background:#0a1008;color:#cbd5c5;font-family:sans-serif;text-align:center;padding-top:30vh"><h2 style="color:#f43f5e">链接无效或已过期</h2><p>请回到游戏重新发送登录邮件。</p></body>';
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(result ? okHtml : badHtml);
      return;
    }

    if (method === "POST" && path === "/api/auth/email/magic/poll") {
      // 游戏轮询免密确认状态；确认后登录即注册并返回会话
      const body = await parseBody(req);
      const requestId = String((body && body.requestId) || "");
      if (!requestId) return errorResponse(res, 400, "invalid_body", "缺少 requestId");
      const poll = await emailRepo.pollMagicRequest(requestId);
      if (poll.status !== "approved") return json(res, 200, { ok: true, status: "pending" });
      const result = await authService.emailLoginOrRegister(poll.email, null);
      return json(res, 200, { ok: true, status: "done", created: result.created, token: result.token, user: sanitizeUser(result.user) });
    }

    if (method === "POST" && path === "/api/ads/claim") {
      // 广告奖励领取：凭据单次有效；服务端为权威账本；游客不发放
      const token = extractBearer(req);
      let user;
      try { user = await authService.authenticate(token); } catch (e) { return errorResponse(res, e.status, e.code, e.message); }
      if (user.guest) return errorResponse(res, 403, "guest_forbidden", "游客账号不能领取广告奖励");
      const body = await parseBody(req);
      if (!body || !body.adToken) return errorResponse(res, 400, "invalid_body", "缺少广告凭据");
      const result = await walletRepo.claimAd(user.id, String(body.adToken));
      if (!result.ok) return json(res, 200, { ok: false, error: result.error || "claim_failed" });
      // coins 型广告位返回最新余额；其余类型由客户端按 rewardType 自行生效
      return json(res, 200, result);
    }

  } catch (e) {
    if (e.status) return errorResponse(res, e.status, e.code || "error", e.message);
    console.error("API error:", e.message);
    return errorResponse(res, 500, "internal", "服务器内部错误");
  }

  return errorResponse(res, 404, "not_found", "接口不存在");
}

function sanitizeUser(u) {
  return {
    id: u.id,
    displayName: u.display_name || "玩家",
    email: u.email || null,
    guest: !!u.guest,
    createdAt: u.created_at,
  };
}

function setAuthCookie(res, token) {
  res.setHeader("Set-Cookie", `auth_token=${token}; HttpOnly; SameSite=Lax; Max-Age=2592000; Path=/`);
}

function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", "auth_token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/");
}

module.exports = { apiRouter, parseCookies, extractBearer };

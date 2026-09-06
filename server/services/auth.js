"use strict";

const crypto = require("crypto");
const { promisify } = require("util");
const userRepo = require("../repositories/user-repo");
const sessionRepo = require("../repositories/session-repo");

const scrypt = promisify(crypto.scrypt);
const SCRYPT_VERSION = "v1";
const SCRYPT_N = 65536;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 128 * 1024 * 1024 };

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `scrypt$${SCRYPT_VERSION}$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

async function verifyPassword(storedHash, password) {
  const parts = storedHash.split("$");
  if (parts.length !== 7 || parts[0] !== "scrypt" || parts[1] !== SCRYPT_VERSION) return false;

  const [, , nText, rText, pText, saltHex, hashHex] = parts;
  if (nText !== String(SCRYPT_N) || rText !== String(SCRYPT_R) || pText !== String(SCRYPT_P)) return false;
  if (!/^[0-9a-f]{32}$/i.test(saltHex) || !/^[0-9a-f]{128}$/i.test(hashHex)) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length, SCRYPT_OPTIONS);
  return crypto.timingSafeEqual(expected, actual);
}

const authService = {
  async guestLogin(displayName) {
    const user = await userRepo.createGuest(displayName);
    const token = await sessionRepo.create(user.id);
    return { user, token };
  },

  async register(email, password, displayName) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw { status: 409, code: "email_taken", message: "该邮箱已被注册" };

    const hash = await hashPassword(password);
    const user = await userRepo.createEmailUser(email, hash, displayName);
    const token = await sessionRepo.create(user.id);
    return { user, token };
  },

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user || !user.password_hash) throw { status: 401, code: "invalid_credentials", message: "邮箱或密码错误" };

    let valid;
    try { valid = await verifyPassword(user.password_hash, password); } catch (_) { valid = false; }
    if (!valid) throw { status: 401, code: "invalid_credentials", message: "邮箱或密码错误" };

    await sessionRepo.revokeAllForUser(user.id);
    const token = await sessionRepo.create(user.id);
    return {
      user: { id: user.id, display_name: user.display_name, email: user.email, guest: user.guest, created_at: user.created_at },
      token,
    };
  },

  async upgradeGuest(userId, email, password, displayName) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw { status: 409, code: "email_taken", message: "该邮箱已被注册" };

    const hash = await hashPassword(password);
    const user = await userRepo.upgradeGuestToEmail(userId, email, hash, displayName);
    if (!user) throw { status: 400, code: "not_guest", message: "当前不是游客账号" };
    return { user };
  },

  async authenticate(token) {
    if (!token) throw { status: 401, code: "unauthorized", message: "未登录" };
    const user = await sessionRepo.validate(token);
    if (!user) throw { status: 401, code: "session_expired", message: "登录已过期，请重新登录" };
    return user;
  },

  async logout(token) {
    if (token) await sessionRepo.revoke(token);
  },

  async updateDisplayName(userId, displayName) {
    const user = await userRepo.updateDisplayName(userId, displayName);
    if (!user) throw { status: 404, code: "not_found", message: "用户不存在" };
    return user;
  },

  // ---------- 平台登录（TapTap 等，经 platform-auth.verifyPlatformToken 校验后进入） ----------
  // 平台身份首次登录：自动创建正式账号（非游客）并绑定；再次登录：直接发会话。
  async platformLogin(provider, openid, displayName) {
    const identityRepo = require("../repositories/identity-repo");
    const existing = await identityRepo.findByProvider(provider, openid);
    if (existing) {
      const user = await userRepo.findById(existing.user_id);
      if (!user) throw { status: 401, code: "identity_orphan", message: "绑定账号不存在，请联系客服" };
      const token = await sessionRepo.create(user.id);
      return { user, token, created: false };
    }
    let user = await userRepo.createGuest(displayName || null);
    await userRepo.setGuest(user.id, false); // 平台登录的账号视为正式账号（解锁广告奖励/上榜）
    await identityRepo.bind(user.id, provider, openid, displayName);
    user = await userRepo.findById(user.id);
    const token = await sessionRepo.create(user.id);
    return { user, token, created: true };
  },

  // 已登录账号绑定平台身份（幂等；已被他人绑定的 openid 拒绝）
  async bindPlatform(userId, provider, openid, displayName) {
    const identityRepo = require("../repositories/identity-repo");
    const existing = await identityRepo.findByProvider(provider, openid);
    if (existing) {
      if (existing.user_id === userId) return { bound: true };
      throw { status: 409, code: "identity_taken", message: "该平台账号已绑定其他游戏账号" };
    }
    await identityRepo.bind(userId, provider, openid, displayName);
    return { bound: true };
  },

  async unbindPlatform(userId, provider) {
    const identityRepo = require("../repositories/identity-repo");
    return { unbound: await identityRepo.unbind(userId, provider) };
  },

  async listIdentities(userId) {
    const identityRepo = require("../repositories/identity-repo");
    return identityRepo.listForUser(userId);
  },

  // ---------- 邮箱验证码 / 免密链接（登录即注册） ----------
  // 邮箱已存在 → 登录；不存在 → 自动注册正式账号。
  async emailLoginOrRegister(email, displayName) {
    let user = await userRepo.findByEmail(email);
    if (!user) {
      user = await userRepo.createEmailNoPassword(email, displayName || null);
      return { user, token: await sessionRepo.create(user.id), created: true };
    }
    return { user, token: await sessionRepo.create(user.id), created: false };
  },

  // 游客用验证码绑定邮箱 = 升级正式账号（进度保留；邮箱已注册则拒绝，防吞号）
  async bindGuestEmail(userId, email) {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      if (existing.id === userId) return { user: existing };
      throw { status: 409, code: "email_taken", message: "该邮箱已绑定其他账号" };
    }
    const user = await userRepo.bindEmailToGuest(userId, email);
    if (!user) throw { status: 400, code: "not_guest", message: "当前不是游客账号或已绑定邮箱" };
    return { user };
  },
};

module.exports = authService;

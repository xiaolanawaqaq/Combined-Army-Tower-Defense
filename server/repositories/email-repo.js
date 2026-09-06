"use strict";

const crypto = require("crypto");
const db = require("../db");

const CODE_TTL_MIN = 10;          // 验证码/链接有效期
const MAX_ATTEMPTS = 5;           // 最大错误尝试次数
const RESEND_COOLDOWN_SEC = 60;   // 同邮箱重发冷却

function hmac(value) {
  return crypto.createHmac("sha256", process.env.TOKEN_PEPPER || "default-pepper").update(String(value)).digest("hex");
}

function genCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

const emailRepo = {
  CODE_TTL_MIN, RESEND_COOLDOWN_SEC,

  // 同邮箱冷却检查（60 秒内发过则拒绝）
  async inCooldown(email) {
    const { rows } = await db.query(
      `SELECT 1 FROM email_codes
       WHERE email = $1 AND created_at > NOW() - INTERVAL '60 seconds'
       LIMIT 1`,
      [email]
    );
    return rows.length > 0;
  },

  // 新建验证码记录（先作废同邮箱旧码）
  async createCode(email, purpose, code) {
    await db.query("UPDATE email_codes SET used_at = NOW() WHERE email = $1 AND used_at IS NULL", [email]);
    const { rows } = await db.query(
      `INSERT INTO email_codes (email, purpose, code_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '${CODE_TTL_MIN} minutes') RETURNING id`,
      [email, purpose, hmac(code)]
    );
    return rows[0];
  },

  // 验证码校验：按邮箱找最新未消费码比对（找不到/不匹配都计一次错误，防爆破）
  async verifyCode(email, code) {
    const { rows } = await db.query(
      `SELECT id, attempts, code_hash FROM email_codes
       WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (rows.length === 0) return { ok: false, error: "code_invalid", message: "验证码错误或已过期" };
    const row = rows[0];
    if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: "code_locked", message: "尝试次数过多，请重新获取验证码" };
    if (row.code_hash !== hmac(code)) {
      await db.query("UPDATE email_codes SET attempts = attempts + 1 WHERE id = $1", [row.id]);
      return { ok: false, error: "code_invalid", message: "验证码错误或已过期" };
    }
    await db.query("UPDATE email_codes SET used_at = NOW() WHERE id = $1", [row.id]);
    return { ok: true };
  },

  // 新建免密链接请求（游戏持 requestId，邮件持 linkToken）
  async createMagicRequest(email) {
    await db.query("UPDATE email_codes SET used_at = NOW() WHERE email = $1 AND used_at IS NULL", [email]);
    const linkToken = crypto.randomBytes(24).toString("hex");
    const requestId = crypto.randomBytes(24).toString("hex");
    const { rows } = await db.query(
      `INSERT INTO email_codes (email, purpose, code_hash, link_token_hash, request_id_hash, expires_at)
       VALUES ($1, 'magic', $2, $3, $4, NOW() + INTERVAL '${CODE_TTL_MIN} minutes') RETURNING id`,
      [email, hmac("magic-" + linkToken), hmac(requestId)]
    );
    return { rowId: rows[0].id, linkToken, requestId };
  },

  // 浏览器点击链接：按 linkToken 找到请求并标记确认（approved_at 与作废 used_at 独立）
  async approveMagicLink(linkToken) {
    const { rows } = await db.query(
      `SELECT id, email FROM email_codes
       WHERE link_token_hash = $1 AND approved_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [hmac(linkToken)]
    );
    if (rows.length === 0) return null;
    await db.query("UPDATE email_codes SET approved_at = NOW() WHERE id = $1", [rows[0].id]);
    return { email: rows[0].email };
  },

  // 游戏轮询：按 requestId 查确认状态（已确认 → 返回邮箱登录）
  async pollMagicRequest(requestId) {
    const { rows } = await db.query(
      `SELECT email, approved_at FROM email_codes
       WHERE request_id_hash = $1 AND approved_at IS NOT NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [hmac(requestId)]
    );
    if (rows.length === 0) return { status: "pending" };
    return { status: "approved", email: rows[0].email };
  },
};

module.exports = emailRepo;

"use strict";

const db = require("../db");

// 平台身份仓库：provider + openid ↔ user_id 的绑定关系
const identityRepo = {
  // 按平台身份查绑定（无则返回 null）
  async findByProvider(provider, openid) {
    const { rows } = await db.query(
      "SELECT * FROM user_identities WHERE provider = $1 AND openid = $2",
      [provider, openid]
    );
    return rows[0] || null;
  },

  // 绑定平台身份到已有账号（幂等：已绑定同一 user 则直接成功）
  async bind(userId, provider, openid, displayName) {
    await db.query(
      `INSERT INTO user_identities (user_id, provider, openid, display_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (provider, openid) DO NOTHING`,
      [userId, provider, openid, displayName || null]
    );
  },

  // 解绑
  async unbind(userId, provider) {
    const { rows } = await db.query(
      "DELETE FROM user_identities WHERE user_id = $1 AND provider = $2 RETURNING id",
      [userId, provider]
    );
    return rows.length > 0;
  },

  // 我的绑定列表
  async listForUser(userId) {
    const { rows } = await db.query(
      "SELECT provider, display_name, created_at FROM user_identities WHERE user_id = $1",
      [userId]
    );
    return rows;
  },
};

module.exports = identityRepo;

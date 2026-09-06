"use strict";

const db = require("../db");
const crypto = require("crypto");

// 经济参数（与客户端 game_types.gd 的 AD_PLACEMENTS 表保持一致；服务端为权威值）
const WALLET_START_COINS = 30;
// 广告位定义：id → {name, rewardType, reward}（与客户端 Types.AD_PLACEMENTS 同步维护）
// rewardType="coins" 服务端直接入钱包；其余类型由客户端调用方按返回值生效。
const AD_PLACEMENTS = {
  energy_refill: { name: "金币补给", rewardType: "coins", reward: 10 },
  revive: { name: "复活续战", rewardType: "revive", reward: 1 },
};
const AD_SESSION_TTL_MS = 10 * 60 * 1000;   // 广告凭据 10 分钟有效
const SPEND_MAX_AMOUNT = 20;                // 单次扣费上限（防异常数值）

function newAdToken() {
  return crypto.randomBytes(24).toString("hex");
}

const walletRepo = {
  WALLET_START_COINS,
  AD_PLACEMENTS,

  adPlacement(placementId) {
    return AD_PLACEMENTS[String(placementId || "")] || null;
  },

  // 取钱包（首次自动开户送初始金币）
  async getOrCreate(userId) {
    const { rows } = await db.query(
      `INSERT INTO user_wallets (user_id, coins) VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, WALLET_START_COINS]
    );
    if (rows.length > 0) return { coins: WALLET_START_COINS };
    const { rows: existing } = await db.query(
      "SELECT coins FROM user_wallets WHERE user_id = $1",
      [userId]
    );
    return { coins: Number(existing[0] ? existing[0].coins : WALLET_START_COINS) };
  },

  // 开局扣费：幂等（同 idemKey 只扣一次）；余额不足返回 {ok:false}
  async spend(userId, amount, idemKey) {
    const amt = Math.max(1, Math.min(SPEND_MAX_AMOUNT, Math.floor(Number(amount) || 0)));
    if (!idemKey || typeof idemKey !== "string" || idemKey.length > 64) {
      return { ok: false, error: "invalid_idem" };
    }
    return db.transaction(async (client) => {
      const { rows: existing } = await client.query(
        "SELECT amount FROM wallet_spends WHERE idem_key = $1",
        [idemKey]
      );
      if (existing.length > 0) {
        // 幂等重放：返回当前余额即可
        const { rows: cur } = await client.query(
          "SELECT coins FROM user_wallets WHERE user_id = $1",
          [userId]
        );
        return { ok: true, coins: Number(cur[0] ? cur[0].coins : 0), replay: true };
      }
      // 原子扣费：余额够才扣
      const { rows: updated } = await client.query(
        `UPDATE user_wallets SET coins = coins - $2, updated_at = NOW()
         WHERE user_id = $1 AND coins >= $2
         RETURNING coins`,
        [userId, amt]
      );
      if (updated.length === 0) {
        const { rows: cur } = await client.query(
          "SELECT coins FROM user_wallets WHERE user_id = $1",
          [userId]
        );
        return { ok: false, error: "insufficient", coins: Number(cur[0] ? cur[0].coins : 0) };
      }
      await client.query(
        "INSERT INTO wallet_spends (idem_key, user_id, amount) VALUES ($1, $2, $3)",
        [idemKey, userId, amt]
      );
      return { ok: true, coins: Number(updated[0].coins) };
    });
  },

  // 看广告前领取一次性凭据（客户端拿 adToken 去 SDK 播广告；placement 记录进凭据防串用）
  async createAdSession(userId, placement) {
    const meta = this.adPlacement(placement);
    if (!meta) return { ok: false, error: "unknown_placement" };
    const token = newAdToken();
    await db.query(
      `INSERT INTO ad_sessions (token, user_id, placement, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
      [token, userId, placement]
    );
    return { ok: true, adToken: token, ttlMs: AD_SESSION_TTL_MS, rewardType: meta.rewardType, reward: meta.reward };
  },

  // 看完广告后凭据换奖励：单次有效、未过期、本人持有、按凭据记录的广告位发奖
  // 真实接入 AdMob SSV 时，这里改为校验 Google 的 SSV 回调签名后再发奖。
  async claimAd(userId, adToken) {
    return db.transaction(async (client) => {
      const { rows } = await client.query(
        "SELECT user_id, claimed_at, expires_at, placement FROM ad_sessions WHERE token = $1",
        [String(adToken || "")]
      );
      if (rows.length === 0) return { ok: false, error: "unknown_token" };
      const session = rows[0];
      if (session.user_id !== userId) return { ok: false, error: "not_owner" };
      if (session.claimed_at) return { ok: false, error: "already_claimed" };
      if (new Date(session.expires_at).getTime() < Date.now()) return { ok: false, error: "expired" };
      const meta = this.adPlacement(session.placement);
      if (!meta) return { ok: false, error: "unknown_placement" };
      await client.query(
        "UPDATE ad_sessions SET claimed_at = NOW() WHERE token = $1",
        [String(adToken)]
      );
      // coins 型广告位服务端直接入钱包；其余类型只确认凭据（客户端按返回值生效）
      let newCoins = null;
      if (meta.rewardType === "coins") {
        const { rows: updated } = await client.query(
          `UPDATE user_wallets SET coins = coins + $2, updated_at = NOW()
           WHERE user_id = $1 RETURNING coins`,
          [userId, meta.reward]
        );
        if (updated.length === 0) {
          await client.query(
            "INSERT INTO user_wallets (user_id, coins) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
            [userId, WALLET_START_COINS + meta.reward]
          );
          newCoins = WALLET_START_COINS + meta.reward;
        } else {
          newCoins = Number(updated[0].coins);
        }
      }
      return { ok: true, coins: newCoins, rewardType: meta.rewardType, reward: meta.reward };
    });
  },
};

module.exports = walletRepo;

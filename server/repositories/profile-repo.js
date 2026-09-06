"use strict";

const db = require("../db");

// 档案云同步：客户端提交本地档案，服务端与云端合并（逐项取最大/并集，幂等可重放）
function mergeProfiles(cloud, incoming) {
  const out = { cores: {}, achievements: {}, career_kills: {} };
  const cloudCores = cloud.cores || {}, inCores = incoming.cores || {};
  for (const k of new Set([...Object.keys(cloudCores), ...Object.keys(inCores)])) {
    out.cores[k] = Math.max(Number(cloudCores[k]) || 0, Number(inCores[k]) || 0);
  }
  const cloudAch = cloud.achievements || {}, inAch = incoming.achievements || {};
  for (const k of new Set([...Object.keys(cloudAch), ...Object.keys(inAch)])) {
    out.achievements[k] = !!(cloudAch[k] || inAch[k]);
  }
  const cloudKills = cloud.career_kills || {}, inKills = incoming.career_kills || {};
  for (const k of new Set([...Object.keys(cloudKills), ...Object.keys(inKills)])) {
    out.career_kills[k] = Math.max(Number(cloudKills[k]) || 0, Number(inKills[k]) || 0);
  }
  return out;
}

const profileRepo = {
  async get(userId) {
    const { rows } = await db.query(
      "SELECT data FROM player_profile WHERE user_id = $1",
      [userId]
    );
    return rows[0] ? rows[0].data : {};
  },

  // 合并提交的本地档案与云端档案，保存并返回合并结果（客户端直接采用）
  async syncMerged(userId, incoming) {
    const clean = {
      cores: (incoming && incoming.cores) || {},
      achievements: (incoming && incoming.achievements) || {},
      career_kills: (incoming && incoming.career_kills) || {},
    };
    const cloud = await this.get(userId);
    const merged = mergeProfiles(cloud, clean);
    await db.query(
      `INSERT INTO player_profile (user_id, data, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [userId, JSON.stringify(merged)]
    );
    return merged;
  },
};

module.exports = profileRepo;

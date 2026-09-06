"use strict";

const db = require("../db");

// 每日挑战种子：按日期确定性生成（无需持久化也可复现，但落库便于审计/防篡改）
// 生成规则：SHA-256("hbq-daily:" + YYYY-MM-DD) 取前 8 字节 → 无符号整数。
function seedForDate(dateStr) {
  const crypto = require("crypto");
  const hash = crypto.createHash("sha256").update("hbq-daily:" + dateStr).digest();
  return hash.readUInt32BE(0) >>> 0;
}

function todayUTC() {
  // 挑战日按东八区（中国玩家的一天）计算：UTC+8 取日期
  const cn = new Date(Date.now() + 8 * 3600 * 1000);
  return cn.toISOString().slice(0, 10);
}

const dailyRepo = {
  // 取（或创建）当日挑战：返回 { date, seed }
  async getOrCreateToday() {
    const date = todayUTC();
    const seed = seedForDate(date);
    await db.query(
      `INSERT INTO daily_challenges (challenge_date, seed) VALUES ($1, $2)
       ON CONFLICT (challenge_date) DO NOTHING`,
      [date, seed]
    );
    const { rows } = await db.query(
      "SELECT challenge_date, seed FROM daily_challenges WHERE challenge_date = $1",
      [date]
    );
    const row = rows[0] || { challenge_date: date, seed };
    return { date: row.challenge_date, seed: Number(row.seed) };
  },

  // 提交当日成绩：一人一天一条，保留最好成绩（level 高者胜；同 level 比剩余水晶）
  async submitResult(userId, level, crystalsLeft) {
    const date = todayUTC();
    const levelInt = Math.max(1, Math.min(999, Math.floor(Number(level) || 1)));
    const crystalsInt = Math.max(0, Math.min(9999, Math.floor(Number(crystalsLeft) || 0)));
    await db.transaction(async (client) => {
      const { rows: existing } = await client.query(
        "SELECT level_reached, crystals_left FROM daily_results WHERE challenge_date = $1 AND user_id = $2",
        [date, userId]
      );
      if (existing.length === 0) {
        await client.query(
          `INSERT INTO daily_results (challenge_date, user_id, level_reached, crystals_left)
           VALUES ($1, $2, $3, $4)`,
          [date, userId, levelInt, crystalsInt]
        );
        return;
      }
      const prev = existing[0];
      const better = levelInt > prev.level_reached ||
        (levelInt === prev.level_reached && crystalsInt > prev.crystals_left);
      if (better) {
        await client.query(
          `UPDATE daily_results SET level_reached = $3, crystals_left = $4, submitted_at = NOW()
           WHERE challenge_date = $1 AND user_id = $2`,
          [date, userId, levelInt, crystalsInt]
        );
      }
    });
    return { date, level: levelInt, crystals: crystalsInt };
  },

  // 当日排行榜：前 50（level 降序 → 水晶降序 → 提交时间升序）
  async leaderboard(date) {
    const day = date || todayUTC();
    const { rows } = await db.query(
      `SELECT u.display_name AS name, r.level_reached AS level, r.crystals_left AS crystals
       FROM daily_results r JOIN users u ON u.id = r.user_id
       WHERE r.challenge_date = $1
       ORDER BY r.level_reached DESC, r.crystals_left DESC, r.submitted_at ASC
       LIMIT 50`,
      [day]
    );
    return rows.map(r => ({ name: r.name, level: Number(r.level), crystals: Number(r.crystals) }));
  },

  // 我的当日成绩（进榜名次一并返回，未上榜返回 null rank）
  async myResult(userId, date) {
    const day = date || todayUTC();
    const { rows } = await db.query(
      `SELECT level_reached, crystals_left,
              (SELECT COUNT(*) + 1 FROM daily_results d2
                WHERE d2.challenge_date = r.challenge_date
                  AND (d2.level_reached > r.level_reached
                       OR (d2.level_reached = r.level_reached AND d2.crystals_left > r.crystals_left))) AS rank
       FROM daily_results r
       WHERE r.challenge_date = $1 AND r.user_id = $2`,
      [day, userId]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return { level: Number(row.level_reached), crystals: Number(row.crystals_left), rank: Number(row.rank) };
  },
};

module.exports = dailyRepo;

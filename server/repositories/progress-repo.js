"use strict";

const db = require("../db");

const progressRepo = {
  async getOrCreate(userId) {
    const { rows } = await db.query(
      "INSERT INTO player_progress (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING RETURNING *",
      [userId]
    );
    if (rows.length > 0) return rows[0];
    const { rows: existing } = await db.query(
      "SELECT * FROM player_progress WHERE user_id = $1",
      [userId]
    );
    return existing[0] || null;
  },

  async recordSoloResult(userId, level, won, idempotentKey) {
    const result = won ? "win" : "lose";
    await db.transaction(async (client) => {
      let match = null;
      const { rows: existing } = await client.query(
        "SELECT id FROM matches WHERE match_idempotent_key = $1",
        [idempotentKey]
      );
      if (existing.length > 0) match = existing[0];
      else {
        const { rows: created } = await client.query(
          `INSERT INTO matches (mode, result, level_reached, player_count, match_idempotent_key)
           VALUES ('solo', $1, $2, 1, $3) RETURNING id`,
          [result, level, idempotentKey]
        );
        match = created[0];
        await client.query(
          "INSERT INTO match_players (match_id, user_id, result) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [match.id, userId, result]
        );
        await client.query(
          `UPDATE player_progress SET
             games_played = games_played + 1,
             games_won = games_won + CASE WHEN $1 THEN 1 ELSE 0 END,
             highest_level = GREATEST(highest_level, $2),
             updated_at = NOW()
           WHERE user_id = $3`,
          [won, level, userId]
        );
      }
    });
  },

  async recordMultiResult(userIds, mode, result, level, idempotentKey) {
    await db.transaction(async (client) => {
      const { rows: existing } = await client.query(
        "SELECT id FROM matches WHERE match_idempotent_key = $1",
        [idempotentKey]
      );
      if (existing.length > 0) return;

      const { rows: created } = await client.query(
        `INSERT INTO matches (mode, result, level_reached, player_count, match_idempotent_key)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [mode, result, level, userIds.length, idempotentKey]
      );
      const match = created[0];

      for (const uid of userIds) {
        const playerResult = result === "win" ? "win" : "lose";
        await client.query(
          "INSERT INTO match_players (match_id, user_id, result) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [match.id, uid, playerResult]
        );
        await client.query(
          `UPDATE player_progress SET
             games_played = games_played + 1,
             games_won = games_won + CASE WHEN $1 THEN 1 ELSE 0 END,
             highest_level = GREATEST(highest_level, $2),
             updated_at = NOW()
           WHERE user_id = $3`,
          [result === "win", level, uid]
        );
      }
    });
  },

  // 双人对战结算：赢家记 win、输家记 lose（幂等键防重复记账）
  async recordVersusResult(winnerUserId, loserUserId, level, idempotentKey) {
    await db.transaction(async (client) => {
      const { rows: existing } = await client.query(
        "SELECT id FROM matches WHERE match_idempotent_key = $1",
        [idempotentKey]
      );
      if (existing.length > 0) return;
      const { rows: created } = await client.query(
        `INSERT INTO matches (mode, result, level_reached, player_count, match_idempotent_key)
         VALUES ('versus', 'win', $1, 2, $2) RETURNING id`,
        [level, idempotentKey]
      );
      const match = created[0];
      const seat = async (uid, result) => {
        await client.query(
          "INSERT INTO match_players (match_id, user_id, result) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [match.id, uid, result]
        );
        await client.query(
          `UPDATE player_progress SET
             games_played = games_played + 1,
             games_won = games_won + CASE WHEN $1 THEN 1 ELSE 0 END,
             updated_at = NOW()
           WHERE user_id = $2`,
          [result === "win", uid]
        );
      };
      await seat(winnerUserId, "win");
      await seat(loserUserId, "lose");
    });
  },

  // 查询某账号某模式的总胜负（versus 用）
  async getRecord(userId, mode) {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE mp.result = 'win') AS wins,
         COUNT(*) FILTER (WHERE mp.result = 'lose') AS losses
       FROM match_players mp JOIN matches m ON m.id = mp.match_id
       WHERE mp.user_id = $1 AND m.mode = $2`,
      [userId, mode]
    );
    const row = rows[0] || {};
    return { wins: Number(row.wins || 0), losses: Number(row.losses || 0) };
  },

  // 排行榜：versus 按对战胜场，solo 按最高关卡
  async getLeaderboard(mode) {
    if (mode === "versus") {
      const { rows } = await db.query(
        `SELECT u.display_name AS name,
                COUNT(*) FILTER (WHERE mp.result = 'win') AS wins,
                COUNT(*) AS games
         FROM match_players mp
         JOIN matches m ON m.id = mp.match_id
         JOIN users u ON u.id = mp.user_id
         WHERE m.mode = 'versus'
         GROUP BY mp.user_id, u.display_name
         ORDER BY wins DESC, games ASC
         LIMIT 50`);
      return rows.map(r => ({ name: r.name, wins: Number(r.wins), games: Number(r.games) }));
    }
    const { rows } = await db.query(
      `SELECT u.display_name AS name, pp.highest_level AS level, pp.games_won AS wins, pp.games_played AS games
       FROM player_progress pp JOIN users u ON u.id = pp.user_id
       ORDER BY pp.highest_level DESC, pp.games_won DESC, pp.games_played ASC
       LIMIT 50`);
    return rows.map(r => ({ name: r.name, level: Number(r.level), games: Number(r.games) }));
  },
};

module.exports = progressRepo;

"use strict";

const db = require("../db");

// 埋点事件批量落库（登录/开局/结算/广告等关键漏斗）
const statsRepo = {
  async insertBatch(userId, events) {
    if (!Array.isArray(events) || events.length === 0) return 0;
    const capped = events.slice(0, 50);
    const values = [];
    const params = [];
    let p = 1;
    for (const ev of capped) {
      values.push(`($${p++}, $${p++}, $${p++}::jsonb)`);
      params.push(userId, String(ev.name || "unknown").slice(0, 64), JSON.stringify(ev.props || {}));
    }
    await db.query(
      `INSERT INTO analytics_events (user_id, name, props) VALUES ${values.join(",")}`,
      params
    );
    return capped.length;
  },
};

module.exports = statsRepo;

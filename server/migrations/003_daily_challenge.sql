-- 每日挑战：每天一条全球统一的种子记录 + 每人每天一次成绩提交
-- 种子由服务端按日期确定性生成（UTC），所有玩家同一天打同一局。
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  seed BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 每日成绩：一人一天一条（PK 双列天然幂等），只保留当日最好成绩（level 越高越好）
CREATE TABLE IF NOT EXISTS daily_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_reached INTEGER NOT NULL DEFAULT 1,
  crystals_left INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_date, user_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_results_board ON daily_results (challenge_date, level_reached DESC, crystals_left DESC);

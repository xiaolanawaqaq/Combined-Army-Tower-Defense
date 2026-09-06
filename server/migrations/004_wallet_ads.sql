-- 金币钱包 + 广告激励会话（对接激励视频的经济闭环）
-- 玩一局消耗金币；看激励视频得金币。服务端为权威账本，客户端离线时用本地缓存兜底。

-- 钱包：一人一条，注册即送初始金币
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 广告会话：客户端看广告前先领一次性凭据，看完凭据换奖励（防裸刷接口）
-- placement 记录凭据对应的广告位，发奖以凭据记录为准（防客户端串用广告位）
CREATE TABLE IF NOT EXISTS ad_sessions (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  placement TEXT NOT NULL DEFAULT 'energy_refill',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ
);

-- 游戏开局扣费的幂等记录：同一次开局重试只扣一次
CREATE TABLE IF NOT EXISTS wallet_spends (
  idem_key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT 'run_start',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

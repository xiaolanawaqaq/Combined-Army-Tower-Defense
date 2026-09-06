-- 平台登录身份绑定：一个游戏账号可绑定多个平台身份（taptap / 未来微信等）
-- provider + openid 唯一定位一个平台身份；一个 user 可绑多个 provider。
CREATE TABLE IF NOT EXISTS user_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  openid TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, openid)
);

CREATE INDEX IF NOT EXISTS idx_user_identities_user ON user_identities (user_id);

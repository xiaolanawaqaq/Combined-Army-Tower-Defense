-- 档案云同步 + 基础埋点
-- 档案：图鉴/成就/累计击杀 跟随账号跨设备（合并策略：逐项取最大/并集，天然幂等）
CREATE TABLE IF NOT EXISTS player_profile (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 埋点：轻量事件流（登录/开局/结算/广告），留存与漏斗分析用
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_name_time ON analytics_events (name, created_at);

-- 邮箱验证码 + 免密链接（登录即注册的轻量邮箱体系）
CREATE TABLE IF NOT EXISTS email_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login',          -- login / bind
  code_hash TEXT NOT NULL,                        -- HMAC 后的验证码（不存明文）
  link_token_hash TEXT,                           -- 免密链接令牌（HMAC，邮箱侧持有）
  request_id_hash TEXT,                           -- 免密轮询请求 ID（HMAC，游戏侧持有）
  attempts INTEGER NOT NULL DEFAULT 0,            -- 错误尝试次数（防爆破）
  used_at TIMESTAMPTZ,                            -- 验证码消费时间（作废标记）
  approved_at TIMESTAMPTZ,                        -- 免密链接确认时间（与作废独立）
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_codes_email ON email_codes (email, purpose, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_codes_link ON email_codes (link_token_hash) WHERE link_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_codes_req ON email_codes (request_id_hash) WHERE request_id_hash IS NOT NULL;

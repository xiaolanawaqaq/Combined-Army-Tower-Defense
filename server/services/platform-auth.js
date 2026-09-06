"use strict";

// 平台登录服务 —— 当前支持 TapTap，预留微信等 provider 扩展位。
//
// TapTap 接入清单（上架 TapTap 前完成，代码无需再改）：
//   1. TapTap 开放平台 (open.taptap.com) 创建应用，拿 Client ID；
//   2. 服务端环境变量：TAPTAP_CLIENT_ID、TAPTAP_SERVER_URL（公网域名）；
//   3. Android 渠道包装 TapTap SDK（初始化 + 拉起登录拿 access_token / openid），
//      把 access_token+openid 交给本服务的 /api/auth/platform/taptap 完成登录；
//   4. 防沉迷/实名：上架国内渠道时按渠道要求在 SDK 侧完成，服务端 openid 记账即可。
//
// 安全设计：access_token 永远由服务端向 TapTap 服务器校验（不信任客户端上报的 openid），
// 验证通过才发本站会话 token。

const TAPTAP_USERINFO_URL = "https://open.taptap.io/oauth2/v1/userinfo";
const ALLOWED_PROVIDERS = ["taptap"];

// 用 access_token 向平台服务器换取身份（唯一可信来源）
async function verifyPlatformToken(provider, accessToken) {
  if (provider !== "taptap") {
    throw { status: 400, code: "unknown_provider", message: "不支持的平台" };
  }
  if (!process.env.TAPTAP_CLIENT_ID) {
    throw { status: 503, code: "taptap_not_configured", message: "TapTap 登录暂未开放" };
  }
  const res = await fetch(TAPTAP_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}`, "X-UA": `client_id=${process.env.TAPTAP_CLIENT_ID}` },
  });
  if (!res.ok) {
    throw { status: 401, code: "platform_token_invalid", message: "平台登录凭证无效" };
  }
  const info = await res.json();
  // TapTap userinfo 标准字段：openid（长期稳定）、name
  if (!info.openid) {
    throw { status: 401, code: "platform_token_invalid", message: "平台未返回身份标识" };
  }
  return { openid: String(info.openid), displayName: info.name ? String(info.name) : null };
}

module.exports = { verifyPlatformToken, ALLOWED_PROVIDERS };

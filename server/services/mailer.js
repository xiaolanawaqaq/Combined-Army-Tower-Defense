"use strict";

// 邮件发送服务 —— SMTP（nodemailer）。
// 环境变量：
//   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM   生产必填
//   APP_PUBLIC_URL            免密链接的域名（如 https://your-game.example.com）
// 未配置 SMTP 时进入 DEV 模式：验证码/链接打印到服务端控制台（方便本地调试），不真发信。
// 生产接信服（阿里云邮件推送/SendGrid/Resend 等）只改本文件的 send() 实现。

const APP_PUBLIC_URL = process.env.APP_PUBLIC_URL || "";

function isDevMode() {
  return !process.env.SMTP_HOST;
}

async function send(to, subject, text) {
  if (isDevMode()) {
    console.log(`[MAIL:DEV] to=${to} subject="${subject}"\n${text}`);
    return { dev: true };
  }
  // 生产：nodemailer SMTP。依赖加进 package.json 后启用：
  //   const nodemailer = require("nodemailer");
  //   const transport = nodemailer.createTransport({ host, port, auth });
  //   await transport.sendMail({ from: MAIL_FROM, to, subject, text });
  throw new Error("SMTP configured but send() not implemented — wire nodemailer here");
}

async function sendLoginCode(to, code) {
  return send(to, "合兵塔防 · 登录验证码",
    `你的登录验证码：${code}\n10 分钟内有效。如果不是本人操作，请忽略本邮件。`);
}

async function sendMagicLink(to, url) {
  return send(to, "合兵塔防 · 登录链接",
    `点击下面的链接直接登录（10 分钟内有效，仅需点击一次）：\n${url}\n\n如果不是本人操作，请忽略本邮件。`);
}

module.exports = { send, sendLoginCode, sendMagicLink, isDevMode, APP_PUBLIC_URL };

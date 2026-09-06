"use strict";

require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const { attachTransport } = require("./transport");
const { apiRouter, parseCookies, extractBearer } = require("./api-routes");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8787);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".apk": "application/vnd.android.package-archive",
};

const PUBLIC_FILES = new Set([
  "shared/game-types.js",
]);

const PUBLIC_DIRS = ["shared", "lite", "apk"];

function isPublic(relative) {
  if (PUBLIC_FILES.has(relative)) return true;
  for (const dir of PUBLIC_DIRS) {
    if (relative.startsWith(dir + "/") && relative.indexOf("..") === -1) return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  const requestPath = (req.url || "/").split("?")[0];

  if (requestPath === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }

  if (requestPath === "/ready") {
    const db = require("./db");
    db.ready().then(ok => {
      res.writeHead(ok ? 200 : 503, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(ok ? "ready" : "not ready");
    }).catch(() => {
      res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("not ready");
    });
    return;
  }

  if (requestPath.startsWith("/api/")) {
    return apiRouter(req, res);
  }

  if (requestPath === "/download-apk") {
    const candidates = [
      path.join(root, "apk", "merge-td-full.apk"),
      path.join(root, "apk", "合兵塔防1.apk"),
      path.join(root, "合兵塔防1.apk"),
    ];
    const apk = candidates.find(candidate => fs.existsSync(candidate));
    if (!apk) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("完整版 APK 尚未上传，请稍后重试");
      return;
    }
    const size = fs.statSync(apk).size;
    res.writeHead(200, {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="merge-td-full.apk"',
      "Content-Length": size,
      "Cache-Control": "no-store",
    });
    fs.createReadStream(apk).pipe(res);
    return;
  }

  // Normalize: strip trailing slash (except root)
  let normalized = requestPath === "/" ? "/" : requestPath.replace(/\/+$/, "");

  // 官网页面已完全独立部署（正本在 F:\游戏官网，与游戏服务器解耦）：
  // 这些路径一律 302 跳转到 PORTAL_URL 指定的官网地址。
  // 未配置 PORTAL_URL 时出提示页（旧链接用户能看懂发生了什么）。
  const PORTAL_URL = (process.env.PORTAL_URL || "").replace(/\/+$/, "");
  const portalPaths = {
    "/": true, "/index": true, "/index.html": true, "/studio": true, "/studio.html": true,
    "/td": true, "/td.html": true, "/game": true,
    "/rank": true, "/rank.html": true,
    "/codex": true, "/codex.html": true,
    "/download": true, "/download.html": true,
  };
  if (portalPaths[normalized]) {
    if (PORTAL_URL) {
      const target = normalized === "/" || normalized === "/studio" || normalized === "/studio.html"
        ? PORTAL_URL + "/"
        : PORTAL_URL + normalized;
      res.writeHead(302, { "Location": target });
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<body style="background:#0a1008;color:#cbd5c5;font-family:sans-serif;max-width:560px;margin:0 auto;padding:48px 24px;line-height:1.8">' +
      '<h1 style="color:#fde047">合兵塔防</h1>' +
      '<p>官网已独立部署，游戏服务器未配置 PORTAL_URL 环境变量。</p>' +
      '<p><a href="/play" style="color:#7ee787">▶ 进入网页试玩版</a></p>' +
      '<p style="color:#7a8a68;font-size:13px">（服务器管理员：设置环境变量 PORTAL_URL=官网地址 并重启，此页将自动跳转官网）</p>' +
      '</body>'
    );
    return;
  }

  // Handle redirect targets first
  if (normalized === "/online" || normalized === "/online.html" ||
      normalized === "/login" || normalized === "/login.html") {
    res.writeHead(302, { "Location": "/" });
    res.end();
    return;
  }

  // Determine file to serve
  let relative;
  if (normalized === "/play") {
    // 网页试玩版入口（lite/ 目录未做任何改动）
    relative = "lite/index.html";
  } else {
    relative = normalized.replace(/^\/+/, "");
  }

  if (!isPublic(relative) || relative.includes("..")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
});

let dbReady = false;
async function startup() {
  try {
    const { run } = require("./migrate");
    await run();
    dbReady = true;
    console.log("Database migrations applied successfully.");
  } catch (e) {
    console.warn("Database not available — running without persistence:", e.message);
  }

  attachTransport(server, dbReady);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Merge TD multiplayer server listening on port ${port}`);
  });
}

function shutdown() {
  console.log("Shutting down...");
  const db = require("./db");
  db.close().catch(() => {});
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startup().catch(e => { console.error(e); process.exit(1); });
#!/usr/bin/env node
// Checks the prebuilt learning app, the Hugo publish copy, and the
// /xiaofuzi-lab/ai-agent/ URL the GitHub Pages site will serve.

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(repoRoot, "static", "ai-agent");
const sitePrefix = "/xiaofuzi-lab";
const appPrefix = `${sitePrefix}/ai-agent`;
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function walkFiles(rootDir) {
  const files = [];
  if (!fs.existsSync(rootDir)) return files;
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  files.sort();
  return files;
}

function sha256(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function relPosix(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function commandPath(binaryNames) {
  const listed = binaryNames.filter(Boolean);
  for (const candidate of listed) {
    if (candidate.includes(path.sep) && fs.existsSync(candidate)) return candidate;
  }
  const pathEntries = (process.env.PATH || "").split(path.delimiter);
  for (const name of listed) {
    if (name.includes(path.sep)) continue;
    for (const entry of pathEntries) {
      const full = path.join(entry, name);
      if (fs.existsSync(full)) return full;
    }
  }
  return "";
}

function hugoBinary() {
  return commandPath([
    process.env.HUGO,
    "hugo",
    path.join(os.homedir(), ".local", "bin", "hugo"),
  ]);
}

function chromeBinary() {
  return commandPath([
    process.env.CHROME_PATH,
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome",
    "/opt/google/chrome/chrome",
  ]);
}

function countQuizItems(appDir) {
  const chunksDir = path.join(appDir, "_next", "static", "chunks");
  const files = walkFiles(chunksDir).filter((file) => file.endsWith(".js"));
  let total = 0;
  let blocks = 0;
  for (const file of files) {
    const source = readText(file);
    const parts = source.split("questions:[");
    if (parts.length === 1) continue;
    for (const part of parts.slice(1)) {
      const ids = part.match(/\{id:"q\d+",prompt:"/g) || [];
      if (ids.length) {
        blocks += 1;
        total += ids.length;
      }
    }
  }
  return { total, blocks };
}

function checkSourceTree() {
  assert(fs.existsSync(path.join(appRoot, "index.html")), "static/ai-agent/index.html 缺失");
  assert(fs.existsSync(path.join(appRoot, "_next")), "static/ai-agent/_next 缺失");
  const files = walkFiles(appRoot);
  assert(files.length === 151, `静态文件应为 151 个，实际 ${files.length}`);

  const chapters = [];
  const lessons = [];
  const quizzes = [];
  for (const file of files) {
    const rel = relPosix(appRoot, file);
    if (/^chapters\/\d+\/index\.html$/.test(rel)) chapters.push(rel);
    if (/^learn\/\d+\/[^/]+\/index\.html$/.test(rel)) lessons.push(rel);
    if (/^quiz\/\d+\/index\.html$/.test(rel)) quizzes.push(rel);
  }
  assert(chapters.length === 10, `章节页应为 10，实际 ${chapters.length}`);
  assert(lessons.length === 31, `课次页应为 31，实际 ${lessons.length}`);
  assert(quizzes.length === 10, `测验页应为 10，实际 ${quizzes.length}`);

  const quiz = countQuizItems(appRoot);
  assert(quiz.blocks === 10, `测验数据块应为 10，实际 ${quiz.blocks}`);
  assert(quiz.total === 60, `测验题应为 60，实际 ${quiz.total}`);

  const home = readText(path.join(appRoot, "index.html"));
  assert(home.includes(`${appPrefix}/_next/`), "首页资源没有 /xiaofuzi-lab/ai-agent 前缀");
  assert(home.includes('href="/xiaofuzi-lab/ai-agent/"'), "首页导航缺少带斜杠的学习台链接");
  assert(home.includes('href="/xiaofuzi-lab/ai-agent/chapters/"'), "首页导航缺少十章链接");
  assert(!/content-security-policy/i.test(home), "学习应用首页含 CSP，内联启动脚本会被拦截");

  const referenced = new Set();
  for (const file of files.filter((item) => item.endsWith(".html"))) {
    const html = readText(file);
    for (const match of html.matchAll(/(?:src|href)="(\/xiaofuzi-lab\/ai-agent\/[^"]+)"/g)) {
      const pathname = decodeURIComponent(match[1].split("?")[0]);
      const rel = pathname.slice(appPrefix.length + 1);
      referenced.add(rel);
      assert(fs.existsSync(path.join(appRoot, rel)), `HTML 引用缺失: ${pathname}`);
    }
  }
  assert(referenced.size > 0, "没有解析到学习应用资源引用");
  console.log(
    `source ok: files=${files.length} chapters=${chapters.length} lessons=${lessons.length} quizzes=${quizzes.length} questions=${quiz.total} refs=${referenced.size}`,
  );
}

function checkSiteUntouched() {
  const config = readText(path.join(repoRoot, "config.toml"));
  assert(config.includes('baseURL = "https://charlieliu9999.github.io/xiaofuzi-lab/"'), "baseURL 被改动");
  assert(config.includes('theme = "PaperMod"'), "主题被改动");
  for (const snippet of ['name = "文章"', 'url = "/posts/"', 'name = "关于"', 'url = "/about/"', 'name = "指南"', 'url = "/guides/"']) {
    assert(config.includes(snippet), `菜单缺少原有项: ${snippet}`);
  }
  assert(!config.includes("ai-agent"), "config.toml 被写入 ai-agent，菜单或配置不应为这次接入改动");
  assert(!fs.existsSync(path.join(repoRoot, "content", "ai-agent")), "content/ai-agent 已存在，不能覆盖博客内容");
  assert(fs.existsSync(path.join(repoRoot, "static", "covers", "openclaw-medimaging-v1.png")), "原有封面资源缺失");
  const staticNames = fs.readdirSync(path.join(repoRoot, "static")).sort();
  assert(
    staticNames.includes("ai-agent") && staticNames.includes("covers"),
    `static 目录异常: ${staticNames.join(",")}`,
  );
}

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"], ...options });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function buildWithHugo() {
  const hugo = hugoBinary();
  if (!hugo) {
    const message = "未找到 hugo，无法核对发布目录";
    if (process.env.REQUIRE_HUGO === "1") fail(message);
    else console.log(`skip hugo: ${message}`);
    return "";
  }
  const destination = fs.mkdtempSync(path.join(os.tmpdir(), "xiaofuzi-hugo-"));
  const result = await run(hugo, [
    "--minify",
    "--baseURL",
    "https://charlieliu9999.github.io/xiaofuzi-lab/",
    "--destination",
    destination,
  ]);
  assert(result.code === 0, `hugo 构建失败\n${result.stderr}\n${result.stdout}`);
  if (result.code !== 0) {
    fs.rmSync(destination, { recursive: true, force: true });
    return "";
  }

  const published = path.join(destination, "ai-agent");
  assert(fs.existsSync(path.join(published, "_next")), "Hugo 发布结果丢掉了 _next");
  const sourceFiles = walkFiles(appRoot);
  const publishedFiles = walkFiles(published);
  assert(
    publishedFiles.length === sourceFiles.length,
    `发布文件数 ${publishedFiles.length} 与源文件数 ${sourceFiles.length} 不一致`,
  );
  for (const source of sourceFiles) {
    const rel = relPosix(appRoot, source);
    const target = path.join(published, rel);
    if (!fs.existsSync(target)) {
      fail(`Hugo 未复制 ${rel}`);
      continue;
    }
    if (sha256(source) !== sha256(target)) fail(`Hugo 改变了 ${rel} 的字节`);
  }

  const home = readText(path.join(destination, "index.html"));
  const about = readText(path.join(destination, "about", "index.html"));
  const appHome = readText(path.join(published, "index.html"));
  assert(home.includes("小福子实验室"), "博客首页丢失");
  assert(!home.includes("Agent 学习伴侣"), "博客首页被学习应用替换");
  assert(about.includes("OpenClaw"), "博客关于页丢失");
  assert(fs.existsSync(path.join(destination, "posts", "hello", "index.html")), "原有文章 /posts/hello/ 没有生成");
  const coverName = "openclaw-medimaging-v1.png";
  assert(
    sha256(path.join(repoRoot, "static", "covers", coverName)) ===
      sha256(path.join(destination, "covers", coverName)),
    "原有封面在发布结果中被改动",
  );
  assert(appHome.includes("Agent 学习伴侣"), "发布后的学习应用首页内容不对");
  console.log(`hugo ok: ${hugo} destination files preserved`);
  return destination;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".json": "application/json",
    ".xml": "application/xml",
  };
  return types[ext] || "application/octet-stream";
}

function startServer(siteDir) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
    if (!pathname.startsWith(`${sitePrefix}/`) && pathname !== sitePrefix) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("missing site prefix");
      return;
    }
    const rel = pathname.slice(sitePrefix.length).replace(/^\/+/, "");
    const target = path.resolve(siteDir, rel);
    if (target !== siteDir && !target.startsWith(`${siteDir}${path.sep}`)) {
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      response.end("bad path");
      return;
    }
    let stat = fs.existsSync(target) ? fs.statSync(target) : null;
    if (stat?.isDirectory()) {
      if (!pathname.endsWith("/")) {
        response.writeHead(301, { location: `${pathname}/` });
        response.end();
        return;
      }
      const index = path.join(target, "index.html");
      if (!fs.existsSync(index)) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("no index");
        return;
      }
      stat = fs.statSync(index);
      const body = fs.readFileSync(index);
      response.writeHead(200, { "content-type": contentType(index), "content-length": body.length });
      response.end(body);
      return;
    }
    if (!stat) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("not found");
      return;
    }
    const body = fs.readFileSync(target);
    response.writeHead(200, { "content-type": contentType(target), "content-length": body.length });
    response.end(body);
  });
  server.listen(0, "127.0.0.1");
  return server;
}

async function textOf(response) {
  return Buffer.from(await response.arrayBuffer()).toString("utf8");
}

async function checkHttp(origin, siteDir) {
    const noSlash = await fetch(`${origin}${appPrefix}`, { redirect: "manual" });
    assert(noSlash.status === 301, `无斜杠地址应 301，实际 ${noSlash.status}`);
    assert(noSlash.headers.get("location") === `${appPrefix}/`, `斜杠跳转位置不对: ${noSlash.headers.get("location")}`);

    const home = await fetch(`${origin}${appPrefix}/`);
    const homeText = await textOf(home);
    assert(home.status === 200, `学习首页状态 ${home.status}`);
    assert(homeText.includes("Agent 学习伴侣"), "学习首页正文不对");
    assert(home.headers.get("content-security-policy") == null, "响应带了 CSP");

    const chapters = await fetch(`${origin}${appPrefix}/chapters/`);
    assert((await textOf(chapters)).includes(`${appPrefix}/chapters/1/`), "十章目录缺少第一章链接");

    const lesson = await fetch(`${origin}${appPrefix}/learn/1/react/`);
    assert((await textOf(lesson)).includes("把一次工具调用写成四行"), "课次正文没有发布出来");

    const quiz = await fetch(`${origin}${appPrefix}/quiz/1/`);
    assert((await textOf(quiz)).includes("最小工程公式"), "测验题没有发布出来");

    const flight = await fetch(`${origin}${appPrefix}/chapters/index.txt`);
    const flightText = await textOf(flight);
    assert(flight.status === 200, "章节 index.txt 不可访问");
    assert((flight.headers.get("content-type") || "").startsWith("text/plain"), "index.txt 不是 text/plain，客户端导航会退回整页加载");
    assert(flightText.includes("chapters"), "章节 RSC 载荷内容不对");

    const quizHtml = readText(path.join(siteDir, "ai-agent", "quiz", "1", "index.html"));
    const encoded = quizHtml.match(/\/xiaofuzi-lab\/ai-agent\/_next\/[^"]*%5B[^"]+\.js/)?.[0];
    assert(encoded, "测验页没有百分号编码的动态路由脚本");
    if (encoded) {
      const asset = await fetch(`${origin}${encoded}`);
      assert(asset.status === 200, `编码后的脚本不可访问: ${encoded}`);
    }

    const blog = await fetch(`${origin}${sitePrefix}/`);
    const blogText = await textOf(blog);
    assert(blog.status === 200 && blogText.includes("小福子实验室"), "博客首页在前缀下不可访问");
    assert(!blogText.includes("Agent 学习伴侣"), "博客首页混入了学习应用");

    const about = await fetch(`${origin}${sitePrefix}/about/`);
    assert((await textOf(about)).includes("OpenClaw"), "博客关于页在前缀下不可访问");
    const post = await fetch(`${origin}${sitePrefix}/posts/hello/`);
    assert(post.status === 200, "原有文章在前缀下不可访问");
    const cover = await fetch(`${origin}${sitePrefix}/covers/openclaw-medimaging-v1.png`);
    assert(cover.status === 200, "原有封面不可访问");
    assert((cover.headers.get("content-type") || "").includes("image/png"), "封面类型不对");

    const missing = await fetch(`${origin}${appPrefix}/missing-route/`);
    assert(missing.status === 404, "未知学习路径应返回 404");
    console.log(`http ok: ${origin}${appPrefix}/`);
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      } else if (message.method) {
        this.events.push(message);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const promise = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return promise;
  }
}

async function waitFor(fn, label, timeoutMs = 8000) {
  const start = Date.now();
  let last = "";
  while (Date.now() - start < timeoutMs) {
    last = await fn();
    if (last) return last;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(`等待超时: ${label}`);
  return "";
}

async function checkBrowser(origin) {
  if (typeof WebSocket === "undefined") {
    console.log("skip browser: 当前 Node 没有 WebSocket");
    return;
  }
  const chrome = chromeBinary();
  if (!chrome) {
    const message = "未找到 Chrome，跳过浏览器点击";
    if (process.env.REQUIRE_BROWSER === "1") fail(message);
    else console.log(`skip browser: ${message}`);
    return;
  }
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), "xiaofuzi-chrome-"));
  const debugPort = 9333 + Math.floor(Math.random() * 1000);
  const child = spawn(chrome, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${debugPort}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${userData}`,
    "about:blank",
  ], { stdio: "ignore" });
  try {
    let version;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try {
        version = await fetch(`http://127.0.0.1:${debugPort}/json/version`).then((response) => response.json());
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    assert(version?.webSocketDebuggerUrl, "Chrome 调试端口没有起来");
    if (!version?.webSocketDebuggerUrl) return;
    const browser = new Cdp(new WebSocket(version.webSocketDebuggerUrl));
    await once(browser.ws, "open");
    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const { webSocketDebuggerUrl } = (await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => response.json()))
      .find((page) => page.id === targetId);
    const page = new Cdp(new WebSocket(webSocketDebuggerUrl));
    await once(page.ws, "open");
    await page.send("Page.enable");
    await page.send("Network.enable");
    await page.send("Runtime.enable");

    async function bodyText() {
      const result = await page.send("Runtime.evaluate", { expression: "document.body ? document.body.innerText : ''", returnByValue: true });
      return result.result.value || "";
    }
    async function currentPath() {
      const result = await page.send("Runtime.evaluate", { expression: "location.pathname", returnByValue: true });
      return result.result.value || "";
    }
    async function open(urlPath) {
      page.events = page.events.filter(() => false);
      await page.send("Page.navigate", { url: `${origin}${urlPath}` });
      await waitFor(async () => page.events.some((event) => event.method === "Page.loadEventFired") ? "loaded" : "", urlPath);
    }
    async function clickHref(href) {
      const result = await page.send("Runtime.evaluate", {
        expression: `(() => { const node = document.querySelector(${JSON.stringify(`a[href="${href}"]`)}); if (!node) return "missing"; node.click(); return "clicked"; })()`,
        returnByValue: true,
      });
      assert(result.result.value === "clicked", `找不到链接 ${href}`);
    }

    await open(`${appPrefix}/`);
    const homeText = await waitFor(async () => (await bodyText()).includes("从第 1 章开始") ? "ready" : "", "首页水合");
    assert(homeText === "ready", "首页脚本没有进入可学习状态");
    const badHome = page.events.filter((event) => {
      if (event.method === "Network.responseReceived" && event.params.response.status >= 400) {
        return event.params.response.url.includes(sitePrefix);
      }
      if (event.method === "Network.loadingFailed") {
        const failedUrl = event.params?.request?.url || "";
        return failedUrl.includes(sitePrefix);
      }
      return false;
    });
    assert(badHome.length === 0, `首页有失败资源 ${badHome.map((event) => event.params?.response?.url || event.params?.errorText || event.method).join(", ")}`);

    await clickHref(`${appPrefix}/chapters/`);
    await waitFor(async () => (await currentPath()) === `${appPrefix}/chapters/` && (await bodyText()).includes("第 1 章") ? "ready" : "", "进入十章");
    await clickHref(`${appPrefix}/chapters/1/`);
    await waitFor(async () => (await currentPath()) === `${appPrefix}/chapters/1/` ? "ready" : "", "进入第一章");
    await clickHref(`${appPrefix}/learn/1/react/`);
    await waitFor(async () => (await bodyText()).includes("把一次工具调用写成四行") ? "ready" : "", "进入课次");
    await open(`${appPrefix}/quiz/1/`);
    await waitFor(async () => (await bodyText()).includes("最小工程公式") ? "ready" : "", "打开测验");
    for (let question = 0; question < 6; question += 1) {
      const marker = `第 ${question + 1} / 6 题`;
      await waitFor(async () => (await bodyText()).includes(marker) ? "ready" : "", marker);
      const picked = await page.send("Runtime.evaluate", {
        expression: `(() => { const node = document.querySelector('fieldset button[aria-pressed="false"]'); if (!node) return "missing"; node.click(); return "picked"; })()`,
        returnByValue: true,
      });
      assert(picked.result.value === "picked", `第 ${question + 1} 题没有选项`);
      const label = question < 5 ? "下一题" : "交卷";
      const advanced = await waitFor(async () => {
        const result = await page.send("Runtime.evaluate", {
          expression: `(() => { const node = [...document.querySelectorAll("button")].find((item) => item.textContent.trim() === ${JSON.stringify(label)} && !item.disabled); if (!node) return ""; node.click(); return "clicked"; })()`,
          returnByValue: true,
        });
        return result.result.value;
      }, label);
      assert(advanced === "clicked", `没有点到${label}`);
    }
    const explained = await waitFor(async () => {
      const text = await bodyText();
      return text.includes("环境在边界外") || text.includes("参考答案") || text.includes("答对") || text.includes("答错") ? "ready" : "";
    }, "测验交卷");
    assert(explained === "ready", "交卷后没有出现得分或解析");

    await open(`${sitePrefix}/`);
    const blogText = await bodyText();
    assert(blogText.includes("小福子实验室"), "浏览器里的博客首页不对");
    assert(!blogText.includes("从第 1 章开始"), "博客首页显示成了学习应用");
    if (explained === "ready" && blogText.includes("小福子实验室")) {
      console.log("browser ok: home, chapters, lesson, quiz submit, blog home");
    }
    page.ws.close();
    browser.ws.close();
  } finally {
    child.kill("SIGKILL");
    fs.rmSync(userData, { recursive: true, force: true });
  }
}

async function main() {
  process.chdir(repoRoot);
  checkSourceTree();
  checkSiteUntouched();
  const destination = await buildWithHugo();
  if (destination) {
    const server = startServer(destination);
    await once(server, "listening");
    const { port } = server.address();
    const origin = `http://127.0.0.1:${port}`;
    try {
      await checkHttp(origin, destination);
      if (failures.length === 0) await checkBrowser(origin);
    } finally {
      server.close();
      fs.rmSync(destination, { recursive: true, force: true });
    }
  }
  if (failures.length) {
    console.error(`\n${failures.length} 项检查没有通过`);
    process.exit(1);
  }
  console.log("all checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

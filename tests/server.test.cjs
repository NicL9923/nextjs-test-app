const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");

test("health and SPA fallback work under a hidden checkout path", async (t) => {
  const root = path.resolve(__dirname, "..");
  const scratch = process.platform === "darwin" ? "/Volumes/DevSSD/scratch" : os.tmpdir();
  const fixture = await fs.mkdtemp(path.join(scratch, ".express-spa-"));
  t.after(() => fs.rm(fixture, { recursive: true, force: true }));
  await fs.copyFile(path.join(root, "server.js"), path.join(fixture, "server.js"));
  await fs.symlink(path.join(root, "node_modules"), path.join(fixture, "node_modules"), "dir");
  await fs.mkdir(path.join(fixture, "client", "dist"), { recursive: true });
  const html = "<!doctype html><title>SPA fixture</title>";
  await fs.writeFile(path.join(fixture, "client", "dist", "index.html"), html);
  const app = require(path.join(fixture, "server.js"));
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of ["/", "/nested/deep/route"]) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.equal(await response.text(), html);
  }
  const health = await fetch(base + "/api/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");
});

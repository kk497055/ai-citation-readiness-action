const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const action = path.resolve(__dirname, "..", "index.js");

function fixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "citation-action-"));
  for (const [name, contents] of Object.entries(files)) {
    const target = path.join(dir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  }
  return dir;
}

test("reports 100 for a site containing all five signals", () => {
  const dir = fixture({
    "index.html": `<!doctype html><title>Clear Example Company</title><h1>Clear Example Company</h1><p>Pricing and FAQ</p><a href="/evidence">Evidence</a><script type="application/ld+json">{"@type":"Organization"}</script>`,
    "robots.txt": "User-agent: *\nAllow: /",
    "sitemap.xml": "<urlset></urlset>",
  });
  const output = path.join(dir, "output.txt");
  const run = spawnSync(process.execPath, [action], {
    env: { ...process.env, INPUT_PATH: dir, GITHUB_OUTPUT: output },
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /Score: 100\/100/);
  assert.equal(fs.readFileSync(output, "utf8"), "score=100\n");
});

test("fails clearly when the configured path has no HTML", () => {
  const dir = fixture({ "robots.txt": "User-agent: *" });
  const run = spawnSync(process.execPath, [action], {
    env: { ...process.env, INPUT_PATH: dir },
    encoding: "utf8",
  });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /No HTML files found/);
});

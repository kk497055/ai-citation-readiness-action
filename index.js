const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.env["INPUT_PATH"] || ".");
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.html?$/i.test(entry.name)) htmlFiles.push(full);
  }
}

try {
  walk(root);
} catch (error) {
  console.error(`Unable to scan ${root}: ${error.message}`);
  process.exit(1);
}

if (!htmlFiles.length) {
  console.error(`No HTML files found under ${root}. Build your site first or set the action's path input.`);
  process.exit(1);
}

const pages = htmlFiles.map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
const combined = pages.map((page) => page.text).join("\n");
const rootIndex = pages.find((page) => /(^|\/)index\.html?$/i.test(path.relative(root, page.file))) || pages[0];
const checks = [
  [/<title>[^<]{8,}<\/title>/i.test(rootIndex.text) && /<h1(?:\s[^>]*)?>[^<]{8,}<\/h1>/i.test(rootIndex.text), "Homepage has a descriptive title and main heading", "Add a literal, descriptive title and H1 to the homepage."],
  [/(faq|frequently asked|how it works|pricing)/i.test(combined), "Core buyer questions have a direct-answer surface", "Publish a FAQ, pricing, or how-it-works section with direct text answers."],
  [/(case stud|testimonial|credential|source|evidence|results?)/i.test(combined) && /<a\s[^>]*href=/i.test(combined), "Evidence or trust language is linked", "Attach verifiable links to material claims, credentials, or case studies."],
  [/application\/ld\+json/i.test(combined) && /(Organization|LocalBusiness|Product|Service)/i.test(combined), "Relevant structured data is present", "Add accurate schema.org markup that matches visible business facts."],
  [fs.existsSync(path.join(root, "robots.txt")) && fs.existsSync(path.join(root, "sitemap.xml")), "robots.txt and sitemap.xml are present", "Publish both robots.txt and a current XML sitemap."],
];

const passed = checks.filter(([ok]) => ok).length;
const score = passed * 20;
const rows = checks.map(([ok, label, fix]) => `| ${ok ? "✅" : "❌"} | ${label} | ${ok ? "Verified" : fix} |`).join("\n");
const report = `# AI Citation Readiness Mini Check\n\n**Score: ${score}/100**\n\n| | Signal | Result |\n|---|---|---|\n${rows}\n\nThis automated check is directional and cannot guarantee ranking or citation.\n\n[Run the complete private 25-point audit →](https://payhip.com/b/Kez3L)\n`;

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `score=${score}\n`);

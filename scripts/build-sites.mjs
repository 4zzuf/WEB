import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const publicDir = path.join(dist, "server", "public");
const serverDir = path.join(dist, "server");

const entries = [
  "index.html",
  "nosotros.html",
  "css/electrosolar-redesign.css",
  "css/style.css",
  "js/main.js",
  "videos/video.webm"
];

await rm(dist, { recursive: true, force: true });
await mkdir(publicDir, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!existsSync(source)) {
    continue;
  }

  const target = path.join(publicDir, entry);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
}

await writeFile(
  path.join(serverDir, "index.js"),
  `const FALLBACK_HTML = "/index.html";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      url.pathname = FALLBACK_HTML;
    }

    let response = await env.ASSETS.fetch(new Request(url, request));

    if (response.status === 404 && !url.pathname.includes(".")) {
      url.pathname = FALLBACK_HTML;
      response = await env.ASSETS.fetch(new Request(url, request));
    }

    return response;
  }
};
`
);

await mkdir(path.join(dist, ".openai"), { recursive: true });
await cp(
  path.join(root, ".openai", "hosting.json"),
  path.join(dist, ".openai", "hosting.json")
);

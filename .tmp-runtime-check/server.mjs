import { statSync } from "node:fs";
import { join, normalize } from "node:path";

const root = join(import.meta.dir, "dist");
const port = Number.parseInt(process.env.PORT ?? "8080", 10);

function buildRuntimeConfig() {
  return JSON.stringify({
    VITE_SERVER_URL: process.env.VITE_SERVER_URL ?? "",
  });
}

const runtimeConfigScript = `window.__APP_CONFIG__ = ${buildRuntimeConfig()};\n`;

const runtimeConfigTag = '<script src="/runtime-config.js"></script>';

function resolveAssetPath(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const relativePath = normalized === "/" ? "index.html" : normalized.replace(/^[/\\]/, "");
  const filePath = join(root, relativePath);

  try {
    if (statSync(filePath).isFile()) {
      return filePath;
    }
  } catch {
    // Fall through to the SPA entrypoint.
  }

  return join(root, "index.html");
}



function getIndexHtml() {
  const indexHtml = Bun.file(join(root, "index.html")).text();
  return indexHtml.then((html) => {
    if (html.includes(runtimeConfigTag)) {
      return html;
    }

    return html.replace('</body>', `  ${runtimeConfigTag}\n  </body>`);
  });
}
async function getResponse(request) {
  const pathname = new URL(request.url).pathname;

  if (pathname === "/runtime-config.js") {
    return new Response(runtimeConfigScript, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const assetPath = resolveAssetPath(request.url);
  if (assetPath === join(root, "index.html")) {
    return new Response(await getIndexHtml(), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  return new Response(Bun.file(assetPath));
}
Bun.serve({
  hostname: "0.0.0.0",
  port,
  fetch(request) {
    return getResponse(request);
  },
});

console.log(`Serving static files from ${root} on port ${port}`);

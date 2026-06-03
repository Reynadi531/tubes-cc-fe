import { statSync } from "node:fs";
import { join, normalize } from "node:path";

const root = join(import.meta.dir, "dist");
const port = Number.parseInt(process.env.PORT ?? "8080", 10);

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

Bun.serve({
  hostname: "0.0.0.0",
  port,
  fetch(request) {
    return new Response(Bun.file(resolveAssetPath(request.url)));
  },
});

console.log(`Serving static files from ${root} on port ${port}`);

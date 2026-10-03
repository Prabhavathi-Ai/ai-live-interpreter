const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

if (!backendUrl) {
  console.error(
    "NEXT_PUBLIC_BACKEND_URL must be set to the deployed FastAPI URL before building."
  );
  process.exit(1);
}

let parsedUrl;
try {
  parsedUrl = new URL(backendUrl);
} catch {
  console.error("NEXT_PUBLIC_BACKEND_URL must be a valid absolute URL.");
  process.exit(1);
}

if (
  !["http:", "https:"].includes(parsedUrl.protocol) ||
  !parsedUrl.hostname ||
  parsedUrl.username ||
  parsedUrl.password ||
  (parsedUrl.pathname !== "/" && parsedUrl.pathname !== "") ||
  parsedUrl.search ||
  parsedUrl.hash
) {
  console.error(
    "NEXT_PUBLIC_BACKEND_URL must be an HTTP(S) origin without credentials, path, query, or fragment."
  );
  process.exit(1);
}

if (parsedUrl.protocol !== "https:") {
  console.error("Production frontend builds require an HTTPS backend URL.");
  process.exit(1);
}

import path from "node:path";
import { fileURLToPath } from "node:url";

const dashboardDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingRoot: path.join(dashboardDir, "../.."),
  outputFileTracingIncludes: {
    "/api/rag/search": ["./rag/foodhub/normalized/chunks.jsonl"]
  }
};

export default nextConfig;

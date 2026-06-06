import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const dashboardRoot = process.cwd();
const source = path.join(dashboardRoot, ".next");
const nestedOutput = path.join(dashboardRoot, "apps", "dashboard", ".next");

if (path.resolve(source) !== path.resolve(nestedOutput)) {
  await rm(nestedOutput, { recursive: true, force: true });
  await mkdir(path.dirname(nestedOutput), { recursive: true });
  await cp(source, nestedOutput, { recursive: true });
}

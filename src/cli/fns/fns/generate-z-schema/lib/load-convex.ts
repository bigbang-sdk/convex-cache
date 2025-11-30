import { loadConvexApi } from "../utils/load-convex-api";
import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";

export const loadConvex = async () => {
  const args = process.argv.slice(2);
  const convexDir = resolveConvexDir(args);

  if (!fs.existsSync(convexDir)) {
    console.warn('⚠️  No "convex" directory found in this project. Skipping schema generation.');
    return;
  }

  const api = await loadConvexApi(convexDir);
  if (!api) return;

  const files = await findConvexSourceFiles(convexDir);

  return { convexDir, api, files };
};

const resolveConvexDir = (args: string[]): string => {
  let convexDir = path.join(process.cwd(), "convex");

  const idx = args.indexOf("--convexDir");
  if (idx !== -1 && args[idx + 1]) {
    convexDir = path.resolve(args[idx + 1] as string);
  }

  return convexDir;
};

const findConvexSourceFiles = async (convexDir: string): Promise<string[]> => {
  return fg("**/*.ts", {
    cwd: convexDir,
    ignore: ["_generated/**/*.ts"],
    absolute: true,
  });
};

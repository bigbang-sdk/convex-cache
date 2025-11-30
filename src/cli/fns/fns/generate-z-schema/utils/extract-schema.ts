import { ZodType } from "zod";
import { AnyApi } from "convex/server";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { findFunctionReference } from "./find-fn-ref";
import { getFunctionName } from "convex/server";
import { ZOD_JSON } from "@bigbang-sdk/zod-json";
import { SchemaEntry } from "../generate";

const isConvexFn = (value: unknown): boolean => {
  if (!value || (typeof value !== "function" && typeof value !== "object")) {
    return false;
  }
  const maybeFn = value as { isQuery?: boolean; isPublic?: boolean };
  return Boolean(maybeFn.isQuery && maybeFn.isPublic);
};

const hasZReturn = (value: unknown): value is { __zReturn: ZodType } => {
  return !!value && (typeof value === "function" || typeof value === "object") && "__zReturn" in (value as any) && Boolean((value as any).__zReturn);
};

export const extractSchema = async (file: string, api: AnyApi, convexDir: string): Promise<SchemaEntry[]> => {
  const entries: SchemaEntry[] = [];

  let mod: Record<string, unknown>;
  try {
    mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
  } catch (err) {
    console.warn(`⚠️  Failed to import ${file}:`, err);
    return entries;
  }

  const relativePath = path.relative(convexDir, file);
  const modulePath = relativePath.replace(/\.ts$/, "");

  for (const [exportName, value] of Object.entries(mod)) {
    if (!hasZReturn(value)) continue;
    if (!isConvexFn(value)) continue;

    const zReturn = value.__zReturn;

    const fnRef = findFunctionReference(api, modulePath, exportName);
    if (!fnRef) continue;

    const fnName = getFunctionName(fnRef);

    try {
      const jsonSchema = ZOD_JSON.zodToJson(zReturn, { name: fnName });
      entries.push({
        fnName,
        schema: {
          output: jsonSchema,
        },
      });
    } catch (error) {
      console.error(`Error converting schema for ${fnName}:`, error);
    }
  }

  return entries;
};

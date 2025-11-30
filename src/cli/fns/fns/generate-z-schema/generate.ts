#!/usr/bin/env bun
import { type JsonSchema } from "@bigbang-sdk/zod-json";
import { loadConvex } from "./lib/load-convex";
import { buildSchemaMap } from "./lib/build-schema-map";

export type SchemaEntry = {
  fnName: string;
  schema: {
    output: JsonSchema;
  };
};

const main = async (): Promise<void> => {
  const loaded = await loadConvex();
  if (!loaded) return;
  const { api, files, convexDir } = loaded;

  await buildSchemaMap({ files, api, convexDir });
};

main().catch((err) => {
  console.error("⚠️  Bun generate-z-schema failed:", err);
  process.exit(1);
});

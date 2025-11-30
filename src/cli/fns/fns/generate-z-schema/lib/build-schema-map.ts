import { AnyApi } from "convex/server";
import { SchemaEntry } from "../generate";
import { extractSchema } from "../utils/extract-schema";
import path from "node:path";
import fs from "node:fs";

export const buildSchemaMap = async ({ files, api, convexDir }: { files: string[]; api: AnyApi; convexDir: string }) => {
  const perFileEntries = await Promise.all(files.map((file) => extractSchema(file, api, convexDir)));

  const byName = new Map<string, SchemaEntry>();
  for (const list of perFileEntries) {
    for (const entry of list) {
      byName.set(entry.fnName, entry);
    }
  }

  const schemaEntries = [...byName.values()];

  if (schemaEntries.length === 0) {
    console.warn("⚠️  No Zod-returning Convex functions found.");
    return;
  }

  const content = buildSchemaFile(schemaEntries);
  writeSchemasFile(content, convexDir);
};

export const buildSchemaFile = (schemaEntries: SchemaEntry[]): string => {
  // Ensure deterministic ordering by sorting by fnName.
  const sorted = [...schemaEntries].sort((a, b) => a.fnName.localeCompare(b.fnName));

  const schemaMapEntries = sorted.map(({ fnName, schema }) => `  "${fnName}": ${JSON.stringify(schema, null, 2)},`);

  return `// Auto-generated file - do not edit manually
    // This file contains JSON Schema definitions converted from Zod schemas
    
    export const schemaMap = {
    ${schemaMapEntries.join("\n")}
    };
    `;
};

export const writeSchemasFile = (content: string, convexDir: string): void => {
  const hostConvexZDir = path.join(convexDir, "_generated");

  fs.mkdirSync(hostConvexZDir, { recursive: true });
  fs.writeFileSync(path.join(hostConvexZDir, "schemaMap.js"), content);
};

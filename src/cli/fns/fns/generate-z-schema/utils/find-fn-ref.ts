import { AnyApi, FunctionReference } from "convex/server";

/**
 * Walk the convex API object to find a FunctionReference.
 */
export const findFunctionReference = (api: AnyApi, modulePath: string, exportName: string): FunctionReference<any, any> | undefined => {
  try {
    // Handle both "/" and "\" so this works on Windows too.
    const parts = modulePath.split(/[\\/]/).filter(Boolean);
    if (parts.length === 0) return undefined;

    let current: any = api;

    for (const part of parts) {
      if (!current || typeof current !== "object") return undefined;
      current = current[part];
      if (!current) return undefined;
    }

    if (exportName === "default") {
      return current.default || current;
    }

    return current[exportName] as FunctionReference<any, any> | undefined;
  } catch (error) {
    console.warn(`Failed to find function reference for ${modulePath}.${exportName}:`, error);
    return undefined;
  }
};

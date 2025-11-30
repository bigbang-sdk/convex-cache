import { useMemo } from "react";
import { makeQueryKey } from "../../../helpers/utils/query-key";

type T_UseQueryKey = {
  queryName: string;
  args: unknown;
  kind: "query" | "paginated";
};

export const useQueryKey = ({ queryName, args, kind }: T_UseQueryKey): string => {
  return useMemo(() => makeQueryKey({ queryName, args, kind }).key, [queryName, args, kind]);
};

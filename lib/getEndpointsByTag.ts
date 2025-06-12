export type ApiSpec = {
  paths: Record<
    string,
    Record<
      string,
      {
        tags?: string[];
        summary?: string;
        description?: string;
        operationId?: string;
      }
    >
  >;
};

export type Endpoint = {
  path: string;
  method: string;
  summary?: string;
  operationId?: string;
};

export type GroupedEndpoints = Record<string, Endpoint[]>;

/**
 * Agrupa os endpoints da especificação OpenAPI por tags (categorias).
 */
export function getEndpointsByTag(apiSpec: ApiSpec): GroupedEndpoints {
  const tagsMap: GroupedEndpoints = {};

  if (!apiSpec.paths) return tagsMap;

  for (const path in apiSpec.paths) {
    const methods = apiSpec.paths[path];

    for (const method in methods) {
      const operation = methods[method];
      const methodUpper = method.toUpperCase();

      if (!operation.tags || operation.tags.length === 0) {
        const tag = "Sem Categoria";
        if (!tagsMap[tag]) tagsMap[tag] = [];
        tagsMap[tag].push({
          path,
          method: methodUpper,
          summary: operation.summary,
          operationId: operation.operationId,
        });
        continue;
      }

      for (const tag of operation.tags) {
        if (!tagsMap[tag]) tagsMap[tag] = [];
        tagsMap[tag].push({
          path,
          method: methodUpper,
          summary: operation.summary,
          operationId: operation.operationId,
        });
      }
    }
  }

  return tagsMap;
}

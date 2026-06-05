import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DOC_URL = "https://partner-api.t2sonline.com/";
const SPEC_URL =
  "https://falcon-production-partner-api-assetsb7c36b1b-15to2ldkqpgba.s3.eu-west-2.amazonaws.com/dvad0kpzj1-production-1.4.51-oas30.json";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "rag", "foodhub");
const RAW = path.join(OUT, "raw");
const NORMALIZED = path.join(OUT, "normalized");
const MARKDOWN = path.join(OUT, "markdown");
const INDEX = path.join(OUT, "index");

const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "patch",
  "options",
  "head",
  "trace",
]);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stable(value[key])]),
  );
}

function jsonl(rows) {
  return `${rows.map((row) => JSON.stringify(stable(row))).join("\n")}\n`;
}

function mdEscape(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getByPointer(root, pointer) {
  if (!pointer.startsWith("#/")) return undefined;
  return pointer
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((node, part) => (node == null ? undefined : node[part]), root);
}

function collectRefs(node, refs = new Set()) {
  if (!node || typeof node !== "object") return refs;
  if (typeof node.$ref === "string") refs.add(node.$ref);
  for (const value of Object.values(node)) collectRefs(value, refs);
  return refs;
}

function collectReferencedSchemas(spec, node) {
  const output = {};
  const queue = [...collectRefs(node)].filter((ref) =>
    ref.startsWith("#/components/schemas/"),
  );
  const seen = new Set();

  while (queue.length) {
    const ref = queue.shift();
    if (seen.has(ref)) continue;
    seen.add(ref);
    const name = ref.split("/").at(-1);
    const schema = getByPointer(spec, ref);
    if (!schema) continue;
    output[name] = schema;
    for (const childRef of collectRefs(schema)) {
      if (childRef.startsWith("#/components/schemas/") && !seen.has(childRef)) {
        queue.push(childRef);
      }
    }
  }

  return output;
}

function schemaType(schema) {
  if (!schema) return "unknown";
  if (schema.$ref) return schema.$ref;
  if (schema.type === "array") {
    const item = schema.items?.$ref ?? schema.items?.type ?? "unknown";
    return `array<${item}>`;
  }
  if (schema.oneOf) return `oneOf(${schema.oneOf.map(schemaType).join(", ")})`;
  if (schema.anyOf) return `anyOf(${schema.anyOf.map(schemaType).join(", ")})`;
  if (schema.allOf) return `allOf(${schema.allOf.map(schemaType).join(", ")})`;
  return schema.type ?? "object";
}

function constraints(schema) {
  const keys = [
    "enum",
    "format",
    "minimum",
    "maximum",
    "minLength",
    "maxLength",
    "multipleOf",
    "default",
    "nullable",
    "uniqueItems",
  ];
  return Object.fromEntries(
    keys
      .filter((key) => schema?.[key] !== undefined)
      .map((key) => [key, schema[key]]),
  );
}

function flattenSchema(schema, prefix = "", parentRequired = []) {
  if (!schema || typeof schema !== "object") return [];
  const rows = [];
  const required = Array.isArray(schema.required) ? schema.required : [];

  if (schema.$ref || schema.oneOf || schema.anyOf || schema.allOf) {
    rows.push({
      path: prefix || "$",
      required: parentRequired.includes(prefix.split(".").at(-1)),
      type: schemaType(schema),
      description: schema.description ?? "",
      constraints: constraints(schema),
    });
  }

  if (schema.properties) {
    for (const [name, prop] of Object.entries(schema.properties)) {
      const propertyPath = prefix ? `${prefix}.${name}` : name;
      rows.push({
        path: propertyPath,
        required: required.includes(name),
        type: schemaType(prop),
        title: prop.title ?? "",
        description: prop.description ?? "",
        constraints: constraints(prop),
      });
      if (prop.properties || prop.$ref || prop.oneOf || prop.anyOf || prop.allOf) {
        rows.push(...flattenSchema(prop, propertyPath, required));
      }
      if (prop.type === "array" && prop.items) {
        rows.push(...flattenSchema(prop.items, `${propertyPath}[]`, []));
      }
    }
  }

  return rows;
}

function extractOperations(spec) {
  const operations = [];
  for (const [apiPath, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method)) continue;
      const refs = [...collectRefs(operation)].sort();
      const scopes = (operation.security ?? [])
        .flatMap((entry) => Object.values(entry).flat())
        .filter(Boolean);
      operations.push({
        id: `endpoint:${method.toUpperCase()} ${apiPath}`,
        type: "endpoint",
        tag: operation.tags?.[0] ?? "Untagged",
        method: method.toUpperCase(),
        path: apiPath,
        operationId: operation.operationId ?? "",
        summary: operation.summary ?? "",
        description: operation.description ?? "",
        scopes,
        parameters: operation.parameters ?? [],
        requestBody: operation.requestBody ?? null,
        responses: operation.responses ?? {},
        referencedSchemas: refs
          .filter((ref) => ref.startsWith("#/components/schemas/"))
          .map((ref) => ref.split("/").at(-1)),
        referencedSchemaBundle: collectReferencedSchemas(spec, operation),
        raw: operation,
      });
    }
  }
  return operations.sort((a, b) =>
    `${a.tag} ${a.path} ${a.method}`.localeCompare(`${b.tag} ${b.path} ${b.method}`),
  );
}

function extractSchemas(spec) {
  return Object.entries(spec.components?.schemas ?? {})
    .map(([name, schema]) => ({
      id: `schema:${name}`,
      type: "schema",
      name,
      title: schema.title ?? "",
      description: schema.description ?? "",
      required: schema.required ?? [],
      fields: flattenSchema(schema),
      referencedSchemas: [...collectRefs(schema)]
        .filter((ref) => ref.startsWith("#/components/schemas/"))
        .map((ref) => ref.split("/").at(-1))
        .sort(),
      raw: schema,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function extractWebhooks(spec) {
  return Object.entries(spec.webhooks ?? {})
    .map(([name, webhook]) => {
      const refs = [...collectRefs(webhook)].sort();
      return {
        id: `webhook:${name}`,
        type: "webhook",
        name,
        methods: Object.keys(webhook).filter((key) => HTTP_METHODS.has(key)),
        referencedSchemas: refs
          .filter((ref) => ref.startsWith("#/components/schemas/"))
          .map((ref) => ref.split("/").at(-1)),
        referencedSchemaBundle: collectReferencedSchemas(spec, webhook),
        raw: webhook,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function extractSecurity(spec) {
  return Object.entries(spec.components?.securitySchemes ?? {}).map(([name, raw]) => ({
    id: `security:${name}`,
    type: "security",
    name,
    raw,
  }));
}

function makeEndpointText(op) {
  const responseCodes = Object.keys(op.responses ?? {}).join(", ");
  return [
    `Endpoint: ${op.method} ${op.path}`,
    `API group: ${op.tag}`,
    `Operation ID: ${op.operationId}`,
    `Summary: ${op.summary}`,
    `Description: ${op.description}`,
    `Required scopes: ${op.scopes.join(", ") || "None listed"}`,
    `Path/query/header parameters: ${JSON.stringify(op.parameters)}`,
    `Request body: ${JSON.stringify(op.requestBody)}`,
    `Responses: ${responseCodes}`,
    `Referenced schemas: ${op.referencedSchemas.join(", ") || "None"}`,
    `Raw operation JSON: ${JSON.stringify(op.raw)}`,
    `Referenced schema bundle JSON: ${JSON.stringify(op.referencedSchemaBundle)}`,
  ].join("\n");
}

function makeSchemaText(schema) {
  const fields = schema.fields
    .map(
      (field) =>
        `${field.required ? "required" : "optional"} ${field.path}: ${field.type}; ${field.description}; constraints=${JSON.stringify(field.constraints)}`,
    )
    .join("\n");
  return [
    `Schema: ${schema.name}`,
    `Title: ${schema.title}`,
    `Description: ${schema.description}`,
    `Required fields: ${schema.required.join(", ") || "None listed"}`,
    `Referenced schemas: ${schema.referencedSchemas.join(", ") || "None"}`,
    "Flattened fields:",
    fields || "No direct fields",
    `Raw schema JSON: ${JSON.stringify(schema.raw)}`,
  ].join("\n");
}

function makeWebhookText(webhook) {
  return [
    `Webhook event: ${webhook.name}`,
    `Methods: ${webhook.methods.join(", ") || "None listed"}`,
    `Referenced schemas: ${webhook.referencedSchemas.join(", ") || "None"}`,
    `Raw webhook JSON: ${JSON.stringify(webhook.raw)}`,
    `Referenced schema bundle JSON: ${JSON.stringify(webhook.referencedSchemaBundle)}`,
  ].join("\n");
}

function chunkLongText(base, text, maxChars = 12000) {
  if (text.length <= maxChars) return [{ ...base, text }];
  const chunks = [];
  for (let start = 0, index = 1; start < text.length; start += maxChars, index += 1) {
    chunks.push({
      ...base,
      id: `${base.id}:part-${index}`,
      part: index,
      text: text.slice(start, start + maxChars),
    });
  }
  return chunks;
}

function makeRetrievalChunks({ spec, operations, schemas, webhooks, security }) {
  const chunks = [];
  for (const op of operations) {
    chunks.push(
      ...chunkLongText(
        {
          id: op.id,
          type: "endpoint",
          tag: op.tag,
          method: op.method,
          path: op.path,
          operationId: op.operationId,
          scopes: op.scopes,
          referencedSchemas: op.referencedSchemas,
        },
        makeEndpointText(op),
      ),
    );
  }
  for (const schema of schemas) {
    chunks.push(
      ...chunkLongText(
        {
          id: schema.id,
          type: "schema",
          name: schema.name,
          referencedSchemas: schema.referencedSchemas,
        },
        makeSchemaText(schema),
      ),
    );
  }
  for (const webhook of webhooks) {
    chunks.push(
      ...chunkLongText(
        {
          id: webhook.id,
          type: "webhook",
          name: webhook.name,
          referencedSchemas: webhook.referencedSchemas,
        },
        makeWebhookText(webhook),
      ),
    );
  }
  for (const item of security) {
    chunks.push({
      id: item.id,
      type: "security",
      name: item.name,
      text: `Security scheme: ${item.name}\nRaw security JSON: ${JSON.stringify(item.raw)}`,
    });
  }
  for (const [key, value] of Object.entries(spec)) {
    chunks.push(
      ...chunkLongText(
        { id: `raw-openapi-top-level:${key}`, type: "raw-openapi", key },
        `Top-level OpenAPI key: ${key}\nRaw JSON: ${JSON.stringify(value)}`,
      ),
    );
  }
  return chunks;
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(mdEscape).join(" | ")} |`),
  ].join("\n");
}

function endpointMarkdown(operations) {
  const byTag = Map.groupBy(operations, (op) => op.tag);
  const parts = [
    "# FoodHub Partner API Endpoint Reference",
    "",
    "Generated from the published OpenAPI document. The raw source is preserved in `../raw/foodhub-openapi.json`.",
    "",
  ];
  for (const [tag, ops] of [...byTag.entries()].sort()) {
    parts.push(`## ${tag}`, "");
    parts.push(
      table(
        ["Method", "Path", "Summary", "Scopes", "Request Schemas", "Response Codes"],
        ops.map((op) => [
          op.method,
          op.path,
          op.summary,
          op.scopes.join(", "),
          op.referencedSchemas.join(", "),
          Object.keys(op.responses).join(", "),
        ]),
      ),
      "",
    );
    for (const op of ops) {
      parts.push(`### ${op.method} ${op.path}`, "");
      parts.push(op.description || op.summary || "No description provided.", "");
      parts.push(`- Operation ID: \`${op.operationId}\``);
      parts.push(`- Required scopes: ${op.scopes.map((scope) => `\`${scope}\``).join(", ") || "None listed"}`);
      parts.push(`- Referenced schemas: ${op.referencedSchemas.map((name) => `\`${name}\``).join(", ") || "None"}`);
      parts.push(`- Response codes: ${Object.keys(op.responses).map((code) => `\`${code}\``).join(", ")}`);
      parts.push("");
    }
  }
  return `${parts.join("\n")}\n`;
}

function schemaMarkdown(schemas) {
  const parts = [
    "# FoodHub Partner API Schema Catalog",
    "",
    "This file lists every schema and its flattened fields. Full raw schemas are in `../normalized/schemas.jsonl` and `../raw/foodhub-openapi.json`.",
    "",
  ];
  for (const schema of schemas) {
    parts.push(`## ${schema.name}`, "");
    if (schema.title) parts.push(`Title: ${schema.title}`, "");
    if (schema.description) parts.push(schema.description, "");
    parts.push(`Required fields: ${schema.required.map((field) => `\`${field}\``).join(", ") || "None listed"}`, "");
    parts.push(
      table(
        ["Field", "Required", "Type", "Description", "Constraints"],
        schema.fields.map((field) => [
          field.path,
          field.required ? "yes" : "no",
          field.type,
          field.description,
          JSON.stringify(field.constraints),
        ]),
      ),
      "",
    );
  }
  return `${parts.join("\n")}\n`;
}

function webhookMarkdown(webhooks) {
  const parts = [
    "# FoodHub Partner API Webhook Events",
    "",
    "Full raw webhook definitions are preserved in `../normalized/webhooks.jsonl` and `../raw/foodhub-openapi.json`.",
    "",
    table(
      ["Webhook", "Methods", "Referenced Schemas"],
      webhooks.map((webhook) => [
        webhook.name,
        webhook.methods.join(", "),
        webhook.referencedSchemas.join(", "),
      ]),
    ),
    "",
  ];
  for (const webhook of webhooks) {
    parts.push(`## ${webhook.name}`, "");
    parts.push(`Methods: ${webhook.methods.map((method) => `\`${method.toUpperCase()}\``).join(", ") || "None listed"}`);
    parts.push(`Referenced schemas: ${webhook.referencedSchemas.map((name) => `\`${name}\``).join(", ") || "None"}`, "");
  }
  return `${parts.join("\n")}\n`;
}

function indexMarkdown(spec, operations, schemas, webhooks) {
  const byTag = Map.groupBy(operations, (op) => op.tag);
  return `# FoodHub API RAG

Generated from: ${DOC_URL}

OpenAPI source: ${SPEC_URL}

API title: ${spec.info?.title ?? ""}

API version: ${spec.info?.version ?? ""}

## Contents

- Raw OpenAPI JSON: \`raw/foodhub-openapi.json\`
- Source HTML shell: \`raw/partner-api-page.html\`
- Endpoint JSONL: \`normalized/endpoints.jsonl\`
- Schema JSONL: \`normalized/schemas.jsonl\`
- Webhook JSONL: \`normalized/webhooks.jsonl\`
- Security JSONL: \`normalized/security.jsonl\`
- Retrieval chunks JSONL: \`normalized/chunks.jsonl\`
- Human endpoint reference: \`markdown/api-reference.md\`
- Human schema catalog: \`markdown/schema-catalog.md\`
- Human webhook reference: \`markdown/webhooks.md\`
- Retrieval manifest: \`index/manifest.json\`
- Retrieval map: \`index/retrieval-map.json\`

## Counts

- Paths: ${Object.keys(spec.paths ?? {}).length}
- Operations: ${operations.length}
- Schemas: ${schemas.length}
- Webhook events: ${webhooks.length}

## Endpoint Groups

${[...byTag.entries()]
  .sort()
  .map(([tag, ops]) => `- ${tag}: ${ops.length}`)
  .join("\n")}
`;
}

function retrievalMap(chunks) {
  return Object.fromEntries(
    chunks.map((chunk) => [
      chunk.id,
      {
        type: chunk.type,
        tag: chunk.tag,
        method: chunk.method,
        path: chunk.path,
        name: chunk.name,
        key: chunk.key,
        referencedSchemas: chunk.referencedSchemas ?? [],
      },
    ]),
  );
}

async function main() {
  for (const dir of [RAW, NORMALIZED, MARKDOWN, INDEX, path.join(ROOT, "tools")]) {
    await mkdir(dir, { recursive: true });
  }

  const [docPage, specResponse] = await Promise.all([
    fetch(DOC_URL).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${DOC_URL}: ${res.status}`);
      return res.text();
    }),
    fetch(SPEC_URL).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${SPEC_URL}: ${res.status}`);
      return res.json();
    }),
  ]);

  const spec = specResponse;
  const operations = extractOperations(spec);
  const schemas = extractSchemas(spec);
  const webhooks = extractWebhooks(spec);
  const security = extractSecurity(spec);
  const chunks = makeRetrievalChunks({ spec, operations, schemas, webhooks, security });

  const metadata = {
    generatedAt: new Date().toISOString(),
    docUrl: DOC_URL,
    specUrl: SPEC_URL,
    title: spec.info?.title ?? "",
    version: spec.info?.version ?? "",
    serverUrls: (spec.servers ?? []).map((server) => server.url),
    counts: {
      paths: Object.keys(spec.paths ?? {}).length,
      operations: operations.length,
      schemas: schemas.length,
      webhooks: webhooks.length,
      securitySchemes: security.length,
      chunks: chunks.length,
    },
  };

  await Promise.all([
    writeFile(path.join(RAW, "partner-api-page.html"), docPage),
    writeFile(path.join(RAW, "foodhub-openapi.json"), `${JSON.stringify(spec, null, 2)}\n`),
    writeFile(path.join(RAW, "source-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`),
    writeFile(path.join(NORMALIZED, "endpoints.jsonl"), jsonl(operations)),
    writeFile(path.join(NORMALIZED, "schemas.jsonl"), jsonl(schemas)),
    writeFile(path.join(NORMALIZED, "webhooks.jsonl"), jsonl(webhooks)),
    writeFile(path.join(NORMALIZED, "security.jsonl"), jsonl(security)),
    writeFile(path.join(NORMALIZED, "chunks.jsonl"), jsonl(chunks)),
    writeFile(path.join(MARKDOWN, "api-reference.md"), endpointMarkdown(operations)),
    writeFile(path.join(MARKDOWN, "schema-catalog.md"), schemaMarkdown(schemas)),
    writeFile(path.join(MARKDOWN, "webhooks.md"), webhookMarkdown(webhooks)),
    writeFile(path.join(OUT, "README.md"), indexMarkdown(spec, operations, schemas, webhooks)),
    writeFile(path.join(INDEX, "manifest.json"), `${JSON.stringify(metadata, null, 2)}\n`),
    writeFile(path.join(INDEX, "retrieval-map.json"), `${JSON.stringify(retrievalMap(chunks), null, 2)}\n`),
  ]);

  console.log(JSON.stringify(metadata, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

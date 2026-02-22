import { MCPServer, error, object, text, widget } from "mcp-use/server";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { z } from "zod";

const server = new MCPServer({
  name: "duya-mcp",
  title: "duya-mcp",
  version: "1.0.0",
  description: "Outfit suggestion MCP server",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
});

const WIDGET_ROUTE_BASE = "/mcp-use/widgets/outfit-images";
const WIDGET_DIST_DIR = join(
  process.cwd(),
  "dist",
  "resources",
  "widgets",
  "outfit-images"
);

function getContentType(filePath: string) {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".map":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

async function serveWidgetFile(pathname: string) {
  const relative = pathname.replace(WIDGET_ROUTE_BASE, "") || "/";
  const normalized = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  const safePath = normalized === "/" ? "index.html" : normalized.replace(/^\/+/, "");
  const filePath = join(WIDGET_DIST_DIR, safePath);
  const data = await readFile(filePath);
  return { data, contentType: getContentType(filePath) };
}

server.app.get(WIDGET_ROUTE_BASE, async (c) => {
  try {
    const { data, contentType } = await serveWidgetFile("/");
    return c.body(data, 200, { "Content-Type": contentType });
  } catch {
    return c.text("Not Found", 404);
  }
});

server.app.get(`${WIDGET_ROUTE_BASE}/*`, async (c) => {
  try {
    const { data, contentType } = await serveWidgetFile(c.req.path);
    return c.body(data, 200, { "Content-Type": contentType });
  } catch {
    return c.text("Not Found", 404);
  }
});

const runtimeBaseUrl =
  process.env.MCP_URL ||
  process.env.MCP_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

server.tool(
  {
    name: "get-server-info",
    description: "Return runtime URLs for debugging deployment issues",
    schema: z.object({}),
  },
  async () =>
    object({
      baseUrl: runtimeBaseUrl,
      publicBaseUrl: `${runtimeBaseUrl}/mcp-use/public`,
      widgetBaseUrl: `${runtimeBaseUrl}/mcp-use/widgets/outfit-images`,
      mcpEndpoint: `${runtimeBaseUrl}/mcp`,
    })
);

server.tool(
  {
    name: "get-widget-status",
    description: "List built widget files on the server for debugging",
    schema: z.object({}),
  },
  async () => {
    try {
      const widgetDir = join(process.cwd(), "dist", "resources", "widgets");
      const widgets = await readdir(widgetDir, { withFileTypes: true });
      const widgetNames = widgets
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
      return object({
        widgetDir,
        widgetNames,
      });
    } catch (err) {
      return error(
        `Failed to read widget directory: ${
          err instanceof Error ? err.message : "unknown error"
        }`
      );
    }
  }
);

server.tool(
  {
    name: "probe-widget-route",
    description: "Probe the widget URL from the server to verify routing",
    schema: z.object({}),
  },
  async () => {
    const url = `${runtimeBaseUrl}/mcp-use/widgets/outfit-images/`;
    try {
      const response = await fetch(url, { method: "GET" });
      const textSnippet = (await response.text()).slice(0, 200);
      return object({
        url,
        status: response.status,
        ok: response.ok,
        textSnippet,
      });
    } catch (err) {
      return error(
        `Probe failed: ${err instanceof Error ? err.message : "unknown error"}`
      );
    }
  }
);

type OutfitItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  imagePath: string;
};

const tops: OutfitItem[] = [
  {
    id: "top-tshirt",
    name: "Cotton T-Shirt",
    description: "Soft crewneck tee with a clean, minimal fit.",
    tags: ["casual", "street", "weekend"],
    imagePath: "/top-tshirt.jpg",
  },
  {
    id: "top-shirt",
    name: "Oxford Shirt",
    description: "Crisp button-down with a structured collar.",
    tags: ["business", "smart-casual", "date"],
    imagePath: "/top-shirt.jpg",
  },
  {
    id: "top-pullover",
    name: "Merino Pullover",
    description: "Lightweight knit with refined texture.",
    tags: ["smart-casual", "winter", "work"],
    imagePath: "/top-pullover.png",
  },
  {
    id: "top-blazer",
    name: "Tailored Blazer",
    description: "Sharp silhouette with a polished finish.",
    tags: ["gala", "formal", "cocktail", "business"],
    imagePath: "/top-blazer.jpg",
  },
  {
    id: "top-silk-blouse",
    name: "Silk Blouse",
    description: "Draped silk with a subtle sheen.",
    tags: ["gala", "formal", "cocktail", "date"],
    imagePath: "/top-silk-blouse.jpg",
  },
];

const bottoms: OutfitItem[] = [
  {
    id: "bottom-jeans",
    name: "Dark Jeans",
    description: "Slim dark-wash denim with clean lines.",
    tags: ["casual", "street", "weekend"],
    imagePath: "/bottom-jeans.jpg",
  },
  {
    id: "bottom-chinos",
    name: "Tapered Chinos",
    description: "Cotton twill with a modern tapered leg.",
    tags: ["smart-casual", "work", "date"],
    imagePath: "/bottom-chinos.jpg",
  },
  {
    id: "bottom-pleated-trousers",
    name: "Pleated Trousers",
    description: "High-waist trousers with soft drape.",
    tags: ["formal", "gala", "business"],
    imagePath: "/bottom-pleated-trousers.jpg",
  },
  {
    id: "bottom-pencil-skirt",
    name: "Pencil Skirt",
    description: "Structured skirt with a clean hem.",
    tags: ["business", "cocktail", "date"],
    imagePath: "/bottom-pencil-skirt.jpg",
  },
  {
    id: "bottom-floor-skirt",
    name: "Floor-Length Skirt",
    description: "Elegant full-length skirt with movement.",
    tags: ["gala", "formal"],
    imagePath: "/bottom-floor-skirt.jpg",
  },
];

const shoes: OutfitItem[] = [
  {
    id: "shoes-sneakers",
    name: "Minimal Sneakers",
    description: "Clean leather sneakers for everyday wear.",
    tags: ["casual", "street", "weekend"],
    imagePath: "/shoes-sneakers.jpg",
  },
  {
    id: "shoes-loafers",
    name: "Leather Loafers",
    description: "Classic loafers with a sleek profile.",
    tags: ["smart-casual", "work", "date"],
    imagePath: "/shoes-loafers.jpg",
  },
  {
    id: "shoes-oxfords",
    name: "Polished Oxfords",
    description: "Formal lace-ups with a glossy finish.",
    tags: ["formal", "gala", "business"],
    imagePath: "/shoes-oxfords.jpg",
  },
  {
    id: "shoes-heels",
    name: "Classic Heels",
    description: "Pointed-toe heels for evening looks.",
    tags: ["cocktail", "gala", "formal"],
    imagePath: "/shoes-heels.jpg",
  },
  {
    id: "shoes-ankle-boots",
    name: "Ankle Boots",
    description: "Sleek boots with a modest heel.",
    tags: ["smart-casual", "winter", "date"],
    imagePath: "/shoes-ankle-boots.jpg",
  },
];

const allItems = [...tops, ...bottoms, ...shoes];

function normalizeOccasion(occasion: string) {
  return occasion.trim().toLowerCase();
}

function filterByOccasion(items: OutfitItem[], occasion: string) {
  if (!occasion) return items;
  const key = normalizeOccasion(occasion);
  const filtered = items.filter((item) =>
    item.tags.some((tag) => tag.toLowerCase() === key)
  );
  return filtered.length > 0 ? filtered : items;
}

function withImagePath(item: OutfitItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    imagePath: item.imagePath,
  };
}

function getPublicBaseUrl() {
  const baseUrl = process.env.MCP_URL || "http://localhost:3000";
  const normalized = baseUrl.includes("0.0.0.0")
    ? baseUrl.replace("0.0.0.0", "localhost")
    : baseUrl;
  return `${normalized}/mcp-use/public`;
}

function withImageUrl(item: OutfitItem) {
  if (item.imagePath.startsWith("http://") || item.imagePath.startsWith("https://")) {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imagePath,
    };
  }
  const publicBaseUrl = getPublicBaseUrl();
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    imageUrl: `${publicBaseUrl}${item.imagePath}`,
  };
}

server.tool(
  {
    name: "show-outfit-images",
    description:
      "Show selected outfit images in a widget for a given occasion",
    schema: z.object({
      occasion: z
        .string()
        .optional()
        .describe("Occasion (e.g., gala, business, date, casual)"),
      topId: z.string().describe("Selected top id"),
      bottomId: z.string().describe("Selected bottom id"),
      shoesId: z.string().describe("Selected shoes id"),
    }),
    widget: {
      name: "outfit-images",
      invoking: "Loading outfit images...",
      invoked: "Outfit images ready",
    },
  },
  async ({ occasion, topId, bottomId, shoesId }) => {
    const top = allItems.find((item) => item.id === topId);
    const bottom = allItems.find((item) => item.id === bottomId);
    const shoesItem = allItems.find((item) => item.id === shoesId);

    if (!top || !bottom || !shoesItem) {
      return error(
        "One or more selected items were not found. Please re-check the ids."
      );
    }

    return widget({
      props: {
        occasion,
        top: withImagePath(top),
        bottom: withImagePath(bottom),
        shoes: withImagePath(shoesItem),
      },
      output: text("Outfit images ready"),
    });
  }
);

server.tool(
  {
    name: "list-outfit-options",
    description:
      "List tops, bottoms, and shoes tailored to a given occasion",
    schema: z.object({
      occasion: z
        .string()
        .describe("Occasion (e.g., gala, business, date, casual)"),
    }),
  },
  async ({ occasion }) => {
    const filteredTops = filterByOccasion(tops, occasion);
    const filteredBottoms = filterByOccasion(bottoms, occasion);
    const filteredShoes = filterByOccasion(shoes, occasion);

    return object({
      occasion,
      tops: filteredTops.map(({ id, name, description, tags }) => ({
        id,
        name,
        description,
        tags,
      })),
      bottoms: filteredBottoms.map(({ id, name, description, tags }) => ({
        id,
        name,
        description,
        tags,
      })),
      shoes: filteredShoes.map(({ id, name, description, tags }) => ({
        id,
        name,
        description,
        tags,
      })),
    });
  }
);

server.tool(
  {
    name: "get-outfit-images",
    description:
      "Get image URLs for selected top, bottom, and shoes by id",
    schema: z.object({
      topId: z.string().describe("Selected top id"),
      bottomId: z.string().describe("Selected bottom id"),
      shoesId: z.string().describe("Selected shoes id"),
    }),
  },
  async ({ topId, bottomId, shoesId }) => {
    const top = allItems.find((item) => item.id === topId);
    const bottom = allItems.find((item) => item.id === bottomId);
    const shoesItem = allItems.find((item) => item.id === shoesId);

    if (!top || !bottom || !shoesItem) {
      return error(
        "One or more selected items were not found. Please re-check the ids."
      );
    }

    return object({
      top: withImageUrl(top),
      bottom: withImageUrl(bottom),
      shoes: withImageUrl(shoesItem),
    });
  }
);

server.listen().then(() => {
  console.log("Server running");
});

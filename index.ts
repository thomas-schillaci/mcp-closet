import { MCPServer, error, object, text, widget } from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "duya-mcp",
  title: "duya-mcp",
  version: "1.0.0",
  description: "Outfit suggestion MCP server",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
});


type OutfitItem = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  imagePath: string;
  priceUsd: number;
};

const tops: OutfitItem[] = [
  {
    id: "top-tshirt",
    name: "Cotton T-Shirt",
    description: "Soft crewneck tee with a clean, minimal fit.",
    tags: ["casual", "street", "weekend"],
    imagePath: "/top-tshirt.jpg",
    priceUsd: 28,
  },
  {
    id: "top-shirt",
    name: "Oxford Shirt",
    description: "Crisp button-down with a structured collar.",
    tags: ["business", "smart-casual", "date"],
    imagePath: "/top-shirt.jpg",
    priceUsd: 64,
  },
  {
    id: "top-pullover",
    name: "Merino Pullover",
    description: "Lightweight knit with refined texture.",
    tags: ["smart-casual", "winter", "work"],
    imagePath: "/top-pullover.png",
    priceUsd: 78,
  },
  {
    id: "top-blazer",
    name: "Tailored Blazer",
    description: "Sharp silhouette with a polished finish.",
    tags: ["gala", "formal", "cocktail", "business"],
    imagePath: "/top-blazer.jpg",
    priceUsd: 180,
  },
  {
    id: "top-silk-blouse",
    name: "Silk Blouse",
    description: "Draped silk with a subtle sheen.",
    tags: ["gala", "formal", "cocktail", "date"],
    imagePath: "/top-silk-blouse.jpg",
    priceUsd: 120,
  },
];

const bottoms: OutfitItem[] = [
  {
    id: "bottom-jeans",
    name: "Dark Jeans",
    description: "Slim dark-wash denim with clean lines.",
    tags: ["casual", "street", "weekend"],
    imagePath: "/bottom-jeans.jpg",
    priceUsd: 72,
  },
  {
    id: "bottom-chinos",
    name: "Tapered Chinos",
    description: "Cotton twill with a modern tapered leg.",
    tags: ["smart-casual", "work", "date"],
    imagePath: "/bottom-chinos.jpg",
    priceUsd: 68,
  },
  {
    id: "bottom-pleated-trousers",
    name: "Pleated Trousers",
    description: "High-waist trousers with soft drape.",
    tags: ["formal", "gala", "business"],
    imagePath: "/bottom-pleated-trousers.jpg",
    priceUsd: 110,
  },
  {
    id: "bottom-pencil-skirt",
    name: "Pencil Skirt",
    description: "Structured skirt with a clean hem.",
    tags: ["business", "cocktail", "date"],
    imagePath: "/bottom-pencil-skirt.jpg",
    priceUsd: 85,
  },
  {
    id: "bottom-floor-skirt",
    name: "Floor-Length Skirt",
    description: "Elegant full-length skirt with movement.",
    tags: ["gala", "formal"],
    imagePath: "/bottom-floor-skirt.jpg",
    priceUsd: 140,
  },
];

const shoes: OutfitItem[] = [
  {
    id: "shoes-sneakers",
    name: "Minimal Sneakers",
    description: "Clean leather sneakers for everyday wear.",
    tags: ["casual", "street", "weekend"],
    imagePath: "/shoes-sneakers.jpg",
    priceUsd: 95,
  },
  {
    id: "shoes-loafers",
    name: "Leather Loafers",
    description: "Classic loafers with a sleek profile.",
    tags: ["smart-casual", "work", "date"],
    imagePath: "/shoes-loafers.jpg",
    priceUsd: 130,
  },
  {
    id: "shoes-oxfords",
    name: "Polished Oxfords",
    description: "Formal lace-ups with a glossy finish.",
    tags: ["formal", "gala", "business"],
    imagePath: "/shoes-oxfords.jpg",
    priceUsd: 150,
  },
  {
    id: "shoes-heels",
    name: "Classic Heels",
    description: "Pointed-toe heels for evening looks.",
    tags: ["cocktail", "gala", "formal"],
    imagePath: "/shoes-heels.jpg",
    priceUsd: 120,
  },
  {
    id: "shoes-ankle-boots",
    name: "Ankle Boots",
    description: "Sleek boots with a modest heel.",
    tags: ["smart-casual", "winter", "date"],
    imagePath: "/shoes-ankle-boots.jpg",
    priceUsd: 135,
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
    priceUsd: item.priceUsd,
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
  async ({ topId, bottomId, shoesId }) => {
    const topOptions = tops;
    const bottomOptions = bottoms;
    const shoesOptions = shoes;
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
        selected: {
          topId,
          bottomId,
          shoesId,
        },
        tops: topOptions.map(withImagePath),
        bottoms: bottomOptions.map(withImagePath),
        shoes: shoesOptions.map(withImagePath),
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

import * as React from "react";
import { Image, McpUseProvider, useWidget, useWidgetTheme, type WidgetMetadata } from "mcp-use/react";
import { z } from "zod";

function useColors() {
  const theme = useWidgetTheme();
  return {
    background: theme === "dark" ? "#141414" : "#F6F2EC",
    panel: theme === "dark" ? "#1C1C1C" : "#FFFFFF",
    text: theme === "dark" ? "#EDE9E2" : "#1B1B1B",
    muted: theme === "dark" ? "#B9B3AA" : "#6A6258",
    border: theme === "dark" ? "#2A2A2A" : "#E1D7CB",
    accent: theme === "dark" ? "#D8B36A" : "#8B5A2B",
    accentSoft: theme === "dark" ? "#2D2418" : "#F1E5D8",
  };
}

const imageSchema = z.object({
  name: z.string(),
  imagePath: z.string(),
  id: z.string(),
  priceUsd: z.number(),
  description: z.string(),
});

const propsSchema = z.object({
  selected: z.object({
    topId: z.string(),
    bottomId: z.string(),
    shoesId: z.string(),
  }),
  tops: z.array(imageSchema),
  bottoms: z.array(imageSchema),
  shoes: z.array(imageSchema),
});

export const widgetMetadata: WidgetMetadata = {
  description: "Display selected outfit images",
  props: propsSchema,
  exposeAsTool: false,
};

type Props = z.infer<typeof propsSchema>;

export default function OutfitImages() {
  const { props, isPending } = useWidget<Props>();
  const colors = useColors();

  const [topIndex, setTopIndex] = React.useState(0);
  const [bottomIndex, setBottomIndex] = React.useState(0);
  const [shoesIndex, setShoesIndex] = React.useState(0);

  const tops = props?.tops ?? [];
  const bottoms = props?.bottoms ?? [];
  const shoes = props?.shoes ?? [];

  React.useEffect(() => {
    if (!props || tops.length === 0 || bottoms.length === 0 || shoes.length === 0) return;
    const topIdx = tops.findIndex((item) => item.id === props.selected.topId);
    const bottomIdx = bottoms.findIndex((item) => item.id === props.selected.bottomId);
    const shoesIdx = shoes.findIndex((item) => item.id === props.selected.shoesId);
    setTopIndex(topIdx >= 0 ? topIdx : 0);
    setBottomIndex(bottomIdx >= 0 ? bottomIdx : 0);
    setShoesIndex(shoesIdx >= 0 ? shoesIdx : 0);
  }, [props, tops, bottoms, shoes]);

  if (isPending || !props || tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    return (
      <McpUseProvider autoSize>
        <div style={{ padding: 24 }}>Loading outfit images...</div>
      </McpUseProvider>
    );
  }

  const makeControls = (
    items: z.infer<typeof imageSchema>[],
    index: number,
    setIndex: (value: number) => void
  ) => {
    const prev = () => setIndex((index - 1 + items.length) % items.length);
    const next = () => setIndex((index + 1) % items.length);
    return { prev, next };
  };

  const topControls = makeControls(tops, topIndex, setTopIndex);
  const bottomControls = makeControls(bottoms, bottomIndex, setBottomIndex);
  const shoesControls = makeControls(shoes, shoesIndex, setShoesIndex);

  const renderCarousel = (
    items: z.infer<typeof imageSchema>[],
    index: number,
    controls: { prev: () => void; next: () => void }
  ) => {
    const item = items[index];
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `${item.name} ${item.description}`
    )}`;
    return (
      <div
        style={{
          display: "grid",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <a href={searchUrl} target="_blank" rel="noreferrer">
              <Image
                src={item.imagePath}
                alt={item.name}
                style={{ width: "100%", borderRadius: 8, display: "block", cursor: "pointer" }}
              />
            </a>
            <button
              type="button"
              onClick={controls.prev}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(0, 0, 0, 0.55)",
                color: "#ffffff",
                borderRadius: 999,
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              ←
            </button>
            <button
              type="button"
              onClick={controls.next}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(0, 0, 0, 0.55)",
                color: "#ffffff",
                borderRadius: 999,
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              →
            </button>
          </div>
          <div style={{ display: "grid", gap: 6, minWidth: 220 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
              {item.name}
            </div>
            <div style={{ fontSize: 12, color: colors.muted }}>
              {item.description}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
              ${item.priceUsd.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <McpUseProvider autoSize>
      <div
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 150,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {renderCarousel(tops, topIndex, topControls)}
        {renderCarousel(bottoms, bottomIndex, bottomControls)}
        {renderCarousel(shoes, shoesIndex, shoesControls)}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: colors.panel,
              padding: "8px 12px",
              fontSize: 14,
              fontWeight: 700,
              textAlign: "center",
              width: "100%",
            }}
          >
            Total: $
            {(
              tops[topIndex]?.priceUsd +
              bottoms[bottomIndex]?.priceUsd +
              shoes[shoesIndex]?.priceUsd
            ).toFixed(0)}
          </div>
        </div>
      </div>
    </McpUseProvider>
  );
}

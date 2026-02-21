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
});

const propsSchema = z.object({
  occasion: z.string().optional(),
  top: imageSchema,
  bottom: imageSchema,
  shoes: imageSchema,
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

  if (isPending || !props) {
    return (
      <McpUseProvider autoSize>
        <div style={{ padding: 24 }}>Loading outfit images...</div>
      </McpUseProvider>
    );
  }

  return (
    <McpUseProvider autoSize>
      <div
        style={{
          fontFamily: "\"IBM Plex Serif\", \"Georgia\", serif",
          color: colors.text,
          background: colors.background,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          padding: 20,
          display: "grid",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            Selected outfit{props.occasion ? ` for ${props.occasion}` : ""}
          </div>
          <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
            Images for the client-selected top, bottom, and shoes.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {[
            { label: "Top", item: props.top },
            { label: "Bottom", item: props.bottom },
            { label: "Shoes", item: props.shoes },
          ].map(({ label, item }) => (
            <div
              key={label}
              style={{
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, color: colors.muted }}>{label}</div>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <Image
                src={item.imagePath}
                alt={item.name}
                style={{ width: "100%", borderRadius: 8 }}
              />
            </div>
          ))}
        </div>
      </div>
    </McpUseProvider>
  );
}

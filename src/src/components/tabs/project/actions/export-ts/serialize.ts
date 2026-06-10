import type { EColor } from "../../../../../document/types.misc";

export function stringLiteral(value: string): string {
  return JSON.stringify(value);
}

// Mirrors buildCSSColor in the preview: "#RRGGBB" + alpha byte -> "#RRGGBBAA".
export function cssColorLiteral(color: EColor): string {
  const alpha = Math.round(color.alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return JSON.stringify(`${color.color}${alpha}`);
}

// Text chunk styles use the bare "#RRGGBB" (no alpha), matching buildTextContent.
export function hexColorLiteral(color: EColor): string {
  return JSON.stringify(color.color);
}

// Assets (textures/fonts) cannot be embedded; leave a valid `undefined`
// placeholder naming the asset so the user swaps in their own resource.
export function assetPlaceholder(assetName: string | undefined): string {
  return `undefined /* TODO: ${assetName ?? "unknown asset"} */`;
}

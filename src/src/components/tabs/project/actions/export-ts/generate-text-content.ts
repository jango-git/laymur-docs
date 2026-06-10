import type { ETextChunk } from "../../../../../document/types.misc";
import { assetPlaceholder, hexColorLiteral, stringLiteral } from "./serialize";

// Reproduces buildTextContent from the preview: a UIText content array. The
// only non-serializable bit is the font (an asset), left as a placeholder.
export function generateTextContent(
  chunks: ETextChunk[],
  assetMap: Map<string, string>,
): string {
  const parts = chunks.map((chunk) => {
    const s = chunk.style;
    const style = [
      `color: ${hexColorLiteral(s.color)}`,
      `align: ${stringLiteral(s.align.toLowerCase())}`,
      `fontFamily: ${assetPlaceholder(assetMap.get(s.font))}`,
      `fontSize: ${s.fontSize}`,
      `fontStyle: ${stringLiteral(s.fontStyle.toLowerCase())}`,
      `fontWeight: ${stringLiteral(s.fontWeight.toLowerCase())}`,
      `lineHeight: ${s.lineHeight}`,
      `enableShadow: ${s.enableShadow}`,
      `shadowOffsetX: ${s.shadowOffsetX}`,
      `shadowOffsetY: ${s.shadowOffsetY}`,
      `shadowBlur: ${s.shadowBlur}`,
      `shadowColor: ${hexColorLiteral(s.shadowColor)}`,
      `enableStroke: ${s.enableStroke}`,
      `strokeColor: ${hexColorLiteral(s.strokeColor)}`,
      `strokeThickness: ${s.strokeThickness}`,
    ].join(", ");
    return `{ text: ${stringLiteral(chunk.text)}, style: { ${style} } }`;
  });
  return `[${parts.join(", ")}]`;
}

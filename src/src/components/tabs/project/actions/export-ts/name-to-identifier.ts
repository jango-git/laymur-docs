export function nameToIdentifier(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s_]/g, "")
    .trim()
    .split(/[\s_]+/)
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
}

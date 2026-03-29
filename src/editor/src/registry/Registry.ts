/**
 * Registry.ts
 *
 * Generic typed registry: an immutable keyed collection with O(1) lookup.
 */

export class Registry<T extends { type: string }> {
  private readonly map: Map<string, T>;

  constructor(private readonly items: T[]) {
    this.map = new Map(items.map((item) => [item.type, item]));
  }

  public get(type: string): T | undefined {
    return this.map.get(type);
  }

  public has(type: string): boolean {
    return this.map.has(type);
  }

  public all(): readonly T[] {
    return this.items;
  }
}

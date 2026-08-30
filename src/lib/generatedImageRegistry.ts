export type GeneratedImageIndexEntry = readonly [
  sourceWidth: number,
  aspectRatio: number,
  hash: string,
  variants: readonly (readonly [width: number, src: string])[],
];

export type GeneratedImageIndex = Readonly<
  Record<string, GeneratedImageIndexEntry>
>;

const registeredImageEntries = new Map<string, GeneratedImageIndexEntry>();

export const registerGeneratedImageIndex = (index: GeneratedImageIndex) => {
  for (const [source, entry] of Object.entries(index)) {
    registeredImageEntries.set(source, entry);
  }
};

export const getGeneratedImageIndexEntry = (source: string) =>
  registeredImageEntries.get(source);

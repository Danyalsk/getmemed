export const ACCENT_BACKGROUNDS = ["bg-brand", "bg-pop-cyan", "bg-pop-violet", "bg-pop-orange"] as const;
export const ACCENT_TEXTS = ["text-brand", "text-pop-cyan", "text-pop-violet", "text-pop-orange"] as const;

function accentIndex(seed: string): number {
  const hash = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % ACCENT_BACKGROUNDS.length;
}

export const accentBackground = (seed: string): string => ACCENT_BACKGROUNDS[accentIndex(seed)] ?? "bg-brand";

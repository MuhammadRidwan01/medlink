export function fuzzyMatch(query: string, text: string) {
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return { score: 0, indices: [] as number[] };
  // simple subsequence scoring
  let ti = 0;
  let score = 0;
  const indices: number[] = [];
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi]!;
    const found = t.indexOf(ch, ti);
    if (found === -1) return { score: -1, indices: [] };
    indices.push(found);
    // compactness bonus
    if (found === ti) score += 2; else score += 1 - Math.min((found - ti) / 10, 1) * 0.5;
    ti = found + 1;
  }
  // length bonus
  score += Math.max(0, 3 - (ti - indices[0]!));
  return { score, indices };
}

export function highlight(text: string, indices: number[]) {
  if (!indices.length) return [{ text, hit: false }];
  const parts: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i]!;
    if (idx > last) parts.push({ text: text.slice(last, idx), hit: false });
    parts.push({ text: text[idx]!, hit: true });
    last = idx + 1;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });
  return parts;
}


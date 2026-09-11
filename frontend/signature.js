// Coordinates stay in a fixed SVG space, so resizing never changes the artwork.
export class Signature {
  strokes = [];
  active = null;
  begin(point) { this.active = [point]; this.strokes.push(this.active); }
  move(point) {
    if (!this.active) return;
    const last = this.active.at(-1);
    if (Math.hypot(point.x - last.x, point.y - last.y) >= 0.6) this.active.push(point);
  }
  end() { this.active = null; }
  undo() { this.end(); this.strokes.pop(); }
  clear() { this.end(); this.strokes = []; }
}

const n = value => Number(value.toFixed(2));
export function pathData(points) {
  const first = points[0];
  if (points.length === 1) return `M ${n(first.x)} ${n(first.y)} l 0.01 0`;
  let path = `M ${n(first.x)} ${n(first.y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i], next = points[i + 1];
    path += ` Q ${n(p.x)} ${n(p.y)} ${n((p.x + next.x) / 2)} ${n((p.y + next.y) / 2)}`;
  }
  const last = points.at(-1);
  return `${path} L ${n(last.x)} ${n(last.y)}`;
}

export function paths(strokes) {
  return strokes.map(points => `<path d="${pathData(points)}"/>`).join('');
}

export function exportSVG(strokes) {
  if (!strokes.length) throw new Error('Draw a signature first.');
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const stroke of strokes) for (const {x, y} of stroke) {
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  const padding = 12;
  const width = n(right - left + padding * 2), height = n(bottom - top + padding * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${n(left - padding)} ${n(top - padding)} ${width} ${height}"><g fill="none" stroke="#172b25" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${paths(strokes)}</g></svg>`;
}

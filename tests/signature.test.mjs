import test from 'node:test';
import assert from 'node:assert/strict';
import { Signature, exportSVG, pathData } from '../frontend/signature.js';

test('pen lifts separate strokes and ignore movement while lifted', () => {
  const signature = new Signature();
  signature.begin({x: 10, y: 20});
  signature.move({x: 30, y: 40});
  signature.end();
  signature.move({x: 500, y: 300});
  signature.begin({x: 80, y: 90});
  signature.end();
  assert.deepEqual(signature.strokes.map(s => s.length), [2, 1]);
  signature.undo();
  assert.equal(signature.strokes.length, 1);
  signature.clear();
  assert.equal(signature.strokes.length, 0);
  assert.equal(signature.active, null);
});

test('SVG is transparent and crops to all strokes with padding', () => {
  const svg = exportSVG([[{x: 100, y: 50}, {x: 300, y: 150}], [{x: 400, y: 90}]]);
  assert.match(svg, /viewBox="88 38 324 124"/);
  assert.match(svg, /xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /fill="none"/);
  assert.equal((svg.match(/<path /g) ?? []).length, 2);
  assert.doesNotMatch(svg, /<rect|background|TRANSPARENT/);
});

test('single-point strokes remain visible and empty drawings cannot export', () => {
  assert.match(pathData([{x: 1, y: 2}]), /l 0.01 0/);
  assert.match(exportSVG([[{x: 1, y: 2}]]), /width="24" height="24"/);
  assert.throws(() => exportSVG([]), /Draw a signature/);
});

test('smoothing uses quadratic curves within sample bounds', () => {
  assert.equal(pathData([{x: 0, y: 0}, {x: 10, y: 20}, {x: 30, y: 0}]), 'M 0 0 Q 10 20 20 10 L 30 0');
});

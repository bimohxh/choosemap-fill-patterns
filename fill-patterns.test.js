import test from 'node:test';
import assert from 'node:assert/strict';
import { FILL_STYLES, fillPatternSpec, patternSvg, ringRadii } from './fill-patterns.js';

test('every advertised non-solid style produces a usable vector definition', () => {
  for (const { id } of FILL_STYLES) {
    const spec = fillPatternSpec(id, '#245c47', 640, 400);
    if (id === 'solid') { assert.equal(spec, null); continue; }
    assert.ok(spec.width > 0 && spec.height > 0 && spec.elements.length > 0);
    assert.match(patternSvg(spec, `demo-${id}`), /patternUnits="userSpaceOnUse"/);
    assert.ok(!patternSvg(spec, id).includes('strokeWidth'));
  }
});
test('unknown and solid styles fall back without a pattern', () => {
  assert.equal(fillPatternSpec('unknown', '#000'), null);
  assert.equal(patternSvg(null, 'empty'), '');
});
test('SVG attribute values cannot escape their quotes', () => {
  const svg = patternSvg(fillPatternSpec('hatch', '\" onload=\"alert(1)'), 'a\"&<>');
  assert.ok(svg.includes('&quot;'));
  assert.ok(svg.includes('&amp;'));
  assert.ok(!svg.includes('stroke="" onload='));
});
test('rings cover all four corners of a non-square viewport', () => {
  const radii = ringRadii(400, 640);
  assert.ok(radii.at(-1) >= Math.hypot(320, 200));
  assert.ok(radii.at(-2) < Math.hypot(320, 200));
});

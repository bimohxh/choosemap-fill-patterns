export const PATTERN_TILE = 12;
export const PARTICLE_RADIUS = 1.15;
export const HATCH_WIDTH = 1.2;
export const RING_SPACING = 5.5;
export const RING_WIDTH = 1.5;

export function ringRadii(height, width = 640) {
  const maxRadius = Math.hypot(width / 2, height / 2);
  return Array.from(
    { length: Math.ceil(maxRadius / RING_SPACING) },
    (_, i) => (i + 1) * RING_SPACING,
  );
}

export function patternColor(theme) {
  return theme.active;
}

export const FILL_STYLES = [
  { id: "solid", label: "Solid" },
  { id: "particles", label: "Dots" },
  { id: "rings", label: "Rings" },
  { id: "hatch", label: "Hatch" },
  { id: "horizontal", label: "Horizontal" },
  { id: "vertical", label: "Vertical" },
];

// One vector definition for detail Canvas, editable SVG exports and Studio.
export function fillPatternSpec(style, color, width = 640, height = 400) {
  if (style === "solid" || !FILL_STYLES.some((item) => item.id === style))
    return null;
  if (style === "rings")
    return {
      width,
      height,
      opacity: 0.85,
      elements: ringRadii(height, width).map((r) => ({
        tag: "circle",
        attrs: {
          cx: width / 2,
          cy: height / 2,
          r,
          fill: "none",
          stroke: color,
          strokeWidth: RING_WIDTH,
        },
      })),
    };
  return {
    width: PATTERN_TILE,
    height: PATTERN_TILE,
    opacity: 0.55,
    elements:
      style === "particles"
        ? [3, 9].map((c) => ({
            tag: "circle",
            attrs: { cx: c, cy: c, r: PARTICLE_RADIUS, fill: color },
          }))
        : [
            {
              tag: "path",
              attrs: {
                d:
                  style === "horizontal"
                    ? `M0,${PATTERN_TILE / 2}H${PATTERN_TILE}`
                    : style === "vertical"
                      ? `M${PATTERN_TILE / 2},0V${PATTERN_TILE}`
                      : `M0,${PATTERN_TILE}L${PATTERN_TILE},0`,
                fill: "none",
                stroke: color,
                strokeWidth: HATCH_WIDTH,
              },
            },
          ],
  };
}

export function patternSvg(spec, id) {
  if (!spec) return "";
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c],
    );
  const elements = spec.elements
    .map(
      ({ tag, attrs }) =>
        `<${tag} ${Object.entries(attrs)
          .map(
            ([key, value]) =>
              `${key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}="${escape(value)}"`,
          )
          .join(
            " ",
          )} ${attrs.fill !== "none" ? "fill" : "stroke"}-opacity="${spec.opacity}"/>`,
    )
    .join("");
  return `<pattern id="${escape(id)}" patternUnits="userSpaceOnUse" width="${spec.width}" height="${spec.height}">${elements}</pattern>`;
}

export function drawFillPattern(ctx, style, color, width = 640, height = 400) {
  const spec = fillPatternSpec(style, color, width, height);
  if (!spec) return;
  const drawing = new Path2D();
  for (const { tag, attrs } of spec.elements) {
    const shape = new Path2D(tag === "path" ? attrs.d : undefined);
    if (tag === "circle")
      shape.arc(attrs.cx, attrs.cy, attrs.r, 0, Math.PI * 2);
    for (let y = 0; y < height; y += spec.height) {
      for (let x = 0; x < width; x += spec.width) {
        drawing.addPath(shape, new DOMMatrix().translate(x, y));
      }
    }
  }
  const attrs = spec.elements[0].attrs;
  ctx.globalAlpha = spec.opacity;
  if (attrs.fill !== "none") {
    ctx.fillStyle = attrs.fill;
    ctx.fill(drawing);
  }
  if (attrs.stroke) {
    ctx.strokeStyle = attrs.stroke;
    ctx.lineWidth = attrs.strokeWidth;
    ctx.stroke(drawing);
  }
}

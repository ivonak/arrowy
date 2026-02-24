import { useCallback, useRef } from 'react';

const SVG_NS = 'http://www.w3.org/2000/svg';

const PARAM_KEYS = ['loopX','loopY','e1X','e1Y','e2X','e2Y','l1X','l1Y','l2X','l2Y','exitX','exitY','x1X','x1Y','x2X','x2Y'];

const PARAM_GROUPS = [
  { name: 'Loop Point', keys: ['loopX','loopY'], color: '#facc15' },
  { name: 'Entry CP1', keys: ['e1X','e1Y'], color: '#ef4444' },
  { name: 'Entry CP2', keys: ['e2X','e2Y'], color: '#f97316' },
  { name: 'Loop CP1', keys: ['l1X','l1Y'], color: '#22c55e' },
  { name: 'Loop CP2', keys: ['l2X','l2Y'], color: '#06b6d4' },
  { name: 'Exit Point', keys: ['exitX','exitY'], color: '#3b82f6' },
  { name: 'Exit CP1', keys: ['x1X','x1Y'], color: '#a855f7' },
  { name: 'Exit CP2', keys: ['x2X','x2Y'], color: '#ec4899' },
];

const DOT_COLORS = {};
PARAM_GROUPS.forEach(g => g.keys.forEach(k => { DOT_COLORS[k] = g.color; }));

const ANCHOR_POINT_RATIOS = {
  tl: [0, 0], tc: [0.5, 0], tr: [1, 0],
  cl: [0, 0.5], cc: [0.5, 0.5], cr: [1, 0.5],
  bl: [0, 1], bc: [0.5, 1], br: [1, 1],
};

export { PARAM_KEYS, PARAM_GROUPS, DOT_COLORS, ANCHOR_POINT_RATIOS };

export function computePath(startX, startY, endX, endY, controls) {
  const loopX = (startX + endX) / 2 + controls.loopX;
  const loopY = (startY + endY) / 2 + controls.loopY;
  const entry1X = startX + controls.e1X;
  const entry1Y = startY + controls.e1Y;
  const entry2X = loopX + controls.e2X;
  const entry2Y = loopY + controls.e2Y;
  const loopCp1X = loopX + controls.l1X;
  const loopCp1Y = loopY + controls.l1Y;
  const loopCp2X = loopX + controls.l2X;
  const loopCp2Y = loopY + controls.l2Y;
  const loopExitX = loopX + controls.exitX;
  const loopExitY = loopY + controls.exitY;
  const exit1X = loopExitX + controls.x1X;
  const exit1Y = loopExitY + controls.x1Y;
  const exit2X = endX + controls.x2X;
  const exit2Y = endY + controls.x2Y;

  const pathD = `M ${startX} ${startY} C ${entry1X} ${entry1Y}, ${entry2X} ${entry2Y}, ${loopX} ${loopY} C ${loopCp1X} ${loopCp1Y}, ${loopCp2X} ${loopCp2Y}, ${loopExitX} ${loopExitY} C ${exit1X} ${exit1Y}, ${exit2X} ${exit2Y}, ${endX} ${endY}`;

  const controlPoints = [
    { name: 'e1', key: 'e1', x: entry1X, y: entry1Y, color: PARAM_GROUPS[1].color, anchor: { x: startX, y: startY } },
    { name: 'e2', key: 'e2', x: entry2X, y: entry2Y, color: PARAM_GROUPS[2].color, anchor: { x: loopX, y: loopY } },
    { name: 'loop', key: 'loop', x: loopX, y: loopY, color: PARAM_GROUPS[0].color },
    { name: 'l1', key: 'l1', x: loopCp1X, y: loopCp1Y, color: PARAM_GROUPS[3].color, anchor: { x: loopX, y: loopY } },
    { name: 'l2', key: 'l2', x: loopCp2X, y: loopCp2Y, color: PARAM_GROUPS[4].color, anchor: { x: loopX, y: loopY } },
    { name: 'exit', key: 'exit', x: loopExitX, y: loopExitY, color: PARAM_GROUPS[5].color },
    { name: 'x1', key: 'x1', x: exit1X, y: exit1Y, color: PARAM_GROUPS[6].color, anchor: { x: loopExitX, y: loopExitY } },
    { name: 'x2', key: 'x2', x: exit2X, y: exit2Y, color: PARAM_GROUPS[7].color, anchor: { x: endX, y: endY } },
  ];

  return { pathD, controlPoints, exit2X, exit2Y, loopX, loopY, loopExitX, loopExitY };
}

export function computeArrow(endX, endY, exit2X, exit2Y, arrowSize, arrowAngleDeg) {
  const arrowAngleRad = (arrowAngleDeg * Math.PI) / 180;
  const tangentAngle = Math.atan2(exit2Y - endY, exit2X - endX);
  const a1x = endX + arrowSize * Math.cos(tangentAngle - arrowAngleRad);
  const a1y = endY + arrowSize * Math.sin(tangentAngle - arrowAngleRad);
  const a2x = endX + arrowSize * Math.cos(tangentAngle + arrowAngleRad);
  const a2y = endY + arrowSize * Math.sin(tangentAngle + arrowAngleRad);
  return `M ${a1x} ${a1y} L ${endX} ${endY} L ${a2x} ${a2y}`;
}

export function getEndpointAnchorBase(which, startEl, endEl, startAnchorPoint, endAnchorPoint) {
  const el = which === 'start' ? startEl : endEl;
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  const anchorKey = which === 'start' ? startAnchorPoint : endAnchorPoint;
  const [ax, ay] = ANCHOR_POINT_RATIOS[anchorKey] || ANCHOR_POINT_RATIOS.cc;
  return { x: rect.left + rect.width * ax, y: rect.top + rect.height * ay };
}

export function getControlAnchor(key, startX, startY, endX, endY, controls) {
  const midX = (startX + endX) / 2, midY = (startY + endY) / 2;
  const loopX = midX + controls.loopX, loopY = midY + controls.loopY;
  const exitX = loopX + controls.exitX, exitY = loopY + controls.exitY;
  const map = {
    loop: { x: midX, y: midY },
    e1: { x: startX, y: startY },
    e2: { x: loopX, y: loopY },
    l1: { x: loopX, y: loopY },
    l2: { x: loopX, y: loopY },
    exit: { x: loopX, y: loopY },
    x1: { x: exitX, y: exitY },
    x2: { x: endX, y: endY },
  };
  return map[key];
}

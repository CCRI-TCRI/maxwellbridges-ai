// Sinclaire Storion — cinematic frame drawn with Konva (for the infinite canvas)
import { Circle, Ellipse, Group, Line, Path, Rect } from "react-konva";
import { facingDir, FRAME_H, FRAME_W, horizonFor, projectPanel } from "@/lib/studio/projection";
import type { Panel, StagePosition } from "@/lib/studio/types";

function KonvaFigure({ x, h, baseY, person }: { x: number; h: number; baseY: number; person: StagePosition }) {
  const dir = facingDir(person.facing);
  const headR = h * 0.13;
  const headCy = baseY - h + headR;
  const bodyTop = headCy + headR;
  const bodyW = h * 0.26;
  const sit = person.pose === "sitting" || person.pose === "crouching";
  const bodyBottom = sit ? baseY - h * 0.28 : baseY;
  const stroke = "rgba(0,0,0,0.35)";

  if (person.isProp) {
    return <Rect x={x - bodyW * 0.5} y={baseY - h * 0.5} width={bodyW} height={h * 0.5} cornerRadius={3} fill={person.color} stroke={stroke} strokeWidth={1} opacity={0.9} />;
  }

  const d = `M ${x - bodyW / 2} ${bodyBottom} L ${x - bodyW * 0.42} ${bodyTop + h * 0.04} Q ${x} ${bodyTop - h * 0.02} ${x + bodyW * 0.42} ${bodyTop + h * 0.04} L ${x + bodyW / 2} ${bodyBottom} Z`;

  return (
    <Group listening={false}>
      <Ellipse x={x} y={baseY + 2} radiusX={bodyW * 0.7} radiusY={h * 0.03} fill="rgba(0,0,0,0.25)" />
      <Path data={d} fill={person.color} stroke={stroke} strokeWidth={1} />
      <Circle x={x} y={headCy} radius={headR} fill={person.color} stroke={stroke} strokeWidth={1} />
      {dir !== 0 && <Circle x={x + dir * headR * 0.85} y={headCy} radius={headR * 0.28} fill="rgba(0,0,0,0.55)" />}
      {dir === 0 && (
        <>
          <Circle x={x - headR * 0.35} y={headCy} radius={headR * 0.14} fill="rgba(0,0,0,0.6)" />
          <Circle x={x + headR * 0.35} y={headCy} radius={headR * 0.14} fill="rgba(0,0,0,0.6)" />
        </>
      )}
    </Group>
  );
}

// Draws a panel's frame into a `width`-wide box (16:9), scaled from FRAME space.
export function KonvaFrame({ panel, x, y, width }: { panel: Panel; x: number; y: number; width: number }) {
  const scale = width / FRAME_W;
  const items = projectPanel(panel);
  const horizon = horizonFor(panel.angle);
  const baseY = horizon + 6;
  const dutch = panel.angle === "dutch" ? 8 : 0;

  return (
    <Group x={x} y={y} scaleX={scale} scaleY={scale} clipX={0} clipY={0} clipWidth={FRAME_W} clipHeight={FRAME_H} listening={false}>
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: 0, y: FRAME_H }} fillLinearGradientColorStops={[0, "#2a3550", 0.55, "#1b2130", 1, "#12151c"]} />
      <Group rotation={dutch} offsetX={dutch ? FRAME_W / 2 : 0} offsetY={dutch ? FRAME_H / 2 : 0} x={dutch ? FRAME_W / 2 : 0} y={dutch ? FRAME_H / 2 : 0} scaleX={dutch ? 1.12 : 1} scaleY={dutch ? 1.12 : 1}>
        <Rect x={-20} y={horizon} width={FRAME_W + 40} height={FRAME_H} fill="rgba(0,0,0,0.35)" />
        <Line points={[-20, horizon, FRAME_W + 20, horizon]} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        {items.map((it) => (
          <KonvaFigure key={it.p.id} x={it.x} h={it.h} baseY={baseY} person={it.p} />
        ))}
      </Group>
      <Rect x={0} y={0} width={FRAME_W} height={FRAME_H} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
    </Group>
  );
}

"use client";
// Sinclaire Storion — cinematic shot frame renderer (SVG)
// Deterministically simulates how the camera frames the staged characters.
import { shotFraming } from "@/lib/studio/constants";
import type { Panel, StagePosition } from "@/lib/studio/types";

interface ShotFrameProps {
  panel: Panel;
  width?: number;
  showComposition?: boolean;
  className?: string;
}

const W = 320;
const H = 180; // 16:9

function facingDir(f: StagePosition["facing"]): number {
  // -1 = looks left, +1 = looks right, 0 = toward camera
  if (f === "left" || f === "three-quarter-left") return -1;
  if (f === "right" || f === "three-quarter-right") return 1;
  return 0;
}

function projected(panel: Panel) {
  const framing = shotFraming(panel.shotType);
  const spread = (1 - framing) * 1.7 + 0.42;
  const cam = panel.camera;
  return panel.stage
    .map((p) => {
      const depth = 0.7 + p.y * 0.55;
      const h = framing * H * 1.15 * p.scale * depth;
      const x = W * (0.5 + (p.x - cam.targetX) * spread);
      return { p, h, x, depth };
    })
    .filter((it) => it.x > -60 && it.x < W + 60)
    .sort((a, b) => a.depth - b.depth); // far first
}

function Figure({
  x,
  h,
  baseY,
  person,
}: {
  x: number;
  h: number;
  baseY: number;
  person: StagePosition;
}) {
  const dir = facingDir(person.facing);
  const headR = h * 0.13;
  const headCy = baseY - h + headR;
  const bodyTop = headCy + headR;
  const bodyW = h * 0.26;
  const sit = person.pose === "sitting" || person.pose === "crouching";
  const bodyBottom = sit ? baseY - h * 0.28 : baseY;
  const stroke = "rgba(0,0,0,0.35)";

  if (person.isProp) {
    return (
      <g opacity={0.9}>
        <rect
          x={x - bodyW * 0.5}
          y={baseY - h * 0.5}
          width={bodyW}
          height={h * 0.5}
          rx={3}
          fill={person.color}
          stroke={stroke}
          strokeWidth={1}
        />
      </g>
    );
  }

  return (
    <g>
      {/* soft shadow */}
      <ellipse cx={x} cy={baseY + 2} rx={bodyW * 0.7} ry={h * 0.03} fill="rgba(0,0,0,0.25)" />
      {/* body */}
      <path
        d={`M ${x - bodyW / 2} ${bodyBottom}
            L ${x - bodyW * 0.42} ${bodyTop + h * 0.04}
            Q ${x} ${bodyTop - h * 0.02} ${x + bodyW * 0.42} ${bodyTop + h * 0.04}
            L ${x + bodyW / 2} ${bodyBottom} Z`}
        fill={person.color}
        stroke={stroke}
        strokeWidth={1}
      />
      {/* head */}
      <circle cx={x} cy={headCy} r={headR} fill={person.color} stroke={stroke} strokeWidth={1} />
      {/* facing nose */}
      {dir !== 0 && (
        <circle cx={x + dir * headR * 0.85} cy={headCy} r={headR * 0.28} fill="rgba(0,0,0,0.55)" />
      )}
      {dir === 0 && (
        <>
          <circle cx={x - headR * 0.35} cy={headCy} r={headR * 0.14} fill="rgba(0,0,0,0.6)" />
          <circle cx={x + headR * 0.35} cy={headCy} r={headR * 0.14} fill="rgba(0,0,0,0.6)" />
        </>
      )}
    </g>
  );
}

function CompositionOverlay({ angle }: { angle: Panel["angle"] }) {
  const t = "rgba(120,200,255,0.4)";
  return (
    <g pointerEvents="none">
      {/* rule of thirds */}
      <line x1={W / 3} y1={0} x2={W / 3} y2={H} stroke={t} strokeWidth={1} />
      <line x1={(2 * W) / 3} y1={0} x2={(2 * W) / 3} y2={H} stroke={t} strokeWidth={1} />
      <line x1={0} y1={H / 3} x2={W} y2={H / 3} stroke={t} strokeWidth={1} />
      <line x1={0} y1={(2 * H) / 3} x2={W} y2={(2 * H) / 3} stroke={t} strokeWidth={1} />
      {/* power points */}
      {[W / 3, (2 * W) / 3].map((px) =>
        [H / 3, (2 * H) / 3].map((py) => (
          <circle key={`${px}-${py}`} cx={px} cy={py} r={2.5} fill="rgba(120,200,255,0.9)" />
        ))
      )}
      {/* headroom guide */}
      <line
        x1={0}
        y1={H * 0.16}
        x2={W}
        y2={H * 0.16}
        stroke="rgba(255,180,80,0.5)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    </g>
  );
}

export function ShotFrame({ panel, showComposition = false, className }: ShotFrameProps) {
  const items = projected(panel);
  const angle = panel.angle;
  // Angle affects horizon / ground line placement.
  const horizon =
    angle === "high" || angle === "birds-eye"
      ? H * 0.72
      : angle === "low" || angle === "worms-eye"
        ? H * 0.34
        : H * 0.58;
  const baseY = horizon + 6;
  const dutch = angle === "dutch" ? 8 : 0;

  const dark = "#12151c";
  const mid = "#1b2130";
  const glow = "#2a3550";

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block", background: dark }}
      role="img"
      aria-label={`Shot ${panel.shotNumber} — ${panel.shotType}`}
    >
      <defs>
        <linearGradient id={`sky-${panel.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={glow} />
          <stop offset="55%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`key-${panel.id}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,240,210,0.14)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <g transform={dutch ? `rotate(${dutch} ${W / 2} ${H / 2}) scale(1.12) translate(${-W * 0.055} ${-H * 0.055})` : undefined}>
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={`url(#sky-${panel.id})`} />
        {/* ground */}
        <rect x={-20} y={horizon} width={W + 40} height={H} fill="rgba(0,0,0,0.35)" />
        <line x1={-20} y1={horizon} x2={W + 20} y2={horizon} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={`url(#key-${panel.id})`} />

        {items.map((it) => (
          <Figure key={it.p.id} x={it.x} h={it.h} baseY={baseY} person={it.p} />
        ))}
      </g>

      {showComposition && <CompositionOverlay angle={angle} />}

      {/* letterbox hint */}
      <rect x={0} y={0} width={W} height={H} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
    </svg>
  );
}

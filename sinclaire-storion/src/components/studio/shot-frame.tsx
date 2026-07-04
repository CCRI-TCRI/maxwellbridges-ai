// Sinclaire Storion — cinematic shot frame (SVG previews)
import { facingDir, FRAME_H as H, FRAME_W as W, horizonFor, projectPanel } from "@/lib/studio/projection";
import type { Panel, StagePosition } from "@/lib/studio/types";

interface ShotFrameProps {
  panel: Panel;
  showComposition?: boolean;
  className?: string;
}

function Figure({ x, h, baseY, person }: { x: number; h: number; baseY: number; person: StagePosition }) {
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
      <rect
        x={x - bodyW * 0.5}
        y={baseY - h * 0.5}
        width={bodyW}
        height={h * 0.5}
        rx={3}
        fill={person.color}
        stroke={stroke}
        strokeWidth={1}
        opacity={0.9}
      />
    );
  }

  return (
    <g>
      <ellipse cx={x} cy={baseY + 2} rx={bodyW * 0.7} ry={h * 0.03} fill="rgba(0,0,0,0.25)" />
      <path
        d={`M ${x - bodyW / 2} ${bodyBottom} L ${x - bodyW * 0.42} ${bodyTop + h * 0.04} Q ${x} ${bodyTop - h * 0.02} ${x + bodyW * 0.42} ${bodyTop + h * 0.04} L ${x + bodyW / 2} ${bodyBottom} Z`}
        fill={person.color}
        stroke={stroke}
        strokeWidth={1}
      />
      <circle cx={x} cy={headCy} r={headR} fill={person.color} stroke={stroke} strokeWidth={1} />
      {dir !== 0 && <circle cx={x + dir * headR * 0.85} cy={headCy} r={headR * 0.28} fill="rgba(0,0,0,0.55)" />}
      {dir === 0 && (
        <>
          <circle cx={x - headR * 0.35} cy={headCy} r={headR * 0.14} fill="rgba(0,0,0,0.6)" />
          <circle cx={x + headR * 0.35} cy={headCy} r={headR * 0.14} fill="rgba(0,0,0,0.6)" />
        </>
      )}
    </g>
  );
}

function CompositionOverlay() {
  const t = "rgba(120,200,255,0.4)";
  return (
    <g pointerEvents="none">
      <line x1={W / 3} y1={0} x2={W / 3} y2={H} stroke={t} strokeWidth={1} />
      <line x1={(2 * W) / 3} y1={0} x2={(2 * W) / 3} y2={H} stroke={t} strokeWidth={1} />
      <line x1={0} y1={H / 3} x2={W} y2={H / 3} stroke={t} strokeWidth={1} />
      <line x1={0} y1={(2 * H) / 3} x2={W} y2={(2 * H) / 3} stroke={t} strokeWidth={1} />
      {[W / 3, (2 * W) / 3].map((px) =>
        [H / 3, (2 * H) / 3].map((py) => <circle key={`${px}-${py}`} cx={px} cy={py} r={2.5} fill="rgba(120,200,255,0.9)" />)
      )}
      <line x1={0} y1={H * 0.16} x2={W} y2={H * 0.16} stroke="rgba(255,180,80,0.5)" strokeWidth={1} strokeDasharray="4 4" />
    </g>
  );
}

export function ShotFrame({ panel, showComposition = false, className }: ShotFrameProps) {
  const items = projectPanel(panel);
  const angle = panel.angle;
  const horizon = horizonFor(angle);
  const baseY = horizon + 6;
  const dutch = angle === "dutch" ? 8 : 0;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block", background: "#12151c" }}
      role="img"
      aria-label={`Shot ${panel.shotNumber} — ${panel.shotType}`}
    >
      <defs>
        <linearGradient id={`sky-${panel.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3550" />
          <stop offset="55%" stopColor="#1b2130" />
          <stop offset="100%" stopColor="#12151c" />
        </linearGradient>
        <radialGradient id={`key-${panel.id}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,240,210,0.14)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <g transform={dutch ? `rotate(${dutch} ${W / 2} ${H / 2}) scale(1.12) translate(${-W * 0.055} ${-H * 0.055})` : undefined}>
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={`url(#sky-${panel.id})`} />
        <rect x={-20} y={horizon} width={W + 40} height={H} fill="rgba(0,0,0,0.35)" />
        <line x1={-20} y1={horizon} x2={W + 20} y2={horizon} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={`url(#key-${panel.id})`} />
        {items.map((it) => (
          <Figure key={it.p.id} x={it.x} h={it.h} baseY={baseY} person={it.p} />
        ))}
      </g>

      {showComposition && <CompositionOverlay />}
      <rect x={0} y={0} width={W} height={H} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
    </svg>
  );
}

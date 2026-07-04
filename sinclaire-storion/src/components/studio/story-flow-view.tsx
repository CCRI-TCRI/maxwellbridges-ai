// Sinclaire Storion — Story Flow (connected visual flow of the whole story)
import { Background, Controls, type Edge, Handle, MiniMap, type Node, Position, ReactFlow } from "@xyflow/react";
import { useMemo } from "react";
import { useStudio } from "@/lib/studio/store";
import { EmptyState } from "./ui";

const SHOT_COLOR: Record<string, string> = {
  EWS: "#3b82f6", WS: "#3b82f6", MWS: "#0ea5e9", MS: "#10b981", MCU: "#f59e0b",
  CU: "#ef4444", ECU: "#dc2626", OTS: "#8b5cf6", POV: "#ec4899", INSERT: "#6b7280",
};

function PanelNode({ data }: { data: Record<string, unknown> }) {
  const color = SHOT_COLOR[data.shotType as string] ?? "#6b7280";
  return (
    <div className="w-[120px] rounded-md border bg-card px-2 py-1.5 text-left shadow-sm" style={{ borderColor: color, borderLeftWidth: 4 }}>
      <Handle position={Position.Left} type="target" style={{ opacity: 0 }} />
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-xs">{data.shotNumber as string}</span>
        <span className="font-mono text-[10px]" style={{ color }}>{data.shotType as string}</span>
      </div>
      <div className="truncate text-[10px] text-muted-foreground">{(data.action as string) || "—"}</div>
      <div className="mt-0.5 text-[9px] text-muted-foreground/70">{data.duration as number}s · {data.movement as string}</div>
      <Handle position={Position.Right} type="source" style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { panel: PanelNode };

export function StoryFlowView() {
  const project = useStudio((s) => s.project);
  const selectPanel = useStudio((s) => s.selectPanel);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let rowY = 0;
    for (const scene of project.scenes) {
      const panels = project.panels.filter((p) => p.sceneId === scene.id).sort((a, b) => a.order - b.order);
      nodes.push({
        id: `scene-${scene.id}`,
        position: { x: 0, y: rowY + 12 },
        data: { label: `SC ${scene.number} · ${scene.location}` },
        type: "input",
        draggable: false,
        style: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontWeight: 600, width: 150, color: "var(--foreground)" },
      });
      panels.forEach((panel, i) => {
        const id = `p-${panel.id}`;
        nodes.push({ id, type: "panel", position: { x: 190 + i * 150, y: rowY }, data: { shotNumber: panel.shotNumber, shotType: panel.shotType, action: panel.action, duration: panel.duration, movement: panel.movement, panelId: panel.id } });
        if (i > 0) {
          const prev = panels[i - 1];
          edges.push({ id: `e-${prev.id}-${panel.id}`, source: `p-${prev.id}`, target: id, style: { stroke: "var(--border)" } });
        }
      });
      rowY += 150;
    }
    return { nodes, edges };
  }, [project]);

  if (project.scenes.length === 0) return <EmptyState title="No story to flow yet" hint="Add scenes and shots to visualize the story's shape." />;

  return (
    <div className="h-full w-full">
      <ReactFlow colorMode="dark" edges={edges} fitView nodeTypes={nodeTypes} nodes={nodes} onNodeClick={(_, node) => { const pid = (node.data as Record<string, unknown>)?.panelId as string | undefined; if (pid) selectPanel(pid); }} proOptions={{ hideAttribution: true }}>
        <Background gap={20} />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}

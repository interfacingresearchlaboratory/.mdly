"use client";

import {
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Node,
  type Edge,
  type Connection,
  Position,
  Handle,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@editor/ui/utils";
import { ProviderIcon } from "./provider-icon";
import { Logo } from "@editor/ui/logo";

type IntegrationNodeData = { provider?: string; label?: string };

function IntegrationIconNode({ data }: NodeProps<Node<IntegrationNodeData>>) {
  const showLabel = typeof data.label === "string";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-background shadow-sm",
        showLabel ? "h-12 min-w-12 px-3" : "size-12"
      )}
    >
      <Handle type="target" position={Position.Left} className="!w-1 !h-1 !-left-0.5 !border-0 !bg-muted-foreground/40" />
      {showLabel ? (
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{data.label}</span>
      ) : (
        <ProviderIcon provider={data.provider ?? ""} className="size-6" />
      )}
      <Handle type="source" position={Position.Right} className="!w-1 !h-1 !-right-0.5 !border-0 !bg-muted-foreground/40" />
    </div>
  );
}

function MonoidNode() {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-xl border-1 border-[#0101fd] bg-background px-4 py-2 shadow-sm min-h-[80px]"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-1.5 !h-1.5 !-left-0.5 !border-0 !bg-[#0101fd]"
        style={{ top: "50%" }}
      />
      <Logo className="text-base" />
      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !-right-0.5 !border-0 !bg-[#0101fd]" />
    </div>
  );
}

function ApiGroupNode() {
  return (
    <div className="w-full h-full border border-border rounded-xl bg-muted/50">
      <div className="p-3 text-sm font-semibold text-muted-foreground absolute top-2 left-4">API</div>
    </div>
  );
}

const SOURCE_PROVIDERS = ["apple", "googlecalendar", "notion", "linear"] as const;

const nodeTypes = {
  integration: IntegrationIconNode,
  monoid: MonoidNode,
  group: ApiGroupNode,
};
const OUTPUT_LABELS = [
  "Dashboards",
  "Internal tools",
  "Automations",
  "Agents",
  "Company filing",
  "Reports",
] as const;

const NODE_SIZE = 48;
const MONOID_X = 180;
const OUTPUT_X = MONOID_X + 140;

const initialNodes: Node[] = (() => {
  const nds: Node[] = [];
  SOURCE_PROVIDERS.forEach((provider, i) => {
    nds.push({
      id: provider,
      type: "integration",
      data: { provider },
      position: { x: 20, y: 20 + i * (NODE_SIZE + 16) },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });
  nds.push({
    id: "monoid",
    type: "monoid",
    data: {},
    position: { x: MONOID_X, y: 70 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });
  
  // Add API group node
  const outputSpacing = 60;
  const groupHeight = OUTPUT_LABELS.length * outputSpacing + 100;
  nds.push({
    id: "api-group",
    type: "group",
    data: {},
    position: { x: OUTPUT_X - 20, y: 0 },
    style: { 
      width: 200, 
      height: groupHeight,
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.75rem',
      backgroundColor: 'hsl(var(--muted) / 0.5)',
    },
  });
  
  // Add output nodes as children of the group
  OUTPUT_LABELS.forEach((label, i) => {
    const id = label.toLowerCase().replace(/\s+/g, "-");
    nds.push({
      id,
      type: "integration",
      data: { label },
      position: { x: 40, y: 60 + i * outputSpacing },
      parentId: "api-group",
      extent: "parent" as const,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });
  });
  return nds;
})();

const initialEdges: Edge[] = (() => {
  const edgs: Edge[] = [];
  SOURCE_PROVIDERS.forEach((provider) => {
    edgs.push({
      id: `${provider}-monoid`,
      source: provider,
      target: "monoid",
      style: { strokeWidth: 1 },
    });
  });
  OUTPUT_LABELS.forEach((label) => {
    const id = label.toLowerCase().replace(/\s+/g, "-");
    edgs.push({
      id: `monoid-${id}`,
      source: "monoid",
      target: id,
      className: "edge-outwards",
      style: { strokeWidth: 1, stroke: "#0101fd" },
    });
  });
  return edgs;
})();

export function IntegrationsDiagram() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = (connection: Connection) =>
    setEdges((eds) => addEdge({ ...connection, style: { strokeWidth: 1 } }, eds));

  return (
    <div className="integrations-diagram w-full h-full min-h-[320px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 2 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={2}
      />
    </div>
  );
}

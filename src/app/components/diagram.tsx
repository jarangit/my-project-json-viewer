import React, { useCallback } from "react";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import customNode from "./react-flow/custom-node";
import { useEffect } from "react";

const nodeTypes = {
  selectorNode: customNode,
};

const HorizontalFlow = ({ data }: any) => {
  console.log("🚀 ~ HorizontalFlow ~ data:", data);
  const [nodes, setNodes, onNodesChange] = useNodesState<any[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any[]>([]);
  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    []
  );

  useEffect(() => {
    if (data?.length) {
      // --- Layout constants ---
      const X_GAP = 650; // distance between columns (depths)
      const Y_GAP = 440; // distance between rows inside the same depth
      const X_START = 80; // left margin
      const Y_START = 80; // top margin

      type Item = {
        jspuuid: string;
        name?: string;
        parentId?: string | null;
        value?: any;
      };

      const items: Item[] = Array.isArray(data) ? data : [];

      // Build quick lookups
      const byId = new Map<string, Item>();
      for (const it of items) {
        if (it?.jspuuid) byId.set(it.jspuuid, it);
      }

      // Compute depth for each node via memoized recursion (root has depth 0)
      const depthCache = new Map<string, number>();
      const getDepth = (id: string): number => {
        if (depthCache.has(id)) return depthCache.get(id)!;
        const node = byId.get(id);
        if (!node) return 0;
        const p = node.parentId;
        const depth = p && byId.has(p) ? getDepth(p) + 1 : 0;
        depthCache.set(id, depth);
        return depth;
      };

      // Group nodes by depth
      const levels = new Map<number, Item[]>();
      for (const it of items) {
        if (!it?.jspuuid) continue;
        const d = getDepth(it.jspuuid);
        const arr = levels.get(d) ?? [];
        arr.push(it);
        levels.set(d, arr);
      }

      // For nicer vertical alignment, center each level against the max rows
      const depthKeys = Array.from(levels.keys()).sort((a, b) => a - b);
      const maxRows = depthKeys.reduce(
        (m, k) => Math.max(m, levels.get(k)!.length),
        0
      );

      // Build React Flow nodes positioned by (depth, row)
      const laidOutNodes = depthKeys.flatMap((d) => {
        const arr = levels.get(d)!;
        // optional: deterministic order by name to reduce edge crossings
        arr.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        const startY = Y_START + (maxRows - arr.length) * (Y_GAP / 2);
        return arr.map((it, idx) => ({
          id: it.jspuuid,
          type: "selectorNode",
          data: {
            label: it.name ?? it.jspuuid,
            children: it.name ?? it.jspuuid,
            value: it?.value,
          },
          position: { x: X_START + d * X_GAP, y: startY + idx * Y_GAP },
          sourcePosition: Position.Right,
          targetPosition: d > 0 ? Position.Left : undefined,
        }));
      });

      // Build edges only if parent exists in the map (avoid dangling edges)
      const laidOutEdges = items
        .filter((it) => it?.parentId && byId.has(it.parentId!))
        .map((it) => ({
          id: `e${it.parentId}-${it.jspuuid}`,
          source: it.parentId as string,
          target: it.jspuuid,
          type: "smoothstep",
          animated: true,
        }));

      setNodes(laidOutNodes as any);
      setEdges(laidOutEdges as any);
    }
  }, [data]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      minZoom={-0.1}
      attributionPosition="bottom-left"
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};

export default HorizontalFlow;

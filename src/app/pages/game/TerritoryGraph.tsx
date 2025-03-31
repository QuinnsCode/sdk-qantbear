"use client";

import { useCallback } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, ReactFlowProvider, Node, Edge } from '@xyflow/react'; 
// import '@xyflow/react/dist/style.css';

interface TerritoryGraphProps {
  nodes?: Node[];
  edges?: Edge[];
}

export const TerritoryGraph = ({ 
  nodes: initialNodes = [], 
  edges: initialEdges = [] 
}: TerritoryGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Function to add a new node
  const addNewNode = useCallback(() => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Territory ${nodes.length + 1}` },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  }, [nodes, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
        <button onClick={addNewNode} style={{ position: 'absolute', top: 10, left: 10 }}>
          Add Node
        </button>
      </ReactFlowProvider>
    </div>
  );
}
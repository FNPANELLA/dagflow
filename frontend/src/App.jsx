import { useCallback, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';

// Importante: Los estilos de React Flow son obligatorios
import 'reactflow/dist/style.css';

// Nodos iniciales de prueba (luego vendrán de Django)
const initialNodes = [
  { id: '1', position: { x: 200, y: 100 }, data: { label: 'Inicio (Webhook)' }, type: 'input' },
  { id: '2', position: { x: 200, y: 300 }, data: { label: 'Proceso Python' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true }
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Función para conectar nodos manualmente
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default App;
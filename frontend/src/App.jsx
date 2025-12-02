import { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  ReactFlowProvider,
  Panel // <--- Importamos 'Panel' para poner botones sobre el lienzo
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getWorkflows, saveWorkflowGraph } from './api/client'; // Importamos saveWorkflowGraph
import Sidebar from './Sidebar';

let id = 0;
const getId = () => `dndnode_${id++}`;

function AppContent() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [workflowId, setWorkflowId] = useState(null); // <--- Estado para el ID

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getWorkflows();
        const myWorkflow = response.data[0]; // Tomamos el primero
        if (!myWorkflow) return;

        setWorkflowId(myWorkflow.id); // Guardamos el ID

        const backendNodes = myWorkflow.nodes.map((n) => ({
          id: String(n.id), 
          type: 'default', 
          position: n.ui_position || { x: 0, y: 0 }, 
          data: { label: n.type }, // Usamos n.type para simplificar visualización
        }));

        const backendEdges = myWorkflow.edges.map((e) => ({
          id: String(e.id),
          source: String(e.source),
          target: String(e.target),
          animated: true, 
        }));

        setNodes(backendNodes);
        setEdges(backendEdges);
      } catch (error) {
        console.error("Error cargando workflow:", error);
      }
    }
    loadData();
  }, [setNodes, setEdges]); 

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // --- Lógica del Drag & Drop (Igual que antes) ---
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: getId(),
        type: 'default',
        position,
        data: { label: label }, // Guardamos el label correcto
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  // --- Nueva Función de Guardado ---
  const onSave = async () => {
    if (reactFlowInstance && workflowId) {
      const flow = reactFlowInstance.toObject(); // Obtiene el estado actual del lienzo
      console.log("Guardando flujo...", flow);
      
      try {
        await saveWorkflowGraph(workflowId, flow.nodes, flow.edges);
        alert('¡Flujo guardado con éxito en Django!');
      } catch (error) {
        console.error(error);
        alert('Error al guardar.');
      }
    }
  };

  return (
    <div className="dndflow" style={{ width: '100vw', height: '100vh', display: 'flex' }}>
        <Sidebar />
        
        <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ flexGrow: 1, height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
            >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
                
                {/* Botón flotante de guardar */}
                <Panel position="top-right">
                  <button 
                    onClick={onSave}
                    style={{
                      padding: '10px 20px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                  >
                    💾 Guardar Cambios
                  </button>
                </Panel>

            </ReactFlow>
        </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
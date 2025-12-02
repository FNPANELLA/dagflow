import { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getWorkflows, saveWorkflowGraph } from './api/client';
import Sidebar from './Sidebar';
import NodeInspector from './NodeInspector'; 
import { runWorkflow } from './api/client';

let id = 0;
const getId = () => `dndnode_${id++}`;

function AppContent() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [workflowId, setWorkflowId] = useState(null);
  

  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getWorkflows();
        const myWorkflow = response.data[0];
        if (!myWorkflow) return;
        setWorkflowId(myWorkflow.id);

        const labelMap = {
                'WEBHOOK': ' Webhook Trigger',
                'HTTP_REQUEST': ' Petición HTTP',
                'EMAIL': ' Enviar Email',
                'CONDITION': 'bs Condición'
              };

        const backendNodes = myWorkflow.nodes.map((n) => ({
                id: String(n.id), 
                type: 'default', 
                position: n.ui_position || { x: 0, y: 0 }, 
                data: { 
                  
                  label: labelMap[n.type] || n.type, 
                  nodeType: n.type, 
                  config: n.config || {} 
                }, 
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

  // <--- NUEVO: Cuando hacen clic en un nodo
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onRun = async () => {
    if (workflowId) {
      try {
        await runWorkflow(workflowId);
        alert('Ejecucion disparada, mirate la terminal de python!');
        } catch (error) {
        console.error(error);
      } 
    }
  };

  // <--- NUEVO: Si hacen clic en el fondo vacío, deseleccionamos
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow'); // Ej: 'HTTP_REQUEST'
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
        // <--- NUEVO: Guardamos el nodeType explícitamente en 'data'
        data: { 
            label: label,
            nodeType: type, // Esto es clave para el inspector
            config: {}      // Config vacía inicial
        },
      };

      setNodes((nds) => nds.concat(newNode));
      // Opcional: Seleccionar automáticamente el nodo nuevo
      setSelectedNode(newNode);
    },
    [reactFlowInstance, setNodes],
  );

  const onSave = async () => {
    if (reactFlowInstance && workflowId) {
      const flow = reactFlowInstance.toObject(); 
      // Los nodos ahora llevan 'data.config' dentro, así que se enviarán al backend
      console.log("Guardando flujo...", flow);
      try {
        await saveWorkflowGraph(workflowId, flow.nodes, flow.edges);
        alert('¡Flujo guardado con éxito!');
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
                
                // <--- NUEVOS EVENTOS
                onNodeClick={onNodeClick} 
                onPaneClick={onPaneClick}
                
                fitView
            >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
                
                <Panel position="top-right">
                  <button 
                    onClick={onRun}
                    style={{ 
                      marginRight: '40px', 
                      padding: '10px 20px', 
                      background: '#2196F3', // Azul para diferenciarlo
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold' 
                    }}
                  >
                    ▶ Ejecutar
                  </button>

                  <button 
                    onClick={onSave}
                  >
                    💾 Guardar
                  </button>
                </Panel>
                <Panel position="top-right">
                  
                  <button 
                    onClick={onSave}
                    style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    💾 Guardar
                  </button>
                
                </Panel>
            </ReactFlow>
        </div>

        {/* <--- NUEVO: El Inspector a la derecha */}
        <NodeInspector selectedNode={selectedNode} setNodes={setNodes} />
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
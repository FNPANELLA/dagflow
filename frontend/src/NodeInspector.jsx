import React, { useEffect, useState } from 'react';

export default function NodeInspector({ selectedNode, setNodes }) {
  const [config, setConfig] = useState({});


  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  
  const handleChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          //
          return {
            ...node,
            data: {
              ...node.data,
              config: newConfig, //  se guarda info 
            },
          };
        }
        return node;
      })
    );
  };

  if (!selectedNode) {
    return (
      <aside style={styles.aside}>
        <div style={styles.empty}>Selecciona un nodo para editarlo</div>
      </aside>
    );
  }

  return (
    <aside style={styles.aside}>
      <h3>Configuración</h3>
      <div style={styles.info}>ID: {selectedNode.id}</div>
      <div style={styles.info}>Tipo: {selectedNode.data.nodeType}</div>
      
      <hr style={{ margin: '15px 0', borderTop: '1px solid #ddd' }} />

      {/* Formulario Dinámico según el tipo de nodo */}
      
      {selectedNode.data.nodeType === 'HTTP_REQUEST' && (
        <>
          <label style={styles.label}>URL Endpoint</label>
          <input 
            style={styles.input}
            type="text" 
            placeholder="https://api.ejemplo.com"
            value={config.url || ''}
            onChange={(e) => handleChange('url', e.target.value)}
          />

          <label style={styles.label}>Método</label>
          <select 
            style={styles.input}
            value={config.method || 'GET'}
            onChange={(e) => handleChange('method', e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
          </select>
        </>
      )}

      {selectedNode.data.nodeType === 'EMAIL' && (
        <>
          <label style={styles.label}>Destinatario</label>
          <input 
            style={styles.input}
            type="email" 
            placeholder="cliente@empresa.com"
            value={config.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <label style={styles.label}>Asunto</label>
          <input 
            style={styles.input}
            type="text" 
            placeholder="Alerta de Sistema"
            value={config.subject || ''}
            onChange={(e) => handleChange('subject', e.target.value)}
          />
        </>
      )}

      {selectedNode.data.nodeType === 'WEBHOOK' && (
        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
          Este nodo no requiere configuración. 
          <br/>Se activará cuando recibas una petición externa.
        </div>
      )}

    </aside>
  );
}


const styles = {
  aside: {
    width: '300px',
    borderLeft: '1px solid #eee',
    padding: '20px',
    background: '#fff',
    fontSize: '14px',
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    marginTop: '50px',
  },
  info: {
    color: '#555',
    marginBottom: '5px',
    fontSize: '12px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    marginTop: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box', 
  }
};
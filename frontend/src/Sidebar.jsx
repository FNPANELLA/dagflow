import React from 'react';

export default function Sidebar() {
  const onDragStart = (event, nodeType, label) => {

    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={{ 
      width: '250px', 
      borderRight: '1px solid #eee', 
      padding: '15px', 
      background: '#fcfcfc' 
    }}>
      <h3>Bloques</h3>
      <div className="description" style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
        Arrastra estos bloques al lienzo.
      </div>
      
      {/* Bloque Webhook */}
      <div 
        className="dndnode input" 
        onDragStart={(event) => onDragStart(event, 'WEBHOOK', 'Webhook Trigger')} 
        draggable
        style={{ padding: '10px', border: '1px solid #777', borderRadius: '5px', marginBottom: '10px', cursor: 'grab', background: 'white' }}
      >
        ⚡ Webhook Trigger
      </div>

      {/* Bloque Acción HTTP */}
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'HTTP_REQUEST', 'Petición HTTP')} 
        draggable
        style={{ padding: '10px', border: '1px solid #007bff', borderRadius: '5px', marginBottom: '10px', cursor: 'grab', color: '#007bff', background: 'white' }}
      >
        🌐 Petición HTTP
      </div>

      {/* Bloque Email */}
      <div 
        className="dndnode output" 
        onDragStart={(event) => onDragStart(event, 'EMAIL', 'Enviar Email')} 
        draggable
        style={{ padding: '10px', border: '1px solid #28a745', borderRadius: '5px', marginBottom: '10px', cursor: 'grab', color: '#28a745', background: 'white' }}
      >
        ✉️ Enviar Email
      </div>
    </aside>
  );
}
import requests
import time
from .models import Node, Edge

class GraphExecutor:
    def __init__(self, workflow):
        self.workflow = workflow
        self.edges=list(workflow.edges.all())
    def get_next_nodes(self, current_node):
        targets = []
        for edge in self.edges:
            if edge.source_id == current_node.id:
                targets.append(edge.target)
        return targets
        
    def execute_node(self, node, context):
        print(f"Ejecutando el nodo:  {node.type} ({node.id})")

        try:
            if node.type == 'WEBHOOK':
                print("Trigger visto, iniciando flujo...")
            elif node.type == 'HTTP_REQUEST':
                url = node.config.get('url')
                method = node.config.get('method', 'GET')

                if url: 
                    print(f"Enviando {method} a {url}... ")
                    response = requests.request(method, url, json=context.get('payload'))
                    print(f"Respuesta: {response.status_code}!!")
                    context['http_response'] = response.text[:100]
                else:
                    print("Direccion URL no configurada...")


                    ##!! tsting
            elif node.type == 'EMAIL':
                recipient = node.config.get('email')
                subject = node.config.get('subject')
                print(f"Enviando mail a: {recipient}")
                print(f"Asunto: {subject}")
                print(f"Cuerpo: Hola, el proceso termino con exito!")



        except Exception as e:
            print(f"Error ejecutando nodo: {str(e)}")
        return context

    def run(self):
        print(f"\n--- Iniciando Ejecución: {self.workflow.name} ---")
        
        # 1. Buscar el nodo inicial (WEBHOOK)
        start_node = self.workflow.nodes.filter(type='WEBHOOK').first()
        
        if not start_node:
            return "Error: No se encontró un nodo de inicio (Webhook)."

        # 2. Cola de ejecución (Nodo, Contexto de datos)
        # El contexto son los datos que viajan por los cables
        queue = [(start_node, {'payload': {}})] 

        while queue:
            current_node, context = queue.pop(0)
            
            # Ejecutar acción
            new_context = self.execute_node(current_node, context)
            
            # Buscar siguientes pasos y agregarlos a la cola
            next_nodes = self.get_next_nodes(current_node)
            for next_node in next_nodes:
                # Pasamos el contexto actualizado al siguiente nodo
                queue.append((next_node, new_context.copy()))
                
        print("--- Ejecución Finalizada ---\n")

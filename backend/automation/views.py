from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Workflow, Node, Edge
from .serializers import WorkflowSerializer, NodeSerializer, EdgeSerializer






class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

    @action(detail=True, methods=['post'])
    def save_graph(self, request, pk=None):

        workflow = self.get_object()
        data = request.data
        
        nodes_data = data.get('nodes', [])
        edges_data = data.get('edges', [])

        try:
            with transaction.atomic():
                # 1. Limpiar versión anterior
                workflow.nodes.all().delete()
                workflow.edges.all().delete()

                # 2. Crear Nodos
                # Mapeamos IDs temporales del frontend a los nuevos IDs reales de la DB
                node_mapping = {} 

                for n in nodes_data:
                    frontend_id = n.get('id')
                    

                    node_data = n.get('data', {})
                    real_type = node_data.get('nodeType', node_data.get('label', 'DEFAULT'))
                    

                    new_node = Node.objects.create(
                        workflow=workflow,
                        type=real_type, 
                        ui_position=n.get('position', {'x': 0, 'y': 0}),
                        config=node_data.get('config', {}) # Guarda solo la config limpia
                    )
                    
                    # Guardamos la referencia
                    node_mapping[frontend_id] = new_node

                # 3. Crear Edges (Conexiones)
                for e in edges_data:
                    source_id = e.get('source')
                    target_id = e.get('target')

                    # Buscamos los nodos reales usando el mapa
                    source_node = node_mapping.get(source_id)
                    target_node = node_mapping.get(target_id)

                    if source_node and target_node:
                        Edge.objects.create(
                            workflow=workflow,
                            source=source_node,
                            target=target_node,
                            source_handle=e.get('sourceHandle'),
                            target_handle=e.get('targetHandle')
                        )

            return Response({'status': 'Workflow guardado correctamente'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        """
        Ejecuta el workflow inmediatamente (sincrónico para pruebas).
        """
        from .executor import GraphExecutor  # Importación local
        
        workflow = self.get_object()
        executor = GraphExecutor(workflow)
        
        # Ejecutamos y miramos la consola del backend para ver los logs
        executor.run()
        
        return Response({'status': 'Ejecución iniciada (mira la consola del servidor)'}, status=status.HTTP_200_OK)    


class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer

class EdgeViewSet(viewsets.ModelViewSet):
    queryset = Edge.objects.all()
    serializer_class = EdgeSerializer
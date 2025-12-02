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
        """
        Recibe el grafo completo (nodos y edges) y actualiza el workflow.
        Estrategia: Borrón y cuenta nueva (Delete & Re-create) para simplificar.
        """
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
                # Esto es crucial si quisieras mantener historial, pero para el MVP re-creamos.
                node_mapping = {} 

                for n in nodes_data:
                    # El ID que viene del frontend (puede ser 'dndnode_0' o un UUID viejo)
                    frontend_id = n.get('id')
                    
                    # Creamos el nodo en la DB
                    new_node = Node.objects.create(
                        workflow=workflow,
                        type=n.get('data', {}).get('label', 'DEFAULT'), # Simplificación
                        ui_position=n.get('position', {'x': 0, 'y': 0}),
                        config=n.get('data', {})
                    )
                    # Guardamos la referencia: ID Frontend -> Objeto DB Real
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

class NodeViewSet(viewsets.ModelViewSet):
    queryset = Node.objects.all()
    serializer_class = NodeSerializer

class EdgeViewSet(viewsets.ModelViewSet):
    queryset = Edge.objects.all()
    serializer_class = EdgeSerializer
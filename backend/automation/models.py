from django.db import models
import uuid 

class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nombre del flujo")
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
class Node(models.Model):
    NODE_TYPES = (
        ('WEBHOOK', 'Webhook Trigger'),
        ('HTTP_REQUEST', 'Petición HTTP'),
        ('CONDITION', 'Condición Lógica'),
        ('EMAIL', 'Enviar Email'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(Workflow, related_name='nodes', on_delete=models.CASCADE)
    
    #   acción que ejecuta este nodo
    type = models.CharField(max_length=50, choices=NODE_TYPES)
    
    # 
    #eejemplo: {"url": "https://api.google.com", "method": "POST"}
    config = models.JSONField(default=dict, blank=True)
    
    # Posición visual en el frontend 
    ui_position = models.JSONField(default=dict, help_text="Coordenadas {x: 100, y: 200}")

    def __str__(self):
        return f"{self.type} ({self.id})"
    
class Edge(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(Workflow, related_name='edges', on_delete=models.CASCADE)
    
    source = models.ForeignKey(Node, related_name='outputs', on_delete=models.CASCADE)
    target = models.ForeignKey(Node, related_name='inputs', on_delete=models.CASCADE)

    # Identificador usado por React Flow para saber de qué 'handle' sale la conexión
    source_handle = models.CharField(max_length=100, null=True, blank=True)
    target_handle = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        unique_together = ('source', 'target') # no conexiones dupe

    def __str__(self):
        return f"{self.source} -> {self.target}"
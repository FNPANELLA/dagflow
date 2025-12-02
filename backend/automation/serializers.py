from rest_framework import serializers
from .models import Workflow, Node, Edge

class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = '__all__'

class EdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edge
        fields = '__all__'

class WorkflowSerializer(serializers.ModelSerializer):
    nodes = NodeSerializer(many=True, read_only=True)
    edges = EdgeSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at', 'nodes', 'edges']
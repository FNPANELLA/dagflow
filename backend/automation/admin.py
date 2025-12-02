

# Register your models here.
from django.contrib import admin
from .models import Workflow, Node, Edge

@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')

@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = ('type', 'workflow', 'id')

@admin.register(Edge)
class EdgeAdmin(admin.ModelAdmin):
    list_display = ('source', 'target', 'workflow')
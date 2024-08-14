from rest_framework import serializers
from .models import Folder, Conversation, Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class ConversationSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = '__all__'

class FolderSerializer(serializers.ModelSerializer):
    conversations = ConversationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Folder
        fields = '__all__'
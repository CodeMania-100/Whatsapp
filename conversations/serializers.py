from rest_framework import serializers
from .models import Folder, Conversation, Document, Group, WhatsAppUser, WhatsAppGroup, WhatsAppMessage, UserWhatsAppData
import bleach

class GroupSerializer(serializers.ModelSerializer):
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'is_member']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False
    
    def validate_name(self, value):
          return bleach.clean(value, strip=True)

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'conversation', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


    
class WhatsAppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppUser
        fields = ['id', 'name', 'phone_number']

class WhatsAppGroupSerializer(serializers.ModelSerializer):
    members = WhatsAppUserSerializer(many=True, read_only=True)

    class Meta:
        model = WhatsAppGroup
        fields = ['id', 'name', 'members']

class WhatsAppMessageSerializer(serializers.ModelSerializer):
    sender = WhatsAppUserSerializer(read_only=True)
    group = WhatsAppGroupSerializer(read_only=True)

    class Meta:
        model = WhatsAppMessage
        fields = ['id', 'sender', 'group', 'content', 'timestamp']

    def validate_content(self, value):
        return bleach.clean(value, tags=['p', 'br', 'strong', 'em'], strip=True)

class UserWhatsAppDataSerializer(serializers.ModelSerializer):
    whatsapp_users = WhatsAppUserSerializer(many=True, read_only=True)
    whatsapp_groups = WhatsAppGroupSerializer(many=True, read_only=True)

    class Meta:
        model = UserWhatsAppData
        fields = ['id', 'user', 'whatsapp_users', 'whatsapp_groups']

class ConversationSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    whatsapp_group = WhatsAppGroupSerializer(read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'content', 'folder', 'created_at', 'updated_at', 'documents', 'whatsapp_group']
        read_only_fields = ['id', 'created_at', 'updated_at']


    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.folder = validated_data.get('folder', instance.folder)
        instance.save()
        return instance
    
    def validate_title(self, value):
        return bleach.clean(value, strip=True)

    def validate_content(self, value):
         return bleach.clean(value, tags=['p', 'br', 'strong', 'em'], strip=True)

class FolderSerializer(serializers.ModelSerializer):
    conversations = ConversationSerializer(many=True, read_only=True)
    conversation_count = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'user', 'created_at', 'conversations', 'conversation_count']
        read_only_fields = ['id', 'created_at', 'user']

    def get_conversation_count(self, obj):
        return obj.conversations.count()

    def validate_name(self, value):
        user = self.context['request'].user
        if Folder.objects.filter(name=value, user=user).exists():
            raise serializers.ValidationError("A folder with this name already exists for this user.")
        return value
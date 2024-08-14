from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Conversation

@registry.register_document
class ConversationDocument(Document):
    folder = fields.ObjectField(properties={
        'name': fields.TextField(),
    })

    class Index:
        name = 'conversations'

    class Django:
        model = Conversation
        fields = [
            'title',
            'content',
            'created_at',
            'updated_at',
        ]
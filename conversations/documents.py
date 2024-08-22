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
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = Conversation
        fields = [
            'id',
            'title',
            'content',
        ]

    def prepare_folder(self, instance):
        return {'name': instance.folder.name} if instance.folder else None
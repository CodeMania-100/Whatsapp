from django.shortcuts import render
from rest_framework import viewsets
from .models import Folder, Conversation, Document
from .serializers import FolderSerializer, ConversationSerializer, DocumentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django_elasticsearch_dsl.search import Search
from .documents import ConversationDocument
import spacy
from transformers import pipeline

nlp = spacy.load('en_core_web_sm')
qa_pipeline = pipeline('question-answering')

class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', None)
        if query is not None:
            # Basic search with Elasticsearch
            search = Search(index='conversations').query("multi_match", query=query, fields=['title', 'content', 'folder.name'])
            response = search.execute()
            results = [hit.to_dict() for hit in response]
            
            # NLP enhancement: Expand search using SpaCy
            doc = nlp(query)
            related_terms = [token.lemma_ for token in doc if not token.is_stop]
            
            # Advanced AI: Use Transformers for contextual search
            if results and len(results) > 0:
                context = results[0]['content']
                answer = qa_pipeline({'question': query, 'context': context})
                results.append({'AI_Suggested_Answer': answer['answer']})
            
            return Response(results)
        return Response({"error": "No query provided"}, status=400)
    

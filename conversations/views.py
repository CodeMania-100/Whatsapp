from django.shortcuts import render, get_object_or_404
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from django_elasticsearch_dsl.search import Search
from .models import Folder, Conversation, Document, Group
from .serializers import FolderSerializer, ConversationSerializer, DocumentSerializer, GroupSerializer
from .documents import ConversationDocument
import logging
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
#from transformers import pipeline
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, status
from .elasticsearch_client import get_elasticsearch_client
from django.http import HttpResponse
from .mixins import LoggingMixin
from django.http import JsonResponse
from django.db.models import Q
#qa_pipeline = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
# Load the spaCy model
#nlp = spacy.load("en_core_web_sm")

@api_view(['GET'])
def search(request):
    query = request.GET.get('q', '')
    if not query:
        return Response({"error": "No query provided"}, status=status.HTTP_400_BAD_REQUEST)

    # Perform search in the database
    conversations = Conversation.objects.filter(
        title__icontains=query
    ) | Conversation.objects.filter(
        content__icontains=query
    )
    
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

logger = logging.getLogger(__name__)

def home(request):
    return HttpResponse("Welcome to the Home Page!")

class GroupViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        # Return all groups
        return Group.objects.all()

    def list(self, request):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Total groups: {queryset.count()}")
            logger.info(f"Returning groups: {serializer.data}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in GroupViewSet.list: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        logger.info(f"Retrieved group: {serializer.data}")
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        logger.info(f"Created group: {serializer.data}")
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info(f"Updated group: {serializer.data}")
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info(f"Deleting group: {instance.id}")
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def handle_exception(self, exc):
        logger.error(f"Exception in GroupViewSet: {exc}", exc_info=True)
        return super().handle_exception(exc)
    

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]  # Add this line
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return self.queryset.filter(conversation__folder__user=self.request.user)

    def perform_create(self, serializer):
        conversation_id = self.request.data.get('conversation')
        conversation = get_object_or_404(Conversation, id=conversation_id, folder__user=self.request.user)
        serializer.save(conversation=conversation)

    @action(detail=False, methods=['post'])
    def upload_file(self, request):
        file_serializer = self.get_serializer(data=request.data)
        if file_serializer.is_valid():
            self.perform_create(file_serializer)
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user)

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Returning folders: {serializer.data}")
        return Response(serializer.data)

    def handle_exception(self, exc):
        logger.error(f"Exception in FolderViewSet: {exc}", exc_info=True)
        return super().handle_exception(exc)

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        user = self.request.user
        queryset = Conversation.objects.filter(folder__user=user)
        
        folder_id = self.request.query_params.get('folder', None)
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)
        
        return queryset

   
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return JsonResponse({"error": "No query provided", "results": [], "total_hits": 0}, status=400)

        try:
            conversations = Conversation.objects.filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            )
            folders = Folder.objects.filter(name__icontains=query)
            groups = Group.objects.filter(name__icontains=query)

            conversation_results = ConversationSerializer(conversations, many=True).data
            folder_results = FolderSerializer(folders, many=True).data
            group_results = GroupSerializer(groups, many=True, context={'request': request}).data

            all_results = {
                'conversations': conversation_results,
                'folders': folder_results,
                'groups': group_results
            }

            total_hits = len(conversation_results) + len(folder_results) + len(group_results)

            logger.info(f"Search query: {query}")
            logger.info(f"Found {total_hits} results")

            return JsonResponse({
                "total_hits": total_hits,
                "results": all_results,
                "query": query
            })

        except Exception as e:
            logger.error(f"An error occurred during search: {str(e)}", exc_info=True)
            return JsonResponse({"error": str(e), "results": [], "total_hits": 0}, status=500)
        
    def serialize_result(self, hit):
        return {
            'id': hit['_id'],
            'title': hit['_source'].get('title'),
            'content': hit['_source'].get('content'),
            'folder': hit['_source'].get('folder', {}).get('name'),
            'score': hit['_score']
        }


    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
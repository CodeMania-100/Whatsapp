from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from conversations.views import FolderViewSet, GroupViewSet, ConversationViewSet, DocumentViewSet
from rest_framework.authtoken import views as auth_views
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/search/', ConversationViewSet.as_view({'get': 'search'}), name='conversation-search'),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', auth_views.obtain_auth_token),
    path('', include(router.urls)),
]

# Add this conditional statement to serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.contrib import admin
from .models import Folder, Conversation, Document

admin.site.register(Folder)
admin.site.register(Conversation)
admin.site.register(Document)

from django.contrib import admin
from .models import Folder, Conversation, Document, Group

admin.site.register(Group)
admin.site.register(Folder)
admin.site.register(Conversation)


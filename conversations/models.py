from django.db import models
from django.contrib.auth.models import User
import os

def get_default_title(instance, filename):
    return os.path.splitext(filename)[0]

class Folder(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Conversation(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Document(models.Model):
    title = models.CharField(max_length=255, default=get_default_title)
    file = models.FileField(upload_to='documents/')
    conversation = models.ForeignKey(Conversation, related_name='documents', on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.title:
            self.title = get_default_title(self, self.file.name)
        super(Document, self).save(*args, **kwargs)

from django.contrib.auth.models import User

class Group(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='custom_groups')

    def __str__(self):
        return self.name
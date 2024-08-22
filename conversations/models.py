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



class Group(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='custom_groups')

    def __str__(self):
        return self.name
    

class WhatsAppUser(models.Model):
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class WhatsAppGroup(models.Model):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(WhatsAppUser)

    def __str__(self):
        return self.name

class WhatsAppMessage(models.Model):
    sender = models.ForeignKey(WhatsAppUser, on_delete=models.CASCADE)
    group = models.ForeignKey(WhatsAppGroup, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.sender.name}: {self.content[:50]}..."

class UserWhatsAppData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    whatsapp_users = models.ManyToManyField(WhatsAppUser)
    whatsapp_groups = models.ManyToManyField(WhatsAppGroup)

    def __str__(self):
        return f"WhatsApp data for {self.user.username}"
    
class Conversation(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    whatsapp_group = models.ForeignKey(WhatsAppGroup, on_delete=models.SET_NULL, null=True, blank=True)

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
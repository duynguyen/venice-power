from django.contrib import admin
from votes.models import User, Painting, Item, Comment, Annotation

admin.site.register(User)
admin.site.register(Painting)
admin.site.register(Item)
admin.site.register(Annotation)
admin.site.register(Comment)

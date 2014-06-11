from django.db import models
import secretballot
import sys

class User(models.Model):
	username = models.CharField(max_length=20)
	fullname = models.CharField(max_length=20)
	created_at = models.DateTimeField(auto_now=True)

class Painting(models.Model):
	name = models.CharField(max_length=200)
	description = models.CharField(max_length=400)
	image = models.ImageField(upload_to='media/images')
	last_updated = models.DateTimeField(auto_now=True)
	is_example = models.BooleanField(default=False)

	def __unicode__(self):
		return self.name

	def get_comments(self):
		return sorted([a.to_dict() for a in self.comment_set.all()], key=lambda x: x['id'], reverse=True)

class Item(models.Model):
	painting = models.ForeignKey(Painting)
	top = models.IntegerField(default=0)
	left = models.IntegerField(default=0)
	width = models.IntegerField(default=0)
	height = models.IntegerField(default=0)

	def __unicode__(self):
		return self.painting.name + " / Top " + str(self.top) + ", Left " + str(self.left)

	def to_dict(self):
		return {"painting_id": self.painting.id, "top": self.top, "left": self.left,
				"width": self.width, "height": self.height, "id": self.id,
				"name": self.top_annotation().name, "type": self.top_annotation().type,
				"description": self.top_annotation().description,
				"annotations": sorted([a.to_dict() for a in self.annotation_set.all()], key=lambda x: x['vote_total'], reverse=True)}

	def top_annotation(self):
		top_annot = None
		max_score = -sys.maxint - 1
		for a in self.annotation_set.all():
			if a.total_votes() > max_score:
				max_score = a.total_votes()
				top_annot = a
		return top_annot

class Annotation(models.Model):
	type = models.CharField(max_length=10, default="person")
	name = models.CharField(max_length=100)
	description = models.CharField(max_length=400)
	item = models.ForeignKey(Item)

	def __unicode__(self):
		return self.name

	def total_votes(self):
		return Annotation.objects.get(id=self.id).vote_total

	def upvotes(self):
		return Annotation.objects.get(id=self.id).total_upvotes

	def downvotes(self):
		return Annotation.objects.get(id=self.id).total_downvotes

	def to_dict(self):
		return {"name": self.name, "description": self.description, "type": self.type,
				"id": self.id, "vote_total": self.total_votes(), "total_upvotes": self.upvotes(),
				"total_downvotes": self.downvotes()}

class Comment(models.Model):
	painting = models.ForeignKey(Painting)
	name = models.CharField(max_length=100)
	content = models.CharField(max_length=400)

	def to_dict(self):
		return {"name": self.name, "content": self.content, "id": self.id}

secretballot.enable_voting_on(Annotation)

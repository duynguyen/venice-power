from django.shortcuts import render, render_to_response, redirect
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.template import RequestContext
import json

from votes.models import Painting, Item, Annotation, Comment
from secretballot.views import vote

def home(request):
	return render_to_response('home.html', context_instance=RequestContext(request))

def painting_annotate(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	if request.method == 'POST':
		top_coordinate = request.POST.get('top_coordinate', False)
		left_coordinate = request.POST.get('left_coordinate', False)
		width = request.POST.get('width', False)
		height = request.POST.get('height', False)
		name = request.POST.get('name', False)
		description = request.POST.get('description', False)
		type = request.POST.get('type', False)
		if top_coordinate and left_coordinate and width and height and name and description and type:
			item = Item(top=int(top_coordinate), left=int(left_coordinate),
				width=int(width), height=int(height), painting=painting)
			item.save()
			Annotation(name=name, description=description, type=type, item=item).save()
		else:
			return render_to_response('annotate.html', {
				"error_message": "Invalid input.",
				"painting": painting,
				}, context_instance=RequestContext(request))
	
	return render_to_response('annotate.html', {
			"painting": painting,
		}, context_instance=RequestContext(request))

def add_annotation(request, item_id):
	item = Item.objects.get(id=item_id)
	name = request.GET.get('name', False)
	description = request.GET.get('description', False)
	type = request.GET.get('type', False)
	if name and description and type:
		Annotation(name=name, description=description, type=type, item=item).save()
	else:
		return HttpResponse(json.dumps({'error': 'Invalid input!'}), content_type="application/json")
	
	return HttpResponse(json.dumps(item.to_dict()), content_type="application/json")

def add_comment(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	name = request.GET.get('name', False)
	content = request.GET.get('content', False)
	if name and content:
		Comment(name=name, content=content, painting=painting).save()
	else:
		return HttpResponse(json.dumps({'error': 'Invalid input!'}), content_type="application/json")
	
	return HttpResponse(json.dumps(painting.get_comments()), content_type="application/json")

def get_comments_by_painting(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	return HttpResponse(json.dumps(painting.get_comments()), content_type="application/json")

def painting_index(request):
	paintings = Painting.objects.filter(is_example=False)
	return render_to_response('paintings/index.html', {'painting_list': paintings}, context_instance=RequestContext(request))

def painting_examples(request):
	paintings = Painting.objects.filter(is_example=True)
	return render_to_response('paintings/examples.html', {'painting_list': paintings}, context_instance=RequestContext(request))

def painting_detail(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	items = Item.objects.filter(painting=painting)
	return render_to_response('paintings/detail.html', {
		'painting': painting,
		'item_list': items,
		}
		, context_instance=RequestContext(request))

def painting_example(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	items = Item.objects.filter(painting=painting)
	return render_to_response('paintings/example.html', {
		'painting': painting,
		'item_list': items,
		}, context_instance=RequestContext(request))

def painting_detail_json(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	items = Item.objects.filter(painting=painting)
	if items:
		item_objs = [i.to_dict() for i in items]
		return HttpResponse(json.dumps(item_objs), content_type="application/json")
	return HttpResponse("Some error occurs!", content_type="application/json")

def painting_detail_export(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	exported = {"painting_name": painting.name,
					"description": painting.description,
					"url": painting.image.url,
					"width": painting.image.width,
					"height": painting.image.height,
					"objects": [],
					}
	items = Item.objects.filter(painting=painting)
	if items:
		item_objs = [i.to_dict() for i in items]
		exported['objects'] = item_objs
	return HttpResponse(json.dumps(exported, indent=4,
						separators=(',', ': ')), content_type="application/json")
	# return HttpResponse("Some error occurs!", content_type="application/json")

def item_update(request, item_id):
	item = Item.objects.get(id=item_id)
	if 'name' in request.GET and 'description' in request.GET and 'type' in request.GET:
		item.name = request.GET['name']
		item.description = request.GET['description']
		item.type = request.GET['type']
		item.save()
	return redirect('painting_detail', painting_id=item.painting.id)

def item_delete(request, item_id):
	item = Item.objects.get(id=item_id)
	painting_id = item.painting.id
	item.delete()
	return painting_detail(request, painting_id)

def annotations_by_item_json(request, item_id):
	item = Item.objects.get(id=item_id)
	return HttpResponse(json.dumps(item.to_dict()), content_type="application/json")

def annotation_vote(request, annotation_id, vote_score):
	vote_score = int(vote_score)
	if vote_score == 2:
		vote_score = -1
	vote(request, Annotation, int(annotation_id), vote_score)
	annotation = Annotation.objects.get(id=annotation_id)
	return HttpResponse(json.dumps(annotation.to_dict()), content_type="application/json")

def painting_detail_export_image(request, painting_id):
	painting = Painting.objects.get(id=painting_id)
	items = Item.objects.filter(painting=painting)
	return render_to_response('paintings/export_painting.html', {
		'painting': painting,
		'item_list': items,
		}, context_instance=RequestContext(request))

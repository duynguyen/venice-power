from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin

from votes.views import *

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', home),
    url(r'^annotate/(?P<painting_id>[0-9]+)/$', painting_annotate, name='painting_annotate'),
    url(r'^paintings/$', painting_index, name='painting_index'),
    url(r'^examples/$', painting_examples, name='painting_examples'),
    url(r'^paintings/(?P<painting_id>[0-9]+)/$', painting_detail, name='painting_detail'),
    url(r'^examples/(?P<painting_id>[0-9]+)/$', painting_example, name='painting_example'),
    url(r'^annotate/(?P<painting_id>[0-9]+)/json/$', painting_detail_json, name='annotate_json'),
    url(r'^paintings/(?P<painting_id>[0-9]+)/json/$', painting_detail_json, name='painting_json'),
    url(r'^paintings/(?P<painting_id>[0-9]+)/export/json/$', painting_detail_json, name='painting_json'),
    url(r'^paintings/(?P<painting_id>[0-9]+)/export/objects/$', painting_detail_export, name='painting_export'),
    url(r'^paintings/(?P<painting_id>[0-9]+)/export/$', painting_detail_export_image, name='painting_export_image'),
    url(r'^paintings/(?P<painting_id>[0-9]+)/comment/add/$', add_comment, name='add_comment'),
    url(r'^paintings/(?P<painting_id>[0-9]+)/comments/$', get_comments_by_painting, name='get_comments_by_painting'),
    url(r'^items/(?P<item_id>[0-9]+)/annotations/json/$', annotations_by_item_json, name='annotations_by_item_json'),
    url(r'^items/(?P<item_id>[0-9]+)/update/$', item_update, name='item_update'),
    url(r'^items/(?P<item_id>[0-9]+)/delete/$', item_delete, name='item_delete'),
    url(r'^annotation/(?P<annotation_id>[0-9]+)/vote/(?P<vote_score>[012])/$', annotation_vote, name='annotation_vote'),
    url(r'^annotation/(?P<item_id>[0-9]+)/add/$', add_annotation, name='add_annotation'),
    (r'^admin/', include(admin.site.urls)),
)

urlpatterns += staticfiles_urlpatterns()

var items;
var chosen_item;

$("#display_option").on('change', function(e) {
  if($(this).is(':checked')) {
    $(".item").addClass("annotate_item");
  } else {
    $(".item").removeClass("annotate_item");
  }
});

$("#item_list").html('');
$.ajax({
  dataType: "json",
  url: "json/",
  async: false,
  success: function(data){
    items = data;
    bindItems();
    bindItemsEvent();
  }
});

$("#export_btn").on("click", function() {
  var canvas = document.getElementById("existing_canvas");
  // window.location.href = canvas.toDataURL("image/png");
  window.open('export/', '_blank');
});

$("#add_annotation").on("click", function() {
  var addForm = $("#add_annotation_form");
  if(addForm.hasClass("hidden")) {
    addForm.removeClass("hidden");
  } else {
    addForm.addClass("hidden");
  }
})

$("#new_annotation_submit").on("click", function() {
  $("#annotation_error").html('');
  $("#annotation_success").html('');
  var name = $("#add_annotation_form [name='name']").val();
  var desc = $("#add_annotation_form [name='description']").val();
  var type = $("#add_annotation_form [name='type']:checked").val();
  $.ajax({
    dataType: "json",
    url: $("#add_annotation_form").attr("data-submit") + "?name=" + name + "&description=" + desc + "&type=" + type,
    async: false,
    success: function(data){
      if(data.error) {
        $("#annotation_error").html(data.error);
      } else {
        $("#annotation_success").html('New annotation has been added.');
        $("#add_annotation_form [name='name']").val('');
        $("#add_annotation_form [name='description']").val('');
        $("#add_annotation_form [name='type']").val('');
        chosen_item = data;
        refreshAnnotations();
      }
    }
  });
  return false;
});

$("#add_comment_btn").on("click", function() {
  $("#comment_error").html('');
  $("#comment_success").html('');
  var name = $("#add_comment_form [name='name']").val();
  var content = $("#add_comment_form [name='content']").val();
  $.ajax({
    dataType: "json",
    url: "comment/add/?name=" + name + "&content=" + content,
    async: false,
    success: function(data){
      if(data.error) {
        $("#comment_error").html(data.error);
      } else {
        $("#comment_success").html('Your comment has been added.');
        updateCommentList(data);
        $("#add_comment_form [name='name']").val('');
        $("#add_comment_form [name='content']").val('');
      }
    }
  });
  return false;
});

function bindItems() {
  // var ctx = document.getElementById("existing_canvas").getContext("2d");
  // var img = document.getElementById("painting_img");
  // img.onload = function() {
    // ctx.drawImage(img, 0, 0);
    $.each(items, function(i, item) {
      $("#item_list").append('<div class="item ' + (item.type == "person" ? "cyan" : "green") + '" id="item_' + item.id + '" style="width:' + item.width + 'px; height:' + item.height + 'px; top:' + item.top + 'px; left:' + item.left + 'px;"></div>');
      // ctx.beginPath();
      // ctx.rect(item.left, item.top, item.width, item.height);
      // ctx.fillStyle = (item.type == "person" ? "cyan" : "green");
      // ctx.globalAlpha = 0.3;
      // ctx.fill();
      // ctx.lineWidth = 2;
      // ctx.strokeStyle = (item.type == "person" ? "cyan" : "green");
      // ctx.stroke();
      // ctx.fillStyle = "black";
      // ctx.globalAlpha = 1
      // ctx.font="14px Georgia";
      // ctx.fillText(item.id, item.left + 1, item.top + 15);
    });
    bindTooltip();
    $.ajax({
      dataType: "json",
      url: "comments/",
      async: false,
      success: function(data){
        updateCommentList(data);
      }
    });
  // }
}

function bindItemsEvent() {
  $('.item').on('click', function() {
    var thisId = parseInt($(this).attr('id').split('_')[1]);
    $.ajax({
      dataType: "json",
      url: "/items/" + thisId + "/annotations/json",
      async: false,
      success: function(data){
        chosen_item = data;
      }
    });
    refreshAnnotations();
    $(".vote_panel").removeClass("hidden");
    $('.item').removeClass("chosen_item");
    $(this).addClass("chosen_item");
  });
}

function refreshAnnotations() {
  $("#chosen_name").html(chosen_item.name);
  $("#chosen_description").html(chosen_item.description);
  $("#annotation_list").html('');
  $.each(chosen_item.annotations, function(i, annotation) {
    $("#annotation_list").append(
      "<div class='annotation_item'>" +
      "<div class='annotation_left'>" +
      "<h5 class='annotation_name'>" + annotation.name + "</h5>" +
      "<span class='annotation_description'>" + annotation.description + "</span>" +
      "</div>" +
      "<div class='annotation_right'>" +
      "<div class='left vote_wrapper'>" +
      "<a href='#' class='voteup_btn' data-itemid='" + annotation.id + "'><img src='/static/img/up.png' width='20px'></a><br>" +
      "<span class='vote_total'>" + annotation.vote_total + "</span><br>" +
      "<a href='#' class='votedown_btn' data-itemid='" + annotation.id + "'><img src='/static/img/down.png' width='20px'></a>" +
      "</div>" +
      "<button class='unvote_btn right' data-itemid='" + annotation.id + "'>Unvote</button>" +
      "</div>" +
      "</div>" +
      "<div class='clear_both'></div>"
      );
  });
  $("#add_annotation_form").attr("data-submit", "/annotation/" + chosen_item.id + "/add/");
  bindVoteBtn();
}

function bindVoteBtn() {
  $(".voteup_btn").on("click", function() {
    var thisItem = $(this);
    $.ajax({
      url: "/annotation/" + $(this).attr("data-itemid") + "/vote/1/",
      async: false,
      success: function(data){
        thisItem.siblings('.vote_total').html(data.vote_total);
      }
    });
    return false;
  });

  $(".votedown_btn").on("click", function() {
    var thisItem = $(this);
    $.ajax({
      url: "/annotation/" + $(this).attr("data-itemid") + "/vote/2/",
      async: false,
      success: function(data){
        thisItem.siblings('.vote_total').html(data.vote_total);
      }
    });
    return false;
  });

  $(".unvote_btn").on("click", function() {
    var thisItem = $(this);
    $.ajax({
      url: "/annotation/" + $(this).attr("data-itemid") + "/vote/0/",
      async: false,
      success: function(data){
        thisItem.parent().children('.vote_wrapper').children('.vote_total').html(data.vote_total);
      }
    });
  });
}

function updateCommentList(comments) {
  $("#comment_list").html('');
  $.each(comments, function(i, comment) {
    $("#comment_list").append(
      "<div class='comment_item'>" +
      "<h5 class='comment_name'>" + comment.name + "</h5>" +
      "<span class='comment_content'>" + comment.content + "</span>" +
      "</div>"
      );
  });
}

function bindTooltip() {
  $('.item').hover(function() {
    // Hover over code
    var thisId = parseInt($(this).attr('id').split('_')[1]);
    var item;
    $.ajax({
      dataType: "json",
      url: "/items/" + thisId + "/annotations/json",
      async: false,
      success: function(data){
        item = data;
      }
    });
    var text = item.name;
    $(this).data('tipText', text).removeAttr('title');
    $('<p class="mytooltip"></p>')
      .text(text)
      .appendTo('body')
      .fadeIn('fast');
  }, function() {
    // Hover out code
    $(this).attr('title', $(this).data('tipText'));
    $('.mytooltip').remove();
  }).mousemove(function(e) {
    var mousex = e.pageX - 20; //Get X coordinates
    var mousey = e.pageY + 10; //Get Y coordinates
    $('.mytooltip').css({ top: mousey, left: mousex })
  });
}
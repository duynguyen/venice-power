// boolean value indicating whether the mouse is pressed or not
var mouseDown = false;
var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;

//
// When a mouse button is down on the canvas,
// it will be the start position of our rectangle
//
$("#annotate_canvas").mousedown(function(e) {
    mouseDown = true;

    // subtracting the offset position found from findPos method
    // from the mouse position in the window
    var pos = findPos(this);
    startX = e.pageX - pos.x;
    startY = e.pageY - pos.y;
    $("[name='left_coordinate']").val(startX);
    $("[name='top_coordinate']").val(startY);
    $("[name='width']").val(0);
    $("[name='height']").val(0);
    var c = document.getElementById("annotate_canvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
});

//
// When the mouse moves and the mouse is down
// clear the rectangle and redraw the rectangle
// to make it look like it's drag and dropping
//
$("#annotate_canvas").mousemove(function(e) {
    if (mouseDown) {
        // Clear the canvas, so we can redraw the rectangle with end positions
        var c = document.getElementById("annotate_canvas");
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        
        var pos = findPos(this);
        endX = e.pageX - pos.x;
        endY = e.pageY - pos.y;

        var w = endX - startX;
        var h = endY - startY;
        var top = startY;
        var left = startX;
        if(w < 0) {
            left = startX + w;
            w = -w;
        }
        if(h < 0) {
            top = startY + h;
            h = -h;
        }

        $("[name='left_coordinate']").val(left);
        $("[name='top_coordinate']").val(top);
        $("[name='width']").val(w);
        $("[name='height']").val(h);

        // Start a new shape instead of adding it to an existing rectangle we drew earlier
        ctx.beginPath();
        ctx.rect(startX, startY, endX - startX, endY - startY);
        ctx.fillStyle = "blue";
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }
});

// When the mouse button is up,
// disable drag and drop drawing
$("#annotate_canvas").mouseup(function (e) {
    // if (mousedown) {
    //     var c = document.getElementById("canvas");
    //     var ctx = c.getContext("2d");
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.beginPath();
    //     ctx.rect(startX, startY, endX - startX, endY - startY);
    //     ctx.fillStyle = "cyan";
    //     ctx.globalAlpha = 0.6;
    //     ctx.fill();
    //     ctx.lineWidth = 4;
    //     ctx.strokeStyle = 'black';
    //     ctx.stroke();
    // }
    mouseDown = false;
});

//
// Draw previous annotations
//
$.ajax({
  dataType: "json",
  url: "json/",
  async: false,
  success: function(data){
    items = data;
    $.each(items, function(i, item) {
        var ctx = document.getElementById("existing_canvas").getContext("2d");
        ctx.beginPath();
        ctx.rect(item.left, item.top, item.width, item.height);
        ctx.fillStyle = (item.type == "person" ? "cyan" : "green");
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = (item.type == "person" ? "cyan" : "green");
        ctx.stroke();
    });
  }
});

    
//
// Looping through all parents to get the correct offset position of obj
//  
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

var brushes = {};
var canvasid = 'tutorial';
function resize_canvas(){
	var c = document.getElementById(canvasid);
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	c.setAttribute('width',canvasWidth);
	c.setAttribute('height',canvasHeight);
	//taken from http://stackoverflow.com/questions/1152203/centering-a-canvas/1646370
}
function getContext(){
	var canvas = document.getElementById(canvasid);
	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
		return ctx;
	} else {
		alert('You need Safari or Firefox 1.5+ to see this demo.');
	}
}
function drawShape(x,y,r){
	if (!x) x=0;
	if (!y) y=0;
	if (!r) r=10;
	var ctx = getContext();
	ctx.beginPath();	
	ctx.arc(x,y,r,0,Math.PI*2,true)
	ctx.closePath();
	ctx.fill();
}
function startUp(){
	resize_canvas();
	clear_screen();
	for (var i=0;i<100;i++){
		randomColor();
		drawShape(800*Math.random(),600*Math.random(),50);
	}
}
function setFill(r,g,b){
	r = Math.floor(r);
	g = Math.floor(g);
	b = Math.floor(b);
	var ctx = getContext();
	ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
}
function randomColor(){
	var ctx = getContext();
	var r = Math.floor(Math.random()*255);
	var g = Math.floor(Math.random()*255);
	var b = Math.floor(Math.random()*255);
	setFill(r,g,b);
}
document.onmousedown = function(e){
	var brush = {};
	brush.x = e.clientX;
	brush.y = e.clientY;
	brush.color = sample_pixel_color(brush.x,brush.y);
	brush.r = 10;
	brushes['mouse'] = brush;
	draw_brush(brush);
	document.onmousemove = function(e){
		var brush = brushes['mouse'];
		brush.x = e.clientX;
		brush.y = e.clientY;
		draw_brush(brush);
	}
}
document.onmouseup = function(e){
	delete brushes['mouse'];
	document.onmousemove = undefined;
}
function clear_screen(){
	var ctx = getContext();
	ctx.fillStyle = "rgb(255,255,255)";  
	ctx.fillRect (0, 0, 400, 400);
	return ctx;
}
function sample_pixel_color(x,y){
	var ctx = getContext();
	var s=0; //how many pixels should we sample?
	var pixel = ctx.getImageData(x-s,y-s,1+2*s,1+2*s).data;	
	var r = 0;
	var g = 0;
	var b = 0;
	for (var i=0;i<pixel.length;i++){
		r+=pixel[i++];
		g+=pixel[i++];
		b+=pixel[i++];
	}
	var n = pixel.length/4;
	r/=n;
	g/=n;
	b/=n;
	return 'rgb('+r+','+g+','+b+')';
}

function set_fill_color(colorstring){
	var ctx = getContext();
	ctx.fillStyle = colorstring;
	return ctx;
}
var drawable = true;
function draw_brush(b){
	if (!drawable) return;
	var ctx = set_fill_color(b.color);
	var x = b.x;
	var y = b.y;
	
	var oldx = b.oldx;
	var oldy = b.oldy;	
	
	if (!oldx) oldx = x;
	if (!oldy) oldy = y;
	
	var dx = x-oldx;
	var dy = y-oldy;
	var dist = Math.sqrt(dx*dx+dy*dy);
	var N = 10;
	var r = Math.min(200,Math.max(1,dist));
	dR = .1*(r-b.r)/N;
	for (var i=0;i<N+1;i++){
		b.r+=dR;
		drawShape(oldx+i*dx/N,oldy+i*dy/N,b.r);
	}
	b.oldx=x;
	b.oldy=y;
}
function fingerStart(e){
	e.preventDefault();
	for (var t in e.changedTouches){
		var touch = e.changedTouches[t];
		if (touch.identifier==undefined) continue;
		var brush = {};
		brush.x = touch.pageX;
		brush.y = touch.pageY;
		brush.color = sample_pixel_color(brush.x,brush.y);
		brush.r = 10;
		brushes[touch.identifier] = brush;
		draw_brush(brush);
	}
	return false;
}

function fingerMove(e){
	e.preventDefault();
	for (var t in e.changedTouches){
		var touch = e.changedTouches[t];
		if (touch.identifier==undefined) continue;
		var brush = brushes[touch.identifier];
		brush.x = touch.pageX;
		brush.y = touch.pageY;
		draw_brush(brush);
	}
	return false;
}
function fingerUp(e){
	e.preventDefault();
	for (var t in e.changedTouches){
		var touch = e.changedTouches[t];
		if (touch.identifier==undefined) continue;
		delete brushes[touch.identifier];
	}
	return false;
}
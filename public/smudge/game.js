
/*
0. load title screen
1. push start button
2. load goal image, say Ready?, 3,2,1.. GO!
3. load starting image, 10 sec countdown
4. allow drawing
5. times up, quick score (good bad)
6. after three seconds, GOTO 2, unless out of images
7. show all the goal images, then show all the drawn images, then give a final score

circle the goals, then one-by-one replace them with the drawns, showing the score in the middle
then once all have been replaced, show a letter grade.

ALMOST PERFECT
zoom into a problem area and give the user a few seconds to fix it, hoping they get 100%


*/
var drawable = false;
function good(){
	var ctx = clear_screen();
	ctx.lineWidth = 5;
	ctx.strokeStyle = "rgba(0,255,0,1.0)";
	ctx.beginPath();
	ctx.moveTo(80,200);
	ctx.lineTo(160,300);
	ctx.lineTo(350,50);
	ctx.stroke();	
}
function bad(){
  
	var ctx = clear_screen();
	ctx.strokeStyle = "rgba(255,0,0,1.0)";
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.moveTo(50,50);
	ctx.lineTo(350,350);
	ctx.moveTo(50,350);
	ctx.lineTo(350,50);
	ctx.stroke();	
}
function scaleimage(){
	var ctx = getContext();
	var W = 100;
	var W1 = 400;
	var H = 100;
	var H1 = 400;
	var image = ctx.getImageData(0,0,W1,H1);
	var small = ctx.createImageData(W,H);

	for (var x=0;x<W;x++){
		for (var y=0;y<H;y++){
			var i1 = 4*(W*y+x);
			var i2 = 4*4*(W1*y+x);
			small.data[i1] = image.data[i2];
			small.data[i1+1] = image.data[i2+1];
			small.data[i1+2] = image.data[i2+2];
			small.data[i1+3] = image.data[i2+3];
		}
	}
	return small;
}
function getImage(url,fn){
	var img = new Image();
	img.onload = function(){
		var ctx = getContext();
		ctx.drawImage(img,0,0);
		if (fn) fn();
	}
	img.src=url;
}
var goalData;
var current;
function preview(){
	drawable = false;
	current = image_names.shift();
	getImage(current+'_colored.png',function(){
		goal_images_small.push(scaleimage());
		countdown(3,draw);
	});
	gg('score').innerHTML = 'Ready?';
	
}
function countdown(t,fn){
	if (t>0) {
		gg('timer').innerHTML = t;
		setTimeout(function(){countdown(t-1,fn)},1000);
	} else {
		gg('timer').innerHTML = '';
		fn();
	}
}
function pixeldiff(a,b){
	var score = 0;
	for (var i=0;i<a.data.length;i++){
		var dr = Math.abs(a.data[i]-b.data[i++]);
		var dg = Math.abs(a.data[i]-b.data[i++]);
		var db = Math.abs(a.data[i]-b.data[i++]);
		score+=1*((dr+dg+db)>10);
	}
	return score;
}
function draw(){
	gg('score').innerHTML = 'GO!';
	getImage(current+'_blank.png',function(){
	drawable = true;
		countdown(15,done_and_next);
		setTimeout(function(){gg('score').innerHTML = '';},500);
		max_score = pixeldiff(goal_images_small[goal_images_small.length-1],scaleimage());
	});
}
function gg(x){
	return document.getElementById(x);
}
function done_and_next(){
	drawable = false;
	//grab the current image, save it smaller, and get ready for the next.
	var drawing = scaleimage();
	drawn_images_small.push(drawing);
	var goalimage = goal_images_small[goal_images_small.length-1];
	var thediff = pixeldiff(goalimage,drawing);
	var thescore = Math.max(0,(100-Math.floor(100*thediff/max_score)))
	gg('score').innerHTML = thescore;

	if (thescore>70){
		good();
	} else {
		bad();
	}
	scores.push(thescore);
	if (image_names.length) {
		setTimeout(preview,1000);
	} else {
		setTimeout(finalize,1000);
	}
}
function finalize(){
	clear_screen();
	var ctx = getContext();
	var ims = drawn_images_small;
	var N = ims.length;
	var total =0;
	for (var i=0;i<scores.length;i++){
		total+=scores[i];
	}
	gg('score').innerHTML = Math.round(total/scores.length);
	for (var i=0;i<N;i++){
		//ctx.putImageData(ims[i],clockwise[i],clockwise[N-i-1]);
		ctx.putImageData(ims[i],100*i,100);
		ctx.putImageData(goal_images_small[i],100*i,0);
	}
	gg('timer').innerHTML = '<a ontouchstart="start_game()" href="javascript:start_game();void(0);">x</a>';
}
var clockwise = [100,200,300,300,200,100,0,0];

var levels = {
	easy: ['moon','arrow','square','star'],
	hard: ['circle','abstract','person','boat'],
}

function load_level(l){
	image_names = levels[l].slice(0,4);
	goal_images_small=[];
	drawn_images_small = [];
	scores = [];
	preview();
}
function start_game(){
	clear_screen();
	gg('timer').innerHTML = '';
	var s = 'Choose:<br>';
	for (var l in levels){
		s+='<a ontouchstart="load_level(\''+l+'\')" href="javascript:load_level(\''+l+'\');void(0);">'+l+'</a> ';
	}
	gg('score').innerHTML = s;
}
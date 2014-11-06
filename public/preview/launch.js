var chapterID = 'WhyWait/1';
var X = new Display('display', 10);
var STAGE = new Stage();
var MANAGER = new StageManager(STAGE);


X.root = STAGE;

var READY = function(infomap){
    console.log('ready!');
    LOAD_INFO(infomap);
    console.log('now loading slot and spots, because they arent in infos on the server i guess');
    INSERT_INFO_CLASSES({
    'Slot':{
        '1':{'identifier':'1', 'x':0,   'y':0},
        '2':{'identifier':'2', 'x':320, 'y':0},
        '3':{'identifier':'3', 'x':640, 'y':0},
        '4':{'identifier':'4', 'x':960, 'y':0}
        },
    'Spot':{
        'offscreen_left':{x:-120, y:0},
        'screen_left':{x:120, y:0},
        'screen_right':{x:200, y:0},
        'offscreen_right':{x:440, y:0},
        }
    });
    start('WhyWait/1');
    console.log('ok, any time now..');
};

X.update();
var start = function(chapterID){
    $.ajax({
        url:"/dcon/" + INFO.Chapter(chapterID).scriptFileName,
        type:"GET",
        cache:false,
        data:{},
        dataType:"json",
        success:function(output){
            console.log('downloaded chapter script successfully');
            MANAGER.play(output);
        },
        error:function(_,estatus,ethrown){
            alert('unable to preview chapter! Sorry! Go back to the editor I guess.');
            ES = estatus;
            ET = ethrown;
        }
    });
};

HOUSES = {
    "Slythern": {
        xOrigin: 0,
        color: "#366a5e",
        upKey: "q",
        downKey: "a"
    },
    "Hufflefuff": {
        xOrigin: 212,
        color: "#b4b90e",
        upKey: "w",
        downKey: "s"
    },
    "Ravenclaw": {
        xOrigin: 427,
        color: "#2140b3",
        upKey: "e",
        downKey: "d"
    },
    "Gryffendor": {
        xOrigin: 642,
        color: "#a14946",
        upKey: "r",
        downKey: "f"
    },
    "Beauxbatons": {
        xOrigin: 855,
        color: "#2badcd",
        upKey: "t",
        downKey: "g"
    },
    "Dermstrang": {
        xOrigin: 1069,
        color: "#743d15",
        upKey: "y",
        downKey: "h"
    }
};

var HOUSE_BALL_COUNT = 70;//2badcd
var ROW_BALL_COUNT = 8;
var BALL_SIZE = 7;
var Y_TOP = 20;

$(document).keypress(function(e){
    var name, dir;
            
    if(e.keyCode){
        for(var k in HOUSES){
            var letter = String.fromCharCode(e.keyCode);
            if(HOUSES[k].upKey == letter){
                name = k; dir = 1;}
            if(HOUSES[k].downKey == letter){
                name = k; dir = -1;}
        }
        if(name){
            console.log(name +" "+dir);
            sceneManager.gravityChange(HOUSES[name].color, dir);
            var scoreEl = $("[data-house-name='"+name+"']");
            scoreEl.text(parseInt(scoreEl.text(), 10) + dir);
        }
    }
});

var sceneManager;
$(document).ready(function(){
	//makeBalls();
    sceneManager = new BodyManager($(".sandbox canvas"));
    $(".tally .stop").click(function(){isRunning = false;sceneManager.describe()});

    makeHourglass(0);
    makeBalls();
    setupTallyBoard();

    doFrame();
});

function makeBalls(){
	for(var i=0;i<HOUSE_BALL_COUNT;i++){
		for(houseName in HOUSES){
			var house = HOUSES[houseName];
            sceneManager.addBall({
				positionX: house.xOrigin +
                    (i%ROW_BALL_COUNT)*(2*BALL_SIZE+1)
                    +Math.random() + 180,
				positionY: Y_TOP + Math.floor(i / ROW_BALL_COUNT)*(2*BALL_SIZE+1)+Math.random(),
				size: BALL_SIZE,
				color: house.color
			});
		}
	}
}

function makeHourglass(){
    var shift;
    for(k in HOUSES){
        shift = HOUSES[k].xOrigin;

        for(var i=0;i<hourglass.length-1;i++) {
            var begin = hourglass[i];
            var end = hourglass[i + 1];
            sceneManager.addWall({
                xStart: begin[0] + shift,
                yStart: begin[1],
                xEnd: end[0] + shift,
                yEnd: end[1]
            })
        }
    }
}

function setupTallyBoard(){
    var originalElement = $(".panel .house-info")[0];
    $(".panel .house-info").remove();

    for(name in HOUSES){
        var el = $(originalElement).clone();
        console.log(name);
        el.find(".house-name").text(name);
        el.find(".score").text(0);
        el.find(".score").attr("data-house-name", name);
        $(".panel").append(el);
    }
}

var lastRenderAt = new Date();
var isRunning = true;
var renderAt, dt;
function doFrame(){
    sceneManager.doUpdate(dt/1000.0);
    renderAt = new Date();
    dt = Math.min(renderAt - lastRenderAt, 150);

    lastRenderAt = renderAt;

    if(isRunning) setTimeout(doFrame, Math.max(16-dt, 0));
}
var hourglass = [[190,723],[178,715],[170,704],[163,693],[159,682],[154,669],[152,653],[148,599],[153,577],[157,556],[170,521],[210,417],[229,380],
    [234,372],[234,359],[230,351],[222,335],[199,286],[157,168],[149,94],[154,58],[169,24],[185,8],[194,5],[274,5],
    [298,5],[310,17],[324,38],[335,57],[338,78],[339,102],[337,136],[309,227],[284,294],[267,328],[259,349],[256,371],
    [260,386],[268,404],[274,417],[282,435],[297,472],[310,509],[327,558],[336,590],[339,613],[339,634],[335,664],
    [327,686],[320,699],[314,706],[307,715],[297,724],[190,723]];



/**
 * BCLearningNetwork.com
 * Food Chains Quiz Game
 * @author Colin Bernard (colinjbernard@hotmail.com)
 * May 2017
 */

 ///////// VARIABLES

 var mute = false;
 var FPS = 24;
 var gameStarted = false;

 var STAGE_WIDTH;
 var STAGE_HEIGHT;

 var IMAGE_WIDTH = 150;
 var IMAGE_HEIGHT = 80;

 var BOX_WIDTH = 160;
 var BOX_HEIGHT = 90;


 function init() {
 	// set constants
	STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes
	createjs.Touch.enable(stage); // enable touch interactions if supported

	setupManifest(); // preloadJS
	startPreload();
 }

 function update(event) {
 	stage.update(event);

 	if (gameStarted) {

 		// var isReady = true;
 		// for (option of questionImages) {
 		// 	if (option.bitmap.x < 50 || option.bitmap.x > 200 || option.bitmap.y < 100 || option.bitmap.y > 650) {
 		// 		isReady = false;
 		// 	}
 		// 	for (another of questionImages) {
 		// 		if (option.id != another.id) {
 		// 			if (ndgmr.checkRectCollision(another.bitmap, option.bitmap) != null) {
 		// 				isReady = false;
 		// 			}
 		// 		}
 		// 	}
 		// }

 		// if (isReady) {
 		// 	stage.addChild(checkButton);
 		// 	stage.removeChild(checkButtonDisabled);
 		// 	gameStarted = false;
 		// }

 		var isComplete = true;
 		for (var option of questionImages) {
 			var isMatched = false;
 			for (var rect of whiteRectsArray) {
 				if (ndgmr.checkRectCollision(option.bitmap, rect) != null) {
 					isMatched = true;
 					break;
 				}
 			}
 			if (!isMatched) {
 				isComplete = false;
 			}
 		}

 		if (isComplete) {
 			for (var option1 of questionImages) {
 				for (var option2 of questionImages) {
 					if (option1.id != option2.id) {
 						if (ndgmr.checkRectCollision(option1.bitmap, option2.bitmap) != null) {
	 						isComplete = false;
	 						break;
 						}
 					}

 				}
 			}

 			if (isComplete) {
 				stage.addChild(checkButton);
 				stage.removeChild(checkButtonDisabled);
 				gameStarted = false;
 			}
 		}
 	}
 }

 /*
 * Starts the game
 */
function startGame() {

	// ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", update); // call update function


	initGraphics();


	gameStarted = true;
}

function endGame(correct) {
	if (correct) {
		stage.addChild(correctScreen);
	} else {
		stage.addChild(incorrectScreen);
	}

	stage.on("stagemousedown", function() {
		location.reload();
	})
}

function initGraphics() {
	// background
	stage.addChild(backgroundImage);

	// check button
	checkButton.x = 280;
	checkButton.y = STAGE_HEIGHT - checkButton.getBounds().height - 15;
	checkButtonPressed.x = checkButton.x;
	checkButtonPressed.y = checkButton.y;
	checkButtonDisabled.x = checkButton.x;
	checkButtonDisabled.y = checkButton.y;
	checkButton.cursor = "pointer";
	checkButtonPressed.cursor = "pointer";
	stage.addChild(checkButtonDisabled); // only add disabled one to start
	checkButton.on("click", function(event) {
		checkButtonHandler();
	});
	checkButtonPressed.on("click", function(event) {
		checkButtonHandler();
	});
	checkButton.on("mouseover", function() {
		stage.addChild(checkButtonPressed);
		stage.removeChild(checkButton);
	});
	checkButtonPressed.on("mouseout", function() {
		stage.addChild(checkButton);
		stage.removeChild(checkButtonPressed);
	})

	// white rectangles (for snapping)
	for (var i = 0; i < whiteRectsArray.length; i++) {
		var rect = whiteRectsArray[i];

		rect.x = 292;
		rect.y = 190 + (105 * i);

		rect.alpha = 0;

		stage.addChild(rect);	

	}

	// question images
	shuffle(questionImages);
	for (var i = 0; i < questionImages.length; i++) {
		var image = questionImages[i].bitmap;
		image.name = questionImages[i].id;

		image.scaleX = IMAGE_WIDTH / image.image.width;
		image.scaleY = IMAGE_HEIGHT / image.image.height;

		image.x = 100;
		image.y = 235 + (105*i);
		questionImages[i].originalX = image.x;
		questionImages[i].originalY = image.y;

		image.regX = image.getBounds().width/2;
		image.regY = image.getBounds().height/2;

		image.cursor = "pointer";

		// listener
		image.on("pressmove", function(event) {
			imageClickHandler(event);

		});

		image.on("click", function(event) {
			imageDropHandler(event);
		})


		image.on("rollover", function(event) {
			this.scaleX = this.scaleX * 1.1;
			this.scaleY = this.scaleY * 1.1;
		});

		image.on("rollout", function(event) {
			this.scaleX = IMAGE_WIDTH / this.image.width;
			this.scaleY = IMAGE_HEIGHT / this.image.height;
		})

		stage.addChild(image);
	}
}

function imageDropHandler(event) {
	for (var rect of whiteRectsArray) {
		if (ndgmr.checkRectCollision(rect, event.target) != null) {
			var passed = true;
			for (var i = 1; i < questionImages.length; i++) {
				if (ndgmr.checkRectCollision(questionImages[i].bitmap, questionImages[i-1].bitmap) != null) {
					passed = false;
				}
			}
			if (passed) {
				event.target.x = rect.x + IMAGE_WIDTH/2 + 5;
				event.target.y = rect.y + IMAGE_HEIGHT/2 + 5;
				break;
			}
		}
	}
}

var lastTime = 0;
function imageClickHandler(event) {

	if (!gameStarted) {
		gameStarted = true;
		stage.addChild(checkButtonDisabled);
		stage.removeChild(checkButton);
	}

	event.target.x = event.stageX;
	event.target.y = event.stageY;
}

function checkButtonHandler() {
	playSound("click");
	var correct = true;
	questionImages.sort(compare);
	var lastOne = questionImages[0];
	for (var i = 1; i < questionImages.length; i++) {
		if (questionImages[i].bitmap.y < lastOne.bitmap.y) {
			correct = false;
			break;
		}
		lastOne = questionImages[i];
	}
	endGame(correct);
}

function compare(a, b) {
	if (a.id < b.id) {
		return 1;
	} else if (a.id > b.id) {
		return -1;
	}
	return 0;
}

///////////////////////////////////// PRELOAD JS 

var PATH_TO_QUESTION_IMAGES = "images/question_images/" + SUB_FOLDER + "/";

// bitmap variables
var backgroundImage;
var checkButton, checkButtonPressed, checkButtonDisabled;
var correctScreen, incorrectScreen;
var questionImages = [];
var whiteRectsArray = [];

function setupManifest() {
	manifest = [
		{
			src: "sounds/click.mp3",
			id: "click"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "background.png",
			id: "background"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "1.jpg",
			id: "image1"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "2.jpg",
			id: "image2"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "3.jpg",
			id: "image3"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "4.jpg",
			id: "image4"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "check_button.png",
			id: "check_button"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "check_button_pressed.png",
			id: "check_button_pressed"
		},
		{
			src: PATH_TO_QUESTION_IMAGES + "check_button_disabled.png",
			id: "check_button_disabled"
		},
		{
			src: "images/correct.png",
			id: "correct"
		},
		{
			src: "images/incorrect.png",
			id: "incorrect"
		},
		{
			src: "images/white_rect.jpg",
			id: "white_rect"
		}
	];
}

function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);          
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
	console.log("A file has loaded of type: " + event.item.type);

	if (event.item.id == "background") {
		backgroundImage = new createjs.Bitmap(event.result);
	} else if (event.item.id == "check_button") {
		checkButton = new createjs.Bitmap(event.result);
	} else if (event.item.id == "check_button_pressed") {
		checkButtonPressed = new createjs.Bitmap(event.result);
	} else if (event.item.id.includes("image")) {
		questionImages.push({id: event.item.id, bitmap:new createjs.Bitmap(event.result), originalX:0, originalY:0});
	} else if (event.item.id == "check_button_disabled") {
		checkButtonDisabled = new createjs.Bitmap(event.result);
	} else if (event.item.id == "correct") {
		correctScreen = new createjs.Bitmap(event.result);
	} else if (event.item.id == "incorrect") {
		incorrectScreen = new createjs.Bitmap(event.result);
	} else if (event.item.id == "white_rect") {
		for (var i = 0; i < 4; i++) {
			whiteRectsArray.push(new createjs.Bitmap(event.result));
		}
	}
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {
    /*progressText.text = (preload.progress*100|0) + " % Loaded";
    progressText.x = STAGE_WIDTH/2 - progressText.getMeasuredWidth() / 2;
    stage.update();*/
}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
    console.log("Finished Loading Assets");

    startGame();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS
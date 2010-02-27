function DioObjectAssistant() {
	
}

DioObjectAssistant.prototype.setup = function () {
	this.buttonModel1 = {
		buttonLabel : 'Play',
		buttonClass : 'affirmative',
		disable : false
	};
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	};
	
	//Set up button handlers
	this.buttonModel2 = {
		buttonLabel : 'Pause',
		buttonClass : 'dismiss',
		disable : false
	};
	this.buttonAtt2 = {
		type : Mojo.Widget.activityButton
	};
	
	this.controller.setupWidget('PlayButton', this.buttonAtt1, this.buttonModel1);
	this.controller.setupWidget('PauseButton', this.buttonAtt2, this.buttonModel2);
	
	Mojo.Event.listen(this.controller.get('PauseButton'), Mojo.Event.tap, this.handlePauseButton.bind(this));
	Mojo.Event.listen(this.controller.get('StopButton'), Mojo.Event.tap, this.handleStopButton.bind(this));
	Mojo.Event.listen(this.controller.get('PlayButton'), Mojo.Event.tap, this.handlePlayButton.bind(this));
	Mojo.Event.listen(this.controller.get('PickSong'), Mojo.Event.tap, this.handlePickSongButton.bind(this));

};


DioObjectAssistant.prototype.activate = function (event) {
	
	if (Song.newSong === true){
		this.stopTheSong();
		Song.newSong = false;
	}
	
	if (Song.audioFileLocation === ''){
		this.pickMySong();
	}
	this.playMeSomeDio();

};

DioObjectAssistant.prototype.handlePlayButton = function(event){
	this.playMeSomeDio();
}

DioObjectAssistant.prototype.playMeSomeDio = function () {
	this.mybutton = this.controller.get('PauseButton');
	this.mybutton.mojo.deactivate();
    Mojo.Log.info("playMeSomeDio Song File: %s", Song.audioFileLocation);
	try {
		if (this.paused && !this.stopped) {
			this.paused = false;
			this.playing = true;	
			this.audioPlayer.play();
		} else {
			if (!this.playing) {
				this.paused = false;
				this.playing = true;	
				this.stopped = false;
				this.audioPlayer = new Audio();
				var file = Song.audioFileLocation;
				if (this.audioPlayer.palm) {
					this.audioPlayer.mojo.audioClass = "media";
				}
				this.myCueHandler(file);
			}
		}
		$('area-to-update').update("Playing...");
	}catch (err) {
		this.showDialogBox('error', err); 
	}
};

DioObjectAssistant.prototype.handlePauseButton = function (event) {
	this.pauseTheSong();
};

DioObjectAssistant.prototype.pauseTheSong = function () {
	this.paused = true;	
	if (this.playing) {
		this.playing = false;
		this.stopped = false;
		this.mybutton = this.controller.get('PlayButton');
		this.mybutton.mojo.deactivate();
		this.controller.get('area-to-update').update("Paused!!");
		this.audioPlayer.pause();
	} else {
		this.playing = false;	
		this.paused = false;
		this.stopped = true;
		this.mybutton = this.controller.get('PauseButton');
		this.mybutton.mojo.deactivate();
	}
};

DioObjectAssistant.prototype.handleStopButton = function (event) {
	this.stopTheSong();
}

DioObjectAssistant.prototype.stopTheSong = function () {	
	this.mybutton = this.controller.get('PauseButton');
	this.mybutton.mojo.deactivate();
	this.mybutton = this.controller.get('PlayButton');
	this.mybutton.mojo.deactivate();
	this.audioPlayer.pause();	
	this.audioPlayer.src = null;
	this.playing = false;	
	this.paused = false;
	this.stopped = true;
	$('area-to-update').update("Stopped...");
};

DioObjectAssistant.prototype.handlePickSongButton = function (event) {
	this.pickMySong();
}

DioObjectAssistant.prototype.pickMySong = function () {
	var params = {
			kind:	'audio',
		    onValidate: function(file){
		         if (file.fullPath.search(/bad/i) != -1) {
		             alert( $L('File not accepted') );
		             return false;
		         }
		         return true;
		    },
		    onSelect: function(file){
			    Song.audioFileLocation = file.fullPath;
			    Song.newSong = true;
			    Song.Cookie.storeCooke();
		    },
		    onCancel: function(){
		         $('area-to-update').innerHTML = $L('no file selected');
		    }
		 };
	this.pauseTheSong();
	Mojo.FilePicker.pickFile(params, Mojo.Controller.stageController); 
};

DioObjectAssistant.prototype.deactivate = function (event) {
	Song.Cookie.storeCookie();
};

DioObjectAssistant.prototype.cleanup = function (event) {
	this.controller.stopListening('PauseButton', Mojo.Event.tap, this.handlePauseButton);
	this.controller.stopListening('StopButton', Mojo.Event.tap, this.handleStopButton);
	this.controller.stopListening('PlayButton', Mojo.Event.tap, this.handlePlayButton);
	this.controller.stopListening('PickSong', Mojo.Event.tap, this.handlePickSongButton);
};

DioObjectAssistant.prototype.myCueHandler = function (url) {
	console.log("In cue handler");
	this.audioPlayer.src = url;

	// Prevent playback starting immediately.  Must be called *after* setting the src URL
	this.myPlayHandler();
};
DioObjectAssistant.prototype.myPlayHandler = function () {
	// Register this handler so we know when the play is finished
	this.audioPlayer.addEventListener('end', this.myCueIterator, false);

	// Register this handler so we know if there was a problem with playback of the sound file.
	this.audioPlayer.addEventListener('error', this.myCueIterator, false);
	// Start playback of the audio file
	try {
		this.audioPlayer.play();
	} catch (err) {
		this.showDialogBox('error', err);
	}
};


DioObjectAssistant.prototype.myCueIterator = function (event) {
	// Remove the two event handlers.  
	this.audioPlayer.removeEventListener('end', myCueIterator, false);
	this.audioPlayer.removeEventListener('error', myCueIterator, false);
	
	if (event.type === 'error') {
		console.log("Error");
	} else {
		this.audioPlayer.pause();	
		this.audioPlayer.src = null;
		this.paused = false;
		this.stopped = true;
	}
};

DioObjectAssistant.prototype.showDialogBox = function (title, message) {
	this.controller.showAlertDialog({
		onChoose: function (value) {},
		title: title,
		message: message,
		choices: [ {label: 'OK', value: 'OK', type: 'color'} ]
	});
};


Song = {};

// Constant
Song.versionString = "1.0";

// Globals
Song.audioFileLocation = '';
Song.newSong = false;

function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	//load preferences and globals from saved cookie
	Song.Cookie.initialize();
	
	this.controller.pushScene('dioObject');
}

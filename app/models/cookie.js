/*
	Cookie - Cue the Dio

	Handler for cookie storage for Cue the Song.  Will load and store cookie
	data, migrate preferences and update cookie data.

	Functions:
	initialize - loads or creates songCookie; updates preferences with contents
		of stored songCookie and migrates any preferences due version changes
	store - updates stored songCookie with current global preferences
*/

Song.Cookie = ({
	initialize: function()  {
	  // Update globals with preferences or create it.
	  this.cookieData = new Mojo.Model.Cookie("comHoketronicsCuethedioPrefs");
	  var oldCuethedioPrefs = this.cookieData.get();
	  if (oldCuethedioPrefs) {
	    // If current version, just update globals & prefs
	    if (oldCuethedioPrefs.songVersionString == Song.versionString) {
	      Song.audioFileLocation = oldCuethedioPrefs.audioFileLocation;
	      Song.versionString = oldCuethedioPrefs.songVersionString;
		  Mojo.Log.info("initialize Song File: %s", Song.audioFileLocation);
	    } else {

	    }
	  }
	
	  this.storeCookie();
	        
	},
	    
	//  store - function to update stored cookie with global values
	storeCookie: function() {
	  this.cookieData.put(	{   
	    audioFileLocation: Song.audioFileLocation,
	    songVersionString: Song.versionString,
	  });
	  Mojo.Log.info("storeCookie Song File: %s", Song.audioFileLocation);
	}
});
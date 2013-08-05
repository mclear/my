// var ndefRecord = {}; // ndef Record
var data = {}; // data
var toWrite = false; // ugh this is hacky and ugly and prolly not even needed...
var x, y;

var actions = {
  twitter: {
    label: "Twitter",
    optionText: "What is your Twitter Username?",
    placeHolder: "@nfcring",
    prefix: "http://twitter.com/",
    format: function (option) {
      return this.prefix + option
    }
  },
  facebook: {
    label: "Facebook",
    optionText: "What is your Facebook Page URL?",
    placeHolder: "http://facebook.com/ring.cake24",
    prefix: "http://facebook.com/",
    format: function (option) {
      return this.prefix + option
    }
  },
  clone: {
    label: "Clone Ring",
    isClone: true,
    requiresString: false
  },
  website: {
    label: "Website",
    optionText: "What is the URL of the website?",
    placeHolder: "http://mclear.co.uk",
    format: function (option) {
      return option
    }
  },
  /*
  ,
  skype: {
    label: "Skype",
    optionText: "What is your Skype Username?",
    placeHolder: "JohnMcLear"
  }
  */
  etherpad: {
    label: "Etherpad",
    optionText: "What is your Pad URL?",
    placeHolder: "http://beta.etherpad.org/p/foowie",
    format: function (option) {
      return option
    }
  },
  youtube: {
    label: "Youtube",
    optionText: "What is your Youtube Video / Channel?",
    placeHolder: "johnyma22",
    prefix: "http://youtube.com",
    format: function (option) {
      return this.prefix + option
    }
  }
};

var app = {
  initialize: function () {
    this.bind();
  },
  bind: function () {
    document.addEventListener('deviceready', this.deviceready, false);
  },
  deviceready: function () {
    // note that this is an event handler so the scope is that of the event
    // so we need to call app.report(), and not this.report()
    console.log('deviceready');
    if(nfc){
	
      // window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, clearFS, fail); // Clearing is broken..

      nfc.addNdefListener(function (nfcEvent) {
        ring(nfcEvent); // TODO uncomment me
        console.log("Attempting to bind to NFC");
      }, function () {
        console.log("Success.  Listening for rings..");
      }, function () {
        alert("NFC Functionality is not working, is NFC enabled on your device?");
        $('#createNew, #read, #scan').attr('disabled','disabled');
        // console.log("Fail.");
      });
      // ndefRecord = ndef.uriRecord("http://nfcring.com"); // placeholder..
      console.log('is barcode ready? ' + window.barcodescanner);
    }
  }
};

function debug(msg) {
  console.log(msg);
}

function addActions() {
  // go through each item in actions and render to UI
  $.each(actions, function (key, action) {
    debug(action);
    if (!action.image) {
      action.image = key.toLowerCase() + ".png";
    };
    $(".action > .actionContents > .ringActions").append("<a data-action=" + key + " class=\"ringAction paddedIcon\"><img src=\"img/" + action.image + "\">" + action.label + "</a>");
  });
}

function selectAction(action) {
  debug("Action " + action + " selected");
  debug(actions[action]);
  if (actions[action].requiresString !== false) { // If the item requires further input
    window.location = "addParameterToAction.html?action="+action;
  } else {
    window.location = "writeAction.html?action="+action;
  }
}

/*
function prepareTag(action, option) {
  debug("Preparing Rings..");
  debug(action);
  debug(option);
  var newUrl = actions[action].format(option);
  console.log("New URL", newUrl)
  ndefRecord = ndef.uriRecord(newUrl); // support more types.. TODO
  showWriteTag();
}
*/

// listeners
$("body").on('click', "#createNew", function () {
  window.location = "createAction.html";
});
$("body").on('click', "#scan", function () {
  window.location = "scanQR.html";
});
$("body").on('click', "#read", function () {
  window.location = "readAction.html";
});
$("body").on('click', ".action > .actionContents > .ringActions > .ringAction", function () {
  action = $(this).data("action");
  window.location = "addParameterToAction.html?action="+action;
});
$("body").on('click', "#finish", function () {
  console.log("um")
  debug("Restarting");
  window.location = "index.html";
});
$("body").on('click', "#exit", function () {
  // close window / running application
  console.log("Exiting app");
  navigator.app.exitApp(); 
})

// We have the tag in a global object
function ring(nfcEvent) { // On NFC Activity..
  console.log("Ring found, yay!")
  var action = gup("action");
  var option = gup("option");
  option = unescape(option);
  if(action == "website" && option == "sweetSpot"){ // are we measuring the sweet spot?
    runCoOrds();
  }
  
  else if (action != "") { // do we have an action to write or not?
	// write
    // from https://github.com/don/phonegap-nfc-writer/blob/master/assets/www/main.js
    var newUrl = actions[action].format(option);
    console.log("New URL", newUrl)
    var ndefRecord = ndef.uriRecord(newUrl); // support more types.. TODO

    nfc.write([ndefRecord], function () {
      navigator.notification.vibrate(100);
      console.log("Written", ndefRecord);
      alert("Woohoo!  Your ring is ready.");
    }, function (reason) {
      console.log("Inlay write failed")
    });
	
  }else{
    // read
	console.log("Reading")
	console.log(nfcEvent);
	var ring = nfcEvent.tag;
	console.log(ring);
	ringData = nfc.bytesToString(ring.ndefMessage[0].payload); // TODO make this less fragile 
	if(ringData.indexOf("sweetspot.nfcring.com") !== -1){
	  alert("redirecting to sweet spot page");
	  window.location = "sweetSpot.html?action=website&option=sweetSpot" // We use this to execute the Sweet Spot test runner.
	}else{
	  alert(ringData);
	}
  }
}

function runCoOrds(){
  // Oh my, this is a test of the sweet spot..   Isn't this exciting!
  // Basically when we get a successful read we need to GET data from the arduino
 
  $.ajax({
    url: "http://192.168.1.177",
    success: function(coOrds){
	  console.log(coOrds);
      // coOrds = $.parseJSON(coOrds);
      data = {
        "coOrds": coOrds,
        "deviceUuid": device.uuid,
	    "deviceModel": device.model
      };
	  x = coOrds.x / 10000; // Note this is prolly unhealthy
	  y = coOrds.y / 10000; // Note this is prolly unhealthy
	  console.log(x,y);
      $('.actionContents').append("<li>X: " +x +" ,Y: "+y +"</li>");
	
      console.log("got ", data);
	  
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

	},
  	error: function(xhr, ajaxOts, e){
      console.log(xhr, ajaxOts, e);
    }
  });
}

function scanQR() {
  var scanner = cordova.require("cordova/plugin/BarcodeScanner");
  scanner.scan(function(resp) {
	// qr code discovered, need to decode, set action and option
	var bc = resp.text;
	bc = JSON.parse(bc);
	action = bc.action;
	option = bc.option;
	if (action == "website" && option == "sweetSpot"){
	  alert("WIFI needs to be on and be able to access Arduino also make sure screen or device wont turn off during test");
	  window.location = "sweetSpot.html?action=website&option=sweetSpot" // We use this to execute the Sweet Spot test runner.
	}
	else if (action && option){
      window.location = "writeAction.html?action="+action+"&option="+option;
	}else{
	  window.location = "writeAction.html?action="+action;
	}
  }, function() { 
	alert('uh oh error - please let us know!'); 
  });
}

function gup( name ){
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
  var regexS = "[\\?&]"+name+"=([^&#]*)";  
  var regex = new RegExp( regexS );  
  var results = regex.exec( window.location.href ); 
  if( results == null ){
    return "";
  }
  else{
    return results[1];
  }
}

function gotFS(fileSystem) {
  fileSystem.root.getFile("sweetSpot.txt", {create: true, exclusive: false}, gotFileEntry, fail);
}

function gotFileEntry(fileEntry) {
  fileEntry.createWriter(gotFileWriter, fail);
}

function gotFileWriter(writer) {
  writer.onwriteend = function(evt) {
    console.log("wrote x n y");
  };
  writer.seek(writer.length);
  writer.write(device.uuid + "," + device.model + "," + x + "," + y);
}

function fail(error) {
  console.log(error.code);
}

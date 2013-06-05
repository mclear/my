var isApp = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
var step = 0; // token nasty globals -- this isn't used
var action = ""; // one for the money
var option = ""; // two for the show..
var platform = ""; // three for the heavy now go go go -- we dont use this
var ndefRecord = {}; // last one

var actions = {
  twitter: {
    label: "Twitter",
    optionText: "What is your Twitter Username?",
    placeHolder: "@johnmclear",
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

    nfc.addTagDiscoveredListener(function () {
      writeTag(); // TODO uncomment me
      console.log("Attempting to bind to NFC");
    }, function () {
      console.log("Success.  Listening for tags..");
    }, function () {
      console.log("Fail.");
    });
    addActions();
    ndefRecord = ndef.uriRecord("http://nfcring.com"); // placeholder..
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
  $('#action').hide();
  showCompleted("action");
  step = 1;
  debug(actions[action]);
  if (actions[action].requiresString !== false) { // If the item requires further input
    showOption(action);
  } else {
    showInstallApp(); // Action does not require further user input
  }
}

function showOption(action) {
  step = 2; // we're in the show option page
  debug("Action " + action + " requires further information so showing options form");
  $('#option').show();
  var actionName = actions[action].label;
  $('.option > .actionName').hide();
  $('.option > .actionContents > form > input').attr("placeholder", actions[action].placeHolder);
  $('.option > .actionContents > form > label').text(actions[action].optionText);
  $('#optionInput').focus();
}

function showCompleted(step) {
  debug("showing " + step + " as completed");
}

function prepareTag(action, option) {
  debug("Preparing Tag..");
  debug(action);
  debug(option);
  var newUrl = actions[action].format(option);
  console.log("New URL", newUrl)
  ndefRecord = ndef.uriRecord(newUrl); // support more types.. TODO
  showWriteTag();
}

function showWriteTag() { // shows the UI to write the data to the ring
  $('#option').hide();
  $('#writeRing').show();
}

// listeners
$("body").on('click', "#createNew", function () {
  step = 0;
  showCompleted("landing");
  $('#landing').hide();
  $('#action').show();
});
$("body").on('click', ".action > .actionContents > .ringActions > .ringAction", function () {
  action = $(this).data("action");
  selectAction(action);
});
$('#option > .actionContents > form').submit(function () {
  option = $('#optionInput').val();
  debug("Option form submitted");
  showCompleted("option");
  debug("is it a mobile app?");
  debug(isApp);
  if (isApp) { // if its the app already just write the damn tag..
    debug("Writing the tag with action / options:");
    debug(action);
    debug(option);
    prepareTag(action, option);
  }
  return false;
});

$("body").on('click', "#finish", function () {
  debug("Restarting");
  document.location.reload(true);
});
$("body").on('click', "#scan", function () {
  // Show overlay with loading..
  showCompleted("landing");
  scan(); // This can take some time to execute...
})

// We have the tag in a global object

function writeTag() {
  if (action != "") {
    // from https://github.com/don/phonegap-nfc-writer/blob/master/assets/www/main.js
    nfc.write(
      [ndefRecord], function () {
        navigator.notification.vibrate(100);
        console.log("Written", ndefRecord);
        alert("Well done!  Your ring is ready.");
      }, function (reason) {
        console.log("Inlay wriet failed")
      });
  }
}
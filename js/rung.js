/* Looking at the source?  We're going to be hiring so why not get in touch? */

/* 
 == Still to do
 Action spec for other actions
 Find a way to monitor popularity
 Make "Back" button work
 Find out how blackberry/wm works
 Link to actual Rung app in stores
*/

var step = 0; // token nasty globals
var action = ""; // one for the money
var option = ""; // two for the show..

var actions = {
  twitter: {
    label: "Twitter",
	optionText: "What is your Twitter Username?",
	placeHolder: "Your Twitter Username... IE JohnMcLear"
  },
  facebook: {
    label: "Facebook",
	optionText: "What is your Facebook Page URL?",
	placeHolder: "http://facebook.com/whatever"
  },
  clone: {
    label: "Clone Rung",
    isClone: true,
	requiresString: false
  },
  website: {
    label: "Website",
	optionText: "What is the URL of the website?",
	placeHolder: "http://mclear.co.uk"
  }
};

$(document).ready(function(){
  setTimeout(function() {  // ghetto but required to scroll browser back to top on new load
    window.scrollTo(0, 1) }, 
  100);
  
  addActions();
  $("body").on('click', ".action > .actionContents > .rungActions > .rungAction", function(){
    action = $(this).data("action");
    selectAction(action);
  });
  $('.option > .actionContents > form').submit(function(){
    debug("Option form submitted");
    showCompleted("option");
    showInstallApp();	
    return false;
  });
  $("body").on('click', ".platforms > .paddedIcon", function(){
    var platform = $(this).data("platform");
	debug("Platform is "+platform);
	showCompleted("platform");
	$("#"+platform+"Info").show();
	showInstalledApp();
	step = 3; // Platform is selected
  });
  $("body").on('click', "#continue", function(){
    debug("App is installed, need to show the generated QR Code");
    step = 4; // app is installed, just need to show QR code now
    showCompleted("platformInstall");
	showQR();
  });
  $("body").on('click', ".finish", function(){
    document.location.reload(true);
  })
});

function addActions(){
  // go through each item in actions and render to UI
  $.each(actions, function(key, action) {
    debug(action);
	if(!action.image){ action.image = key.toLowerCase() + ".png"; };
    $(".action > .actionContents > .rungActions").append("<a data-action="+key+" class=\"rungAction paddedIcon\"><img src=\"img/"+action.image+"\">"+action.label+"</a>");
  });
}

function selectAction(action){
  debug("Action "+action +" selected");
  showCompleted("action");
  step = 1;
  if(!actions[action].requiresString){ // If the item requires further input
     showOption(action);
  }
}

function showOption(action){
  step = 2; // we're in the show option page
  debug("Action "+action+" requires further information so showing options form");
  $('.option').show();
  $('.option > .overlay').hide();
  $('.option > .actionName').text(action);
  $('.option > .actionContents > form > input').attr("placeholder", actions[action].placeHolder);
  $('.option > .actionContents > form > label').text(actions[action].optionText);
  $('html, body').animate({
	scrollTop: $('.option').offset().top
  }, 500);
  $('#optionInput').focus();
}

function showInstalledApp(){
  generateQR();
  debug("showing installed app");
  $('.platformInstall').show();
  $('html, body').animate({
	scrollTop: $('.platformInstall').offset().top
  }, 500);
}

function showInstallApp(){
  // get the action and option from the dom
  var action = $('.option > .actionName').text();
  var option = $('.option > .actionContents > form > input').val();
  debug("Action frmo the form is "+action);
  debug("option from the form is "+option);
  $('.platform').show();
  $('html, body').animate({
	scrollTop: $('.platform').offset().top
  }, 500);
}

function showCompleted(step){
  debug("showing "+step+" as completed");
  $('.'+step + ' > .overlay').show();
}

function generateQR(){ // Create a QR from an API and write it to dom
  var qrInfo = {
     "action": action,
	 "option": option
  }
  debug("Making qrCode Image for "+JSON.stringify(qrInfo));
  $('#qrCode').qrcode(JSON.stringify(qrInfo));

}


function showQR(){
  step = 5;
  $('.showQr').show();  
  debug("scrolling to showQr");
  $('html, body').animate({
	scrollTop: $('.showQr').offset().top
  }, 500);
}

function debug(msg){
  if(console && msg){
     console.log(msg);
  }
}


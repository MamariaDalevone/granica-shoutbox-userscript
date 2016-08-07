// ==UserScript==
// @name        granica - kolory nicków
// @namespace   lokalizacja
// @description skrypt pomagający pisać na granicy
// @include     http://granica-pbf.pl/mchat.php*
// @include     http://granica-pbf.pl/
// @version     1
// @grant       none
// ==/UserScript==

// ZNAK PRZED WYRÓŻNIENIEM NICKU W POLU WIADOMOŚCI
var nickDifferentiator = "@";

// ZNAK POJAWIAJĄCY SIĘ PO WIADOMOŚCI
var endingChar = ":";

// WYRÓŻNIENIE OSTATNIEGO SHOUTA
var lastShoutDifferentiator = "@@";


function setCookie(cookieName, cookieValue, expirationDays) {
  var date = new Date();
  date.setTime(date.getTime() + (expirationDays*24*60*60*1000));
  var expiresIn = "expires="+ date.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + "; " + expiresIn;
}


function getUsernames() {
  var nodes = document.getElementsByClassName("mChatScriptLink");

  var nickregexp = /\]\w+\[/;
  var colorregexp = /\#\w+/;

  var nodesCount = nodes.length;

  for (var i = 0; i < nodesCount; ++i) {
    var nickAdded = false;

    var nick = nickregexp.exec(nodes[i].getAttribute("onclick"));
    nick = nick[0].substring(1, (nick[0].length - 1));

    var usersCount = users.length;
    var iterator = 0;

    do {
      if (users[iterator].toLowerCase() == nick.toLowerCase()) {
        nickAdded = true;
        usersCount = iterator;
      } else {
        ++iterator;
      }
    } while (iterator < usersCount)

    if (!isUserAdded(nick)) {
      addUser(nick);

      var color = colorregexp.exec(nodes[i].getAttribute("onclick"));

      if (color === null) {
        addColor("none");
      } else {
      color = color[0].substring(1);

      colors[colors.length] = color;
      }
    } else {
      var color = colorregexp.exec(nodes[i].getAttribute("onclick"));

      if (color === null) {
        color = "none";

        verifyColor(iterator, color);
      } else {
        color = color[0].substring(1);

        verifyColor(iterator, color);
      }
    }
  }
}


function isUserAdded(nick) {
  var usersCount = users.length;

  for (var i = 0; i < usersCount; ++i) {
    if (nick == users[i]) {
      return true;
    }
  }

  return false;
}


function addUser(nick) {
  users[users.length] = nick;
}


function addColor(color) {
  colors[colors.length] = color;
}

function verifyColor(arrayPosition, color) {
  if (colors[arrayPosition] != color) {
    colors[arrayPosition] = color;
  }
}


function parseMessage() {
  var messageNode = document.getElementById("mChatMessage");

  var regexp = [new RegExp(nickDifferentiator+"\\w+"), new RegExp("\\w+"+nickDifferentiator)];
  var lastShoutRegexp = new RegExp(lastShoutDifferentiator + "\\d*\\s");

  var regexpLength = regexp.length;

  if (lastShoutRegexp.test(messageNode.value) == true) {
    var number = lastShoutRegexp.exec(messageNode.value);
    if (number[0].length == 3)
      number = document.getElementsByClassName("mChatScriptLink").length - 1;
    else {
      number = document.getElementsByClassName("mChatScriptLink").length - /\d/.exec(number[0])[0];
    }
    var onClickAction = document.getElementsByClassName("mChatScriptLink")[number].getAttribute("onclick");
    onClickAction = /\'.*\'/.exec(onClickAction);
    onClickAction = onClickAction[0].substring(3, onClickAction[0].length - 3);
    messageNode.value = messageNode.value.replace(lastShoutRegexp, onClickAction + endingChar + " ");
  }

  for (var i = 0; i < regexpLength; ++i) {
    if (regexp[i].test(messageNode.value) == true) {
      var nick = regexp[i].exec(messageNode.value);
      if (i == 0)
        nick = nick[0].substring(1);
      else if (i == 1)
        nick = nick[0].substring(0, nick[0].length - 1);

      usersCount = users.length;

      for (var j = 0; j < usersCount; ++j) {
        if (nick.toLowerCase() == users[j].toLowerCase()) {
          replace(messageNode, regexp[i], j)
        }
      }
    }
  }
}


function replace(node, regexp, iterator) {
  node.value = node.value.replace(regexp, colors[iterator] == "none" ? "[b]" + users[iterator] + "[/b]" + endingChar : "[b][color=#" + colors[iterator] + "]" + users[iterator] + "[/color][/b]" + endingChar);
}


function parseCookie(cookie) {
  if(cookie[6] == "U") {
    cookie = cookie.substring(12);

    var containsNicks = true;

    do {
      nick = /[A-Z0-9]+/i.exec(cookie);
      if (nick !== null) {
        nick = nick[0];
        cookie = cookie.substring(nick.length+1);

        addUser(nick);
      } else
        containsNicks = false;
    } while (containsNicks);
  } else {
    cookie = cookie.substring(13);

    var containsColors = true;

    do {
      color = /\w+/.exec(cookie);
      if (color !== null) {
        color = color[0];
        cookie = cookie.substring(color.length+1);

        addColor(color);
      } else
        containsColors = false;
    } while (containsColors);
  }
}


var users = [];
var colors = [];

if (document.cookie !== "") {
  if (/ScriptColors\=[A-Z0-9\,]+/i.test(document.cookie) !== false)
    parseCookie(/ScriptUsers\=[A-Z0-9\,]+/i.exec(document.cookie)[0]);
  if (/ScriptColors\=[A-Z0-9\,]+/i.test(document.cookie) !== false)
    parseCookie(/ScriptColors\=[A-Z0-9\,]+/i.exec(document.cookie)[0]);
}
getUsernames();
setInterval(function(){ getUsernames(); setCookie("ScriptUsers", users, 1000); setCookie("ScriptColors", colors, 1000); }, 5000);

{
  var input = document.getElementById("mChatMessage");
  input.onkeyup = function() { parseMessage(); };
}

setCookie("ScriptUsers", users, 1000);
setCookie("ScriptColors", colors, 1000);

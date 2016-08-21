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
// np: @Akkarin → [b][color=#00CCCC]Akkarin[/color][/b]
var nickDifferentiator = "@";

// ZNAK POJAWIAJĄCY SIĘ PO WIADOMOŚCI
// np: @Akkarin → [b][color=#00CCCC]Akkarin[/color][/b]:
var endingChar = ",";

// WYRÓŻNIENIE OSTATNIEGO SHOUTA
// np: @@2 → [b][color=#FFFF33]Lothia[/color][/b]:
var lastShoutDifferentiator = "@@";

// WYRÓŻNIENIE JAKIEJŚ OSOBY W SHOUCIE, ALE BEZ WOŁANIA
// np: !!2 → [b][color=#FFFF33]Lothia[/color][/b]
var userVocative = "!!";

// ZNAK DO WOŁANIA OBOK NICKU
// np: @3 Habentes - niedziela, 21 sie 2016, 13:01
var callUserSign = "#";


var nodesCount = 0;

function setCookie(cookieName, cookieValue, expirationDays) {
  var date = new Date();
  date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
  var expiresIn = "expires="+ date.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + "; " + expiresIn;
}

function appendNumbers() {
  var nodes = document.getElementsByClassName("mChatScriptLink");

  if (nodesCount < nodes.length) {
    nodesCount = nodes.length;

    for (var i = 0; i < nodesCount; ++i) {
      if (/\@/.test(nodes[nodesCount - 1 - i].innerHTML))
        nodes[nodesCount - 1 - i].innerHTML = nodes[nodesCount - i - 1].innerHTML.replace(/\@\d*/, callUserSign + (i + 1));
      else {
        var regexp = new RegExp(">" + callUserSign + "\\d*");
        nodes[nodesCount - 1 - i].innerHTML = nodes[nodesCount - i - 1].innerHTML.replace(regexp, ">" + callUserSign + (i + 1));
      }
    }

    getUsernames();
  }
}

function getUsernames() {
  var nodes = document.getElementsByClassName("mChatScriptLink");

  var nickregexp = /\]\w+\[/;
  var colorregexp = /\#\w+/;

  for (var i = 0; i < nodesCount; ++i) {

    var nick = nickregexp.exec(nodes[i].getAttribute("onclick"));
    nick = nick[0].substring(1, (nick[0].length - 1));

    if (usersLowerCase.indexOf(nick.toLowerCase()) == -1) {
      addUser(nick);

      var color = colorregexp.exec(nodes[i].getAttribute("onclick"));

      if (color === null) {
        addColor("none");
      } else {
        color = color[0].substring(1);

        addColor(color);
      }


      setCookie("ScriptUsers", users, 1000);
      setCookie("ScriptColors", colors, 1000);
    } else {
      var color = colorregexp.exec(nodes[i].getAttribute("onclick"));

      if (color === null)
        color = "none";
      else
        color = color[0].substring(1);

      if (!verifyColor(usersLowerCase.indexOf(nick.toLowerCase()), color))
        setCookie("ScriptColors", colors, 1000);
    }
  }
}


function addUser(nick) {
  users[users.length] = nick;
  usersLowerCase[usersLowerCase.length] = nick.toLowerCase();
}


function addColor(color) {
  colors[colors.length] = color;
}


function verifyColor(arrayPosition, color) {
  if (colors[arrayPosition] != color) {
    colors[arrayPosition] = color;

    return false;
  }

  return true;
}


function parseMessage() {
  var messageNode = document.getElementById("mChatMessage");

  //https://gfycat.com/SoggyUnfitAllensbigearedbat
  {
    var lastShoutRegexp = new RegExp(lastShoutDifferentiator + "\\d*\\s", "g");

    if (lastShoutRegexp.test(messageNode.value) === true) {
      var matches = messageNode.value.match(lastShoutRegexp);
      var matchesLength = matches.length;
      for (var i = 0; i < matchesLength; ++i) {
        var number;

        if (matches[i].length == 3)
          number = document.getElementsByClassName("mChatScriptLink").length - 1;
        else {
          number = document.getElementsByClassName("mChatScriptLink").length - /\d/.exec(matches);
        }

        var onClickAction = document.getElementsByClassName("mChatScriptLink")[number].getAttribute("onclick");
        onClickAction = /\'.*\'/.exec(onClickAction);
        onClickAction = onClickAction[0].substring(3, onClickAction[0].length - 3);

        messageNode.value = messageNode.value.replace(lastShoutRegexp, onClickAction + endingChar + " ");
      }
    }
  }

  //https://gfycat.com/RealGiganticFlickertailsquirrel
  {
    var vocativeRegexp = [new RegExp(userVocative + "\\d*\\s", "g"), new RegExp(userVocative + "\\w*\\s", "g")];

    var regexpLength = vocativeRegexp.length;

    for (var i = 0; i < regexpLength; ++i) {
      if (vocativeRegexp[i].test(messageNode.value) === true) {
        var matches = messageNode.value.match(vocativeRegexp[i]);
        var matchesLength = matches.length;

        for (var j = 0; j < matchesLength; ++j) {
          if (matches[j].length > 5) {
            // used pattern is !!nick

            var nick = matches[j].substring(2, 3).toUpperCase() + matches[j].substring(3, matches[j].length - 1);

            var indexOfNick = users.indexOf(nick);

            if (indexOfNick != -1) {
              messageNode.value = messageNode.value.replace(matches[j], colors[indexOfNick] == "none" ? "[b]" + users[indexOfNick] + "[/b] " : "[b][color=#" + colors[indexOfNick] + "]" + users[indexOfNick] + "[/color][/b] ");
            }
          } else {
            // used pattern is !!number

            var result;

            if (matches[j].length == 3)
              result = document.getElementsByClassName("mChatScriptLink").length - 1;
            else
              result = document.getElementsByClassName("mChatScriptLink").length - /\d+/.exec(matches[j]);

            var onClickAction = document.getElementsByClassName("mChatScriptLink")[result].getAttribute("onclick");
            onClickAction = /\'.*\'/.exec(onClickAction);
            onClickAction = onClickAction[0].substring(3, onClickAction[0].length - 3);

            messageNode.value = messageNode.value.replace(matches[j], onClickAction + " ");
          }
        }
      }
    }
  }

  //https://gfycat.com/IllfatedHairyJuliabutterfly
  {
    var regexp = [new RegExp(nickDifferentiator+"\\w+", "g"), new RegExp("\\w+"+nickDifferentiator, "g")];
    var regexpLength = regexp.length;

    for (var i = 0; i < regexpLength; ++i) {
      if (regexp[i].test(messageNode.value)) {
        var matches = messageNode.value.match(regexp[i]);
        var matchesLength = matches.length;

        for (var j = 0; j < matchesLength; ++j) {
          var nick;

          if (i == 0)
            nick = matches[j].substring(1);
          else if (i == 1)
            nick = matches[j].substring(0, nick[0].length - 1);

          var index = usersLowerCase.indexOf(nick.toLowerCase());

          if (index != -1) {
            messageNode.value = messageNode.value.replace(matches[j], colors[index] == "none" ? "[b]" + users[index] + "[/b]" + endingChar : "[b][color=#" + colors[index] + "]" + users[index] + "[/color][/b]" + endingChar);
          }
        }
      }
    }
  }
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
var usersLowerCase = [];
var colors = [];

if (document.cookie !== "") {
  if (/ScriptColors\=[A-Z0-9\,]+/i.test(document.cookie) !== false)
    parseCookie(/ScriptUsers\=[A-Z0-9\,]+/i.exec(document.cookie)[0]);
  if (/ScriptColors\=[A-Z0-9\,]+/i.test(document.cookie) !== false)
    parseCookie(/ScriptColors\=[A-Z0-9\,]+/i.exec(document.cookie)[0]);
}
appendNumbers();
setInterval(function(){ appendNumbers(); }, 100);

{
  var usersLength = users.length;

  for (var i = 0; i < usersLength; ++i)
    usersLowerCase[i] = users[i].toLowerCase();
}

{
  var input = document.getElementById("mChatMessage");
  input.onkeyup = function() { parseMessage(); };
}

setCookie("ScriptUsers", users, 1000);
setCookie("ScriptColors", colors, 1000);

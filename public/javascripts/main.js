var globalSocket;

var numEventRows = 0;//number of event forms is initially zero
var message_library;

$(document).ready(function () {
   //triggered when the button "+Another Event" is pressed
    $("#button_for_more_events").unbind("click").click(function () {
        numEventRows++;

        //entire row div
        var row2Div = document.createElement('div');
        row2Div.setAttribute('id', 'row_' + numEventRows);
        document.getElementById('table_2').appendChild(row2Div);

        //+- button for expanding
        var tmpExpand = document.createElement('input');
        tmpExpand.setAttribute('id', 'button_for_expand_event_' + numEventRows);
        tmpExpand.setAttribute('value', '-');
        tmpExpand.setAttribute('type', 'button');
        tmpExpand.setAttribute('onclick', 'expand_shrink_div(this)');
        document.getElementById('row_' + numEventRows).appendChild(tmpExpand);

        //"Event name:"
        var txt = document.createTextNode(numEventRows + ")Event name:");
        document.getElementById('row_' + numEventRows).appendChild(txt);

        //Event Selector
        var tmpEventSelector = document.createElement('select');
        tmpEventSelector.setAttribute('id', 'event_selector_' + numEventRows);
        for (var index in message_library.getEvents) {
            tmpEventSelector.options[tmpEventSelector.options.length] = new Option(message_library.getEvents[index], index);
        }
        tmpEventSelector.setAttribute('onchange', 'pickEventFromList(this)');
        document.getElementById('row_' + numEventRows).appendChild(tmpEventSelector);

        //Send button
        var tmpSendJson = document.createElement('input');
        tmpSendJson.setAttribute('id', 'sendJSON_' + numEventRows);
        tmpSendJson.setAttribute('value', 'Send');
        tmpSendJson.setAttribute('type', 'button');
        tmpSendJson.setAttribute('onclick', 'sendJsonPressed(this);');
        document.getElementById('row_' + numEventRows).appendChild(tmpSendJson);

        //Json_track -where the json text is displayed
        var tmpJsonTrack = document.createElement('div');
        tmpJsonTrack.setAttribute('id', 'json_track_' + numEventRows);
        tmpJsonTrack.setAttribute('contenteditable', 'true');
        tmpJsonTrack.setAttribute('style', 'auto');
        tmpJsonTrack.setAttribute('width', '400px');
        document.getElementById('row_' + numEventRows).appendChild(tmpJsonTrack);
    });

    //connect to correct socket
    var socket = io.connect(window.location.protocol + "//" + window.location.host);
    globalSocket = socket;
    bindEvent(socket);
});

/*
 *	binds socket events to button clicks
 *	@param socket - socket object which connects to the server
 */
function bindEvent(socket) {
    socket.on('connected', function () {
        console.log('\n\n**connected');
    });
    //get list_events from the library (on load)
    socket.emit("requesting_list_events");
    socket.on("providing_list_events", function (data) {
        message_library = data;
    });
}
//triggered when a user presses "Send" on any of the event forms
function sendJsonPressed(element) {
    var list = element.parentNode.childNodes
    for (var i = 0; i < list.length; i++) {
        if (typeof list[i].id !== "undefined" && list[i].id.substring(0, 15) == 'event_selector_') {
           var selector = list[i];
        }
    }

    var selectedEvent = selector.options[selector.value].innerHTML;
    var socket = io.connect(window.location.protocol + "//" + window.location.host);
    globalSocket = socket;

    //we extract the number of the section: "event_selector_11" would yield "11"
    var text = document.getElementById("json_track_" + selector.id.substring(15, selector.id.length));

    var json_text = text.textContent.replace(/\s/g, ''); //strip off the empty spaces in the json string from the div

    if (isPresentIn(selectedEvent))
    {
        if(selectedEvent == "anton_custom") //I want this json published without validations, checks, conversion, etc
        {
            console.log("anton_custom event. json=" + json_text);
            var channel = document.getElementById("common_channel").value;
            if (channel == ""){
                alert("Please specify a channel!");
            }
            else
            socket.emit("anton_custom", channel, json_text);
        }
        else
        {
            socket.emit("provideJavascriptObject", json_text, selectedEvent, function (jObject) {
                socket.emit("sendEventManual", jObject);
            });
        }
    }
}
// formatJson() :: formats and indents JSON string FROM http://ketanjetty.com/coldfusion/javascript/format-json/
function formatJson(val) {
    var retval = '';
    var str = val;
    var pos = 0;
    var strLen = str.length;
    var indentStr = '&nbsp;&nbsp;&nbsp;&nbsp;';
    var newLine = '<br />';
    var char = '';

    for (var i = 0; i < strLen; i++) {
        char = str.substring(i, i + 1);

        if (char == '}' || char == ']') {
            retval = retval + newLine;
            pos = pos - 1;

            for (var j = 0; j < pos; j++) {
                retval = retval + indentStr;
            }
        }

        retval = retval + char;

        if (char == '{' || char == '[' || char == ',') {
            retval = retval + newLine;

            if (char == '{' || char == '[') {
                pos = pos + 1;
            }

            for (var k = 0; k < pos; k++) {
                retval = retval + indentStr;
            }
        }
    }

    return retval;
}
//triggered when a user selects what kind of event to be added/displayed
function pickEventFromList(element) {
    //we extract the number of the section: "event_selector_11" would yield "11"
    var currentSectionNum = element.id.substring(15, element.id.length);
    var list = element.parentNode.childNodes
    for (var i = 0; i < list.length; i++) {
        if (typeof list[i].id !== "undefined" && list[i].id.substring(0, 15) == 'event_selector_') {
           var selector = list[i];
        }
    }
    var selectedEvent = selector.options[selector.value].innerHTML;

    var socket = io.connect(window.location.protocol + "//" + window.location.host);
    globalSocket = socket;

    if(isPresentIn(selectedEvent)) {
        var jObject = {};
        if (selectedEvent != "anton_custom")
            jObject = window[selectedEvent + "_sample"]();

        //fetch data from Meeting Info
        if (document.getElementById("common_meeting_id").value != "")
            jObject.meetingId = document.getElementById("common_meeting_id").value;
        if (document.getElementById("common_session").value != "")
            jObject.sessionId = document.getElementById("common_session").value;
        if (document.getElementById("common_meeting_name").value != "")
            jObject.meetingName = document.getElementById("common_meeting_name").value;
        if (document.getElementById("common_channel").value != ""){
            //TODO (implemented only for event "anton_custom")
            // the problem for is that in different messages the name of the field "channel"
            // varies: channel/channels/channelsDestination
            //therefore some more work has to be done if we want the message with this field
            //populated to be able to successfully be validated in the message library

            //jObject.channel = document.getElementById("common_channel").value;
        }
        if (selectedEvent != "anton_custom")
            socket.emit("populateField", jObject, selectedEvent, function (json) {
                document.getElementById("json_track_" + currentSectionNum).innerHTML = formatJson(json);
            });
    }
    else
        alert("could not identify what event you want to send");
}
//triggered when the user selects "Clear fields" under the Meeting Info section
function clearMeetingInfo() {
    document.getElementById("common_meeting_name").value = "";
    document.getElementById("common_meeting_id").value = "";
    document.getElementById("common_session").value = "";
    document.getElementById("common_channel").value = "";
}
//triggered when the user presses -/+ in the beginning of a Send Event JSON row
function expand_shrink_div(element) {
    str = element.id.substring(24, element.id.length);
    var btn = element.value;

    var tmp;
    var list = element.parentNode.childNodes;
    for (var i = 0; i < list.length; i++) {
        if (typeof list[i].id !== "undefined" && list[i].id.substring(0, 11) == 'json_track_') {
            tmp = list[i];
        }
    }

    if (btn == "+") {
        element.value = "-";
        tmp.style.display = "block";
    } else if (btn == "-") {
        element.value = "+";
        tmp.style.display = "none";
    }
}
//helper function for checking whether the eventType is one of the defined types in message_library
function isPresentIn(str){
    for(index in message_library.getEvents)
        if (str == message_library.getEvents[index])
            return true;
    return false;
}

//Sample events
function page_changed_event_sample () {

    var params = {};
    params.meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1389108951916";
    params.sessionId = "someSessionId";
    params.channels = "apps_channel";
    params.source = "bbb-apps";
    params.meetingName = "someMeetingName";
    params.presentationId = "pres-123";
    params.presentationName = "Flight School";
    params.byId = "someById";
    params.byName = "someByName";

    params.pageId = "pres-123/2";
    params.pageNum = 2;

    params.svg="slide2.svg";
    params.png="http://2.bp.blogspot.com/-qxAQotPF-4o/UBYIytHxg4I/AAAAAAAAAg0/tff-gmsbTjs/s1600/2+(3).png";
    params.swf="slide2.swf";

    return params;
}
function share_presentation_event_sample () {

    var params = {};
    params.meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1389108951916";
    params.sessionId = "someSessionId";
    params.channels = "apps_channel";
    params.source = "bbb-apps";
    params.meetingName = "someMeetingName";
    params.presentationId = "pres-123";
    params.presentationName = "Flight School";
    params.byId = "someById";
    params.byName = "someByName";

    params.pages = [];
    var a ={};
    a.png = "http://cdn.m5hosting.com/images/linux.png";
    a.svg = "slide1.svg";
    a.swf = "slide1.swf";

    var b = {};
    b.png = "http://2.bp.blogspot.com/-qxAQotPF-4o/UBYIytHxg4I/AAAAAAAAAg0/tff-gmsbTjs/s1600/2+(3).png";
    b.svg = "slide1.svg";
    b.swf = "slide1.swf";

    params.pages[0] = a;
    params.pages[1] = b;

    return params;
}
function whiteboard_draw_event_sample () {
    var params = {};
    params.meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1389108951916";
    params.sessionId = "someSessionId";
    params.channels = "apps_channel";
    params.source = "bbb-apps";
    params.meetingName = "someMeetingName";
    params.whiteboardId = "presentation_id/page_num";
    params.shapeId = "q779ogycfmxk-13-1383262166102";
    params.shapeType = "line";
    params.firstX = 0.016025641025641028;
    params.firstY = 0.982905982905983;
    params.lastX = 0.33;
    params.lastY = 0.45;
    params.lineColor = 0;
    params.lineWeight = 18;
    params.lineType = "solid"; //TODO choose between "solid", ...
    params.byId = "user1";
    params.byName = "Guga";
    params.background_visible = true;
    params.background_color = 0;
    params.background_alpha = 1;
    params.square = false;

    return params;
}
function whiteboard_update_event_sample () {
    var params = {};
    params.meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1389108951916";
    params.sessionId = "someSessionId";
    params.channels = "apps_channel";
    params.source = "bbb-apps";
    params.meetingName = "someMeetingName";
    params.whiteboardId = "presentation_id/page_num";
    params.shapeId = "q779ogycfmxk-13-1383262166102";
    params.shapeType = "line";
    params.firstX = 0.016025641025641028;
    params.firstY = 0.982905982905983;
    params.lastX = 0.33;
    params.lastY = 0.45;
    params.lineColor = 0;
    params.lineWeight = 18;
    params.lineType = "solid"; //TODO choose between "solid", ...
    params.byId = "user1";
    params.byName = "Guga";
    params.background_visible = true;
    params.background_color = 0;
    params.background_alpha = 1;
    params.square = false;

    return params;
}
function user_joined_event_sample() {

    var a, b, c, params;
    params = {};
    params.channelsDestination = "apps_channel";
    params.meetingName = "someMeetingName";
    params.meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1389108951916";
    params.sessionId = "someSessionId";
    params.source = "bbb-web";
    params.userId = "juanid";
    params.userExternalId = "userjuan";
    params.userName = "Juan Tamad";
    params.role = "MODERATOR";
    params.pin = 12345;
    params.welcome = "Welcome to English 101";
    params.logoutUrl = "http://www.example.com";
    params.avatarUrl = "http://www.example.com/avatar.png";
    params.isPresenter = true;
    params.handRaised = false;
    params.muted = false;
    params.locked = false;
    params.talking = false;
    params.callerName = "Juan Tamad";
    params.callerNumber = "011-63-917-555-1234";
    params.mediaStreams = [];
    a = {};
    a.media_type = "audio";
    a.uri = "http://cdn.bigbluebutton.org/stream/a1234";
    a.metadata = {};
    a.metadata.foo = "bar";
    b = {};
    b.media_type = "video";
    b.uri = "http://cdn.bigbluebutton.org/stream/v1234";
    b.metadata = {};
    b.metadata.foo = "bar";
    c = {};
    c.media_type = "screen";
    c.uri = "http://cdn.bigbluebutton.org/stream/s1234";
    c.metadata = {};
    c.metadata.foo = "bar";
    params.mediaStreams[0] = a;
    params.mediaStreams[1] = b;
    params.mediaStreams[2] = c;
    params.studentId = "54321";
    params.program = "engineering";
    return params;
}
function user_left_event_sample() {
    var params = {};
    params.channelsDestination = "apps_channel";
    params.meetingName = "someMeetingName";
    params.meetingId = "someMeetingId";
    params.sessionId = "english_101-12345";
    params.source = "web-api";
    params.userId = "juanid";
    params.userName = "Juan Tamad";

    return params;
}

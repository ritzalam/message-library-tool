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
    /*var selector;*/
    var list = element.parentNode.childNodes
    for (var i = 0; i < list.length; i++) {
        if (typeof list[i].id !== "undefined" && list[i].id.substring(0, 15) == 'event_selector_') {
           var selector = list[i];
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
function pageChangedEvent () {

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
function sharePresentationEvent () {

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
function whiteboardDraw () {
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
function whiteboardUpdate () {
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

//triggered when a user selects what kind of event to be added/displayed
function pickEventFromList(element) { //can shrink this by A LOT later on
    //fetch data from Meeting Info
    /*var meetingName = document.getElementById("common_meeting_name").value;
    var meetingID = document.getElementById("common_meeting_id").value;
    var sessionID = document.getElementById("common_session").value;

    //we extract the number of the section: "event_selector_11" would yield "11"
    var currentSectionNum = element.id.substring(15, element.id.length);*/
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
    var currentSectionNum = element.id.substring(15, element.id.length);

    alert("cur = " + currentSectionNum);


    if (selectedEvent == message_library.WHITEBOARD_DRAW_EVENT)
    {
        jObject = whiteboardDraw();
        socket.emit("populateField", jObject, message_library.WHITEBOARD_DRAW_EVENT, function (json) {
            document.getElementById("json_track_" + currentSectionNum).innerHTML = formatJson(json);
        });
    }
        
    else if (selectedEvent == message_library.WHITEBOARD_UPDATE_EVENT)
    {
        //socket.emit("sendEventUpdate", whiteboardUpdate());
        jObject = whiteboardUpdate();
        socket.emit("populateField", jObject, message_library.WHITEBOARD_UPDATE_EVENT, function (json) {
            document.getElementById("json_track_" + currentSectionNum).innerHTML = formatJson(json);
        });
    }
    else if (selectedEvent == message_library.SHARE_PRESENTATION_EVENT)
    {
        //socket.emit("sharePresentationEvent", sharePresentationEvent());
        jObject = sharePresentationEvent();
        socket.emit("populateField", jObject, message_library.SHARE_PRESENTATION_EVENT, function (json) {
            document.getElementById("json_track_" + currentSectionNum).innerHTML = formatJson(json);
        });
    }
    else if (selectedEvent == message_library.PAGE_CHANGED_EVENT)
    {
        //socket.emit("pageChangedEvent", pageChangedEvent());
        jObject = pageChangedEvent();
        socket.emit("populateField", jObject, message_library.PAGE_CHANGED_EVENT, function (json) {
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

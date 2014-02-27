message-library-tool
===================

This tool is to be used while building HTML5 client for BBB
together with bigbluebutton-messages module


## Usage

coffee coffeeApp.coffee //to start the application

At localhost:4000
* fill in the Meeting Info form
* use the button "+Another event" to add an event
* select the kind of event from the dropdown
* modify the json for the event and click "Send"

Note: space characters are omitted before transmitting the json
message. Strings containing \s will appear with merged:
"text":"This is a sample message" //#Thisisasamplemessage

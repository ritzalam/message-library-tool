require "coffee-script"
express = require("express")
path = require("path")
redis = require("redis")
http = require("http")
redisClient = undefined
PORT = 4000
message_library = require("bigbluebutton-messages/simple_message_library")

#setting up server to run
app = express()
server = http.createServer(app)
io = require("socket.io").listen(server)#setting up socket.io to listen for requests

# all environments
app.set "port", process.env.PORT or PORT
app.set "views", __dirname + "/public"
app.set "view engine", "jade"
app.use express.logger("dev")
app.use express.bodyParser()
app.use express.methodOverride()
app.use express.cookieParser("your secret here")
app.use express.session()
app.use app.router
app.use express.static(path.join(__dirname, "public"))

# development only
app.use express.errorHandler()  if "development" is app.get("env")

app.get "/", (req, res) ->
  res.render "index",
    title: "Value Injector"
  return

#listening on port 4000
server.listen PORT

#process socket events
io.sockets.on "connection", (socket) -># the actual socket callback
  bindEvents socket
  socket.emit "connected"
  console.log "socket connected"
  redisClient = redis.createClient()#once the socket is connected, connect to the redis client
  redisClient.on "connect", ->
    console.log "redis client connected"
    return
  return

#        binds socket events for which it will listen on
#        @param socket - the socket to transfer the events across
bindEvents = (socket) ->
  socket.on "sendJSON_anton", (text) ->
    #redisClient.publish "bigbluebutton:bridge", JSON.stringify(text)
    console.log "HELP, DEAD END!!!!!"
    return

  #fetch list to populate dropdown for eventName selection
  socket.on "requesting_list_events", ->
    socket.emit "providing_list_events", message_library
    return
  
  #now that we have the eventName, produce the json (from module). Note that Meeting Info is also plugged in
  #socket.on("requestJsonForThisEvent", function (eventName, meetingName, meetingID, sessionID) {
  #        var jsonForThisEvent = message_library.returnJsonOf(eventName, meetingName, meetingID, sessionID)
  #        socket.emit("providingJsonForThisEvent", jsonForThisEvent)
  #    })
  socket.on "sendEventDraw", (params) ->
    message_library.whiteboard_draw_event_to_json(params, (json)->
      console.log "this is onSuccess whiteboardDrawEventToJson"
      redisClient.publish "bigbluebutton:bridge", json
      return
    , ->
      console.log "this is onFailure whiteboardDrawEventToJson"
      return
    )

  socket.on "sendEventUpdate", (params) ->   
    message_library.whiteboard_update_event_to_json(params, (json)->
      console.log "this is onSuccess whiteboardUpdateEventToJson"
      redisClient.publish "bigbluebutton:bridge", json
      return
    , ->
      console.log "this is onFailure whiteboardUpdateEventToJson"
      return
    )
  
  socket.on "sharePresentationEvent", (params) ->   
    message_library.share_presentation_event_to_json(params, (json)->
      console.log "this is onSuccess sharePresentationEvent"
      redisClient.publish "bigbluebutton:bridge", json
      return
    , ->
      console.log "this is onFailure sharePresentationEvent"
      return
    )

#
#  sendJSON - sends whatever JSON the client input across redis into the html5 client node server
#  @param formInfoObj - object the event object that contains the information entered in the form
# 
###sendJSON = (formInfoObj) ->
  #send it to redis
  redisClient.publish "bigbluebutton:bridge", JSON.stringify(formInfoObj)
  return
###
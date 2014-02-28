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

#        binds socket events for which it will listen on
#        @param socket - the socket to transfer the events across
bindEvents = (socket) ->
  #fetch list to populate dropdown for eventName selection
  socket.on "requesting_list_events", ->
    socket.emit "providing_list_events", message_library
  
  socket.on "sendEventDraw", (params) ->
    helperDispatcher params, message_library.WHITEBOARD_DRAW_EVENT

  socket.on "sendEventUpdate", (params) ->   
    helperDispatcher params, message_library.WHITEBOARD_UPDATE_EVENT
  
  socket.on "sharePresentationEvent", (params) ->   
    helperDispatcher params, message_library.SHARE_PRESENTATION_EVENT

  socket.on "pageChangedEvent", (params) ->   
    helperDispatcher params, message_library.PAGE_CHANGED_EVENT

helperDispatcher = (params, eventName) ->
    message_library["#{eventName}_to_json"](params, (json)->
      console.log "this is onSuccess #{eventName}"
      redisClient.publish "bigbluebutton:bridge", json
    , ->
      console.log "this is onFailure #{eventName}"
    )
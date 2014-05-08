require "coffee-script"
express = require "express"
http    = require "http"
path    = require "path"
redis   = require "redis"

message_library = require "bigbluebutton-messages/simple_message_library"

redisClient = undefined
PORT = 4000

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
    title: "Message Library Tool"

#listening on port 4000
server.listen PORT

#process socket events
io.sockets.on "connection", (socket) -># the actual socket callback
  bindEvents socket
  socket.emit "connected"
  console.log "socket connected"

  #once the socket is connected, connect to the redis client
  redisClient = redis.createClient()
  redisClient.on "connect", ->
    console.log "redis client connected"

#binds socket events for which it will listen on
#@param socket - the socket to transfer the events across
bindEvents = (socket) ->
  #fetch list to populate dropdown for eventName selection
  socket.on "requesting_list_events", ->
    socket.emit "providing_list_events", message_library

  socket.on "populateField", (params, eventName, onSuccess) ->
    message_library["#{eventName}_to_json"](params, ((json)->
      console.log "this is onSuccess #{eventName} (to json)"
      onSuccess (json)
    ), (e) ->
      console.log "this is onFailure populateField: #{eventName} (to json) + #{e}"
    )
  
  socket.on "sendEventManual", (params) ->
    params = JSON.parse params
    eventName = params.header.name
    message_library.validateEventJSON(params, eventName, (json)->
      console.log "this is onSuccess #{eventName} *(to json)"
      redisClient.publish "bigbluebutton:bridge", json
    , ->
      console.log "this is onFailure #{eventName} (to json)"
    )

  socket.on "provideJavascriptObject", (params, eventName, onSuccess) ->
    message_library.convertAndValidateJSON(params, eventName, ((jObject)->
      console.log "this is onSuccess #{eventName} (to object)"
      onSuccess (jObject)
    ), (err) ->
      console.log "this is onFailure provideJavaScriptObject:" + 
      " #{eventName} (to object); #{err}"
    )

  #TEMP
  socket.on "anton_custom", (channel, text) ->
    #channel = "bigbluebutton:meeting:anton"
    console.log "injecting in channel #{channel} #{text}"
    redisClient.publish "#{channel}", text

helperDispatcher = (params, eventName) ->
    message_library["#{eventName}_to_json"](params, (json)->
      console.log "this is onSuccess #{eventName} *(to json)"
      redisClient.publish "bigbluebutton:bridge", json
    , ->
      console.log "this is onFailure #{eventName} (to json)"
    )

var express = require('express');
var http = require('http');
var path = require('path');
var redis = require("redis");
var redisClient;
var PORT = 4000;
var message_library = require('message-library-bbb/message_library');

//setting up server to run
var app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server) //setting up socket.io to listen for requests
    ;

// all environments
app.set('port', process.env.PORT || PORT);
app.set('views', __dirname + '/public');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Value Injector'
    });
});

server.listen(PORT); //listening on port 4000

//process socket events
io.sockets.on('connection', function (socket) { // the actual socket callback
    bindEvents(socket);
    socket.emit('connected');
    console.log("socket connected");

    redisClient = redis.createClient(); //once the socket is connected, connect to the redis client
    redisClient.on('connect', function () {
        console.log("redis client connected");
    });
});
/*
 *       binds socket events for which it will listen on
 *       @param socket - the socket to transfer the events across
 */
function bindEvents(socket) {
    socket.on("sendJSON_anton", function (formInfoObj) {
        sendJSON(formInfoObj);
    });

    //fetch list to populate dropdown for eventName selection
    socket.on("requesting_list_events", function () {
        socket.emit("providing_list_events", message_library);
    });

    //now that we have the eventName, produce the json (from module). Note that Meeting Info is also plugged in
    socket.on("requestJsonForThisEvent", function (eventName, meetingName, meetingID, sessionID) {
        var jsonForThisEvent = message_library.returnJsonOf(eventName, meetingName, meetingID, sessionID);
        socket.emit("providingJsonForThisEvent", jsonForThisEvent);
    });
};

/*
 * sendJSON - sends whatever JSON the client input across redis into the html5 client node server
 * @param formInfoObj - object the event object that contains the information entered in the form
 */
function sendJSON(formInfoObj) {
    //send it to redis
    redisClient.publish("bigbluebutton:bridge", JSON.stringify(formInfoObj));
};

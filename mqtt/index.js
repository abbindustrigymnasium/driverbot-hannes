const express = require('express');
const http = require('http');
var mqtt = require('mqtt')

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    // The origins of which are allowed
    origin: "http://127.0.0.1:5500",
    methods: ['GET', 'POST']
  }
});

const clusterURL = '24481123c0884e459cd76ccc6ca6d326.s1.eu.hivemq.cloud';
const port = 8883;
const protocol = 'mqtts';

function connect(clientID, username, password) {
  // Initialize the MQTT client
  var client = mqtt.connect({
    host: clusterURL,
    port: port,
    protocol: protocol,
    username: username,
    password: password
  });

  // Setup the callbacks
  client.on('connect', function () {
    console.log('Connected');
  });

  client.on('error', function (error) {
    console.log(error);
  });

  client.on('message', function (topic, message) {
    // Called each time a message is received
    console.log('Received message:', topic, message.toString());
  });
}

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on('connectValues', (data) => {
    console.log('Received values from client:', data);

    // Pass the values to the MQTT connect function
    connect(data.clientID, data.username, data.password);
  });

  // Pass back connection information to the website client when connected
  socket.on('getConnectionInfo', () => {
    socket.emit('connectionInfoResponse', { clusterURL, port, protocol });
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
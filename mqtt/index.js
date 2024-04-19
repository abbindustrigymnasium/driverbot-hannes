const express = require('express');
const http = require('http');

// Import the connect function from mqttConnect.js
const { connect } = require('./mqttConnect');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // The origins of which are allowed
    methods: ['GET', 'POST']
  }
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A client connected');

  // Handle custom event 'trigger'
  socket.on('connectValues', (data) => {
    // Handle the connectValues event here
    console.log('Received values from client:', data);

    // Now you can pass these values to your MQTT connect function
    connect(data.clientID, data.username, data.password);
  });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running on port 3000');
});
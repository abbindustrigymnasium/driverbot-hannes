var mqtt = require('mqtt')

function connect(clientID, username, password) {
    // initialize the MQTT client
    var client = mqtt.connect({
        host: '24481123c0884e459cd76ccc6ca6d326.s1.eu.hivemq.cloud',
        port: 8883,
        protocol: 'mqtts',
        username: username,
        password: password
    });

    // setup the callbacks
    client.on('connect', function () {
        console.log('Connected');
    });

    client.on('error', function (error) {
        console.log(error);
    });

    client.on('message', function (topic, message) {
        // called each time a message is received
        console.log('Received message:', topic, message.toString());
    });

    // subscribe to topic 'my/test/topic'
    client.subscribe('testtopic');

    // publish message 'Hello' to topic 'my/test/topic'
    client.publish('testtopic', 'Hello');
}

// Export the connect function
module.exports = {
    connect: connect
};
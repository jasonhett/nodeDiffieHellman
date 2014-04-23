const net = require("net");
var crypto = require("crypto");

var poem = 'If you can keep your head when all about you, Are losing theirs and blaming it on you, If you can trust yourself when all men doubt you, But make allowance for their doubting too; If you can wait and not be tired by waiting, Or being lied about, don’t deal in lies, Or being hated, don’t give way to hating, And yet don’t look too good, nor talk too wise.';

// Create a socket (client) that connects to the server
var socket = new net.Socket();

var bob = crypto.getDiffieHellman('modp5');
bob.generateKeys('hex');
//collect pulbic key to send
var clientPublicKey = bob.getPublicKey('hex');
//holder for clients public key
var serverPublicKey;

var commonSecret;

socket.connect(61337, "localhost", function () {
    console.log("Client: Connected to server");
});

// Let's handle the data we get from the server
socket.on("data", function (data) {
    //console.log("Response from server: %s", data);
    serverPublicKey = data;

    //Computer Bob's secret
    commonSecret = bob.computeSecret(serverPublicKey, 'hex', 'hex');


    var cipher = crypto.createCipher('aes-256-cbc', commonSecret);
    var encryptedMsg = cipher.update(poem, 'utf8', 'hex');
    encryptedMsg += cipher.final('hex');

    console.log(commonSecret);
    console.log(encryptedMsg);
    // Respond back
    socket.write(JSON.stringify({msg: encryptedMsg, key: clientPublicKey}));
    // Close the connection
    socket.end();
});
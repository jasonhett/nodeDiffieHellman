/* net library is used for nodejs sockets */
const net = require("net");
/* cryptography library we used for nodejs, can find documentation at
   http://nodejs.org/api/crypto.html
 */
var crypto = require("crypto");

/* Message to send to the server */
var poem = 'If you can keep your head when all about you, Are losing theirs and blaming it on you, If you can trust yourself when all men doubt you, But make allowance for their doubting too; If you can wait and not be tired by waiting, Or being lied about, don’t deal in lies, Or being hated, don’t give way to hating, And yet don’t look too good, nor talk too wise.';

/* Create a socket (client) that connects to the server */
var socket = new net.Socket();

/* On initiating the client it computes its keys */
var bob = crypto.getDiffieHellman('modp5');
bob.generateKeys('hex');

/* collect pulbic key to send */
var clientPublicKey = bob.getPublicKey('hex');

/* holder for clients public key */
var serverPublicKey;

/* holder for common secret */
var commonSecret;

/* Connection will prompt the server to create its keys
   and send the client its public key.
 */
socket.connect(61337, "localhost", function () {
    console.log("Client: Connected to server");
});

/* The server will respond with its public key. The client
   uses this to computer the common secret. We use that as the
   key for the cipher. Once we have computed the cipher we send
   the clients public key and the encrypted message back to the
   server
  */
socket.on("data", function (data) {

    data = JSON.parse(data);
    data = data.key;
    console.log("Generated Client Public Key: \n%s", clientPublicKey);

    console.log("\nReceived Server's Public Key: \n%s", data);
    serverPublicKey = data;

    /* Compute common secret */
    commonSecret = bob.computeSecret(serverPublicKey, 'hex', 'hex');
    console.log("\nComputed Common Secret: \n%s", commonSecret);

    /* Use the common secret as the key for the cipher */
    var cipher = crypto.createCipher('aes-256-cbc', commonSecret);
    /* Set the cipher to auto padding */
    cipher.setAutoPadding(auto_padding=true);
    var encryptedMsg = cipher.update(poem, 'utf8', 'hex');
    encryptedMsg += cipher.final('hex');

    console.log("\nEncrypting Message: \n%s", poem);
    console.log("\nEncrypted Secret Message: \n%s", encryptedMsg);

    /* We then construct a javascript object containing the encrypted
       message and the clients public key and send that object back to
       the server.
     */
    console.log("\nSending Encrypted Message.");
    socket.write(JSON.stringify({msg: encryptedMsg, key: clientPublicKey}));

    /* Close the connection */
    console.log("Message Sent. Closing Connection.");
    socket.end();
});
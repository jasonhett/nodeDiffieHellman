/* net library is used for nodejs sockets */
const net = require("net");
/* cryptography library we used for nodejs, can find documentation at
   http://nodejs.org/api/crypto.html
 */
var crypto = require("crypto");

// Create a simple server
var server = net.createServer(function (conn) {

    /* Log when a client is connected */
    console.log("Server: Client connected");

    /* When a user connects Generate local keys and compute the
       servers public to pass to the client.
     */
    var alice = crypto.getDiffieHellman('modp5');
    alice.generateKeys();
    //collect pulbic key to send
    var serverPublicKey = alice.getPublicKey('hex');
    console.log()
    //holder for clients public key
    var clientPublicKey;
    var commonSecret;

    console.log("\nGenerated Server Public Key: \n%s", serverPublicKey);
    /* Once the key is generated and server's public key
       is computed, we send that key to the client so they
       can compute the common secret key for encryption
     */
    console.log("\nSending Server Public Key.");
    conn.write(JSON.stringify({key: serverPublicKey}));

    /* Once the client has recieved the server's public key
       and computed the common secret, it is used as the key
       for the AES cipher encryption. The client then sends
       us their public key and the encrypted message.
     */
    conn.on("data", function(data) {
        data = JSON.parse(data);

        clientPublicKey = data.key;
        console.log("\nReceived Client's Public Key: \n%s", data.key);

        /* Compute the common secret, requires client's public key */
        commonSecret = alice.computeSecret(clientPublicKey, 'hex', 'hex');
        console.log("\nComputed Common Secret: \n%s", commonSecret);

        console.log("\nReceived Encrypted Message: \n%s", data.msg);

        /* With the common secret computed we can use that as the
           key for decryption of the cipher.
         */
        console.log("\nDecrypting Message.");
        var decipher = crypto.createDecipher('aes-256-cbc', commonSecret);
        var decryptedMsg = decipher.update(data.msg, 'hex', 'utf8');
        decryptedMsg += decipher.final('utf8');

        /* Print out the decrypted message */
        console.log("Decrypted Message: \n%s",decryptedMsg);

    });

    /* Once the client is finished it will close the server */
    conn.on("end", function(data) {
        console.log('Server: Client disconnected');
        // Close the server
        server.close();
        // End the process
        process.exit(0);
    });


});

/* Listen for connections */
server.listen(61337, "localhost", function () {
    console.log("Server: Listening");
});
const net = require("net");
var crypto = require("crypto");

// Create a simple server
var server = net.createServer(function (conn) {
    console.log("Server: Client connected");

    //Generate local keys
    var alice = crypto.getDiffieHellman('modp5');
    alice.generateKeys();
    //collect pulbic key to send
    var serverPublicKey = alice.getPublicKey();
    //holder for clients public key
    var clientPublicKey;
    var commonSecret;

    // If connection is closed
    conn.on("end", function(data) {
        console.log('Server: Client disconnected');
        // Close the server
        server.close();
        // End the process
        process.exit(0);
    });

    // Handle data from client
    conn.on("data", function(data) {
        data = JSON.parse(data);

        clientPublicKey = data.key;
        //Compute Alice's secret
        commonSecret = alice.computeSecret(clientPublicKey, 'hex', 'hex');

        console.log(commonSecret);
        console.log(data.msg);
        //Decipher the AES data;
        var decipher = crypto.createDecipher('aes-256-cbc', commonSecret);
        var decryptedMsg = decipher.update(data.msg, 'hex', 'utf8');
        decryptedMsg += decipher.final('utf8');

        console.log(decryptedMsg);

    });

    // Let's response with a hello message
    conn.write(serverPublicKey);
});

// Listen for connections
server.listen(61337, "localhost", function () {
    console.log("Server: Listening");
});
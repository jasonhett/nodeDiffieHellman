var crypto = require('crypto');
var alice = crypto.getDiffieHellman('modp5');
var bob = crypto.getDiffieHellman('modp5');

alice.generateKeys();
bob.generateKeys();

var bobkey = bob.getPublicKey();
var alicekey = alice.getPublicKey();
var alice_secret = alice.computeSecret(bobkey, null, 'hex');
var bob_secret = bob.computeSecret(alicekey, null, 'hex');

/* alice_secret and bob_secret should be the same */
console.log(alice_secret == bob_secret);
console.log(crypto.getCiphers());
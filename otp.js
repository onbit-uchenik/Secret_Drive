const {hotp,authenticator} = require('otplib');

const secret = authenticator.generateSecret(128);

let counter = 0;
console.log(secret);

const token = hotp.generate(secret,counter);
console.log(token);
console.log(counter);

const token2 = hotp.generate(secret,counter);
const isValid = hotp.check(token,secret,counter);
console.log(token2);
console.log(isValid);
console.log(counter);
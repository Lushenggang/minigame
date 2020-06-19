const crypto = require('crypto')

const secretKey = process.env.SECRET_KEY || 'default'

function encrypt(data) {
    const cipher = crypto.createCipher('aes192', secretKey)
    var crypted = cipher.update(data, 'utf8', 'base64')
    crypted += cipher.final('base64')
    return crypted
}

function decrypt(encrypted) {
    const decipher = crypto.createDecipher('aes192', secretKey)
    var decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

module.exports = {
  encrypt,
  decrypt
}
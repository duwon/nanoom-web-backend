const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const { jwt } = require('../nanoomDBConfig')

const User = new Schema({
    email: String,
    password: String,
    displayName: String,
    phoneNumber: String,
    group: [],
    uid: String,
    title: String,
    created: { type: Date, default: Date.now },
    admin: { type: Boolean, default: false }
})


// crypto.createHmac('sha1', 'secret')
//              .update('mypasswssord')
//              .digest('base64')


// create new User document
User.statics.create = function(email, password, displayName) {
    const encrypted = crypto.createHmac('sha1', jwt.secret)
                      .update(password)
                      .digest('base64')
    console.log(email.password)
    const user = new this({
        email,
        password: encrypted,
        displayName
    })

    // return the Promise
    return user.save()
}

User.statics.assignGroup = function(email, group) {
    
}

User.statics.assignDisplayName = function(email, name) {
    this.displayName = name
    return this.save()
}

User.statics.assignUID = function(email, uid) {
    this.uid = uid
    return this.save()
}

User.statics.assignPhoneNumber = function(email, phoneNumber) {
    this.phoneNumber = phoneNumber
    return this.save()
}

User.statics.assignTitle = function(email, title) {
    this.title = title
    return this.save()
}

// find one user by using username
User.statics.findOneByUsername = function(email) {

    return this.findOne({
        email
    }).exec()
}

// verify the password of the User documment
User.methods.verify = function(password) {
    const encrypted = crypto.createHmac('sha1', jwt.secret)
                      .update(password)
                      .digest('base64')
    console.log(this.password === encrypted)

    return this.password === encrypted
}

User.methods.assignAdmin = function() {
    this.admin = true
    return this.save()
}

module.exports = mongoose.model('User', User)
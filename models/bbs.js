const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { jwt } = require('../nanoomDBConfig')

const Bbs = new Schema({
    category: { type: String, default: '' },
    notice: { type: Boolean, default: false },
    group: { type: String, default: '' },
    writer: {
        email: { type: String, default: '' },
        displayName: { type: String, default: '' },
    },
    hits: { type: Number, default: 0 },
    isComments: { type: Boolean, default: false },
    comments: {type: Array, default: [
//      {
//          contents : {type: String, default: ''},
//          writer: {
//              email: { type: String, default: '' },
//              displayName: { type: String, default: '' },
//          },
//          created: { type: Date, default: Date.now },
//      },
    ]},
    subject: { type: String, default: '' },
    contents: { type: String, default: '' },
    isAttachment: { type: Boolean, default: false },
    attachment: {type: Array, default: [
//      {
//          uid : { type: String, default: ''},
//          src : { type: String, default: ''},
//          filename : { type: String, default: ''},
//          mimeType : { type: String, default: ''},
//          size : { type: Number, default: 0},
//      },
    ]},
    created: { type: Date, default: Date.now },
})



module.exports = mongoose.model('Bbs', Bbs)

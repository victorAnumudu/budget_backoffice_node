const mongoose = require('mongoose')

const SCHEMA = mongoose.Schema

let usersSchema = new SCHEMA({
    firstname:{
        type: String,
    },
    lastname:{
        type: String,
    },
    email: {
        type: String,
        unique: [true, 'opps, duplicate records'],
        required: [true, 'email is required']
    },
    password: {
        type: String,
        // required: [true, 'password is required']
    },
    role: {
        type: String,
        // required: [true, 'role is required']
    },
    status: {
        type: String,
        default: 'pending',
    },
})

const usersModel = mongoose.model('users', usersSchema)

module.exports = usersModel


// const sampleUser = {
//     "firstname": `example${Math.floor((Math.random() * 10))}`,
//     "lastname": `exam${Math.floor((Math.random() * 10))}`,
//     "email": `test${Math.floor((Math.random() * 10))}@text.com`,
//     "password":"1234",
//     "role":"tpo", // user,tpo,admin,
//     "status":"", // active,pending,disbaled
// }
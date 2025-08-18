const usersModel = require("../../models/users")

const JWT = require('jsonwebtoken')

let userDoesNotExistByEmail = (req, res, next) => { //ok
    const {email} = req.body
    usersModel.find({email}).then(info => {
        if(info.length){
            return res.status(401).json({status: -1, message: `User already exist`, data:[]})
        }
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: `An error occurred`, data:[]})
    })
}

let userExistByEmail = (req, res, next) => {
    const {email} = req.body
    usersModel.findOne({email}).then((info) => {
        if(!info){
            return res.status(401).json({status: -1, message: `Invalid user`})
        }
        req.myLocals = {uid: info._id}
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message})
    })
}

let userIsNotVerified = (req, res, next) => {
    const {uid} = req.myLocals
    usersModel.findById(uid).then(info => {
        if(info.password){ //if verify, ie password already exist, terminate
           return res.status(401).json({status: -1, message: `User already verified`})
        }
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message})
    })
}

let validUserToken = (req, res, next) => {
    const {authorization} = req.headers
    const token = authorization?.split(' ')[1]
    if(!token){
        return res.status(401).json({status: -1, message: `User not authorized`})
    }
    JWT.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
        if(err){
            return res.status(401).json({status: -1000, message: err.message})
        }
        req.myLocals = {uid: decoded.id}
        next()
    })
}

const isAdmin = (req, res, next) => {
    const {uid} = req.myLocals
    // return if no id is present in params sent
    if(!uid){
        return res.status(404).json({status: -1, message: 'No active users', data:[]})
    }
    usersModel.findById(uid).then((info)=>{
        if(!info){
            return res.status(404).json({status: -1, message: 'User not found', data:{}})
        }
        if(info.role != 'admin'){
            return res.status(404).json({status: -1, message: 'You are not allowed to perform this action, contact the Admin', data:{}})
        }else{
            next()
        }
    }).catch((err)=>{
        res.status(500).json({status: -1, message: err.message, data:{}})
    })
}

module.exports = {userDoesNotExistByEmail, userExistByEmail, userIsNotVerified, validUserToken, isAdmin}
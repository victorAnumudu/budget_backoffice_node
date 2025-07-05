const usersModel = require("../../models/users")

const JWT = require('jsonwebtoken')

let userDoesNotExistByEmail = (req, res, next) => {
    const {email} = req.body
    usersModel.find({email}).then(info => {
        if(info.length){
            return res.status(401).json({status: -1, message: `user already exist`, data:[]})
        }
        next()
    }).catch(err => {
        res.status(500).json({status: -1, message: `An error occurred`, data:[]})
    })
}

let userExistByEmail = (req, res, next) => {
    const {email} = req.body
    usersModel.findOne({email}).then(info => {
        if(info){
            req.body.userID = info._id
            return next()
        }
        res.status(401).json({status: -1, message: `user does not exist`, data:[]})
    }).catch(err => {
        res.status(500).json({status: -1, message: `An error occurred`, data:[]})
    })
}

let validUserToken = (req, res, next) => {
    const {authorization} = req.headers
    const token = authorization?.split(' ')[1]
    if(!token){
        return res.status(401).json({status: -1, message: `User not authorized`, data:[]})
    }
    JWT.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
        if(err){
            return res.status(401).json({status: -1, message: `An error occurred`, data:[]})
        }
        req.myLocals = {id:decoded.id}
        next()
    })
}

module.exports = {userDoesNotExistByEmail, userExistByEmail, validUserToken}
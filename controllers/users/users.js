const usersModel = require('../../models/users')

const bycrypt = require('bcrypt')
const JWT = require('jsonwebtoken')

// const process = require('process')
const fs = require('fs')
const fsPromise = fs.promises

const path = require('path')

const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    host: "smtp.mandrillapp.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "onClick",
      pass: "md-KRi_doychIuLg8jypP1rug",
    },
  });


const getAllUsers = async (req, res) => {
    try {
        const users = await usersModel.find({})
        res.status(200).json({status: 1, message: 'Successful', data:users})
    } catch (error) {
        res.status(404).json({status: -1, message: 'No active users', data:[]})
    }
    // var message = {
    //     from: "anumudutesting@gmail.com",
    //     to: "anumuduchukwuebuka@gmail.com",
    //     subject: "Message title",
    //     text: "Plaintext version of the message",
    //     html: "<p>HTML version of the message</p>",
    //   };
    //   try {
    //       let mail = await transporter.sendMail(message)
    //       res.end(mail)
    //   } catch (error) {
    //     res.end(error)
    //   }
    // transporter.sendMail(message, (err, data)=>{
    //     if(err){
    //         res.end('error')
    //     }
    //     res.end('good')
    // })
}


const getUserByID = (req, res) => {
    const passedID = req.myLocals.id
    // return if no id is present in params sent
    // if(!passedID){
    //     res.status(404).json({status: -1, message: 'No active users', data:[]})
    // }
    usersModel.findById(passedID).then((info)=>{
        if(!info){
            return res.status(404).json({status: -1, message: 'user not found', data:{}})
        }
        info.password = ''
        res.status(200).json({status: 1, message: 'sucessful', user:info})
    }).catch((err)=>{
        res.status(404).json({status: -1, message: err.message, data:{}})
    })
}


// FUNCTION TO REGISTER NEW USER
const addUser = (req, res) => {
    const {firstname, lastname, role, email, password} = req.body
    if(!firstname || !lastname || !role || !email || !password){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `please enter all fields`, data:[]})
    }
    bycrypt.hash(password, Number(process.env.BYCRYPT_SALT)).then((newpwd)=>{
        req.body.password = newpwd
        usersModel.create(req.body).then((info)=>{
            // info.password = ''
            delete info.password // remove password from the info sent to the client
            res.status(201).json({status: 1, message: `user added successfully`, data:[info]})
        }).catch((err)=>{
            res.status(500).json({status: -1, message: `unable to create user`, data:[]})
        })
    }).catch(err => {
        res.status(500).json({status: -1, message: `something went wrong, try again`, data:[]})
    })
}

const loginUser = (req, res) => {
    // let userID = req.userID
    const {email, password, userID} = req.body
    if(!email || !password){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `Email/Password not present`, data:[]})
    }
    usersModel.findById(userID).then((info) => {
        if(!info){  // return if no user found
            return res.status(400).json({status: -1, message: `User not found`, data:[]})
        }
        // else check if the password matched
        bycrypt.compare(password, info.password, (err, data)=>{
            if(err){
                return res.status(500).json({status: -1, message: `something went wrong, try again`, data:[]})
            }
            if(!data){ // return incorrect password if password do not match
                return res.status(401).json({status: -1, message: `email/password is incorrect`, data:[]})
            }
            // if password matches, generate JWT token and assign the user
            JWT.sign({id: info._id}, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token)=>{
                if(err){ // if error return
                   return res.status(401).json({status: -1, message: `Unable to login user, try again`, data:[]})
                }
                info.password = ''
                res.status(200).json({status: 1, message: `User logged in successfully`, data:{user:info, token}})
            })
        })
    }).catch(err => {
        res.status(500).json({status: -1, message: `server error, try again`, data:[]})
    })
}

const deleteUser = (req, res) => {
    const passedID = req.params.id
    if(!passedID){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `User ID not passed`, data:[]})
    }
    usersModel.findByIdAndDelete(passedID).then((info) => {
        if(!info){
            return res.status(400).json({status: -1, message: `User not found`, data:[]})
        }
        delete info.password// remove user password
        res.status(200).json({status: 1, message: `User Deleted`, data:[info]})
    }).catch(err => {
        res.status(500).json({status: -1, message: `server error, try again`, data:[]})
    })
}

const updateUser = async (req, res) => { // update user
    let acceptedFields = ['password', 'name'] // array to hold list of values updatable
    const passedID = req.params.id
    if(!passedID){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `User ID not passed`, data:[]})
    }
    if(!req.body.action){ // return if no action is passed as payload
        return res.status(400).json({status: -1, message: `Action payload is required`, data:[]})
    }
    const fields = {...req.body}
    const newDetails = {} // object to hold acceptable fields to update and check if its empty

    // loop through the passed paramaters and only take those allowed for update
    for(let keys in fields){
        if(acceptedFields.includes(keys) && fields[keys]){
            newDetails[keys] = fields[keys]
        }
    }

    if(!Object.keys(newDetails).length){ // returns no new field to update if the newDetails is empty
        return res.status(406).json({status: -1, message: `No New fields present to update`, data:[]})
    }

    try {
        const userToUpdate = await usersModel.findById(passedID)
        if(fields.action == 'password'){ // for password update
            const passwordMatched = await bycrypt.compare(newDetails.password, userToUpdate.password)
            if(passwordMatched){
                return res.status(404).json({status: -1, message: `old password cannot be used again, try with a new password`, data:[]})
            }
            // HASH THE NEW PASSWORD
            let newPwdHash = await bycrypt.hash(newDetails.password, Number(process.env.BYCRYPT_SALT))
            let userUpdated = await usersModel.findByIdAndUpdate(passedID, {password: newPwdHash}, {new: true})
            if(!userUpdated){ // return this if unable to update
                return res.status(404).json({status: -1, message: `failed to update`, data:[]})
            }
            res.status(200).json({status: 1, message: `password changed successfully`, data:[]})
        }else{ // for non password update
            delete req.body.password // remove password from what the system will update
            const updatedFields = await usersModel.findByIdAndUpdate(passedID, req.body, {new:true})
            if(!updatedFields){
                return res.status(404).json({status: -1, message: `failed to update`, data:[]})
            }
            updatedFields.password = '' // remove password from what the system sends to client
            res.status(200).json({status: 1, message: `updated successfully`, data:[updatedFields]})
        }
    } catch (error) {
        res.status(500).json({status: -1, message: `An error occurred`, data:[]})
    }

        
    
}

module.exports = {getAllUsers, getUserByID, addUser, loginUser, deleteUser, updateUser}
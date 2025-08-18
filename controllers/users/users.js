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
        let page = Number(req.query.page) >= 1 ? Number(req.query.page) : 1
        let limit = (Number(req.query.limit) && Number(req.query.limit) >= 1) ? Number(req.query.limit) : Number(10);
        let skip = page >= 2 ? (page * limit ) - limit : 0;
        const usersFound = await usersModel.find({}).sort({ role: 1 }).lean().skip(skip).limit(limit)
        let dataSent = {
            users: usersFound.map(item => ({id: item._id.toString(), ...item})),
            pagination: {
            "current_page": 1,
            "has_next": true,
            "has_prev": false,
            "limit": 20,
            "total_count": usersFound.length,
            "total_pages": 4032
            }
        } 

        res.status(200).json({status: 1, message: 'Successful', data:dataSent})
    } catch (error) {
        res.status(500).json({status: -1, message: 'No active users', data:[]})
    }
}

const getUserByID = (req, res) => {
    const passedID = req.myLocals.uid
    // return if no id is present in params sent
    if(!passedID){
        return res.status(404).json({status: -1, message: 'No active users', data:[]})
    }
    usersModel.findById(passedID).then((info)=>{
        if(!info){
            return res.status(404).json({status: -1, message: 'User not found', data:{}})
        }
        info.password = ''
        res.status(200).json({status: 1, message: 'Sucessful', user:info})
    }).catch((err)=>{
        res.status(500).json({status: -1, message: err.message, data:{}})
    })
}

// FUNCTION TO REGISTER NEW USER
const addUser = (req, res) => {
    const {firstname, lastname, role, email, password} = req.body
    if(!firstname || !lastname || !role || !email || !password){ // return if no email, password and etc are present in params sent
        return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
    }
    bycrypt.hash(password, Number(process.env.BYCRYPT_SALT)).then((newpwd)=>{
        req.body.password = newpwd
        usersModel.create(req.body).then((info)=>{
            // info.password = ''
            delete info.password // remove password from the info sent to the client
            res.status(201).json({status: 1, message: `User added successfully`, data:[info]})
        }).catch((err)=>{
            res.status(500).json({status: -1, message: `Unable to create user`, data:[]})
        })
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message, data:[]})
    })
}

// FUNCTION TO REGISTER NEW USER BY ADMIN
const addUserByAdmin = (req, res) => {
    const {firstname, lastname, email} = req.body
    if(!firstname || !lastname|| !email){ // return if no email, password and etc are present in params sent
        return res.status(400).json({status: -1, message: `Please enter all fields`, data:[]})
    }
    usersModel.create(req.body).then((info)=>{
        res.status(201).json({status: 1, message: `User added successfully`, data:[info]})
    }).catch((err)=>{
        res.status(500).json({status: -1, message: `Unable to create user`, data:[]})
    })
}

//FUNCTION TO LOGIN USER
const loginUser = (req, res) => {
    let userID = req.myLocals.uid
    const {email, password, uid} = req.body
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
                return res.status(500).json({status: -1, message: `An error occurred, try again`, data:[]})
            }
            if(!data){ // return incorrect password if password do not match
                return res.status(401).json({status: -1, message: `Email/password is incorrect`, data:[]})
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
        res.status(500).json({status: -1, message: `Server error, try again`, data:[]})
    })
}

// FUNCTION TO VERIFYUSER
const verifyUser = (req, res) => {
    const {email, password, uid} = req.body
    if(!email || !password){ // return if no email, password and etc are present in params sent
        return res.status(400).json({status: -1, message: `Please enter all fields`})
    }
    bycrypt.hash(password, Number(process.env.BYCRYPT_SALT)).then((newpwd)=>{
        req.body = {password: newpwd}
        console.log(req.body)
        req.body.status = 'active'
        usersModel.findByIdAndUpdate(uid, req.body, {new:true}).then((info)=>{
            // info.password = ''
            delete info.password // remove password from the info sent to the client
            res.status(201).json({status: 1, message: `User verified successfully`})
        }).catch((err)=>{
            res.status(500).json({status: -1, message: `Unable to verify user`})
        })
    }).catch(err => {
        res.status(500).json({status: -1, message: err.message, data:[]})
    })
}

// FUNCTION TO DELETE USER
const deleteUser = (req, res) => {
    const passedID = req.body.delete_uid
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
        res.status(500).json({status: -1, message: `Server error, try again`, data:[]})
    })
}





//FUNCTION TO UPDATE
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
                return res.status(404).json({status: -1, message: `Old password cannot be used again, try with a new password`, data:[]})
            }
            // HASH THE NEW PASSWORD
            let newPwdHash = await bycrypt.hash(newDetails.password, Number(process.env.BYCRYPT_SALT))
            let userUpdated = await usersModel.findByIdAndUpdate(passedID, {password: newPwdHash}, {new: true})
            if(!userUpdated){ // return this if unable to update
                return res.status(404).json({status: -1, message: `Failed to update`, data:[]})
            }
            res.status(200).json({status: 1, message: `Password changed successfully`, data:[]})
        }else{ // for non password update
            delete req.body.password // remove password from what the system will update
            const updatedFields = await usersModel.findByIdAndUpdate(passedID, req.body, {new:true})
            if(!updatedFields){
                return res.status(404).json({status: -1, message: `Failed to update`, data:[]})
            }
            updatedFields.password = '' // remove password from what the system sends to client
            res.status(200).json({status: 1, message: `Updated successfully`, data:[updatedFields]})
        }
    } catch (error) {
        res.status(500).json({status: -1, message: `An error occurred`, data:[]})
    }

        
    
}

module.exports = {getAllUsers, getUserByID, addUser, addUserByAdmin, loginUser, verifyUser, deleteUser, updateUser}
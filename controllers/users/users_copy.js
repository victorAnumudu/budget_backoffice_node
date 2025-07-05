const process = require('process')
const fs = require('fs')
const fsPromise = fs.promises

const path = require('path')


const getAllUsers = (req, res) => {
    const userDBPath = path.join(process.cwd(), 'db','users.json')
    fsPromise.readFile(userDBPath).then((data)=>{
        data = JSON.parse(data)
        data.forEach((item)=>{
            delete item.password
        })
        res.status(200).json({status: 1, message: 'Successful', data})
    }).catch((err)=>{
        res.status(404).json({status: -1, message: `Not Found ${err}`, data:[]})
    })
}


const getAllUserByID = (req, res) => {
    const passedID = req.params.id
    if(!passedID){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `User ID not passed`, data:[]})
    }
    const userDBPath = path.join(process.cwd(), 'db','users.json')
    fsPromise.readFile(userDBPath).then((data)=>{
        data = JSON.parse(data)
        let foundUser = data.filter(user => user.id == passedID)
        if(!foundUser.length){
            return res.status(400).json({status: -1, message: `User not found`, data:[]})
        }
        data.forEach((item)=>{
            delete item.password
        })
        res.status(200).json({stattus: 1, message: 'Successful', data:foundUser})
    }).catch((err)=>{
        res.status(404).json({status: -1, message: `Not Found ${err}`, data:[]})
    })
}

const addUser = (req, res) => {
    const {email, password} = req.body
    if(!email || !password){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `Email/Password not present`, data:[]})
    }
    const userDBPath = path.join(process.cwd(), 'db','users.json')
    fsPromise.readFile(userDBPath).then((data)=>{
        data = JSON.parse(data)
        let userExist = data.filter(user => user.email == email)
        if(userExist.length){
            return res.status(400).json({status: -1, message: `User already exist`, data:[]})
        }
        //assign id to new user using ID of the last person in the user DB + 1
        let newUserID;
        if(data.length){
            newUserID = Number(data[data.length -1].id) + 1
        }else{
            newUserID = 1
        }

        // push the new user into the DB
        const newUserDetails = {id:newUserID.toString(), email, password}
        data.push(newUserDetails)

        fsPromise.writeFile(userDBPath, JSON.stringify(data)).then(()=>{
            delete newUserDetails.password
            res.status(200).json({stattus: 1, message: 'Successful', data:newUserDetails})
        }).catch(()=>{
            return res.status(500).json({status: -1, message: `Unable to complete the action, Try again later`, data:[]})
        })
    }).catch((err)=>{
        res.status(404).json({status: -1, message: `Not Found ${err}`, data:[]})
    })
}

const deleteUser = (req, res) => {
    const passedID = req.params.id
    if(!passedID){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `User ID not passed`, data:[]})
    }
    const userDBPath = path.join(process.cwd(), 'db','users.json')
    fsPromise.readFile(userDBPath).then((data)=>{
        data = JSON.parse(data)
        let userExist = data.filter(user => user.id == passedID)
        if(!userExist.length){ // return if user is not found
            return res.status(400).json({status: -1, message: `User not found`, data:[]})
        }

        // delete user by filtering and return all record expect the user with the id passed
        let newData = data.filter(user => user.id != passedID)
        // push the new user into the DB
        fsPromise.writeFile(userDBPath, JSON.stringify(newData)).then(()=>{
            delete userExist[0].password
            res.status(200).json({stattus: 1, message: 'Successful', data:userExist})
        }).catch(()=>{
            return res.status(500).json({status: -1, message: `Unable to complete the action, Try again later`, data:[]})
        })
    }).catch((err)=>{
        res.status(404).json({status: -1, message: `Not Found ${err}`, data:[]})
    })
}

const updateUser = (req, res) => { // update user
    const userDBPath = path.join(process.cwd(), 'db','users.json')
    let acceptedFields = ['password']
    const passedID = req.params.id
    if(!passedID){ // return if no id is present in params sent
        return res.status(400).json({status: -1, message: `User ID not passed`, data:[]})
    }
    const fields = {...req.body}
    const newDetails = {}

    // loop through the passed paramaters and only take those allowed for update
    for(let keys in fields){
        if(acceptedFields.includes(keys) && fields[keys]){
            newDetails[keys] = fields[keys]
        }
    }

    if(!Object.keys(newDetails).length){
        return res.status(406).json({status: -1, message: `No New fields present to update`, data:[]})
    }

    // read DB to get user to update
    fsPromise.readFile(userDBPath).then((data)=>{
        data = JSON.parse(data)
        let userExist = data.filter(user => user.id == passedID)
        if(!userExist.length){
            return res.status(400).json({status: -1, message: `User does not exist`, data:[]})
        }
        // update the user matched by the id using action to determine if its password update or normal user details update
        let newData
        if(!fields.action){
            return res.status(406).json({status: -1, message: `Action payload is missing`, data:[]})
        }else if (fields.action == 'password'){ // updates user password
            if(userExist[0].password == fields.password){ // return if nes password is same as old one
                return res.status(406).json({status: -1, message: `You cannot use your old password`, data:[]})
            }
            newData = data.map(user => {
                if(user.id == passedID){
                    return ({...user, password:fields.password})
                }else{
                    return user
                }
            })
        }else{
            newData = data.map(user => {
                if(user.id == passedID){
                    return ({...user, ...newDetails})
                }else{
                    return user
                }
            })
        }

        // push the new user into the DB
        fsPromise.writeFile(userDBPath, JSON.stringify(newData)).then(()=>{
            delete userExist[0].password
            res.status(200).json({stattus: 1, message: 'Successful', data:userExist})
        }).catch(()=>{
            return res.status(500).json({status: -1, message: `Unable to complete the action, Try again later`, data:[]})
        })
    }).catch((err)=>{
        res.status(404).json({status: -1, message: `Not Found ${err}`, data:[]})
    })
}

module.exports = {getAllUsers, getAllUserByID, addUser, deleteUser, updateUser}
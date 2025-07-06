const express = require('express')

const usersRoute = express.Router()

const {getAllUsers, getUserByID, addUser, loginUser, deleteUser, updateUser} = require('../controllers/users/users')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken} = require('../middlewares/users/userExist') //middleware to check if user already exist


// add a user or user registration
usersRoute.post('/', userDoesNotExistByEmail, addUser)

// login a user
usersRoute.post('/login', userExistByEmail, loginUser)

// get user by id
usersRoute.get('/profile', validUserToken, getUserByID)




// get all users in the data base
usersRoute.get('/', getAllUsers)

// delete a user
usersRoute.delete('/:id', deleteUser)

// update a user
usersRoute.put('/:id', updateUser)

module.exports = usersRoute
const express = require('express')

const usersRoute = express.Router()

const {getAllUsers, getUserByID, addUser, addUserByAdmin, loginUser, verifyUser, deleteUser, updateUser} = require('../controllers/users/users')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist


// add a user or user registration
usersRoute.post('/add', userDoesNotExistByEmail, addUser)

// add a user or user registration by an admin
usersRoute.post('/add/admin', validUserToken, isAdmin, userDoesNotExistByEmail, addUserByAdmin)

// login a user
usersRoute.post('/login', userExistByEmail, loginUser)

// verify user
usersRoute.post('/verify', userExistByEmail, userIsNotVerified, verifyUser)

// get user by id
usersRoute.get('/profile', validUserToken, getUserByID)

// get user by id
usersRoute.get('/all', getAllUsers)

// delete user by id
usersRoute.post('/delete', validUserToken, isAdmin, deleteUser)






// delete a user
usersRoute.delete('/:id', deleteUser)

// update a user
usersRoute.put('/:id', updateUser)

module.exports = usersRoute
const express = require('express')

const mdasRoute = express.Router()

const {getAllMDAs, addMDA, deleteMDA, updateMDA} = require('../controllers/mdas')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist


// add a expense
mdasRoute.post('/add', addMDA)

// get expense by id
mdasRoute.get('/all', getAllMDAs)

// delete expense by id
mdasRoute.post('/delete', deleteMDA)




// update a expense
mdasRoute.put('/:id', updateMDA)


module.exports = mdasRoute
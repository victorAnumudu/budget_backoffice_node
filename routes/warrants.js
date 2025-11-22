const express = require('express')

const warrantsRoute = express.Router()

const { addWarrant, getAllWarrants, removeWarrantItems, deleteWarrant, updateWarrantStatus } = require('../controllers/warrants')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist
const { warrantNotGeneratedThenProceed, warrantIsEmptyThenProceed, warrantIsNotEmptyThenProceed } = require('../middlewares/users/warrants') // warrant middleware


// add a warrant
warrantsRoute.post('/add', addWarrant)

// get warrant by id
warrantsRoute.get('/all', getAllWarrants)

// remove warrant item(s) by id
warrantsRoute.post('/remove', warrantNotGeneratedThenProceed, removeWarrantItems)

// delete warrant by id
warrantsRoute.post('/delete', warrantNotGeneratedThenProceed, warrantIsEmptyThenProceed, deleteWarrant)

// update a warrant status
warrantsRoute.put('/update', warrantNotGeneratedThenProceed, warrantIsNotEmptyThenProceed, updateWarrantStatus)


module.exports = warrantsRoute
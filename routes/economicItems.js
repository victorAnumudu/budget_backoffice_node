const express = require('express')

const economicItemsRoute = express.Router()

const {getAllEconomicItems, addEconomicItem, deleteEconomicItem, updateEconomicItem} = require('../controllers/economicItems')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist


// add a economic item
economicItemsRoute.post('/add', addEconomicItem)

// get economic item by id
economicItemsRoute.get('/all', getAllEconomicItems)

// delete economic item by id
economicItemsRoute.post('/delete', deleteEconomicItem)

// update a economic item
economicItemsRoute.post('/update', updateEconomicItem)

// update a economic item
// economicItemsRoute.put('/:id', updateEconomicItem)


module.exports = economicItemsRoute
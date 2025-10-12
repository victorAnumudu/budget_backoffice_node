const express = require('express')

const economicItemsRoute = express.Router()

const {getAllEconomicItems, getAnEconomicItem, addEconomicItem, deleteEconomicItem, updateEconomicItem} = require('../controllers/economicItems')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist


// add a economic item
economicItemsRoute.post('/add', addEconomicItem)

// get all economic items
economicItemsRoute.get('/all', getAllEconomicItems)

// get an economic item with the economic code
economicItemsRoute.post('/item', getAnEconomicItem)

// delete economic item by id
economicItemsRoute.post('/delete', deleteEconomicItem)

// update a economic item
economicItemsRoute.post('/update', updateEconomicItem)

// update a economic item
// economicItemsRoute.put('/:id', updateEconomicItem)


module.exports = economicItemsRoute
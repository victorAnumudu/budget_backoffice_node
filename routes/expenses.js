const express = require('express')

const expensesRoute = express.Router()

const {getAllExpenses, addExpense, deleteExpense, updateExpense} = require('../controllers/expenses')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist
const {expenseHasNoWarrantNumberThenProceed} = require('../middlewares/expenses') //middleware to expense warrant status


// add a expense
expensesRoute.post('/add', addExpense)

// get expense by id
expensesRoute.get('/all', getAllExpenses)

// delete expense by id
expensesRoute.post('/delete', validUserToken, isAdmin, expenseHasNoWarrantNumberThenProceed, deleteExpense)




// update a expense
expensesRoute.put('/:id', updateExpense)


module.exports = expensesRoute
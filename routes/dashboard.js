const express = require('express')

const dashboardRoute = express.Router()

const {getDashboardData, getDashboardSummaryData, getDashboardRightPanelData} = require('../controllers/dashboard')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist


// GET DASHBOARD DATA
dashboardRoute.get('/data', getDashboardData)

// GET DASHBOARD SUMMARY
dashboardRoute.get('/summary', getDashboardSummaryData)

// GET DASHBOARD RIGHT PANEL SUMMARY
dashboardRoute.get('/right-panel', getDashboardRightPanelData)


module.exports = dashboardRoute
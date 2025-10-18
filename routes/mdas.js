const express = require('express')

const mdasRoute = express.Router()

const multer = require('multer');

const {getAllMDAs, addMDA, uploadMDAFile, deleteMDA, updateMDA} = require('../controllers/mdas')

const {userDoesNotExistByEmail, userExistByEmail, validUserToken, isAdmin, userIsNotVerified} = require('../middlewares/users/userExist') //middleware to check if user already exist


// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });  // CAN BE PUT IN A SEPERATE FILE LATER and cREATE PATH IN INDEX PAGE


// add a expense
mdasRoute.post('/add', addMDA)

// get expense by id
mdasRoute.get('/all', getAllMDAs)

//
mdasRoute.post('/upload-mdas', upload.single('file'), uploadMDAFile)

// delete expense by id
mdasRoute.post('/delete', deleteMDA)




// update a expense
mdasRoute.put('/:id', updateMDA)


module.exports = mdasRoute
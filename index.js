const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const cors = require("cors");

const app = express()

// FOR WEB SOCKET
const {WebSocketServer} = require('ws')
const url = require('url');
// END OF WEB SOCKET

app.use(cors({credentials: true}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// ROUTES
const usersRoute = require('./routes/users');

//AUTHORS
// const authorsRoutes = require('./routes/authors')

//BOOKS ROUTE
// const booksRoutes = require('./routes/books')

const PORT = process.env.SERVER_PORT
const DB_URL = process.env.NODE_ENV == 'development' ? process.env.DB_URL : process.env.MONGODB_DEV

//connect to DATABASE
mongoose.connect(DB_URL).then((info)=>{
    console.log(`Connected to Database`)
}).catch((err)=>{
    console.log(err)
})

// app.use('/users', (req,res, next)=>{ // middleware to run for all the below routes
//     console.log('good')
//     next()
// })

app.get('/', (req, res)=>{
    res.status(200).json({status: 1, message:'Sucessful'})
})


// USERS ROUTES
app.use('/users', usersRoute)

// USERS ROUTES
// app.use('/authors', authorsRoutes)

// USERS ROUTES
// app.use('/books', booksRoutes)



// app.all(/^.*$/, (req, res)=>{
//     res.status(404).json({status: -1, message:'Resource Not Found', data:[{}]})
// })


const webSocketServer = app.listen(PORT, (err)=>{
    if(err){
        console.log(err) 
        return
    }
    console.log('SERVER CONNECTED')
})


// const wsServer = new WebSocketServer({webSocketServer})

// wsServer.on('connection', (connection, request)=>{
//     // console.log(url.parse(request.url, true).query.name)

//     // do this if any connection sends a message
//     connection.on('message', (mesData)=>{
//         console.log(JSON.parse(mesData.toString()))
//     })

//     // do this if any connection closes
//     connection.on('close', ()=>{

//     })
// })

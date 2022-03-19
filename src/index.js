const express = require('express')
require ('dotenv').config() 
const connectDB  = require('./db')

const users = require('./routes/users')



const app = express()
app.use(express.json()); // if I am not using it I will not have req.body


const start = async ()=> {
    try {
        await connectDB.connect(process.env.MONGO_URI)

        app.use('/users', users)
        app.listen(3001, () => console.log( process.env.MONGO_URI));
       
    } catch (error) {
        console.log(error)
    }
}

start()

import dotenv from 'dotenv'
dotenv.config()

import app from './src/app.js'
import connectDb from './src/config/db.js'

const PORT = process.env.PORT || 3000

const start = async ()=>{
    await connectDb()


    app.listen(PORT , ()=>{
        console.log(`HookLine API running on ${PORT}`)
    })

}

start()

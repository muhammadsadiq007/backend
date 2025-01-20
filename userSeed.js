import connectToDatabase from "./db/db.js"
import User from "./models/User.js" 
import crypto from 'crypto'

const userRegister = async() => {
    connectToDatabase()
    try {
        const hashPassword = ""
        const hashValue = crypto.createHash("sha256").update("admin").digest("hex")
        const newUser = new User({
            name: "Muhammad Sadiq",
            email: "ssadiq500@gmail.com",
            password: hashValue,
            role: "master"
        })
        await newUser.save()
    } catch (error) {
        console.log(error)
    }
}

userRegister()
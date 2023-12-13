const mongoose = require("mongoose")


const Userschema = new mongoose.Schema({
    email: String,
    otp: String,
})

const User = mongoose.model("User", Userschema)

module.exports = User;
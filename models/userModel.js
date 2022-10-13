const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
      referalCode: {
        type: String,
        //required: true,
        unique: true
    },
    referalPoint: {     //referalPoint : 100 referal point = 100 diamond
        type: Number,
        default: 0
    },
   
}, { timestamps: true })

module.exports = mongoose.model('user', userSchema)
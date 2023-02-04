const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a name"],
        maxlength:50,
    },
    // we can also validate weather the email is unique or not in controller also using find one
    email:{
        type:String,
        required:[true,"Please provide an email"],
        validate:{
            validator: validator.isEmail,
            message: "Please provide a valid email",
        },
        unique: true,
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength:6,
    },
    role:{
        type : String,
        enum : ["user","admin"],
        default:"user",
    }
});

// Just before saving to DB this will convert the password into hash and then save.The below one is hook
UserSchema.pre('save',async function(){
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password,salt);
})

// Instance method
UserSchema.methods.comparePasswords = function (userPassword){
    return bcrypt.compareSync(userPassword,this.password);
}

module.exports = mongoose.model('Users',UserSchema);
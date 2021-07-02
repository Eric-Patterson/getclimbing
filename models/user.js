const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


// https://github.com/saintedlama/passport-local-mongoose
// You're free to define your User how you like. Passport-Local Mongoose will add a username, 
// hash and salt field to store the username, the hashed password and the salt value.


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // this is not considered a validation, it sets up an index
    }
})

// pass in the required packaged that we installed to UserSchema.plugin
// this will addon a username, field for password, make sure they are unique, not duplicated
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
    const mongoose = require("mongoose");

    let userSchema = new mongoose.Schema({
        Fname: String,
        Lname:String,
        mobile:String,
        email: String,
        username: String,
        password: String,
        profession: String,
        image: {
            data: Buffer,
            contentType: String,
        },
        bio: String,
        language: [{
            languageName:String,
            topics:[{
                topicName:String,
                questions:[{q:String,a:String},{q:String,a:String},{q:String,a:String}],
                complete:Boolean
            }]
        }]
    });

    module.exports = mongoose.model("users", userSchema);

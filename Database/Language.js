const mongoose = require("mongoose");

let languageSchema = new mongoose.Schema({
    name: String,
    image:String,
    description:String
});

module.exports = mongoose.model("languages", languageSchema);

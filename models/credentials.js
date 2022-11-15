const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const credentialsSchema = new Schema({
    templateId: { type: String},
}, {
    timestamps: true,
});
const Certificate = mongoose.model('Credentials', credentialsSchema);
module.exports = Certificate;

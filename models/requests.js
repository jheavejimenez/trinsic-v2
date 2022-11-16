const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const requests = new Schema({
    email: { type: String, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    descriptions: { type: String, required: true },
    orgName: { type: String, required: true },

}, {
    timestamps: true,
});
const Requests = mongoose.model('Requests', requests);
module.exports = Requests;

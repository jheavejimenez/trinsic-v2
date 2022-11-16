const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const request = new Schema({
    email: { type: String, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    descriptions: { type: String, required: true },
    orgName: { type: String, required: true },

}, {
    timestamps: true,
});
const Requests = mongoose.model('Requests', request);
module.exports = Requests;

const { IssueFromTemplateRequest, LoginRequest } = require("@trinsic/trinsic");
const router = require('express').Router();
let Requests = require('../models/requests');
const User = require("../models/users");
require('dotenv').config();

router.route('/').get(async (req, res) => {
    const requests = await requests.find();
    res.json(requests);
}).post(async (req, res) => {
    const {
        email,
        title,
        name,
        descriptions,
        orgname
    } = req.body;

    // save request to mongodb
    const request = new Requests({
        email,
        title,
        name,
        descriptions,
        orgName
    });

    request.save()
        .then(() => res.json(request))
        .catch(err => res.status(500).json(`error ${err}`));

});

router.route('/:id/issue').put(async (req, res) => {
    // create trinsic account
    
})
module.exports = router;

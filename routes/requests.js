const { IssueFromTemplateRequest, LoginRequest, TrinsicService, EcosystemInfoRequest, InsertItemRequest } = require("@trinsic/trinsic");
const router = require('express').Router();
let Requests = require('../models/requests');
const User = require("../models/users");
const trinsic = new TrinsicService();

async function getEcoSystemId() {
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    const infoResponse = await trinsic
        .provider()
        .ecosystemInfo(EcosystemInfoRequest.fromPartial({}));

    const ecosystem = infoResponse.ecosystem;

    return ecosystem?.id;
}

async function loginAnonymous({ email }) {
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    const walletAuth = await trinsic.account().loginAnonymous(await getEcoSystemId());
    const newUser = new User({ email, walletAuth });
    await newUser.save();
}

async function issueCredential({ templateId, valuesJson }) {
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    const issueResponse = await trinsic.credential().issueFromTemplate(
        IssueFromTemplateRequest.fromPartial({
            templateId,
            valuesJson
        })
    );

    return issueResponse.documentJson
}

async function storeCredential(itemJson) {
    // get the user's wallet auth
    const insertResponse = await trinsic.wallet().insertItem(
        InsertItemRequest.fromPartial({ itemJson })
    );
}

router.route('/').get(async (req, res) => {
    const requests = await requests.find();
    res.json(requests);
}).post(async (req, res) => {
    const {
        email,
        title,
        name,
        descriptions,
        orgName
    } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
        await loginAnonymous({ email });
    }
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
    const credentialValues = JSON.stringify({
        firstName: "Allison",
        lastName: "Allisonne",
        batchNumber: "123454321",
        countryOfVaccination: "US",
    });

})

module.exports = router;

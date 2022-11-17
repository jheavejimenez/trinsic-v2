const {
    IssueFromTemplateRequest,
    TrinsicService,
    EcosystemInfoRequest,
    InsertItemRequest, CreateProofRequest
} = require("@trinsic/trinsic");
const router = require('express').Router();
let Requests = require('../models/requests');
let User = require("../models/users");
let Credential = require('../models/credentials');
const { json } = require("express");
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

async function issueCredential(valuesJson) {
    const credentialSchema = await Credential.find();
    console.log(JSON.stringify(credentialSchema[0]))
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    const issueResponse = await trinsic.credential().issueFromTemplate(
        IssueFromTemplateRequest.fromPartial({
            templateId: credentialSchema[0].templateId,
            valuesJson
        })
    );

    return issueResponse.documentJson
}

async function storeAndShareCredential(itemJson, email) {
    // get the user's wallet auth
    const user = await User.findOne({ email });

    // set the wallet auth token
    trinsic.options.authToken = user.walletAuth;

    // store the credential to the user's wallet
    const insertResponse = await trinsic.wallet().insertItem(
        InsertItemRequest.fromPartial({ itemJson })
    );

    const proofResponse = await trinsic.credential().createProof(
        CreateProofRequest.fromPartial({
            itemId: insertResponse.itemId,
        })
    );

    return proofResponse.proofDocumentJsonn;
}

router.route('/').get(async (req, res) => {
    const requests = await Requests.find();
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
        name: req.body.name,
        descriptions: req.body.descriptions,
        organizationName: req.body.orgName
    });

    const itemJson = await issueCredential(credentialValues);
    const proofDocumentJson = await storeAndShareCredential(itemJson, req.body.email);
    try {
        await Requests.updateOne({ _id: req.params.id }, { $set: { proofDocumentJson } });
        res.json({ proofDocumentJson });
    }
    catch (err) {
        res.status(500).json(`error ${err}`);
    }
});


module.exports = router;

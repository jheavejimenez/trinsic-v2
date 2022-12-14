const {
    IssueFromTemplateRequest,
    TrinsicService,
    EcosystemInfoRequest,
    InsertItemRequest, CreateProofRequest, UpdateStatusRequest, CheckStatusRequest
} = require("@trinsic/trinsic");
const router = require('express').Router();
let Requests = require('../models/requests');
let User = require("../models/users");
let Credential = require('../models/credentials');
const trinsic = new TrinsicService();

// this function is used to get the ecosystem id of Xperto
async function getEcoSystemId() {
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    const infoResponse = await trinsic
        .provider()
        .ecosystemInfo(EcosystemInfoRequest.fromPartial({}));

    const ecosystem = infoResponse.ecosystem;

    return ecosystem?.id;
}

// This code is for dev environment only
async function loginAnonymous({ email }) {
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    const walletAuth = await trinsic.account()
        .loginAnonymous(await getEcoSystemId()); // you can change it to get the ecosystem id of Xperto using env

    const newUser = new User({ email, walletAuth });
    await newUser.save();
}

async function issueCredential(valuesJson) {
    // find the template id of the credentials schema
    // you can also get the template id using org id
    const credentialSchema = await Credential.find();

    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    // issue the credential and generate the credential json
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

    return proofResponse.proofDocumentJson;
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

    /***
     you can uncomment this code if you are testing it dev environment

     const user = await User.findOne({ email: email });
     if (!user) {
         await loginAnonymous({ email });
     }

    ***/
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
        const updated = await Requests.findByIdAndUpdate(req.params.id, { proofDocumentJson }, { new: true });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json(`error ${err}`);
    }
});

router.route('/revoke').put(async (req, res) => {
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");
    let updateStatusResponse = await trinsic.credential().updateStatus(UpdateStatusRequest.fromPartial({
        credentialStatusId: req.body.credentialId,
        revoked: true
    }));
    res.json(updateStatusResponse)
});

router.route('/check-revocation-status').get(async (req, res) => {
    trinsic.setAuthToken(process.env.AUTHTOKEN);
    let checkStatusResponse = await trinsic.credential().checkStatus(CheckStatusRequest.fromPartial({
        credentialStatusId: decodeURIComponent(req.query.credentialId)
    }));
    res.json(checkStatusResponse);
})

module.exports = router;

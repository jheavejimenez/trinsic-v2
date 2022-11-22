const {
    TrinsicService,
    VerifyProofRequest
} = require("@trinsic/trinsic");
const router = require('express').Router();
let Requests = require('../models/requests');
const trinsic = new TrinsicService();

async function verifyCredential(proofDocumentJson) {
    trinsic.options.authToken = process.env.AUTHTOKEN || "";
    return await trinsic.credential().verifyProof(
        VerifyProofRequest.fromPartial({
            proofDocumentJson: proofDocumentJson,
        })
    );
}

router.route('/').get(async (req, res) => {
    try {
        const requests = await Requests.findById(req.query.id);
        const verifyResponse = await verifyCredential(requests.proofDocumentJson);
        res.json(verifyResponse);
    } catch (err) {
        res.status(500).json(`error ${err}`);
    }
});

module.exports = router;

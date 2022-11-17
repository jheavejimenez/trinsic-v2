import { TrinsicService, VerifyProofRequest } from "@trinsic/trinsic";
const router = require('express').Router();
let Requests = require('../models/requests');
const trinsic = new TrinsicService();

async function verifyCredential(proofDocumentJson) {
    trinsic.options.authToken = process.env.AUTHTOKEN || "";
    const verifyResponse = await trinsic.credential().verifyProof(
        VerifyProofRequest.fromPartial({
            proofDocumentJson: proofDocumentJson,
        })
    );
    return verifyResponse;
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

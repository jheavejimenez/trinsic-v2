const { TrinsicService, EcosystemInfoRequest, IssueFromTemplateRequest } = require("@trinsic/trinsic");
const router = require('express').Router();
require('dotenv').config();



router.route('/').get(async (req, res) => {
    res.send(`Express + TypeScript Server id=${await getEcoSystemId()}`);
}).post(async (req, res) => {
    trinsic.options.authToken = process.env.AUTHTOKEN
    const credentialValues = JSON.stringify({
        firstName: "Allison",
        lastName: "Allisonne",
        batchNumber: "123454321",
        countryOfVaccination: "US",
    });

    const issueResponse = await trinsic.credential().issueFromTemplate(
        IssueFromTemplateRequest.fromPartial({
            templateId: template.id,
            valuesJson: credentialValues,
        })
    );
});

router.route('/:id').put(async (req, res) => {
    // code here
}).delete(async (req, res) => {
    // code here
});

module.exports = router;

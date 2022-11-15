const router = require('express').Router();
let Credential = require('../models/credentials');
const {
    CreateCredentialTemplateRequest,
    TrinsicService
} = require("@trinsic/trinsic");

async function CreateCredentialSchemas({ title, name, descriptions, orgName }) {
    const trinsic = new TrinsicService();

    // issuer auth token
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    let request = CreateCredentialTemplateRequest.fromPartial({
        name: `${title}`,
        fields: {
            name,
            descriptions,
            organizationName: orgName
        },
    });

    const response = await trinsic.template().create(request);
    return response.data.id;
}

router.route('/').get(async (req, res) => {
    const credentials = await Credential.find();
    res.json(credentials);
}).post(async (req, res) => {
    const { title, name, descriptions, orgName } = req.body;

    // Create Credential Schemas in Trinsic
    const id = await CreateCredentialSchemas({ title, name, descriptions, orgName });

    // save template id to mongodb
    const newCredential = new Credential({templateId: id});
    newCredential.save().then(() => res.json(newCredential)).catch(err => res.status(500).json(`error ${err}`));
});

module.exports = router;

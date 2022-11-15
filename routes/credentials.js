const router = require('express').Router();
const { IssueFromTemplateRequest, CreateCredentialTemplateRequest, TrinsicService } = require("@trinsic/trinsic");

async function CreateCredentialSchemas({ title, name, descriptions, orgName }) {
    const trinsic = new TrinsicService();

    let request = CreateCredentialTemplateRequest.fromPartial({
        name: `${title}`,
        fields: {
            name,
            descriptions,
            organizationName: orgName
        },
    });

    const response = await trinsic.template().create(request);
    return response.data;
}

router.route('/').get(async (req, res) => {
    // TODO: get template id base on org id
}).post(async (req, res) => {
    const { title, name, descriptions, orgName } = req.body;
    const templateId = await CreateCredentialSchemas({ title, name, descriptions, orgName });
});

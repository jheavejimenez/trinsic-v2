const router = require('express').Router();
let Credential = require('../models/credentials');
const {
    CreateCredentialTemplateRequest,
    TrinsicService
} = require("@trinsic/trinsic");
const crypto = require('crypto');

const alphabet = '26T198340PX75JACKVERYMINDBUSHWOLFGQZ'

// `crypto.randomFill()` is a little faster than `crypto.randomBytes()`,
let random = bytes => new Promise((res, rej) => {
    crypto.randomFill(new Uint8Array(bytes), (err, buf) => {
        if (err) return rej(err);
        res(buf);
    });
});

let customID = (defaultSize = 10) => {
    return random(defaultSize).then(buf => {
        let result = '';
        for (let i = 0; i < buf.length; i++) {
            result += alphabet[buf[i] % alphabet.length];
        }
        return result;
    });
}
async function checkCustomId() {
    const size = 1000000;
    const set = new Set(new Array(size)
        .fill(0)
        .map(() => customID()))

    return (
        size === set.size ? 'all ids are unique' : `not unique records ${size - set.size}`
    )

}

const generateCustomAlphabet = async () => {
    let count = 0;
    let arr = [];
    while (count < 10) {
        let a = await customID();
        if (!arr.includes(a)) {
            arr.push(a);
            count++;
        }
    }
    return arr;
}


async function CreateCredentialSchemas({ title, name, descriptions, orgName }) {
    const trinsic = new TrinsicService();

    // issuer auth token
    trinsic.setAuthToken(process.env.AUTHTOKEN || "");

    let request = CreateCredentialTemplateRequest.fromPartial({
        name: `${title}-${await customID()}`,
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
    const newCredential = new Credential({ templateId: id });
    newCredential.save().then(() => res.json(newCredential)).catch(err => res.status(500).json(`error ${err}`));
});

router.route('/check').get(async (req, res) => {
    const id = await checkCustomId();
    res.json(id);
});

module.exports = router;

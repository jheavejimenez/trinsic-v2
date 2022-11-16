const { IssueFromTemplateRequest, LoginRequest } = require("@trinsic/trinsic");
const router = require('express').Router();
require('dotenv').config();

async function loginOrCreateAccount(email) {
    const loginResponse = await trinsic.account().login(
        LoginRequest.fromPartial({ email })
    );

    if (loginResponse.challenge) {
        // Account already exists
        console.log(loginResponse)

        console.log(!loginResponse.challenge)
    }
    return loginResponse.challenge;
}

async function confirmLoginOrCreateAccount(authCode, challenge) {
    const authToken = await trinsic.account()
        .loginConfirm(challenge, authCode);

    console.log(authToken)
    return authToken;
}

router.route('/').get(async (req, res) => {
}).post(async (req, res) => {

});

router.route('/:id/issue').put(async (req, res) => {
    // create trinsic account
    
}).delete(async (req, res) => {
    // code here
});

module.exports = router;

const { LoginRequest, TrinsicService } = require("@trinsic/trinsic");
const router = require('express').Router();
const User = require("../models/users");
require('dotenv').config();

const trinsic = new TrinsicService();
trinsic.setAuthToken(process.env.AUTHTOKEN || "");

async function loginOrCreateAccount(email) {
    const loginResponse = await trinsic.account().login(
        LoginRequest.fromPartial({ email })
    );

    return loginResponse.challenge;
}

async function confirmLoginOrCreateAccount(challenge, authCode) {
    return await trinsic.account().loginConfirm(challenge, authCode);
}

router.route('/').get(async (req, res) => {
    try {
        const users = await User.findOne({ email: req.query.email });

        trinsic.options.authToken = users.walletAuth;
        let items = await trinsic.wallet().searchWallet();
        res.json(items);
    } catch (err) {
        res.status(500).json(`error ${err}`);
    }
});

router.route('/create-account').post(async (req, res) => {
    const { email } = req.body;
    const challenge = await loginOrCreateAccount(email);
    const user = await User.findOne({ email: email });

    // check if user not exist
    if (!user) {
        const newUser = new User({email});
        await newUser.save();
    }
    res.json(challenge);
});

router.route('/confirm-account').put(async (req, res) => {
    const { email, challenge, authCode  } = req.body;
    const authToken = await confirmLoginOrCreateAccount(challenge, authCode)

    // put the auth token to user
    const user = await User.findOne({ email });
    user.walletAuth = authToken;
    await user.save();

    res.json(user);
});

module.exports = router;

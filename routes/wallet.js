const { LoginRequest } = require("@trinsic/trinsic");
const router = require('express').Router();
const User = require("../models/users");

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

router.route('/create-account').post(async (req, res) => {
    const { email } = req.body;
    const challenge = await loginOrCreateAccount(email);
    const user = await User.findOne({ email: email });

    // check if user not exist
    if (!user) {
        const newUser = new User(email);
        await newUser.save();
        res.json(newUser);
    }
    res.json(challenge);
});

router.route('/confirm-account').put(async (req, res) => {
    const { email, authCode, challenge } = req.body;
    const authToken = await confirmLoginOrCreateAccount(challenge, authCode);

    // put the auth token to user
    const user = await User.findOne({ email });
    user.walletAuth = authToken;
    await user.save();

    res.json(user);
});

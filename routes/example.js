const router = require('express').Router();


router.route('/').get(async (req, res) => {
    res.status(200).send({
        "example": "test"
    })
}).post(async (req, res) => {
    // code here
});

router.route('/:id').put(async (req, res) => {
    // code here
}).delete(async (req, res) => {
    // code here
});

module.exports = router;

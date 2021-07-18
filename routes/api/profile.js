const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
// const User = require('../../models/User');

//@route    GET api/profile/me
//@desc     Get current user's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try{
        //Check if the profile is available for the current user
        const profile = await Profile.findOne({ user : req.user.id }).populate('user', ['name', 'avatar']);

        // If not, send message
        if(!profile){
            return res.status(400).json({ msg : 'There is no profile for this user' });
        }
        
        // If yes, send profile
        res.json(profile);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
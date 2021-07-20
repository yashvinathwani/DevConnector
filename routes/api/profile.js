const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    GET api/profile/me
//@desc     Get current user's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try{
        // Check if the profile is available for the current user
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


//@route    POST api/profile
//@desc     Create or update user profile
//@access   Private
router.post('/', [ auth, [
    // status and skills are required fields
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills are required').not().isEmpty()
] ], async (req, res) => {

        // Check if there is any error in the required fields
        const errors = validationResult(req);

        // If yes, then display the errors
        if(!errors.isEmpty()){
            return res.status(400).json({ errors : errors.array() });
        }

        // If not, then get data from the request body
        const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;

        // Build profileFields object to save the data from request
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build social object in profileFields
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(facebook) profileFields.social.facebook = facebook;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(instagram) profileFields.social.instagram = instagram;

        // Use try catch block to create or update the profile
        try{
            // Check if profile already exists
            let profile = await Profile.findOne({ user : req.user.id });

            // If it exist, then UPDATE it
            if(profile){
                //Update
                profile = await Profile.findOneAndUpdate( { user : req.user.id }, { $set : profileFields }, { new : true } );

                // Return the updated profile
                return res.json(profile);
            }

            // If it does not exist, then CREATE a new profile
            profile = new Profile(profileFields);

            // Save the profile
            await profile.save();

            // Return the new created profile
            res.json(profile);
        }
        catch(err){
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);


//@route    GET api/profile
//@desc     Get all profiles
//@access   Public
router.get('/', async (req, res) => {
    try {
        // Get all the profiles and also their name and avatar from user model
        const profiles = await Profile.find().populate('user', [ 'name', 'avatar' ]);

        // Display the profiles
        res.json(profiles);
    } 
    catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    GET api/profile/user/:user_id
//@desc     Get profile by user ID
//@access   Public
router.get('/user/:user_id', async (req, res) => {
    try {
        // Check if the profile exist
        const profile = await Profile.findOne({ user : req.params.user_id }).populate('user', [ 'name', 'avatar' ]);

        // If not, then send msg
        if(!profile){
            return res.status(400).json({ msg : 'Profile not found' });
        }

        // Else send the profile
        res.json(profile);
    } 
    catch (err) {
        console.log(err.message);

        // If user enters an invalid ID(too long or too short)
        if(err.kind == 'ObjectId')
            return res.status(400).json({ msg : 'Profile not found' });
        
        // For any other kind of error
        res.status(500).send('Server Error');
    }
});


//@route    DELETE api/profile
//@desc     Delete profile, user and posts
//@access   Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - delete user's posts

        // Delete profile
        await Profile.findOneAndRemove({ user : req.user.id });

        // Delete user
        await User.findOneAndRemove({ _id : req.user.id });

        // Display the message
        res.json({ msg : 'Deletion successful' });
    } 
    catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    PUT api/profile/experience
//@desc     Add profile experience
//@access   Private
router.put('/experience', [ auth, [
    // Check if valid fields are available or not
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
] ], async(req, res) => {

    // Check for validation errors
    const errors = validationResult(req);

    // If error, then send the errors array
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array() });
    }

    // If not, then get the data from the request
    const { title, company, location, from, to, current, description } = req.body;

    // Create new object with the data from request
    const newExp = { title, company, location, from, to, current, description };

    try{
        // Find the profile
        const profile = await Profile.findOne({ user : req.user.id });

        // Add new experience at the start of the array
        profile.experience.unshift(newExp);

        // save the profile
        await profile.save();

        // Return entire profile
        res.json(profile);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
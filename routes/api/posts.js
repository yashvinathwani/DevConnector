const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

//@route    POST api/posts
//@desc     Create a post
//@access   Private
router.post('/', [auth, [
    // Check if the required fields are added or not
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

    // save validation results
    const errors = validationResult(req);

    // If error send error array
    if(!errors.isEmpty())
        return res.status(400).json({ errors : errors.array() });

    try{
        // Find the user
        const user = await User.findById(req.user.id).select('-password');

        // Create a new post
        const newPost = new Post({ text : req.body.text, name : user.name, avatar : user.avatar, user : req.user.id });

        // Save the post
        const post = await newPost.save();

        // Send the post back
        res.json(post);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
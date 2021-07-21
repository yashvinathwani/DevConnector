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


//@route    GET api/posts
//@desc     Get all posts
//@access   Private
router.get('/', auth, async (req, res) => {
    try{
        // Get post in asc order, for desc do 1
        const posts = await Post.find().sort({ date : -1 });

        // If there are no posts send msg
        if(!posts)
            return res.status(404).json({ msg : 'There is no post in the feed' });

        // Else send all the posts(Newest first)
        res.json(posts);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    GET api/posts/:id
//@desc     Get post by id
//@access   Private
router.get('/:id', auth, async (req, res) => {
    try{
        // Find the post by id
        const post = await Post.findById(req.params.id);

        // If not found, then send msg
        if(!post)
            return res.status(404).json({ msg : 'Post not found' });

        // Else send post
        res.json(post);
    }
    catch(err){
        console.log(err.message);

        // If id is not proper send msg
        if(err.kind === 'ObjectId')
            return res.status(404).json({ msg : 'Post not found' });
        
        res.status(500).send('Server Error');
    }
});


//@route    DELETE api/posts/:id
//@desc     Delete a post
//@access   Private
router.delete('/:id', auth, async (req, res) => {
    try{
        // Find the post by id
        const post = await Post.findById(req.params.id);

        // If not found, then send msg
        if(!post)
        return res.status(404).json({ msg : 'Post not found' });

        // Check user to see if the user who wants to delete the post owns the post or not
        // If not, then send msg
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ msg : 'User not authorized' });
        }

        // Else, delete the post
        await post.remove();

        res.json({ msg : 'Post removed' });
    }
    catch(err){
        console.log(err.message);

        // If id is not proper send msg
        if(err.kind === 'ObjectId')
            return res.status(404).json({ msg : 'Post not found' });
        
        res.status(500).send('Server Error');
    }
});


//@route    PUT api/posts/like/:id
//@desc     Like a post
//@access   Private
router.put('/like/:id', auth, async (req, res) => {
    try{
        // Find the post by id
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        // If yes, then send msg
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ msg : 'Post already liked' });
        }

        // if (post.likes.some((like) => like.user.toString() === req.user.id)) {
        //     return res.status(400).json({ msg: 'Post already liked' });
        //   }

        // If no, then add like
        post.likes.unshift({ user : req.user.id });

        // Save the post
        await post.save();

        // Send back the post
        res.json(post.likes);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    PUT api/posts/unlike/:id
//@desc     Unlike a post
//@access   Private
router.put('/unlike/:id', auth, async (req, res) => {
    try{
        // Find post by id
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        // If no, then send the msg
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ msg : 'Post has not yet been liked' });
        }

        // if (post.likes.some((like) => like.user.toString() === req.user.id)) {
        //     return res.status(400).json({ msg: 'Post already liked' });
        //   }

        // If yes, then...
        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        // Remove the like
        post.likes.splice(removeIndex, 1);

        // Save the post
        await post.save();

        // Send back the post
        res.json(post.likes);
    }
    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
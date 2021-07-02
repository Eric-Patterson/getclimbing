const {gymSchema, reviewSchema} = require('./schemas.js')
const ExpressError = require('./utils/ExpressError');
const Gym = require('./models/gyms')
const Review = require('./models/review')

    module.exports.isLoggedIn = (req, res, next) =>{
        // req.user is from passport. it will be filled in with the deserialized information from the session
        // console.log('REQ.USER....', req.user);

    // isAuthenticated is coming from passport
    // if you are NOT authenticated
    if(!req.isAuthenticated()){
        // redirect the user back to the page they were trying to login to, rather than a static landing page
        // returnTo = variable, req.originalUrl shows url of the path that is being loaded
        req.session.returnTo = req.originalUrl;

        req.flash('error', 'You must be signed in first!');
        // we have to return the bottom otherwise the res.render still runs and causes errors
        return res.redirect('/login');
    }
    next();
    }
    

  module.exports.validateGym = (req, res, next) =>{

        // the schema logic is in schemas.js
    
        const {error} = gymSchema.validate(req.body)
        if(error){
            // details is an object array, we map them and then join the new formed arrays onto a string, spacing them with a ,
            const msg = error.details.map(el => el.message).join(',')
            // if there is an error, we will throw it and it will have something passed on into expresserror() - this will be thrown to the error handling middleware
            throw new ExpressError(msg, 400)
        } else{
            next();
        }
       
    
    }
module.exports.isAuthor = async(req, res, next) =>{
        // take id from url, use the, lookup camground with that id.
        // use the id thats logged in right now, to see if it = the authors id | if not flash and redirect to show page
        const {id} = req.params; 
        const gym = await Gym.findById(id);
        // if the current logged in user does not own this gym, flash a message
        if(!gym.author.equals(req.user._id)){
            req.flash('error', 'You do not have permission to do that!')
            // redirect back to the id/page of origin
            return res.redirect(`/gyms/${id}`)
        }
        next();
    
    }


    // this is to protect against ajax/postman delete requests on reviews
    module.exports.isReviewAuthor = async(req, res, next) =>{
        const {id, reviewId} = req.params; 
        const review = await Review.findById(reviewId);
        if(!review.author.equals(req.user._id)){
            req.flash('error', 'You do not have permission to do that!')
            return res.redirect(`/gyms/${id}`)
        }
        next();
    
    }

    // middleware
module.exports.validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}
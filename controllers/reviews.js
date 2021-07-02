const Gym = require('../models/gyms');
const Review = require('../models/review');

// creating a review
module.exports.createReview = async(req,res) =>{
    const gym = await Gym.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    gym.reviews.push(review);
    await review.save();
    await gym.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/gyms/${gym._id}`);
}

module.exports.deleteReview = async(req,res) =>{
    const {id, reviewId} = req.params;
    // $pull operator removes from an existing array all instances of a value or values that match a specified condition
    await Gym.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/gyms/${id}`);
}
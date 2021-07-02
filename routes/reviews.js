const express = require('express');
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const Gym = require('../models/gyms');
const Review = require('../models/review');
// ======== REQUIRING CONTROLLER ===========
const reviews = require('../controllers/reviews')

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// make new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;
const express = require('express');
const router = express.Router({mergeParams:true});

const ExpressError = require('../utils/ExpressError');
const Joi = require('joi');
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

const validateReview = (request, response, next) => {
    const reviewSchema = Joi.object({
        review: Joi.object({
            body: Joi.string().required(),
            rating: Joi.number().required(),
        }).required()
    })
    const { error } = reviewSchema.validate(request.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

router.post('/',validateReview, catchAsync( async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    response.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewID', catchAsync(async (request, response) => {
    const {id, reviewID} = request.params;
    await Campground.findByIdAndUpdate(id, { $pull : { reviews : reviewID}});
    await Review.findByIdAndDelete(reviewID);
    response.redirect(`/campgrounds/${id}`)
}))

module.exports = router;
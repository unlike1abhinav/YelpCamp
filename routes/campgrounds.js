const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Joi = require('joi');
const Campground = require('../models/campground');

const validateCampground = (request, response, next) => {
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })
    const { error } = campgroundSchema.validate(request.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

router.get('/', catchAsync(async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
}))

router.get('/new', (request, response) => {
    response.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (request, response, next) => {
    // if(!request.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(request.body.campground);
    await newCampground.save();
    request.flash('success', 'Successfully made a new campground');
    response.redirect(`/campgrounds/${newCampground._id}`)
}))

router.get('/:id', catchAsync(async (request, respone) => {
    const { id } = request.params;
    const foundcampground = await Campground.findById(id).populate('reviews');
    respone.render('campgrounds/show', { foundcampground })
}))

router.get('/:id/edit', catchAsync(async (request, response) => {
    const { id } = request.params;
    const editcampground = await Campground.findById(id);
    response.render('campgrounds/edit', { editcampground })
}))

router.put('/:id',validateCampground, catchAsync(async (request, response) => {
    const { id } = request.params;
    const updatedcampground = await Campground.findByIdAndUpdate(id, { ...request.body.campground }, { runValidators: true, new: true });
    response.redirect(`/campgrounds/${updatedcampground._id}`)
}))

router.delete('/:id', catchAsync(async (request, response) => {
    const { id } = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect('/campgrounds')
}))

module.exports = router;
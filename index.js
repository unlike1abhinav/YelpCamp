const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

mongoose.connect('mongodb://127.0.0.1:27017/yelpCampground')
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(() => {
        console.log("Mongo Error")
    })

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

const validateReview = (request, response, next) => {
    const reviewSchema = Joi.object({
        review: Joi.object({
            body: Joi.string().required(),
            rating: Joi.number().required().min(0),
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


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (request, response) => {
    response.render('home')
})

app.get('/campgrounds', catchAsync(async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
}))

app.get('/campgrounds/new', (request, response) => {
    response.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (request, response, next) => {
    // if(!request.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(request.body.campground);
    await newCampground.save();
    response.redirect(`/campgrounds/${newCampground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (request, respone) => {
    const { id } = request.params;
    const foundcampground = await Campground.findById(id).populate('reviews');
    respone.render('campgrounds/show', { foundcampground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (request, response) => {
    const { id } = request.params;
    const editcampground = await Campground.findById(id);
    response.render('campgrounds/edit', { editcampground })
}))

app.put('/campgrounds/:id',validateCampground, catchAsync(async (request, response) => {
    const { id } = request.params;
    const updatedcampground = await Campground.findByIdAndUpdate(id, { ...request.body.campground }, { runValidators: true, new: true });
    response.redirect(`/campgrounds/${updatedcampground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (request, response) => {
    const { id } = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews',validateReview, catchAsync( async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    response.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewID', catchAsync(async (request, response) => {
    const {id, reviewID} = request.params;
    await Campground.findByIdAndUpdate(id, { $pull : { reviews : reviewID}});
    await Review.findByIdAndDelete(reviewID);
    response.redirect(`/campgrounds/${id}`)
}))

app.all('*', (request, response, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((error, request, response, next) => {
    const { statusCode = 500 } = error;
    if (!error.message) error.message = 'Oh No, You Got An Error'
    response.status(statusCode).render('campgrounds/error', { error })
})

app.listen(8080, () => {
    console.log('Listen On 8080')
})
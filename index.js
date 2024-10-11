const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');

const Campground = require('./models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(() => {
        console.log("Mongo Error")
    })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))

app.get('/', (request, response) => {
    response.render('home')
})

app.get('/campgrounds', async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
})

app.get('/campgrounds/new', (request, response) => {
    response.render('campgrounds/new')
})

app.post('/campgrounds', async (request, response) => {
    const newCampground = new Campground(request.body.campground);
    await newCampground.save();
    response.redirect(`/campgrounds/${newCampground._id}`)
})

app.get('/campgrounds/:id', async (request, respone) => {
    const {id} = request.params;
    const foundcampground = await Campground.findById(id);
    respone.render('campgrounds/show', {foundcampground})
})

app.get('/campgrounds/:id/edit', async (request, response) => {
    const { id } = request.params;
    const editcampground = await Campground.findById(id);
    response.render('campgrounds/edit', {editcampground })
})

app.put('/campgrounds/:id', async (request, response) => {
    const { id } = request.params;
    const updatedcampground = await Campground.findByIdAndUpdate(id, {...request.body.campground}, { runValidators: true, new: true });
    response.redirect(`/campgrounds/${updatedcampground._id}`)
})

app.delete('/campgrounds/:id', async (request,response) => {
    const {id} = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect('/campgrounds')
})

app.listen(8080, () => {
    console.log('Listen On 8080')
})
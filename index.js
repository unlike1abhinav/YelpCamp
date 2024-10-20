const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError')
const mongoose = require("mongoose");
const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')

mongoose.connect('mongodb://127.0.0.1:27017/yelpCampground')
    .then(() => {
        console.log("Mongo Connection Open")
    })
    .catch(() => {
        console.log("Mongo Error")
    })

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (request, response) => {
    response.render('home')
})

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly : true,
        expires: Date.now() + 1000*60*60*24*7,
        maxage : 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use((request, response, next) => {
    response.locals.success = request.flash('success');
    response.locals.error = request.flash('error');
    next()
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use(express.static(path.join(__dirname, 'public')));

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
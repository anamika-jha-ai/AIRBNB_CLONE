
require('dotenv').config();
// console.log(process.env.SECRET);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const { get } = require('http');
const methodOverride = require('method-override');
const MONGO_URL = 'mongodb://localhost:27017/AIRBNB';
const ejsMate = require('ejs-mate');
const { listingSchema, reviewSchema } = require('./schema.js');
const Review = require('./models/review.js');
const listings = require('./routes/listing.js');
const session = require('express-session'); 
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./routes/user.js');


const wrapAsync = fn => {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
};

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const sessionOptions = {
    secret: 'thissecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// app.use((req, res, next) => {
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// });

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

app.use('/', userRoutes);

// app.get('/fakeUser', async (req, res) => {
//     let fakeUser = new User({ email: 'test@example.com', username: 'testuser' });
//     // const user = new User({ email: 'test@example.com' });
//     // await user.setPassword('password');
//     // await user.save();
//     // res.send('Fake user created');
// let registeredUser = await User.register(fakeUser, 'password');
// res.send(registeredUser);
// });

app.use('/listings', listings);


main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

app.get('/', (req, res) => {
    res.redirect('/listings');
});
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new Error(msg);
    } else {
        next();
    }
};




app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    // res.status(status).send(message);
    res.render('listings/error.ejs', { err });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});

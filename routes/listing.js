const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Review = require('../models/review');
const { reviewSchema } = require('../schema');
const { isLoggedIn, validateReviews, isReviewAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new Error(msg);
    } else {
        next();
    }
};


// INDEX ROUTE
router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { listings: allListings });
}));

// New listing form
router.get('/new', isLoggedIn, (req, res) => {

    //transfered to loggedIn middleware
    // console.log(req.user);
    // if (!req.isAuthenticated()) {

    //     req.flash('error', 'You must be signed in to create a listing!');
    //     return res.redirect('/login');
    // }
    res.render('listings/new.ejs');
   
});

// Show single listing

// router.get('/:id', wrapAsync(async (req, res) => {
//     const { id } = req.params;
//     console.log('Requested listing ID:', id);
//     const listing = await Listing.findById(id);
//     console.log('Listing found:', listing);
//     res.render('listings/show.ejs', { listing });
// }));
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log('Show route - Requested listing ID:', id);
    let listing;
    try {
        listing = await Listing.findById(id).populate('reviews').populate('owner');
        console.log('Show route - Listing found:', listing);
    } catch (err) {
        console.error('Show route - Error in findById:', err);
        return res.render('listings/error.ejs', { err: { message: "OOPS! You've entered an invalid listing (DB error)." } });
    }
    if (!listing) {
        return res.render('listings/error.ejs', { err: { message: "OOPS! You've entered an invalid listing." } });
    }
    // Fix image field for EJS rendering
    if (listing.image && typeof listing.image === 'object' && listing.image.url) {
        listing.image = listing.image.url;
    }
    res.render('listings/show.ejs', { listing });
}));

// Create listing
router.post('/', isLoggedIn, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the currently logged-in user
    await newListing.save();
    req.flash('success', 'Listing created successfully!');
    res.redirect('/listings');
}));

// Update listing
router.put('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
}));

// Edit listing form
router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
}));

// Delete listing
router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

// Add review
router.post('/:id/reviews', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    console.log('Review POST - req.body:', req.body);
    let listing = await Listing.findById(req.params.id);
    console.log('Review POST - Listing:', listing);
    if (!listing) {
        return res.render('listings/error.ejs', { err: { message: "OOPS! You've entered an invalid listing." } });
    }
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id; // Set the author to the currently logged-in user

    listing.reviews.push(newReview);
    await listing.save();
    await newReview.save();
    req.flash('success', 'Review added successfully!');
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review
router.delete('/:id/reviews/:reviewId', isLoggedIn,  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
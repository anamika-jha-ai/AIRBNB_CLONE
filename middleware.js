const Listing = require('./models/listing');
const User = require('./models/user');
module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.path,"...", req.originalUrl);

    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        // here passport will automatically dlt/resets the originalurl
        //  after it gets the login so that is why here we have stored 
        // the original url in a local variable as passport don't have 
        // the acess to the local variable

        req.flash('error', 'You must be signed in to do that!');
        return res.redirect('/login');
    } else {
        next();
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // Clear the redirect URL from the session
    } else {
        res.locals.redirectUrl = '/listings'; // Default redirect URL
    }
    next();
};

module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!currUser && listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash('error', 'You do not have permission to edit this listing!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new Error(msg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have permission to delete this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
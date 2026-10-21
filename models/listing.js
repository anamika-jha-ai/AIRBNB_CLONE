const mongoose = require('mongoose');
const review = require('./review');
const schema = mongoose.Schema;

const listingSchema = new schema({
    title: String,
    description: String,
    image: {
        type: String,
        filename: String,
        url: String,
        default: "https://images.unsplash.com/photo-1765871321198-30fffc41e605?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) => v == "" ? "https://images.unsplash.com/photo-1765871321198-30fffc41e605?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

listingSchema.post("findOneAndDelete",async (listing)=> {
    if(listing.reviews.length){
        await review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        })
    }
})

const Listing = mongoose.model('listing', listingSchema);
module.exports = Listing;

const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
        url: String,
        filename: String
});

// make a virtual where in the url we replace /upload to upload/w_200 to make a smaller image
// by using a virtual we dont have to store anything on the database or model. We have to make a request to get an image anyways
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = {toJSON: {virtuals: true}};

const GymSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            // this is an objectId from the review model. One To Many relationship. Many reviews for 1 camp
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
   
}, opts);

GymSchema.virtual('properties.popUpMarkup').get(function(){
    // this refering to this campground we are refering to. Since we are doing it multiple times if we used gym.title it wouldnt work.
    return `<strong> <a href="/gyms/${this._id}">${this.title}</a> </strong> 
    <p>${this.description.substring(0,25)}...</p>`
})


GymSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            // we await, we remove the review field, where somewhere in the reviews the id is in the doc.reviews array
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Gym', GymSchema);
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// linking our .env file to cloudinary.config. the cloud_name, api_key is set by the npm package
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY is our variables of choosing, can change these
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: 'GetClimbing', // where we are saving it in cloudinary
        allowedFormats: ['jpeg', 'png', 'jpg'] // the allowed formats that we accept
    }
   
});

module.exports = {
    cloudinary,
    storage
}
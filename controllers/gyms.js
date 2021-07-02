const Gym = require('../models/gyms');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require('../cloudinary')

// ===================================================

// index page
module.exports.index = async (req,res) =>{
    const gyms = await Gym.find({});
    res.render('gyms/index', {gyms})
}

// making new form | making new gym form, not the creating portion
module.exports.renderNewForm = (req, res) =>{
    res.render('gyms/new')
}

// creating a new gym
module.exports.createGym = async(req, res, next) =>{
  const geoData = await geocoder.forwardGeocode({
       query: req.body.gym.location,
       limit: 1
   }).send()

    const gym = new Gym(req.body.gym);

    // save the geo location using our geocoding api
    gym.geometry = geoData.body.features[0].geometry;

    // logs the logged in user and stores them to the author object
    // if we upload a file, we map it. It will make us an object array of filename & url
    gym.images = req.files.map(f =>({url: f.path, filename: f.filename}));
    gym.author = req.user._id; //sets the author to be the currently logged in author
    await gym.save();
    console.log(gym);
    req.flash('success', 'Succesfully made a new gym location!')
    res.redirect(`/gyms/${gym._id}`)
}


// Showing the gym and their authors, reviews ect
module.exports.showGym = async (req, res) =>{
    const gym = await await Gym.findById(req.params.id).populate({ 
        // nested populate. populate all the reviews from the reviews array from the one gym
        // Then populate on each review their author
        path: 'reviews',
        populate: {
            path: 'author'
        }
        // then populate the author on the camground (not review)
    }).populate('author');
    // console.log(gym)
    if(!gym){
        req.flash('error', 'Cannot find that gym!');
        return res.redirect('/gyms');
    }
    res.render('gyms/show', {gym});
}

// editing a gyms page
module.exports.renderEditForm = async (req, res) =>{
    const{id} = req.params
    const gym = await Gym.findById(id)
    // checks if the gym exists, if not flashes messages, redirects back to gyms page
    if(!gym){
        req.flash('error', 'Cannot find that gym!');
        return res.redicrect('/gyms');
    }
    res.render('gyms/edit', {gym});
}

// update a gyms information
module.exports.updateGym = async (req, res) =>{
    const {id} = req.params;
    console.log(req.body);
    const gym = await Gym.findByIdAndUpdate(id,{...req.body.gym});
    const imgs = req.files.map(f =>({url: f.path, filename: f.filename}));
    // if we had req.files ect below it would be an array in an array. instead we spread pushed array
    gym.images.push(...imgs);
    await gym.save();
    // $pull = pull something out of an array. we pull out of the images array, where the filename in req.body.deleteImages is = to whats in the array
    if(req.body.deleteImages){
        // we match the filename to the one on cloudinary, and destroy it from their server
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
        }
       await gym.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
       console.log(gym)
    }
    
    req.flash('success', 'Successfully updated gym!');
    res.redirect(`/gyms/${gym._id}`)
}

// deleting a gym
module.exports.deleteGym = async (req, res) =>{
    const {id} = req.params;
    await Gym.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted gym')
    res.redirect('/gyms');
}
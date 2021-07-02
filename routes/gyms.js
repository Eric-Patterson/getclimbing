const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// ====== IMPORTING CONTROLLERS =====
const gyms = require('../controllers/gyms')
const {isLoggedIn, isAuthor, validateGym} = require('../middleware.js')

const multer = require('multer');
const {storage} = require('../cloudinary'); //dont need to specify index.js, node automatically looks for index.js
const upload = multer({ storage });



// https://expressjs.com/en/4x/api.html#router ctrl+f - router.route(path)
router.route('/')
    .get(catchAsync(gyms.index))
    .post(isLoggedIn,  upload.array('image'), validateGym, catchAsync(gyms.createGym))
    // .post(upload.single('image'), (req, res) =>{
    //     console.log(req.body, req.file);
    //     res.send('It worked!!')
    // })
// ----------------------------------------------------------------------
// index page
// router.get('/', catchAsync(gyms.index));
// make a new gym
// router.post('/', isLoggedIn, validateGym,catchAsync(gyms.createGym))
// ----------------------------------------------------------------------

router.get('/new', isLoggedIn, gyms.renderNewForm)

router.route('/:id')
.get(catchAsync(gyms.showGym))
.put(isLoggedIn, isAuthor, upload.array('image'), validateGym, catchAsync(gyms.updateGym))
.delete(isLoggedIn,isAuthor, catchAsync(gyms.deleteGym))

// ----------------------------------------------------------------------
// show page
// router.get('/:id', catchAsync(gyms.showGym));

// update gym / edit gym
// this is for behind the scenes like ajax / postman
// router.put('/:id', isLoggedIn, isAuthor, validateGym, catchAsync(gyms.updateGym));

// router.delete('/:id', isLoggedIn,isAuthor, catchAsync(gyms.deleteGym));
// ----------------------------------------------------------------------


// editing a gyms page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(gyms.renderEditForm));




module.exports = router;
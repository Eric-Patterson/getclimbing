// process.env.node_environment
// if we are in development mode, which we are unless deployed, take the dotenv package (.env file)
// and take the variables in that file to the node application
// console.log(process.env.SECRET) - if we for example have a SECRET=lololol in .env this is how we access it
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}



// console.log(process.env.SECRET)

// https://www.npmjs.com/package/ejs-mate - add in some functionality to ejs. layout is one of them. can make boiler plates
// https://github.com/sideway/joi - server side validator for javascript | uses schema
// https://www.passportjs.org/ --- Authentication
const express = require ('express');
const path = require ('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash')
// const Joi = require('joi'); // we are exporting schemas from our schemas file, otherwise we can use it here.
const session = require('express-session')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// const MongoDBStore = require('connect-mongo')(session);
const MongoStore = require('connect-mongo');


// ================== ROUTES =============================
const userRoutes = require('./routes/users')

const gyms = require('./routes/gyms')
const reviews = require('./routes/reviews');
const { contentSecurityPolicy } = require('helmet');
// ===================================================

// it uses either our db located in our env file or the localhost database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, { // old database connect

// mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //24 hours * 60 minutes * 60 seconds
})

store.on("error", function(e){
    console.log("Session store error, e")
})

const sessionConfig  ={
    store, // store will now use mongo to store our information
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // secure: true, //this cookie should only work over https
         // 1000 * 60 * 60 * 24 * 7 || 1000 miliseconds in a second, 60 seconds in a minute, 60 minutes in an hour, 24 hours in a day, 7 days a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
// line below, automatically enables all helmet securities
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djqlifwol/", //Your cloudinary account
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
// Below we are saying: Password please user localstrategy that we have downloaded and required. 
// For the local strategy use the usermodel and its called authenticate || We never set one up although local-passport-mongoose set one up for us
passport.use(new LocalStrategy(User.authenticate()));

// passport is telling how to serialize a user. Serialize = how do we store a user in the session
passport.serializeUser(User.serializeUser());
// How do we get a user out of the session - to deserialize that user
passport.deserializeUser(User.deserializeUser());

app.use( (req, res, next) =>{
    // console.log(req.session)

    console.log(req.query)

    // we will have access to all these in all templates 
    // currentUser will be used to hide/show stuff when logged in or not
    res.locals.currentUser = req.user;

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// // Demonstration on how we will make a new user - hard coded
// app.get('/fakeUser', async(req, res) =>{
//     const user = new User({email: 'coltt@gmail.com', username: 'Colttt'});
//     // https://github.com/saintedlama/passport-local-mongoose ||register(username, password)
//     // register will take the password, hash it for us and save it | need to await it since it takes time as we use async
//     const newUser = await User.register(user, 'chicken')
//     res.send(newUser);
// })

// ================== ROUTES =============================
app.use('/', userRoutes);

app.use('/gyms', gyms)
app.use('/gyms/:id/reviews', reviews)

// ===============================================

app.get('/', (req,res) =>{
    res.render('home')
})


// 404 message for page not found
app.all('*', (req, res, next) =>{
    // res.send('404!!!!')
    next(new ExpressError('Page Not Found', 404))
});


// error handler for errors - will give timeout message
app.use((err, req, res, next) =>{
    // const {statusCode = 500, message = 'Something went wrong'} = err
    const {statusCode = 500} = err;
    // with this, we can access it in ejs with err.message
    if(!err.message) err.message ='Oh No, Something Went Wrong!';
    // this below, if an error happens, it will take the error.ejs file and show it as the error
    res.status(statusCode).render('error', {err})
    // res.send('OH boy, something went wrong!')
});

// app.get('/makeGym', async (req,res) =>{
//     const camp = new Gym({title: 'my backyard', description: 'something here'});
//     await camp.save();
//     res.send(camp)
// })

const port = process.env.PORT || 3001;

app.listen(port, () =>{
    console.log(`Serving on port ${port}`)
});
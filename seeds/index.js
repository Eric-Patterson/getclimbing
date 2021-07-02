const mongoose = require('mongoose');
const cities = require('./cities');
const{places, descriptors} = require('./seedHelpers');
const Gym = require('../models/gyms');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
    console.log("Database connected");
})

const sample = array =>array[Math.floor(Math.random() * array.length)];

const seedDB = async() =>{
    await Gym.deleteMany({});
    // const c = new Gym({title: 'purple field'});
    // await c.save();
    for(let i= 0; i < 325; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const gymsnew = new Gym({
             //YOUR USER ID
            author: '60cd54b31e470e379c8a4185',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: ' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptatum quo et, vitae explicabo accusantium, aliquid aspernatur dolorem nam delectus nobis mollitia incidunt, dignissimos id? Voluptas obcaecati alias ullam impedit dolorum.',
            price, //this is shorthand for price: price
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
            ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/djqlifwol/image/upload/v1624828229/GetClimbing/swezzn0rpqmciv05uztd.jpg',
                  filename: 'GetClimbing/swezzn0rpqmciv05uztd'
                },
                {
                    url: 'https://res.cloudinary.com/djqlifwol/image/upload/v1624832260/GetClimbing/jbohttybifhi1tfsovra.jpg',
                    filename: 'GetClimbing/jbohttybifhi1tfsovra'              
                  }
              ]
        })
        await gymsnew.save();
    }
}

seedDB();
require('dotenv').config();
require('express-async-errors');// This is used to avoid the try catch code in controllers

const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const morgan = require('morgan'); // This package is used to log info about which route is being used 
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const productRouter = require('./routes/productRoute');
const reviewRouter = require('./routes/reviewRoute');
const orderRouter = require('./routes/orderRoute');
const {authenticateUser} = require('./middleware/authentication');

app.set('trust proxy',1);
app.use(
    rateLimiter({
        windowMs : 15*60*60,
        max:60,
    })
);
app.use(helmet());
app.use(xss());
app.use(cors());
app.use(mongoSanitize());

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());
// used for file processing
app.use(express.static('./public'));
app.use(fileUpload());
// In order to access the Json data in req.body we use express.json() middlewear

app.get('/',(req,res)=>{
    console.log(req.cookies);
    res.send(`<h1>Welcome to E-Commerce-API<h1>`);
})

// app.get('/cookiedemo',(req,res)=>{
//     console.log(req.cookies);
//     res.send('cookie demo')
// })

app.use('/api/v1/auth',authRoute);
app.use('/api/v1/users',authenticateUser,userRoute);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/orders',orderRouter);

// Why are we placing notfound before errorHandler?
// This is because that's the convention and errorHandler middlewear will always be invoked when 
// we hit an existing route.For eg:
// When an error occurs in an existing route and there is not appropiate handler already defined 
// Then it will the invoke the errorHandler middlewear 

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);



const port = process.env.PORT || 5000;

const start = async ()=>{
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port,()=>{
            console.log(`Server is listening to ${port}...`);
        }) 
    } catch (error) {
        console.log(error);
    }
};

start();

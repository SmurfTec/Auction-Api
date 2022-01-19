require('./src/utils/passport');
const passport = require('passport');
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const cookieSession = require('cookie-session');

const userRouter = require('./src/routers/userRouter');
const authRoutes = require('./src/routers/authRoutes');
const auctionRouter = require('./src/routers/AuctionRouter');
const categoryRouter = require('./src/routers/categoryRouter');
const chatRouter = require('./src/routers/chatRouter');
const socialRouter = require('./src/routers/socialAccount');

const globalErrorHandler = require('./src/middlewares/globalErrorHandler');

const AppError = require('./src/utils/appError');
const protect = require('./src/middlewares/protect');
const restrictTo = require('./src/middlewares/restrictTo');
const catchAsync = require('./src/utils/catchAsync');
const Contact = require('./src/models/Contact');

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  cookieSession({
    name: 'session',
    keys: ['lama'],
    maxAge: 24 * 60 * 60 * 100,
  }) // maxAge is 1day
);

app.use(passport.initialize());
app.use(passport.session());

// var whitelist = ['http://example1.com', 'http://example2.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions))

app.use(express.json());

console.log(process.env.NODE_ENV);

// set security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// $ CORS
app.use(cors());

//  set limit request from same API in timePeroid from same ip
const limiter = rateLimit({
  max: 100, //   max number of limits
  windowMs: 60 * 60 * 1000, // hour
  message:
    ' Too many req from this IP , please Try  again in an Hour ! ',
});

//  Body Parser  => reading data from body into req.body protect from scraping etc
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSql query injection
app.use(mongoSanitize()); //   filter out the dollar signs protect from  query injection attact

// Data sanitization against XSS
app.use(xss()); //    protect from molision code coming from html

// testing middleware
app.use((req, res, next) => {
  console.log('running');
  next();
});

// routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRouter);
app.use('/api/auctions', auctionRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/chats', chatRouter);
app.use('/api/social', socialRouter);

app.get(
  '/api/contacts',
  protect,
  restrictTo('admin'),
  catchAsync(async (req, res, next) => {
    const contacts = await Contact.find();

    res.json({
      status: 'success',
      contacts,
    });
  })
);
// handling all (get,post,update,delete.....) unhandled routes
app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find ${req.originalUrl} on the server`, 404)
  );
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;

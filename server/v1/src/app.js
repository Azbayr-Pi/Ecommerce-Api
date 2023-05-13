const express = require('express');
const path = require('path');
const passport = require('passport');
const usersRouter = require('../routes/users/usersRouter');
const productsRouter = require('../routes/products/productsRouter');
const ordersRouter = require('../routes/orders/ordersRouter');
const categoriesRouter = require('../routes/categories/categoriesRouter');
const reviewsRouter = require('../routes/reviews/reviewsRoute');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const loginRouter = require('../routes/Auth/loginRoute');
const registerRouter = require('../routes/Auth/registerRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


require('../config/passport');

app.use(session({
    secret: 'user\'s session',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/Ecommerce-Api"}),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
})

app.use('/api/v1', loginRouter);
app.use('/api/v1', registerRouter);

app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/products/:id/reviews', reviewsRouter);

app.get('/*', (req, res) => {
    res.send('Not found :"(');
});

module.exports = app;
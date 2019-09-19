require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config')
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const beersRouter = require('./beers/beers-router');
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');
const reviewsRouter = require('./reviews/reviews-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.use('/api/beers', beersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.json({ok: true});
})

app.use((error, req, res, next) => {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error'}}
    }
    else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response);
})

module.exports = app
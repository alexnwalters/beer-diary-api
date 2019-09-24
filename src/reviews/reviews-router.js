const express = require('express')
const path = require('path')
const ReviewsService = require('./reviews-services')
const { requireAuth } = require('../middleware/jwt-auth')

const reviewsRouter = express.Router()
const jsonBodyParser = express.json()

reviewsRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { beer_id, overall, color, drinkability, aroma, taste, notes } = req.body
        const newReview = { beer_id, overall, color, drinkability, aroma, taste, notes }

        for(const [key, value] of Object.entries(newReview))
            if(value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        newReview.user_id = req.user.id        

        ReviewsService.insertReview(
            req.app.get('db'),
            newReview
        )
            .then(review => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${review.id}`))
                    .json(ReviewsService.serializeReview(review))
            })
            .catch(next)
    })

reviewsRouter
    .route('/user')
    .all(requireAuth)
    .get((req, res, next) => {
        
        const user_id = req.user.id

        ReviewsService.getReviewsByUser(
            req.app.get('db'),
            user_id
        )
            .then(reviews => {
                res.json(reviews.map(ReviewsService.serializeReviewWithBeerInfo))
            })
            .catch(next)
    })

reviewsRouter
    .route('/:review_id')
    .all(requireAuth)
    .all((req, res, next) => {        
        ReviewsService.getReviewById(
            req.app.get('db'),
            req.params.review_id
        )
        .then(review => {
            if (!review) {
                return res.status(404).json({
                    error: { message: `Review doesn't exist` }
                })
            }
            res.review = review
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.review)
    })
    .delete((req, res, next) => {

        ReviewsService.deleteReview(
            req.app.get('db'),
            req.params.review_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { overall, color, drinkability, aroma, taste, notes, date_modified } = req.body
        updatedReview = { overall, color, drinkability, aroma, taste, notes, date_modified }

        ReviewsService.updateReview(
            req.app.get('db'),
            req.params.review_id,
            updatedReview
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = reviewsRouter
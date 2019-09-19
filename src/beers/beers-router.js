const express = require('express')
const path = require('path')
const BeersService = require('./beers-service')
const { requireAuth } = require('../middleware/jwt-auth')

const beersRouter = express.Router()
const jsonBodyParser = express.json()

beersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BeersService.getAllBeers(knexInstance)
            .then(beers => {
                res.json(beers)
            })
            .catch(next)
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { beer_id, name, brewery, image, abv, ibu, beer_style, description } = req.body
        const newBeer = { beer_id, name, brewery, image, abv, ibu, beer_style, description }

        for(const [key, value] of Object.entries(newBeer))
            if(value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        
        BeersService.insertBeer(
            req.app.get('db'),
            newBeer
        )
            .then(beer => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${beer.id}`))
                    .json(BeersService.serializeBeer(beer))
            })
            .catch(next)
    })

module.exports = beersRouter
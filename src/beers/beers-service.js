const xss = require('xss')

const BeersService = {
    getAllBeers(knex) {
        return knex
            .select('*')
            .from('beer_diary_beers')
    },
    insertBeer(db, newBeer) {
        return db
            .insert(newBeer)
            .into('beer_diary_beers')
            .returning('*')
            .then(([beer]) => beer)
    },
    serializeBeer(beer) {
        return {
            id: beer.id,
            beer_id: beer.beer_id,
            name: xss(beer.name),
            brewery: xss(beer.brewery),
            image: beer.image,
            abv: beer.abv,
            ibu: beer.ibu,
            beer_style: xss(beer.beer_style),
            description: beer.description,
        }
    },
}

module.exports = BeersService
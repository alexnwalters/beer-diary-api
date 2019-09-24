const xss = require('xss')

const ReviewsService = {
    insertReview(db, newReview) {
        return db
            .insert(newReview)
            .into('beer_diary_reviews')
            .returning('*')
            .then(([review]) => review)
    },
    serializeReview(review) {
        return {
            id: review.id,
            beer_id: review.beer_id,
            overall: review.overall,
            color: review.color,
            drinkability: review.drinkability,
            aroma: review.aroma,
            taste: review.taste,
            notes: xss(review.notes),
            date_created: new Date(review.date_created)
        }
    },
    serializeReviewWithBeerInfo(review) {
        const { beer } = review
        return {
            id: review.id,
            overall: review.overall,
            color: review.color,
            drinkability: review.drinkability,
            aroma: review.aroma,
            taste: review.taste,
            notes: xss(review.notes),
            date_created: review.date_created,
            date_modified: review.date_modified || null,
            user_id: review.user_id,
            beer: {
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
        }
    },
    getReviewsByUser(db, user_id) {
        return db
            .from('beer_diary_reviews AS review')
            .select(
                'review.id',
                'review.user_id',
                'review.overall',
                'review.color',
                'review.drinkability',
                'review.aroma',
                'review.taste',
                'review.notes',
                'review.date_created',
                'review.date_modified',
                db.raw(
                    `json_strip_nulls(
                        row_to_json(
                            (SELECT tmp FROM (
                                SELECT
                                    beer.id,
                                    beer.beer_id,
                                    beer.name,
                                    beer.brewery,
                                    beer.image,
                                    beer.abv,
                                    beer.ibu,
                                    beer.beer_style,
                                    beer.description
                            ) tmp)
                        )
                    ) AS "beer"`
                )
            )
            .where('review.user_id', user_id)
            .leftJoin(
                'beer_diary_beers AS beer',
                'review.beer_id',
                'beer.beer_id',
            )
            .groupBy('review.id', 'beer.id')
    },
    getReviewById(knex, id) {
        return knex('beer_diary_reviews')
            .where('id', id)
            .first()
    },
    deleteReview(knex, id) {
        return knex('beer_diary_reviews')
            .where({ id })
            .delete()
    },
    updateReview(knex, id, updatedReview) {
        return knex('beer_diary_reviews')
            .where({ id })
            .update(updatedReview)
    },
}

module.exports = ReviewsService
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'test-user-1',
            full_name: 'Test user 1',
            password: 'password',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 2,
            user_name: 'test-user-2',
            full_name: 'Test user 2',
            password: 'password',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 3,
            user_name: 'test-user-3',
            full_name: 'Test user 3',
            password: 'password',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 4,
            user_name: 'test-user-4',
            full_name: 'Test user 4',
            password: 'password',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
    ]
}

function makeBeersArray() {
    return [
        {
            id: 1,
            beer_id: '1',
            name: 'test-beer-1',
            brewery: 'test-brewery-1',
            image: '',
            abv: '11',
            ibu: '11',
            beer_style: 'test-style-1',
            description: '',
        },
        {
            id: 2,
            beer_id: '2',
            name: 'test-beer-2',
            brewery: 'test-brewery-2',
            image: '',
            abv: '22',
            ibu: '22',
            beer_style: 'test-style-2',
            description: '',
        },
        {
            id: 3,
            beer_id: '3',
            name: 'test-beer-3',
            brewery: 'test-brewery-3',
            image: '',
            abv: '33',
            ibu: '33',
            beer_style: 'test-style-3',
            description: '',
        },
        {
            id: 4,
            beer_id: '4',
            name: 'test-beer-4',
            brewery: 'test-brewery-4',
            image: '',
            abv: '44',
            ibu: '44',
            beer_style: 'test-style-4',
            description: '',
        },
    ]
}

function makeReviewsArray(users, beers) {
    return [
        {
            id: 1,
            user_id: users[0].id,
            beer_id: beers[0].beer_id,
            overall: 1,
            color: 1,
            drinkability: 1,
            aroma: 'Fruity',
            taste: 'Hop',
            notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: null,
        },
        {
            id: 2,
            user_id: users[0].id,
            beer_id: beers[1].beer_id,
            overall: 1,
            color: 1,
            drinkability: 1,
            aroma: 'Fruity',
            taste: 'Hop',
            notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: null,
        },
        {
            id: 3,
            user_id: users[1].id,
            beer_id: beers[2].beer_id,
            overall: 5,
            color: 5,
            drinkability: 5,
            aroma: 'Fruity',
            taste: 'Hop',
            notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: null,
        },
        {
            id: 4,
            user_id: users[1].id,
            beer_id: beers[3].beer_id,
            overall: 5,
            color: 5,
            drinkability: 5,
            aroma: 'Fruity',
            taste: 'Hop',
            notes: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            date_modified: null,
        },
    ]
}

function makeExpectedReviewsWithBeerInfo(reviews, beers, user_id) {

    const expectedReviews = reviews.filter(
        review => review.user_id == user_id
    )

    return expectedReviews.map(review => {
        const beer = beers.find(
            beer => beer.beer_id === review.beer_id
        )
        return {
            id: review.id,
            user_id: review.user_id,
            overall: review.overall,
            color: review.color,
            drinkability: review.drinkability,
            aroma: review.aroma,
            taste: review.taste,
            notes: review.notes,
            date_created: review.date_created.toISOString(),
            date_modified: review.date_modified || null,
            beer: {
                id: beer.id,
                beer_id: beer.beer_id,
                name: beer.name,
                brewery: beer.brewery,
                image: beer.image,
                abv: beer.abv,
                ibu: beer.ibu,
                beer_style: beer.beer_style,
                description: beer.description,
            }
        }
    })
}

function makeMaliciousBeer() {
    const maliciousBeer = {
        id: 4,
        beer_id: 4,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        brewery: 'Naughty naughty very naughty <script>alert("xss");</script>',
        abv: 44,
        ibu: 44,
        beer_style: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedBeer = {
        ...makeExpectedBeer(maliciousBeer),
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        brewery: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        beer_style: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
        maliciousBeer,
        expectedBeer,
    }
}

function makeMaliciousReview(user) {
    const maliciousReview = {
        id: 911,
        user_id: user.id,
        beer_id: 1,
        overall: 1,
        color: 1,
        drinkability: 1,
        aroma: 'Fruity',
        taste: 'Hop',
        notes: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        date_created: new Date(),
    }
    const expectedReview = {
        ...makeExpectedReview([user], maliciousReview),
        notes: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
        maliciousReview,
        expectedReview,
    }
}

function makeDiaryFixtures() {
    const testUsers = makeUsersArray()
    const testBeers = makeBeersArray()
    const testReviews = makeReviewsArray(testUsers, testBeers)
    return { testUsers, testBeers, testReviews }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
            beer_diary_users,
            beer_diary_beers,
            beer_diary_reviews
            `
        )
        .then(() =>
            Promise.all([
                trx.raw(`ALTER SEQUENCE beer_diary_users_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE beer_diary_beers_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE beer_diary_reviews_id_seq minvalue 0 START WITH 1`),
                trx.raw(`SELECT setval('beer_diary_users_id_seq', 0)`),
                trx.raw(`SELECT setval('beer_diary_beers_id_seq', 0)`),
                trx.raw(`SELECT setval('beer_diary_reviews_id_seq', 0)`),
            ])
        )
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('beer_diary_users').insert(preppedUsers)
        .then(() => 
            db.raw(
                `SELECT setval('beer_diary_users_id_seq', ?)`,
                [users[users.length - 1].id],
            )
        )
}

function seedDiaryTables(db, users, beers, reviews=[]) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('beer_diary_beers').insert(beers)
        await trx.raw(
            `SELECT setval('beer_diary_beers_id_seq', ?)`,
            [beers[beers.length - 1].id],
        )
        if (reviews.length) {
            await trx.into('beer_diary_reviews').insert(reviews)
            await trx.raw(
                `SELECT setval('beer_diary_reviews_id_seq', ?)`,
                [reviews[reviews.length - 1].id],
            )
        }
    })
}

function seedMaliciousBeer(db, user, beer) {
    return seedUsers(db, [user])
        .then(() =>
            db
                .into('beer_diary_beers')
                .insert([beer])
        )
}

function seedMaliciousReview(db, user, review) {
    return seedUsers(db, [user])
        .then(() =>
            db
                .into('beer_diary_reviews')
                .insert([review])
        )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.user_name,
        algorithm: 'HS256',
    })
    return `Bearer ${token}` 
}

module.exports = {
    makeUsersArray,
    makeReviewsArray,
    makeMaliciousBeer,
    makeMaliciousReview,
    makeDiaryFixtures,
    cleanTables,
    seedDiaryTables,
    seedUsers,
    makeExpectedReviewsWithBeerInfo,
    seedMaliciousBeer,
    seedMaliciousReview,
    makeAuthHeader,
}
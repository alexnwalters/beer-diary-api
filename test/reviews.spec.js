const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Reviews Endpoints', function() {
    let db

    const {
        testUsers,
        testBeers,
        testReviews,
    } = helpers.makeDiaryFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the tables', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('GET /api/reviews/user', () => {
        context('given no reviews', () => {
            beforeEach('insert users', () => 
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/reviews/user`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })

        context('given there are reviews in the database', () => {
            beforeEach('insert reviews', () => 
                helpers.seedDiaryTables(
                    db,
                    testUsers,
                    testBeers,
                    testReviews,
                )
            )
            
            it('responds with 200 and all of the users reviews', () => {
                const testUserId = testUsers[0].id
                const expectedReviews = helpers.makeExpectedReviewsWithBeerInfo(
                    testReviews, testBeers, testUserId
                )

                return supertest(app)
                    .get(`/api/reviews/user`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedReviews)
            })
        })

        context(`Given an XSS attack review`, () => {
            const testUser = helpers.makeUsersArray()[1]
            const testBeer = helpers.makeBeersArray()
            const {
                maliciousReview,
                expectedReview,
            } = helpers.makeMaliciousReview(testUser, testBeer[1])
      
            beforeEach('insert malicious Review', () => {
                return helpers.seedMaliciousReview(
                    db,
                    testUser,
                    testBeer,
                    maliciousReview,
                )
            })
      
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/reviews/user`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].notes).to.eql(expectedReview.notes)
                    })
            })
          })
    })

    describe('POST /api/reviews', () => {
        beforeEach('insert reviews', () => 
                helpers.seedDiaryTables(
                    db,
                    testUsers,
                    testBeers,
                )
            )
                
        it(`creates a review, responding 201 and the new review`, function() {
            this.retries(3)
            const testBeer = testBeers[0]
            const newReview = {
                beer_id: testBeer.beer_id,
                overall: 1,
                color: 1,
                drinkability: 1,
                aroma: 'Nutty',
                taste: 'Hop',
                notes: 'Test Note',
            }
            return supertest(app)
                .post('/api/reviews')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newReview)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.beer_id).to.eql(newReview.beer_id)
                    expect(res.body.overall).to.eql(newReview.overall)
                    expect(res.body.color).to.eql(newReview.color)
                    expect(res.body.drinkability).to.eql(newReview.drinkability)
                    expect(res.body.aroma).to.eql(newReview.aroma)
                    expect(res.body.taste).to.eql(newReview.taste)
                    expect(res.body.notes).to.eql(newReview.notes)
                    expect(res.headers.location).to.eql(`/api/reviews/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                        .from('beer_diary_reviews')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.beer_id).to.eql(newReview.beer_id)
                            expect(row.overall).to.eql(newReview.overall)
                            expect(row.color).to.eql(newReview.color)
                            expect(row.drinkability).to.eql(newReview.drinkability)
                            expect(row.aroma).to.eql(newReview.aroma)
                            expect(row.taste).to.eql(newReview.taste)
                            expect(row.notes).to.eql(newReview.notes)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })
    })

    describe(`GET /api/reviews/:review_id`, () => {
        context('Given no reviews', () => {
            beforeEach('insert users', () => 
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('responds with 404', () => {
                const review_id = 12345
                return supertest(app)
                    .get(`/api/reviews/${review_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: { message: `Review doesn't exist` }})
            })
        })

        context('Given there are reviews in database', () => {
            beforeEach('Insert reviews', () =>
                helpers.seedDiaryTables(
                    db,
                    testUsers,
                    testBeers,
                    testReviews,
                )
            )

            it('responds 200 and returns expected review', () => {
                const review_id = 2
                const expectedReview = testReviews[review_id - 1]
                return supertest(app)
                    .get(`/api/reviews/${review_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedReview)
            })
        })
    })

    describe(`DELETE /api/reviews/:review_id`, () => {
        context('Given no reviews', () => {
            beforeEach('insert users', () => 
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('responds with 404', () => {
                const review_id = 12345
                return supertest(app)
                    .delete(`/api/reviews/${review_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: { message: `Review doesn't exist` }})
                })
        })

        context('Given there are reviews in the database', () => {
            beforeEach('Insert reviews', () =>
                helpers.seedDiaryTables(
                    db,
                    testUsers,
                    testBeers,
                    testReviews,
                )
            )

            it('responds 204 for delete and checks for removed review', () => {
                const idToRemove = 2
                const testUserId = testUsers[0].id
                const expectedReviews = helpers.makeExpectedReviewsWithBeerInfo(
                    testReviews, testBeers, testUserId
                )
                const newExpectedReviews = expectedReviews.filter(review => review.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/reviews/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(() =>
                        supertest(app)
                            .get(`/api/reviews/user`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(newExpectedReviews)
                    )
            })
        })
    })

    describe(`PATCH /api/reviews/:review_id`, () => {
        context('Given no reviews', () => {
            beforeEach('insert users', () => 
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('responds with 404', () => {
                const review_id = 12345
                return supertest(app)
                    .patch(`/api/reviews/${review_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {error: { message: `Review doesn't exist` }})
                })
        })

        context('Given there are reviews in the database', () => {
            beforeEach('Insert reviews', () =>
                helpers.seedDiaryTables(
                    db,
                    testUsers,
                    testBeers,
                    testReviews,
                )
            )

            it('responds 204 for update and checks correct change', () => {
                const idToUpdate = 2
                const updatedReview = {
                    overall: 3,
                    color: 3,
                    drinkability: 3,
                    aroma: 'Bready',
                    taste: 'Malt',
                    notes: 'Updated Test Note',
                }
                const expectedReviews = {
                    ...testReviews[idToUpdate - 1],
                    ...updatedReview
                }

                return supertest(app)
                    .patch(`/api/reviews/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updatedReview)
                    .expect(204)
                    .then(() =>
                        supertest(app)
                            .get(`/api/reviews/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedReviews)
                    )
            })
        })
    })
})
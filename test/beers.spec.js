const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Beers Endpoints', function() {
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

    describe('GET /api/beers', () => {
        context('given no beers', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/beers')
                    .expect(200, [])
            })
        })

        context('given there are beers in the database', () => {
            beforeEach('insert beers', () => 
                helpers.seedDiaryTables(
                    db,
                    testUsers,
                    testBeers,
                    testReviews,
                ))
            
            it('responds with 200 and all of the beers', () => {
                const expectedBeers = testBeers
                return supertest(app)
                    .get('/api/beers')
                    .expect(200, expectedBeers)
            })
        })
    })

    describe('POST /api/beers', () => {
        beforeEach('insert beers', () => 
                helpers.seedDiaryTables(
                    db,
                    testUsers,
                    testBeers,
                    testReviews,
                ))

        it(`creates a beer, responding 201 and the new beer`, function() {
            this.retries(3)
            const newBeer = {
                beer_id: '123',
                name: 'Test Beer',
                brewery: 'Test Brewery',
                image: '',
                abv: '11',
                ibu: '11',
                beer_style: 'Test Style',
                description: ''
            }
            return supertest(app)
                .post('/api/beers')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newBeer)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.beer_id).to.eql(newBeer.beer_id)
                    expect(res.body.brewery).to.eql(newBeer.brewery)
                    expect(res.body.image).to.eql(newBeer.image)
                    expect(res.body.abv).to.eql(newBeer.abv)
                    expect(res.body.ibu).to.eql(newBeer.ibu)
                    expect(res.body.beer_style).to.eql(newBeer.beer_style)
                    expect(res.body.description).to.eql(newBeer.description)
                    expect(res.headers.location).to.eql(`/api/beers/${res.body.id}`)
                })
                .expect(res =>
                    db
                        .from('beer_diary_beers')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.beer_id).to.eql(newBeer.beer_id)
                            expect(row.brewery).to.eql(newBeer.brewery)
                            expect(row.image).to.eql(newBeer.image)
                            expect(row.abv).to.eql(newBeer.abv)
                            expect(row.ibu).to.eql(newBeer.ibu)
                            expect(row.beer_style).to.eql(newBeer.beer_style)
                            expect(row.description).to.eql(newBeer.description)
                        })
                )
        })
    })
})
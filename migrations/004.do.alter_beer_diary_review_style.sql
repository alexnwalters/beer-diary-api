CREATE TYPE aroma_options AS ENUM (
    'Bready',
    'Nutty',
    'Toasty',
    'Roasted',
    'Floral',
    'Fruity',
    'Piney',
    'Spicy'
);

CREATE TYPE taste_options AS ENUM (
    'Crisp',
    'Hop',
    'Malt',
    'Roast',
    'Smoke',
    'Fruit & Spice',
    'Tart & Funky'
);

ALTER TABLE beer_diary_reviews
    ADD COLUMN
        aroma aroma_options;

ALTER TABLE beer_diary_reviews
    ADD COLUMN
        taste taste_options;
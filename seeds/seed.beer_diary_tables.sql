BEGIN;

TRUNCATE
    beer_diary_reviews,
    beer_diary_beers,
    beer_diary_users
    RESTART IDENTITY CASCADE;

INSERT INTO beer_diary_users (user_name, full_name, password)
VALUES
    ('TestUser', 'Sample Tester', '$2a$12$mfQl7V7WwSvgwh5Uxmc0b.U0gCYLYNg18kLUvX5U23r7yMVhPPV3a'),
    ('b.deboop', 'Bodeep Deboop', '$2a$12$lh6D.AjolWRQ9VKA5HzsDO6CV0uDukYTVEsBg/1tSofRNd4CLTyIO'),
    ('c.bloggs', 'Charlie Bloggs', '$2a$12$6D1PD0xy70DJJdZO89EPh.e2W0mLMHIhLOe89Dr4F23.WgUWqXdVq');

INSERT INTO beer_diary_beers (beer_id, name, brewery, image, abv, ibu, beer_style, description)
VALUES
    ('1', 'Snake Dog IPA', 'Flying Dog Brewery', '', 7.1, 60, 'IPA', 'A potent snakebite of Citra, Mosaic, Warrior, Simcoe, and Columbus hops gives this beer its citrus-forward superpower.'),
    ('2', 'Golden Ale', 'The Brewery', '', 5.4, 25, 'American Ale', ''),
    ('3', 'Test Beer 3', 'Test Brewery', '', 3.3, 33, 'Stout', 'Elitr labore tempor invidunt invidunt sed dolores et est lorem.'),
    ('4', 'Duff Beer', 'Duff Brewing', '', 4.4, 44, 'Lager', ''),
    ('5', 'No. 5', 'Fifth Place Brew Co.', '', 5.5, 55, 'Pilsner', 'Vero amet dolor invidunt rebum takimata ipsum. Dolor invidunt dolores et stet ea et dolores.');

INSERT INTO beer_diary_reviews (user_id, beer_id, overall, color, aroma, taste, drinkability, notes)
VALUES
    (1, '1', 4, 5, 'Fruity', 'Hop', 4, 'Classic bitter IPA, flavor profile is a nice introduction to an IPA.  However, be prepared it is anything but light.'),
    (1, '2', 3, 4, 'Nutty', 'Malt', 5, ''),
    (1, '3', 5, 2, 'Toasty', 'Roast', 1, 'Sadipscing duo sanctus vero diam duo et sea lorem, kasd.'),
    (2, '2', 3, 5, 'Roasted', 'Smoke', 2, ''),
    (2, '3', 1, 3, 'Floral', 'Tart & Funky', 3, 'Dolore voluptua sea takimata sit lorem. No at est eos.'),
    (3, '4', 2, 2, 'Piney', 'Crisp', 4, ''),
    (3, '5', 3, 1, 'Spicy', 'Fruit & Spice', 5, 'Duo sed sed stet clita et et et duo dolore,.');

COMMIT;
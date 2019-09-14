ALTER TABLE beer_diary_reviews DROP COLUMN IF EXISTS aroma_options;

DROP TYPE IF EXISTS aroma_options;

ALTER TABLE beer_diary_reviews DROP COLUMN IF EXISTS taste_options;

DROP TYPE IF EXISTS taste_options;
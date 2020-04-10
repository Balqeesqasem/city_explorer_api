
DROP TABLE IF EXISTS place;
CREATE TABLE place (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude float,
    longitude float
);


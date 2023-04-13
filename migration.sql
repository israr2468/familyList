DROP TABLE IF EXISTS family;

CREATE TABLE family (
    id SERIAL PRIMARY KEY,
    name TEXT,
    birthday DATE,
    age INT
);
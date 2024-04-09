\c sistemaencuestas;

ALTER TABLE users ADD FOREIGN KEY (rol) REFERENCES rol(id);
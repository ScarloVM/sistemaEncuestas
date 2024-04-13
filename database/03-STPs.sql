--VER TODOS LOS USUARIOS

CREATE OR REPLACE FUNCTION obtenerUsuarios() RETURNS TABLE (
	id integer,
  	name VARCHAR(255),
  	email VARCHAR(255),
  	password VARCHAR(255),
  	rol integer
)
AS
$$

SELECT *
FROM users;

$$
LANGUAGE SQL
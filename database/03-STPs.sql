--VER TODOS LOS USUARIOS
\c sistemaencuestas;


--Insertar usuario
CREATE FUNCTION InsertUsuario(name VARCHAR, email VARCHAR, password VARCHAR, rol INT) 
RETURNS VOID AS $$
BEGIN
	INSERT INTO users
		(name, email, password, rol)
	VALUES
		(name, email, password, rol);
END;
$$ LANGUAGE plpgsql;


--Obtener usuario por email
CREATE FUNCTION ObtenerUsuarioPorEmail(email_user VARCHAR) 
RETURNS TABLE
(
    user_id INT,
    user_name VARCHAR,
    user_email VARCHAR,
    user_password VARCHAR,
    user_rol INT
) AS $$
BEGIN
	RETURN QUERY
	SELECT id AS user_id, name AS user_name, email AS user_email, password AS user_password, rol AS user_rol
	FROM users
	WHERE email = email_user;
END;
$$ LANGUAGE plpgsql;

--Obtener usuarios
CREATE FUNCTION ObtenerUsuarios() 
RETURNS TABLE (
	user_id INT,
	user_name VARCHAR,
	user_email VARCHAR,
	user_password VARCHAR,
	user_rol INT
) AS $$
BEGIN
	RETURN QUERY
	SELECT id AS user_id, name AS user_name, email AS user_email, password AS user_password, rol AS user_rol
	FROM users;
END;
$$ LANGUAGE plpgsql;

--Obtener usuario por ID
CREATE FUNCTION ObtenerUsuarioPorID(id_user INT) 
RETURNS TABLE
(
    user_id INT,
    user_name VARCHAR,
    user_email VARCHAR,
    user_password VARCHAR,
    user_rol INT
) AS $$
BEGIN
	RETURN QUERY
	SELECT id AS user_id, name AS user_name, email AS user_email, password AS user_password, rol AS user_rol
	FROM users
	WHERE id = id_user;
END;
$$ LANGUAGE plpgsql;

--

--Actualizar usuario
CREATE FUNCTION UpdateUser(name VARCHAR, email VARCHAR, password VARCHAR, rol INT, user_id INT) 
RETURNS INT AS $$
DECLARE
    rows_affected INT;
BEGIN
	UPDATE users 
    SET name = $1, email = $2, password = $3, rol = $4 
    WHERE id = $5;

	GET DIAGNOSTICS rows_affected = ROW_COUNT;

RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

--ELIMINAR USUARIO
CREATE FUNCTION DeleteUser(user_id INT) 
RETURNS VOID AS $$
BEGIN
	DELETE FROM users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

--Insertar encuestado
CREATE FUNCTION InsertEncuestado(name VARCHAR, email VARCHAR, password VARCHAR) 
RETURNS VOID AS $$
BEGIN
	INSERT INTO users
		(name, email, password, rol)
	VALUES
		(name, email, password, 3);
END;
$$ LANGUAGE plpgsql;


--Obtener encuestados
CREATE FUNCTION ObtenerEncuestados() 
RETURNS TABLE (
	user_id INT,
	user_name VARCHAR,
	user_email VARCHAR,
	user_password VARCHAR,
	user_rol INT
) AS $$
BEGIN
	RETURN QUERY
	SELECT id AS user_id, name AS user_name, email AS user_email, password AS user_password, rol AS user_rol
	FROM users
	WHERE rol = 3;
END;
$$ LANGUAGE plpgsql;

--Obtener encuestado por ID
CREATE FUNCTION ObtenerEncuestadoPorID(id_User INT) 
RETURNS TABLE
(
    user_id INT,
    user_name VARCHAR,
    user_email VARCHAR,
    user_password VARCHAR,
    user_rol INT
) AS $$
BEGIN
	RETURN QUERY
	SELECT id AS user_id, name AS user_name, email AS user_email, password AS user_password, rol AS user_rol
	FROM users
	WHERE id = id_User AND rol = 3;
END;
$$ LANGUAGE plpgsql;

--Actualizar encuestado
CREATE FUNCTION UpdateEncuestado(name VARCHAR, email VARCHAR, password VARCHAR, user_id INT) 
RETURNS INT AS $$
DECLARE
    rows_affected INT;
BEGIN
	UPDATE users 
    SET name = COALESCE($1, users.name), 
        email = COALESCE($2, users.email), 
        password = COALESCE($3, users.password)
    WHERE id = $4 and rol = 3;

	GET DIAGNOSTICS rows_affected = ROW_COUNT;

RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

--ELIMINAR ENCUESTADO
CREATE FUNCTION DeleteEncuestado(user_id INT) 
RETURNS VOID AS $$
BEGIN
	DELETE FROM users WHERE id = user_id AND rol = 3;
END;
$$ LANGUAGE plpgsql;
# sistemaEncuestas
### Javier Rojas, Julian Lopez, Kendell Garbanzo, Carlos Venegas

# Comandos para la construccion de los Dockers

## 1. Construir el contenedor de Docker con las imagenes

``` bash
docker-compose up --build
```

Nota: Reiniciar el app-1, para asegurar que las conexiones se hagan correctamente


## 2. Construir el contenedor de Docker para los de test integración

``` bash
docker-compose -f docker-compose-test.yml up --build
```
# Instrucciones de uso para cada endpoint

Para poder usar o probar todos estos endpoints es necesario la app de POSTMAN

# Autenticación y Autorización

## POST /auth/register - Registrar un Usuario

URL: '/auth/register/'
METODO: 'POST'
Cuerpo de la Solicitud:
``` js
{
    "name": "Juan",
    "password": "1234",
    "email":"juan@example.com",
    "role": 1
}
```
name:

## POST /auth/login - Iniciar Sesion con un Usuario

Para el inicio de sesión, aqui el usuario va a crear un request con el metodo POST utilizando el endpoint /auth/login, y en el body ingresa sus datos de la siguiente forma:
``` js
{
    "name": "Messi",
    "password": "1234",
    "email":"prueba",
    "role": 1
}
```

## GET /auth/logout - Cerrar la sesión del usuario

# Usuarios

## GET /users

## GET /users/{id}

## PUT /users/{id}

## DELETE /users/{id}

# Encuestas

## POST /surveys

## GET /surveys

## GET /surveys/{id}

## PUT /surveys/{id}

## DELETE /surveys/{id}

## POST/surveys/{id}/publish

# Preguntas de Encuestas

## POST /surveys/{id}/questions

## GET /surveys/{id}/questions

## PUT /surveys/{id}/questions/{questionId}

## DELETE /surveys/{id}/questions/{questionId}

# Respuestas de Encuestas

## POST /surveys/{id}/responses

## GET /surveys/{id}/responses

# Encuestados

## POST /respondents

## GET /respondents

## GET /respondents/{id}

## PUT /respondents/{id}

## DELETE /respondents/{id}

# Reportes y Análisis

## GET /surveys/{id}/analysis

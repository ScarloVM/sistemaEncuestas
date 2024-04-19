# Proyecto de Bases 2 - sistemaEncuestas
### Realizado por: Javier Rojas, Julian Lopez, Kendell Garbanzo y Carlos Venegas

## Comandos para la construccion de los Dockers

#### 1. Construir el contenedor de Docker con las imagenes

``` bash
docker-compose up --build
```

Nota: Reiniciar el app-1, para asegurar que las conexiones se hagan correctamente


### 2. Construir el contenedor de Docker para los de test integración

``` bash
docker-compose -f docker-compose-test.yml up --build
```
# Instrucciones de uso para cada endpoint

Para poder usar o probar todos estos endpoints es necesario la app de POSTMAN

## Autenticación y Autorización

### POST /auth/register - Registrar un Usuario

Para registrar un usuario, aqui el usuario va a crear un request con el metodo **POST** utilizando el endpoint **/auth/register**, y en el body ingresa sus datos de la siguiente forma:

``` js
{
    "name": "Juan",
    "password": "1234",
    "email":"juan@example.com",
    "role": 1
}
```
En el campo role, se puede ingresar el 1 para ADMINISTRADOR, 2 para CREADOR DE ENCUESTAS, 3 para ENCUESTADO.

### POST /auth/login - Iniciar Sesion con un Usuario

Para el inicio de sesión, aqui el usuario va a crear un request con el metodo **POST** utilizando el endpoint **/auth/login**, y en el body ingresa el correo electronico y la contraseña con la que fue registrado, de la siguiente forma:
``` js
{
    "email": "juan@example.com",
    "password": "1234"
}
```

### GET /auth/logout - Cerrar la sesión del usuario

Para cerrar la sesión solamente se envia la solicitud con el metodo **GET** y el endpoint **/auth/logout**.

## Usuarios

### GET /users

Para realizar esta acción se envía la solicitud con el metodo **GET** y el endpoint **/users**. **Nota**: Esta acción solo puede ser realizada por los administradores y creadores de encuesta.

### GET /users/{id}

Para realizar esta acción se envía la solicitud con el metodo **GET** y el endpoint **/users/id**. Donde id es el id del usuario específico que se quiere obtener detalles. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.

### PUT /users/{id}

Para poder actualizar a un usuario se envía la solicitud con el metodo **PUT** y el endpoint **/users/id**. Donde id es el id del usuario específico al que se le quiere actualizar la información. Esta acción solo puede ser realizada por el perfil del usuario, los administradores y creadores de encuesta. Es necesario usar body como el siguiente:
``` js
{
    "name": "Juan",
    "password": "1234",
    "email":"juan@example.com",
    "role": 1
}
```

### DELETE /users/{id}

Para poder eliminar un usuario se envía la solicitud con el metodo **DELETE** y el endpoint **/users/id**. Donde id es el id del usuario específico que se quiere eliminar. Esta acción solo puede ser realizada por el administrador.

## Encuestas

### POST /surveys
Para poder crear una nueva encuesta se envía la solicitud con el metodo **POST** y el endpoint **/surveys**. Esta acción solo puede ser realizada por administradores y creadores de encuestas.

Esta acción necesita un body como el siguiente:
- **Questions** son las preguntas de la encuesta
- **Respuestas** son las respuestas de la encuestas
``` js
{
  "idEncuesta": 2,
  "titulo": "Encuesta de experiencia de compra",
  "descripcion": "Esta encuesta tiene como objetivo recopilar información sobre la experiencia de compra en nuestra tienda.",
  "creador": "admin456",
  "estado": "active",
  "questions": [
    {
      "idPregunta": 1,
      "tipo": "abierta",
      "texto": "¿Cómo calificarías la amabilidad del personal de nuestra tienda?",
      "required": true
    },
    {
      "idPregunta": 2,
      "tipo": "eleccion_simple",
      "texto": "¿Recomendarías nuestra tienda a tus amigos?",
      "options": ["Sí", "No"],
      "required": true
    },
    {
      "idPregunta": 3,
      "tipo": "eleccion_multiple",
      "texto": "¿Qué sección de nuestra tienda te gusta más?",
      "options": ["Ropa", "Electrónica", "Juguetes", "Hogar"],
      "required": false
    }
  ],
  "respuestas": []
}
```

### GET /surveys

Para poder listar todas las encuestas que se encuentran disponibles públicamente, se envía la solicitud con el metodo **GET** y el endpoint **/surveys**.

### GET /surveys/{id}

Para poder mostrar los detalles de una encuesta específica, se envía la solicitud con el metodo **GET** y el endpoint **/surveys/id**. Donde id es el id de la encuesta específica que se quiere obtener detalles.

### PUT /surveys/{id}

Para poder actualizar la información de una encuesta específica, se envía la solicitud con el metodo **PUT** y el endpoint **/surveys/id**. Donde id es el id de la encuesta específica que se quiere actualizar. Esta acción solo puede ser realizada por los creadores de encuesta y los administradores.

Es necesario un body como el siguiente:

``` js
{
  "titulo": "Encuesta de experiencia de compra",
  "descripcion": "Esta encuesta tiene como objetivo recopilar información sobre la experiencia de compra en nuestra tienda.",
  "creador": "admin456",
  "estado": "active"
}
```

O puede actualizar un campo en especifico solamente:

``` js
{
  "titulo": "Encuesta de experiencia de compra",
}
```

### DELETE /surveys/{id}

Para poder eliminar una encuesta se envía la solicitud con el metodo **DELETE** y el endpoint **/surveys/id**. Donde id es el id de la encuesta que se quiere eliminar. Esta acción solo puede ser realizada por el administrador y el creador de la encuesta.

### POST /surveys/{id}/publish

Para poder publicar una encuesta y hacerla accesible se envía la solicitud con el metodo **POST** y el endpoint **/surveys/{id}/publish**. Donde id es el id de la encuesta que se quiere hacer accesible. Esta acción solo puede ser realizada por el administrador y el creador de la encuesta.

## Preguntas de Encuestas

### POST /surveys/{id}/questions

Para añadir una pregunta a una encuesta específica se envía la solicitud con el metodo **POST** y el endpoint **/surveys/{id}/questions**. Donde id es el id de la encuesta donde se quiere añadir la pregunta. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.
Esta acción necesita un body como el siguiente:
``` js


```

### GET /surveys/{id}/questions

Para obtener las preguntas de una encuesta en específico se envía la solicitud con el metodo **GET** y el endpoint **/surveys/{id}/questions**. Donde el id es el id de la encuesta que se quiere obtener las preguntas. 

### PUT /surveys/{id}/questions/{questionId}

Para modificar una pregunta una pregunta específica de una encuesta específica se envía la solicitud con el metodo **PUT** y el endpoint **/surveys/{id}/questions/{questionId}**. Donde el id es el id de la encuesta y el questionId el id de la pregunta que se quiere modificar. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.
Esta acción necesita un body como el siguiente:

``` js


```

### DELETE /surveys/{id}/questions/{questionId}

Para eliminar una pregunta específica de una encuesta específica se envía la solicitud con el metodo **DELETE** y el endpoint **/surveys/{id}/questions/{questionId}**. Donde el id es el id de la encuesta y el questionId el id de la pregunta que se quiere eliminar. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.

## Respuestas de Encuestas

### POST /surveys/{id}/responses

Para enviar respuestas a una encuesta se envía la solicitud con el metodo **POST** y el endpoint **/surveys/{id}/responses**. Donde el id es el id de la encuesta a la que se quiere añadir las respuestas. Esta acción necesita un body como el siguiente:

``` js
{
        "correoEncuestado": "pedro@gmail.com",
        "respuesta": [
          {
            "idPregunta": 1,
            "tipo": "abierta",
            "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
            "respuesta": "Decente",
            "required": true
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Muy malo",
            "required": true
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto A", "Producto D"],
            "required": false
          }]}

```
Nota: Existen 6 tipos de preguntas las cuales son **abiertas**, **eleccion_simple**, **eleccion_multiple**, **escala_calificacion**, **Si/No** y **numericas**

### GET /surveys/{id}/responses

Para obtener las respuestas de una encuesta en específico se envía la solicitud con el metodo **GET** y el endpoint **/surveys/{id}/responses**. Donde el id es el id de la encuesta a la que se quiere añadir las respuestas. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.

## Encuestados

### POST /respondents

Para añadir un nuevo encuestado se envía la solicitud con el metodo **POST** y el endpoint **/respondents**. Esta acción necesita un body como el siguiente:

``` js
{
    "name": "Pedro",
    "email": "pedro@gmail.com",
    "password": "1234"
}
```

### GET /respondents
Para obtener todos los encuestados se envía la solicitud con el metodo **GET** y el endpoint **/respondents**. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.

### GET /respondents/{id}
Para obtener un encuestado en específico se envía la solicitud con el metodo **GET** y el endpoint **/respondents/{id}**. Donde el id es el id del encuestado en específico. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.

### PUT /respondents/{id}

Para actualizar la información de un encuestado se envía la solicitud con el metodo **PUT** y el endpoint **/respondents/{id}**. Donde el id es el id del encuestado en específico que se quiere modificar. Esta acción solo puede ser realizada por los administradores y creadores de encuesta. Esta acción necesita un body como el siguiente:

``` js
{
    "name": "Pedro",
    "email": "pedro@gmail.com"
}
```

### DELETE /respondents/{id}

Para eliminar a un encuestado se envía la solicitud con el metodo **DELETE** y el endpoint **/respondents/{id}**. Donde el id es el id del encuestado en específico que se quiere eliminar. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.

## Reportes y Análisis

### GET /surveys/{id}/analysis

Para generar un análisis de las respuestas de una encuesta se envía la solicitud con el metodo **GET** y el endpoint **/surveys/{id}/analysis**. Donde el id sería el id de la encuesta de la que se quiera obtener el análisis. Esta acción solo puede ser realizada por los administradores y creadores de encuesta.
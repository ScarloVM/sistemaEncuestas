db = db.getSiblingDB('sistemaEncuestas');

db.createCollection('encuestas');

db.encuestas.insertOne({
    "idEncuesta": 1,
    "titulo": "Encuesta de satisfacción del cliente",
    "descripcion": "Esta encuesta tiene como objetivo recopilar información sobre la satisfacción del cliente.",
    "emailCreador": "prueba",
    "estado": "public",
    "questions": [
      {
        "idPregunta": 1,
        "tipo": "abierta",
        "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
        "required": true
      },
      {
        "idPregunta": 2,
        "tipo": "eleccion_simple",
        "texto": "¿Estás satisfecho con el producto?",
        "options": ["Excelente", "Regular", "Malo", "Muy malo"],
        "required": true
      },
      {
        "idPregunta": 3,
        "tipo": "eleccion_multiple",
        "texto": "¿Qué productos te gustaría ver en el futuro?",
        "options": ["Producto A", "Producto B", "Producto C", "Producto D"],
        "required": false
      },
      {
        "idPregunta": 4,
        "tipo": "escala_calificacion",
        "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
        "options": ["5", "4", "3", "2", "1"],
        "required": false
      },
      {
        "idPregunta": 5,
        "tipo": "Si/No",
        "texto": "¿Recomendarías nuestro servicio a un amigo?",
        "options": ["Si", "No"],
        "required": true
      },
      {
        "idPregunta": 6,
        "tipo": "numerica",
        "texto": "¿Cuántos años tienes?",
        "required": false
      }
    ],
    "respuestas": [
      {
        "correoEncuestado": 1,
        "respuesta": [
          {
            "idPregunta": 1,
            "tipo": "abierta",
            "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
            "respuesta":"Muy malo",
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
            "option_seleccionada": ["Producto B", "Producto C"],
            "required": false
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "2",
            "required": false
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "No",
            "required": true
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "25",
            "required": false
          }
        ]
      },
      {
        "correoEncuestado": 2,
        "respuesta": [
          {
            "idPregunta": 1,
            "tipo": "abierta",
            "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
            "respuesta": "Regular",
            "required": true
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Excelente",
            "required": true
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto A", "Producto D"],
            "required": false
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "4",
            "required": false
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "Si",
            "required": true
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "30",
            "required": false
          }
        ]
      },
      {
        "correoEncuestado": 3,
        "respuesta": [
          {
            "idPregunta": 1,
            "tipo": "abierta",
            "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
            "respuesta": "Excelente",
            "required": true
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Regular",
            "required": true
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto C"],
            "required": false
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "5",
            "required": false
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "Si",
            "required": true
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "40",
            "required": false
          }
        ]
      },
      {
        "correoEncuestado": 4,
        "respuesta": [
          {
            "idPregunta": 1,
            "tipo": "abierta",
            "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
            "respuesta": "Bueno",
            "required": true
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Malo",
            "required": true
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto B", "Producto C"],
            "required": false
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "3",
            "required": false
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "No",
            "required": true
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "20",
            "required": false
          }
        ]
      },
      {
        "correoEncuestado": 5,
        "respuesta": [
          {
            "idPregunta": 1,
            "tipo": "abierta",
            "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
            "respuesta": "Muy bueno",
            "required": true
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Malo",
            "required": true
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto A"],
            "required": false
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "4",
            "required": false
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "Si",
            "required": true
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "35",
            "required": false
          }
        ]
      }
    ]
  }
);
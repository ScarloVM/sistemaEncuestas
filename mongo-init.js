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
        "texto": "¿Cuál es tu opinión sobre nuestro servicio?"
      },
      {
        "idPregunta": 2,
        "tipo": "eleccion_simple",
        "texto": "¿Estás satisfecho con el producto?",
        "options": ["Excelente", "Regular", "Malo", "Muy malo"]
      },
      {
        "idPregunta": 3,
        "tipo": "eleccion_multiple",
        "texto": "¿Qué productos te gustaría ver en el futuro?",
        "options": ["Producto A", "Producto B", "Producto C", "Producto D"]
      },
      {
        "idPregunta": 4,
        "tipo": "escala_calificacion",
        "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
        "options": ["5", "4", "3", "2", "1"]
      },
      {
        "idPregunta": 5,
        "tipo": "Si/No",
        "texto": "¿Recomendarías nuestro servicio a un amigo?",
        "options": ["Si", "No"]
      },
      {
        "idPregunta": 6,
        "tipo": "numerica",
        "texto": "¿Cuántos años tienes?"
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
            "respuesta":"Muy malo"
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Muy malo"
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto B", "Producto C"]
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "2"
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "No"
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "25"
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
            "respuesta": "Regular"
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Excelente"
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto A", "Producto D"]
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "4"
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "Si"
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "30"
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
            "respuesta": "Excelente"
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Regular"
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto C"]
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "5"
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "Si"
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "40"
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
            "respuesta": "Bueno"
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Malo"
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto B", "Producto C"]
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "3"
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "No"
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "20"
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
            "respuesta": "Muy bueno"
          },
          {
            "idPregunta": 2,
            "tipo": "eleccion_simple",
            "texto": "¿Estás satisfecho con el producto?",
            "option_seleccionada": "Malo"
          },
          {
            "idPregunta": 3,
            "tipo": "eleccion_multiple",
            "texto": "¿Qué productos te gustaría ver en el futuro?",
            "option_seleccionada": ["Producto A"]
          },
          {
            "idPregunta": 4,
            "tipo": "escala_calificacion",
            "texto": "¿Qué tan satisfecho estás con nuestro servicio?",
            "option_seleccionada": "4"
          },
          {
            "idPregunta": 5,
            "tipo": "Si/No",
            "texto": "¿Recomendarías nuestro servicio a un amigo?",
            "option_seleccionada": "Si"
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "35"
          }
        ]
      }
    ]
  }
);
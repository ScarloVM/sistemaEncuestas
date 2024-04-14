db = db.getSiblingDB('sistemaEncuestas');

db.createCollection('encuestas');

db.encuestas.insertOne({
    "idEncuesta": 1,
    "titulo": "Encuesta de satisfacción del cliente",
    "descripcion": "Esta encuesta tiene como objetivo recopilar información sobre la satisfacción del cliente.",
    "creador": "user123",
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
          "idEncuestado": 1,
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
                  "option_seleccionada": "No",
                  "required": true
              },
              {
                  "idPregunta": 3,
                  "tipo": "eleccion_multiple",
                  "texto": "¿Qué productos te gustaría ver en el futuro?",
                  "option_seleccionada": "Producto B",
                  "required": false
              }
          ]
      }
    ]
  }
  
  );
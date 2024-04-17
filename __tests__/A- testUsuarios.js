// app.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Función para generar un token JWT válido para pruebas
function generateAuthToken(user) {
  return jwt.sign({ username: user.name, role: user.rol, id: user.id , email: user.email}, 'secreto');
}

const userAdmin = {
  id: 1,
  name: "Admin",
  password: "1234",
  email:"admin@email.com",
  role: 1
}

const userCreador = {
  id: 2,
  name: "Creador",
  password: "1234",
  email:"creador@email.com",
  role: 2
}

const userEncuestado = {
  id: 3,
  name: "Encuestado",
  password: "1234",
  email:"encuestado@email.com",
  role: 3
}

const encuestaPrueba = {
  idEncuesta: 77,
  titulo: "Encuesta de ejemplo",
  descripcion: "Esta es una encuesta de ejemplo",
  emailCreador: "creador@email.com",
  questions: [
    {
      idPregunta: 1,
      tipo: "abierta",
      texto: "¿cual es tu color favorito?",
      required: true
    },

    {
      idPregunta: 2,
      tipo: "eleccion_simple",
      texto: "¿que tanto te gusta el helado?",
      options: ["5", "4", "3", "2", "1"],
      required: true
    },

  ]
};

const encuestaPrueba2 = { 
  idEncuesta: 78,
  titulo: "Encuesta de ejemplo 2",
  descripcion: "Esta es una encuesta de ejemplo 2",
  emailCreador: "creador@email.com",
  questions: [
    {
      idPregunta: 1,
      tipo: "abierta",
      texto: "¿cual es tu color favorito?",
      required: true
    },

    {
      idPregunta: 2,
      tipo: "eleccion_simple",
      texto: "¿que tanto te gusta el helado?",
      options: ["5", "4", "3", "2", "1"],
      required: true
    },

  ]
};

const encuestaPrueba3 = {
  idEncuesta: 79,
  titulo: "Encuesta de ejemplo 3",
  descripcion: "Esta es una encuesta de ejemplo 3",
  emailCreador: "creador@email.com",
  questions: [
    {
      idPregunta: 1,
      tipo: "abierta",
      texto: "¿cual es tu color favorito?",
      required: true
    },

    {
      idPregunta: 2,
      tipo: "eleccion_simple",
      texto: "¿que tanto te gusta el helado?",
      options: ["5", "4", "3", "2", "1"],
      required: true
    },

  ]
};

describe('GET /', () => {
  it('Deberia retornar "ola Kennors"', async () => {
    const response = await request('http://localhost:3000').get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ola Kennors');
  });
});

// Pruebas de autenticación y autorización

describe('POST /auth/register Admin', () => {
  it('Deberia registrar un usuario administrador', async () => {
    const response = await request('http://localhost:3000')
      .post('/auth/register')
      .send(userAdmin);
    expect(response.status).toBe(201);
    expect(response.text).toBe('Usuario registrado correctamente');
  }
  );
});

describe('POST /auth/register Creador ', () => {
  it('Deberia registrar un usuario creador de encuestas', async () => {
    const response = await request('http://localhost:3000')
      .post('/auth/register')
      .send(userCreador);
    expect(response.status).toBe(201);
    expect(response.text).toBe('Usuario registrado correctamente');
  }
  );
});

describe('POST /auth/register Encuestado', () => {
  it('Deberia registrar un usuario encuestado', async () => {
    const response = await request('http://localhost:3000')
      .post('/auth/register')
      .send(userEncuestado);
    expect(response.status).toBe(201);
    expect(response.text).toBe('Usuario registrado correctamente');
  }
  );
});

describe('POST /auth/login Admin', () => {
  it('Deberia loguear un usuario', async () => {
    const response = await request('http://localhost:3000')
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});

// Pruebas de usuarios

describe('GET /users Admin', () => {
  it('Deberia retornar la lista de usuarios', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud GET a /users con la cookie establecida
    const response = await agent
      .get('/users')
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
  });
});

describe('GET /users Creador', () => {
  it('Deberia retornar la lista de usuarios', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userCreador.email, password: userCreador.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud GET a /users con la cookie establecida
    const response = await agent
      .get('/users')
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(403);
  });
});


describe('GET /users:userId Admin', () => {

  it('Deberia retornar un usuario', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud GET a /users/:userId con la cookie establecida
    const response = await agent
      .get(`/users/${userAdmin.id}`)
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
  });
}
);

describe('PUT /users:userId Admin', () => {
  it('Deberia actualizar un usuario', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud PUT a /users/:userId con la cookie establecida
    const response = await agent
      .put(`/users/${5}`)
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send({ name: 'Admin', email: 'admin2@email.com', password: '1234' , rol: 1 });
    
    expect(response.status).toBe(200);
    expect(response.text).toBe('Usuario actualizado correctamente');
  }
  );
});

describe('PUT /users:userId El mismo', () => {
  it('Deberia actualizar un usuario', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userEncuestado.email, password: userEncuestado.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud PUT a /users/:userId con la cookie establecida
    const response = await agent
      .put(`/users/${7}`)
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send({ name: 'Encuestado', email: 'encuestado2@email.com', password: '1234' , rol: 3 });
    
    expect(response.status).toBe(200);
    expect(response.text).toBe('Usuario actualizado correctamente');
  }
  );
});

describe('PUT /users:userId otro Usuario', () => {
  it('Deberia actualizar un usuario', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userCreador.email, password: userCreador.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud PUT a /users/:userId con la cookie establecida
    const response = await agent
      .put(`/users/${userEncuestado.id}`)
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send({ name: 'Admin', email: 'admin@email.com', password: '1234' , rol: 1 });
    
    expect(response.status).toBe(403);
    expect(response.text).toBe('Acceso denegado. No tiene permiso para acceder a este recurso');
  }
  );
});

userAdmin.email = 'admin2@email.com';

describe('DELETE /users:userId Admin', () => {
  it('Deberia eliminar un usuario', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud DELETE a /users/:userId con la cookie establecida
    const response = await agent
      .delete(`/users/${userEncuestado.id}`)
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
    expect(response.text).toBe('Usuario eliminado correctamente');
  });
});

describe('DELETE /users:userId Creador', () => {

  it('Deberia eliminar un usuario', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userCreador.email, password: userCreador.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud DELETE a /users/:userId con la cookie establecida
    const response = await agent
      .delete(`/users/${userEncuestado.id}`)
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(403);
  });
});


//Pruebas Unitarias para Respuestas de Encuestas
describe('POST /surveys/:id/responses', () => {
  it('Deberia responder una encuesta', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userEncuestado.email, password: userEncuestado.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud POST a /surveys/:id/responses con la cookie establecida
    const response = await agent
      .post('/surveys/1/responses')
      .send({
        "correoEncuestado": 6,
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
            "option_seleccionada": "Si",
            "required": true
          },
          {
            "idPregunta": 6,
            "tipo": "numerica",
            "texto": "¿Cuántos años tienes?",
            "respuesta": "35",
            "required": false
          }]})
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
    expect(response.text).toBe('Se ha insertado la respuesta correctamente');
  })
});

describe('GET /surveys/:id/responses', () => {
  it('Deberia obtener las respuestas de una encuesta', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud GET a /surveys/:id/responses con la cookie establecida
    const response = await agent
      .get('/surveys/1/responses')
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
  });
});

//Pruebas unitarias Encuestados
describe('POST /respondents', () => {
  it('Deberia crear un encuestado', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud POST a /respondents con la cookie establecida
    const response = await agent
      .post('/respondents')
      .send({
        "name": "Prueba Encuestado",
        "email": "prueba@gmail.com",
        "password": "1234"
      })
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(201);
  }) 
});

describe('GET /respondents', () => {
  it('Deberia obtener la lista de encuestados', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud GET a /respondents con la cookie establecida
    const response = await agent
      .get('/respondents')
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
  });
});

describe('GET /respondents/:id', () => {
  it('Deberia obtener un encuestado por su ID', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud GET a /respondents/:id con la cookie establecida
    const response = await agent
      .get('/respondents/1')
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
  });
});

describe('PUT /respondents/:id', () => {
  it('Deberia actualizar un encuestado por su ID', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud PUT a /respondents/:id con la cookie establecida
    const response = await agent
      .put('/respondents/2')
      .send({
        "name": "Prueba Encuestado Modificado",
        "email": "actualizado@gmail.com"})
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido
    
    expect(response.status).toBe(200);
    expect(response.text).toBe('Encuestado actualizado exitosamente');
  });
});

describe('DELETE /respondents/:id', () => {
  it('Deberia eliminar un encuestado por su ID', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud DELETE a /respondents/:id con la cookie establecida
    const response = await agent
      .delete('/respondents/4')
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
    expect(response.text).toBe('Encuestado eliminado exitosamente');
  });
});

describe('GET /surveys/:id/analysis', () => {
  it('Deberia obtener el análisis de una encuesta', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud GET a /surveys/:id/analysis con la cookie establecida
    const response = await agent
      .get('/surveys/1/analysis')
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    expect(response.status).toBe(200);
  });
});

describe('POST /surveys Admin', () => {
  it('Debería crear una nueva encuesta como administrador', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Realiza la solicitud POST a /surveys con la cookie establecida y los datos de la nueva encuesta
    const response = await agent
      .post('/surveys')
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(encuestaPrueba);

    // Verifica que la solicitud haya sido exitosa y que la respuesta contenga un ID
    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
  });
});



describe('POST /surveys creador', () => {
  it('Debería crear una nueva encuesta como creador de encuestas', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userCreador.email, password: userCreador.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Realiza la solicitud POST a /surveys con la cookie establecida y los datos de la nueva encuesta
    const response = await agent
      .post('/surveys')
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(encuestaPrueba);

    // Verifica que la solicitud haya sido exitosa y que la respuesta contenga un ID
    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
  });
});


describe('POST /surveys encuestado', () => {

  it('Deberia retornar 403 al intentar crear una encuesta', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userEncuestado.email, password: userEncuestado.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Realiza la solicitud POST a /surveys con la cookie establecida y los datos de la nueva encuesta
    const response = await agent
      .post('/surveys')
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(encuestaPrueba);

    // Verifica que la solicitud haya sido exitosa y que la respuesta contenga un ID
    expect(response.status).toBe(403);
  });
});


describe('GET /surveys', () => {
  it('Deberia retornar la lista de encuestas', async () => {
    const response = await request('http://localhost:3000').get('/surveys');
    expect(response.status).toBe(200);
  });
});


describe('GET /surveys/:id', () => {
  it('Deberia retornar una encuesta por su ID', async () => {
    const response = await request('http://localhost:3000').get('/surveys/77');
    expect(response.status).toBe(200);
  });
});


describe('PUT /surveys/:id Admin', () => {
  it('Debería actualizar una encuesta como administrador', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token como administrador
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Realiza una solicitud POST para crear una nueva encuesta como administrador
    const createSurveyResponse = await agent
      .post('/surveys')
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(encuestaPrueba); // Envía los datos de la nueva encuesta

    // Extrae el ID de la encuesta creada
    const surveyId = createSurveyResponse.body.id;

    // Datos actualizados para la encuesta
    const updatedSurveyData = {
      titulo: 'holanda23',
      descripcion: 'Esta es una encuesta de ejemplo actualizada',
      questions: [
        {
          idPregunta: 1,
          tipo: 'abierta',
          texto: '¿Cuál es tu color favorito xd?',
          required: true,
        },
        {
          idPregunta: 2,
          tipo: 'eleccion_simple',
          texto: '¿Qué tanto te gusta el helado?',
          options: ['5', '4', '3', '2', '1'],
          required: true,
        },
      ],
    };

  
     const updateSurveyResponse = await agent
      .put(`/surveys/77`)
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(updatedSurveyData); // Envía los datos actualizados de la encuesta

    // Verifica que la solicitud haya sido exitosa
    expect(updateSurveyResponse.status).toBe(200);
    


  });
});


describe('PUT /surveys/:id Creador', () => {
  it('Debería actualizar una encuesta como creador de encuestas', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token como creador de encuestas
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userCreador.email, password: userCreador.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Realiza una solicitud POST para crear una nueva encuesta como creador de encuestas
    const createSurveyResponse = await agent
      .post('/surveys')
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(encuestaPrueba); // Envía los datos de la nueva encuesta

    // Extrae el ID de la encuesta creada
    const surveyId = createSurveyResponse.body.id;

    // Datos actualizados para la encuesta
    const updatedSurveyData = {
      titulo: 'alocomoasibro166',
      descripcion: 'Esta es una ensdcuesta actualizada',
      emailCreador: 't',
      questions: [
        {
          idPregunta: 1,
          tipo: 'abierta',
          texto: '¿Cuál es tu color favorito?',
          required: true,
        },
        {
          idPregunta: 2,
          tipo: 'eleccion_simple',
          texto: '¿Qué tanto te gusta el helado?',
          options: ['5', '4', '3', '2', '1'],
          required: true,
        },
      ],
    };
    const updateSurveyResponse = await agent
      .put(`/surveys/77`)
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(updatedSurveyData); // Envía los datos actualizados de la encuesta

    // Verifica que la solicitud haya sido exitosa
    expect(updateSurveyResponse.status).toBe(200);
   
  });
}
);


describe('DELETE /surveys/:id Admin', () => {
  it('Debería eliminar una encuesta como administrador', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token como administrador
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Realiza una solicitud POST para crear una nueva encuesta como administrador
    const createSurveyResponse = await agent
      .post('/surveys')
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send(encuestaPrueba); // Envía los datos de la nueva encuesta

    // Extrae el ID de la encuesta creada
    const surveyId = createSurveyResponse.body.id;

    // Realiza la solicitud DELETE a /surveys/:id con la cookie establecida
    const deleteSurveyResponse = await agent
      .delete(`/surveys/77`)
      .set('Cookie', `token=${token}`); // Establece la cookie con el token obtenido

    // Verifica que la solicitud haya sido exitosa
    expect(deleteSurveyResponse.status).toBe(200);
  });
});











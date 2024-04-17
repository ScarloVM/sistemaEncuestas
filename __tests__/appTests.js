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


describe('GET /', () => {
  it('Deberia retornar "ola Kennors"', async () => {
    const response = await request('http://localhost:3000').get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('ola Kennors');
  });
});

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
        "nombre": "Prueba Encuestado",
        "correo": "prueba@gmail.com",
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



// Pruebas de encuestas

describe('POST /encuestas Admin', () => {
  it('Deberia crear una encuesta', async () => {
    const agent = request.agent('http://localhost:3000'); // Crea un agente para mantener las cookies

    // Realiza una solicitud POST para iniciar sesión y obtener el token
    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userAdmin.email, password: userAdmin.password }); // Envía las credenciales de inicio de sesión
    const token = loginResponse.body.token; // Extrae el token de la respuesta

    // Ahora, realiza la solicitud POST a /encuestas con la cookie establecida
    const response = await agent
      .post('/encuestas')
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send({ titulo: 'Encuesta de prueba', descripcion: 'Esta es una encuesta de prueba' });

    expect(response.status).toBe(201);
  });
})







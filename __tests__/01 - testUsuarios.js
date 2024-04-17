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
      .put(`/users/${userAdmin.id}`)
      .set('Cookie', `token=${token}`) // Establece la cookie con el token obtenido
      .send({ name: 'Admin', email: 'email2@email.com', password: '1234' , rol: 1 });
    
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
      .send({ name: 'Admin', email: 'email2@email.com', password: '1234' , rol: 1 });
    
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
      .send({ name: 'Admin', email: 'email2@email.com', password: '1234' , rol: 1 });
    
    expect(response.status).toBe(403);
    expect(response.text).toBe('Acceso denegado. No tiene permiso para acceder a este recurso');
  }
  );
});

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









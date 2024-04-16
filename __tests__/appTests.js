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











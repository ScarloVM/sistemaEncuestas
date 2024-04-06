// app.test.js
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Función para generar un token JWT válido para pruebas
function generateAuthToken(username) {
  return jwt.sign({ username }, 'secreto');
}

describe('GET /', () => {
  it('Deberia retornar "Hello World"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World');
  });
});

describe('GET /api/tasks', () => {
  it('Deberia retornar las tareas', async () => {
    const authToken = generateAuthToken('Javier'); // Generar un token JWT válido
    
    const response = await request(app).get('/api/tasks')
    .set('Authorization', `Bearer ${authToken}`); // Incluir el token en el encabezado de autorización
    expect(response.status).toBe(200); // Estado de respuesta OK
  });
});

describe('GET /api/tasks/:id', () => {
  it('Deberia retornar la tarea con id=1', async () => {
    const authToken = generateAuthToken('Javier'); // Generar un token JWT válido
    const response = await request(app).get('/api/tasks/1')
    .set('Authorization', `Bearer ${authToken}`); // Incluir el token en el encabezado de autorización
    expect(response.status).toBe(200); // Estado de respuesta OK
    expect(response.body).toHaveProperty('id', 1);
  });
});

describe('POST /api/tasks', () => {
  it('Deberia crear una nueva task', async () => {
    const postData = {
      
        title: "new_task2",
        description: "Here we are",
        status: "pending",
        due_date: "09/03/2024",
        user_id:"1"
    };

    const authToken = generateAuthToken('Javier'); // Generar un token JWT válido

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`) // Incluir el token en el encabezado de autorización
      .send(postData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('title', postData.title);
    expect(response.body).toHaveProperty('description', postData.description);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('Deberia hacerle un update al task con id=1', async () => {
    const postData = {
        title: "Task updateado",
        description: "Here we go!",
        due_date: "09-11-2001",
        status: "pending",
        user_id: 1

    };

    const authToken = generateAuthToken('Javier'); // Generar un token JWT válido

    const response = await request(app)
      .put('/api/tasks/1')
      .set('Authorization', `Bearer ${authToken}`) // Incluir el token en el encabezado de autorización
      .send(postData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('title', postData.title);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('Deberia eliminar el task con id=3', async () => {

    const authToken = generateAuthToken('Javier'); // Generar un token JWT válido
    
    const response = await request(app)
    .delete('/api/tasks/3')
    .set('Authorization', `Bearer ${authToken}`); // Incluir el token en el encabezado de autorización
    
    
    expect(response.status).toBe(200);
    expect(response.text).toBe('3');
  });
});



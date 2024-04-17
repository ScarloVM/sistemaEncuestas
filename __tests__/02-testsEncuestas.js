// Pruebas de encuestas
const request = require('supertest');
const jwt = require('jsonwebtoken');


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
  
  
  
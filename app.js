const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Database} = require('./db.js');
const {Database2} = require('./db2.js');
const {AppService} = require('./AppService.js');

const app = express();

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const MONGO_URL = process.env.MONGO_URL;
const MONGO_NAME = process.env.MONGO_NAME;
const db2 = new Database2(MONGO_NAME, MONGO_URL,'root', 'example');

const db = new Database(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT);

const appService = new AppService(db, db2);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('ola Kennors');
});

// Autenticacion y Autorizacion
app.post('/auth/register', async (req, res) => {
    try {
        
        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await appService.getUserByUsername(req.body.name);
        if (existingUser) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }
        // Hash de la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Guardar el nuevo usuario en la base de datos
        await appService.createUser(req.body.name, hashedPassword);
        res.status(201).send('Usuario registrado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar al usuario');
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        // Obtener el usuario de la base de datos
        const user = await appService.getUserByUsername(req.body.name);
        if (!user) {
            return res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
        // Generar un token JWT para el usuario autenticado
        const token = jwt.sign({ username: user.username }, 'secreto');
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al iniciar sesión');
    }
});

app.get('/auth/logout', (req, res) => {
    res.send('Sesión cerrada correctamente');
});



// Usuarios
app.get('/users', async (req, res) => { // r
    const tasks = await appService.getUsers();
    res.send(tasks);
});

app.get('/users/:id', async (req, res) => { // r
    const task = await appService.getUserById(req.params.id);
    res.send(task);
});

app.put('/users/:id', authenticateToken, async (req, res) => {
    const task = await appService.updateUser(req.body,req.params.id);
    res.send(task);
});

app.delete('/users/:id', authenticateToken, async (req, res) => {
    const task = await appService.deleteUser(req.params.id);
    res.send(task);
});

// Encuestas

app.post('/surveys',  async (req, res) => {
    try {
        const survey = await appService.createSurvey(req.body);
        res.status(201).send(survey);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear la encuesta');
    }
});

app.get('/surveys', async (req, res) => { // r
    const surveys = await appService.getSurveys('encuestas');
    res.send(surveys);
});

app.get('/surveys/:id', async (req, res) => { // r
    const survey = await appService.getSurveyById(req.params.id);
    res.send(survey);
});

app.put('/surveys/:id', async (req, res) => {
    const survey = await appService.updateSurvey(req.params.id, req.body);
    res.sendStatus(survey ? 200 : 404);
});

app.delete('/surveys/:id', async (req, res) => {
    const result = await appService.deleteSurvey(req.params.id);
    res.sendStatus(result ? 200 : 404);
});

app.post('/surveys/:id/publish', async (req, res) => {
    const survey = await appService.publishSurvey(req.params.id);
    res.send(survey);
});

// Preguntas de encuestas

app.post('/surveys/:id/questions', authenticateToken, async (req, res) => {
    try {
        const question = await appService.createQuestion(req.body, req.params.id);
        res.status(201).send(question);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear la pregunta');
    }
});

app.get('/surveys/:id/questions', async (req, res) => { //r
    const questions = await appService.getQuestions(req.params.id);
    res.send(questions);
});

app.put('/surveys/:id/questions/:questionId', authenticateToken, async (req, res) => {
    const question = await appService.updateQuestion(req.body, req.params.questionId);
    res.send(question);
});

app.delete('/surveys/:id/questions/:questionId', authenticateToken, async (req, res) => {
    const question = await appService.deleteQuestion(req.params.questionId);
    res.send(question);
});

// Respuestas de encuestas

app.post('/surveys/:id/responses', async (req, res) => {
    try {
        const response = await appService.insertResponse(req.body, req.params.id);
        console.log(response);
        res.status(200).send({ modifiedCount: response }); // Envía un código de estado 200 y el valor de modifiedCount como cuerpo de respuesta
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al insertar la respuesta');
    }
});

app.get('/surveys/:id/responses', async (req, res) => { // r
    const responses = await appService.getResponses(req.params.id);
    res.send(responses);
});

// Encuestados
app.post('/respondents', authenticateToken, async (req, res) => {
    try {
        const respondent = await appService.createRespondent(req.body);
        res.status(201).send(respondent);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el encuestado');
    }
});

app.get('/respondents', async (req, res) => { // r
    const respondents = await appService.getRespondents();
    res.send(respondents);
});

app.get('/respondents/:id', async (req, res) => { // r
    const respondent = await appService.getRespondentById(req.params.id);
    res.send(respondent);
});

app.put('/respondents/:id', authenticateToken, async (req, res) => {
    const respondent = await appService.updateRespondent(req.body, req.params.id);
    res.send(respondent);
});

app.delete('/respondents/:id', authenticateToken, async (req, res) => {
    const respondent = await appService.deleteRespondent(req.params.id);
    res.send(respondent);
});

// Reportes y analisis
app.get('/surveys/:id/analysis', async (req, res) => { // r
    const analysis = await appService.getAnalysis(req.params.id);
    res.send(analysis);
});


// Middleware para verificar el token JWT y autenticar al usuario
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtener el token JWT del encabezado de autorización
    if (!token) {
        return res.status(401).send('Se requiere un token de autenticación');
    }
    jwt.verify(token, 'secreto', (err, user) => {
        if (err) {
            return res.status(403).send('Token de autenticación inválido');
        }
        req.user = user;
        next();
    });
}


// _______________________________________________________________________________________________
// Configuración del puerto y inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;
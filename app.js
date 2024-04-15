const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Database} = require('./db.js');
const {Database2} = require('./db2.js');
const {AppService} = require('./AppService.js');
const {RedisClient} = require('./redis.js');
const cookieParser = require('cookie-parser');

const app = express();

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const MONGO_URL = process.env.MONGO_URL;
const MONGO_NAME = process.env.MONGO_NAME;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const redisClient = new RedisClient(REDIS_HOST, REDIS_PORT);

const db2 = new Database2(MONGO_NAME, MONGO_URL,'root', 'example');

const db = new Database(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT);

const appService = new AppService(db, db2, redisClient);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('ola Kennors');
});

// Autenticacion y Autorizacion
app.post('/auth/register', async (req, res) => {
    try {
        
        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await appService.getUserByEmail(req.body.email);
        if (existingUser) {
            return res.status(400).send('El email ya está en uso');
        }
        // Hash de la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Guardar el nuevo usuario en la base de datos
        await appService.createUser(req.body.name, req.body.email, hashedPassword, req.body.role);
        res.status(201).send('Usuario registrado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar al usuario');
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        // Obtener el usuario de la base de datos
        const user = await appService.getUserByEmail(req.body.email);
        if (!user) {
            return res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
        // Generar un token JWT para el usuario autenticado
        const token = jwt.sign({ username: user.name, role: user.rol, id: user.id , email: user.email}, 'secreto');
        res.cookie('token', token, { httpOnly: true });
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al iniciar sesión');
    }
});

app.get('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send('Sesión cerrada correctamente');
});



// Usuarios
app.get('/users',  async (req, res) => { // r
    const tasks = await appService.getUsers();
    res.send(tasks);
});

app.get('/users/:id', async (req, res) => { // r
    const task = await appService.getUserById(req.params.id);
    res.send(task);
});

app.put('/users/:id', authenticateOwnRole, async (req, res) => {
    const task = await appService.updateUser(req.body,req.params.id);
    res.status(200).send("Usuario actualizado correctamente");
});

app.delete('/users/:id', authenticateAdmin, async (req, res) => {
    const task = await appService.deleteUser(req.params.id);
    res.status(200).send("Usuario eliminado correctamente");
});

// Encuestas

app.post('/surveys', authenticateAdminCreator, async (req, res) => {
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

app.put('/surveys/:id', authenticateAdminCreator, authenticateAdminOrSurveyCreator, async (req, res) => {
    const survey = await appService.updateSurvey(req.params.id, req.body);
    res.sendStatus(survey ? 200 : 404);
});

app.delete('/surveys/:id',authenticateAdminCreator, authenticateAdminOrSurveyCreator, async (req, res) => {
    const result = await appService.deleteSurvey(req.params.id);
    res.sendStatus(result ? 200 : 404);
});

app.post('/surveys/:id/publish',authenticateAdminCreator, authenticateAdminOrSurveyCreator, async (req, res) => {
    const surveyId = req.params.id;
    try {
        const result = await appService.publishSurvey(surveyId);
        if (result) {
            res.status(200).send("Survey published successfully.");
        } else {
            res.status(404).send("Survey not found.");
        }
    } catch (error) {
        console.error(`Failed to publish survey: ${error}`);
        res.status(500).send("Failed to publish survey.");
    }
});


// Preguntas de encuestas

app.post('/surveys/:id/questions', async (req, res) => {
    const surveyId = req.params.id;
    const newQuestion = req.body;

    try {
        const result = await appService.addQuestionToSurvey(surveyId, newQuestion);
        if (result) {
            res.status(201).send("Question added to survey successfully.");
        } else {
            res.status(404).send("Survey not found.");
        }
    } catch (error) {
        console.error(`Failed to add question to survey: ${error}`);
        res.status(500).send("Failed to add question to survey.");
    }
});


app.get('/surveys/:id/questions', async (req, res) => {
    const surveyId = req.params.id;
    try {
        const questions = await appService.getSurveyQuestions(surveyId);
        if (questions) {
            res.status(200).json(questions);
        } else {
            res.status(404).send("Survey not found.");
        }
    } catch (error) {
        console.error(`Failed to get survey questions: ${error}`);
        res.status(500).send("Failed to get survey questions.");
    }
});


app.put('/surveys/:id/questions/:questionId', async (req, res) => {
    const surveyId = req.params.id;
    const questionId = req.params.questionId;
    const updatedQuestion = req.body; // Nueva información de la pregunta
    
    try {
        // Actualiza la pregunta en la encuesta especificada
        const result = await appService.updateSurveyQuestion(surveyId, questionId, updatedQuestion);
        
        if (result) {
            res.status(200).send("Pregunta de encuesta actualizada correctamente.");
        } else {
            res.status(404).send("Encuesta o pregunta no encontrada.");
        }
    } catch (error) {
        console.error(`Error al actualizar la pregunta de la encuesta: ${error}`);
        res.status(500).send("Error al actualizar la pregunta de la encuesta.");
    }
});




app.delete('/surveys/:id/questions/:questionId', async (req, res) => {
    const surveyId = req.params.id;
    const questionId = req.params.questionId;
    
    try {
        // Eliminar la pregunta de la encuesta especificada
        const result = await appService.deleteSurveyQuestion(surveyId, questionId);
        
        if (result) {
            res.status(200).send("Pregunta de encuesta eliminada correctamente.");
        } else {
            res.status(404).send("Encuesta o pregunta no encontrada.");
        }
    } catch (error) {
        console.error(`Error al eliminar la pregunta de la encuesta: ${error}`);
        res.status(500).send("Error al eliminar la pregunta de la encuesta.");
    }
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

app.get('/surveys/:id/responses', authenticateAdminCreator, async (req, res) => { // r
    const responses = await appService.getResponses(req.params.id);
    res.send(responses);
});



app.put('/surveys/:id/questions/:questionId', async (req, res) => {
    const surveyId = req.params.id;
    const questionId = req.params.questionId;
    const updatedQuestion = req.body; // Nueva información de la pregunta
    
    try {
        // Actualiza la pregunta en la encuesta especificada
        const result = await appService.updateSurveyQuestion(surveyId, questionId, updatedQuestion);
        
        if (result) {
            res.status(200).send("Pregunta de encuesta actualizada correctamente.");
        } else {
            res.status(404).send("Encuesta o pregunta no encontrada.");
        }
    } catch (error) {
        console.error(`Error al actualizar la pregunta de la encuesta: ${error}`);
        res.status(500).send("Error al actualizar la pregunta de la encuesta.");
    }
});


// Encuestados
app.post('/respondents', async (req, res) => {
    try {
        const existingUser = await appService.getUserByEmail(req.body.email);
        if (existingUser) {
            return res.status(400).send('El nombre de usuario ya está en uso');
        }
        // Hash de la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Guardar el nuevo encuestado en la base de datos
        const respondent = await appService.createRespondent(req.body.name, req.body.email, hashedPassword);
        res.status(201).send(respondent);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el encuestado');
    }
});

app.get('/respondents',  authenticateAdminCreator, async (req, res) => { // r
    const respondents = await appService.getRespondents();
    res.send(respondents);
});

app.get('/respondents/:id', authenticateAdminCreator, async (req, res) => { // r
    const respondent = await appService.getRespondentById(req.params.id);
    res.send(respondent);
});

app.put('/respondents/:id', authenticateAdminCreator, async (req, res) => {
    const respondent = await appService.updateRespondent(req.body, req.params.id);
    res.send(respondent);
});

app.delete('/respondents/:id', authenticateAdminCreator, async (req, res) => {
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
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Se requiere un token de autenticación');
    }
    
    // Verificar y decodificar el token JWT
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(403).send('Token de autenticación inválido');
        }
        // Extraer la información del payload
        const { username, role } = decoded;

        // Guardar la información en el objeto de solicitud (req) para su uso posterior
        req.user = { username, role };

        next();
    });
}

// Middleware para verificar el token JWT y autenticar al usuario como administrador
function authenticateAdmin(req, res, next) {
    const token = req.cookies.token
    console.log(token)
    if (!token) {
        return res.status(401).send('Se requiere un token de autenticación');
    }
    
    // Verificar y decodificar el token JWT
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(403).send('Token de autenticación inválido');
        }
        // Verificar si el rol del usuario es administrador
        if (decoded.role !== 1) {
            return res.status(403).send('Acceso denegado. Se requiere rol de administrador');
        }
        // Si el usuario es administrador, continúa con la siguiente middleware
        next();
    });
}

function authenticateAdminCreator(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).send('Se requiere un token de autenticación');
    }
    
    // Verificar y decodificar el token JWT
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(403).send('Token de autenticación inválido');
        }
        // Verificar si el rol del usuario es administrador
        if (decoded.role !== 1 && decoded.role !== 2) {
            return res.status(403).send('Acceso denegado. Se requiere rol de administrador o creador de encuestas');
        }
        // Si el usuario es administrador, continúa con la siguiente middleware
        next();
    });

}

async function authenticateAdminOrSurveyCreator(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Se requiere un token de autenticación');
    }
    
    // Verificar y decodificar el token JWT
    jwt.verify(token, 'secreto', async (err, decoded) => {
        if (err) {
            return res.status(403).send('Token de autenticación inválido');
        }
        
        // Extraer la información del payload del token
        //const { email, role } = decoded;

        // Verificar si el usuario es administrador o creador de la encuesta
        if (decoded.role === 1) {
            // El usuario es administrador
            next();
        } else {
            // El usuario no es administrador, comprobamos si es el creador de la encuesta
            const surveyId = req.params.id;
            try {
                const survey = await db2.findSurveyById(surveyId); 
                if (!survey) {
                    return res.status(404).send('Encuesta no encontrada');
                }
                const creatorEmail = survey.emailCreador;
                console.log("creatorEmail: ", creatorEmail, "email: ", decoded.email)
                if (decoded.email === creatorEmail) {
                    // El usuario es el creador de la encuesta
                    next();
                } else {
                    // El usuario no es administrador ni el creador de la encuesta
                    return res.status(403).send('Acceso denegado. Se requiere rol de administrador o ser el creador de la encuesta');
                }
            } catch (error) {
                console.error(`Error al verificar el creador de la encuesta: ${error}`);
                return res.status(500).send('Error interno del servidor');
            }
        }
    });
}



function authenticateOwnRole(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Se requiere un token de autenticación');
    }
    // Verificar y decodificar el token JWT
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(403).send('Token de autenticación inválido');
        }
        // Verificar si el ID del usuario en el token coincide con el ID proporcionado en la solicitud
        // o si el rol del usuario en el token es igual a 1 (es decir, si es administrador)

        if(decoded.role !==1){
            if (decoded.id !== parseInt(req.params.id)) {
                return res.status(403).send('Acceso denegado. No tiene permiso para acceder a este recurso');
            }
        }
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
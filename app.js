const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Database} = require('./db.js');
const {AppService} = require('./AppService.js');

const app = express();

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const db = new Database(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT);

const appService = new AppService(db);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.get('/api/tasks', authenticateToken, async (req, res) => {
    const tasks = await appService.getTasks();
    res.send(tasks);
});

app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
    const task = await appService.getTaskById(req.params.id);
    res.send(task);
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    const task = await appService.createTask(req.body);
    res.send(task);
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    const task = await appService.updateTask(req.body,req.params.id);
    res.send(task);
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    const task = await appService.deleteTask(req.params.id);
    res.send(task);
});



// ---------------------------------------------------------------------------------------------


// Ruta para el registro de usuarios
app.post('/api/register', async (req, res) => {
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


// Ruta para iniciar sesión
app.post('/api/login', async (req, res) => {
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
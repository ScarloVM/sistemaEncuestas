const { Client } = require('pg');
const bcrypt = require('bcryptjs');
class Database {
    constructor(database, user, password, host, port) {
        this.database = database;
        this.user = user;
        this.password = password;
        this.host = host;
        this.port = port;
        this.client = new Client({
            user: this.user,
            host: this.host,
            database: this.database,
            password: this.password,
            port: this.port,
        });
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
        } catch (e) {
            console.error(`Failed to connect ${e}`);
        }
    }

    async disconnect() {
        try {
            await this.client.end();
            console.log('Disconnected from the database');
        } catch (e) {
            console.error(`Failed to disconnect ${e}`);
        }
    }

// Autenticacion y Autorizacion
async createUser(username, email, password, rol) {
    try {
        await this.client.query('INSERT INTO users (name, email, password, rol) VALUES ($1, $2, $3, $4)', [username, email, password, rol]);
    } catch (e) {
        console.error(`Failed to create user ${e}`);
    }
}


    async getUserByEmail(email) {
        try {
            const result = await this.client.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        } catch (e) {
            console.error(`Failed to get user by email ${e}`);
        }
    }
// Usuarios

    async getUsers() {
        try {
            const result = await this.client.query('SELECT * FROM users');
            return result.rows;
        } catch (e) {
            console.error(`Failed to get users ${e}`);
        }
    }

    async getUserById(id) {
        try {
            const result = await this.client.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0];
        } catch (e) {
            console.error(`Failed to get user by id ${e}`);
        }
    }

    async updateUser(request_json, id) {
        try {
            const hashedPassword = await bcrypt.hash(request_json.password, 10);
            await this.client.query('UPDATE users SET name = $1, email = $2 , password = $3, rol = $4 WHERE id = $5', [request_json.name,request_json.email, hashedPassword,request_json.rol, id])
        } catch (e) {
            console.error(`Failed to update user ${e}`);
        }
    }

    async deleteUser(id) {
        try {
            await this.client.query('DELETE FROM users WHERE id = $1', [id]);
        } catch (e) {
            console.error(`Failed to delete user ${e}`);
        }
    }

    //Encuestados
    async createRespondent(username, email, password) {
        try {
            await this.client.query('INSERT INTO users (name, email, password, rol) VALUES ($1, $2, $3, 3)', [username, email, password]);
        } catch (e) {
            console.error(`Failed to create respondent ${e}`);
            return 'Error al crear encuestado';
        }
    }

    async getRespondents() {
        try {
            const result = await this.client.query('select * from users where rol = 3');
            return result.rows;
        } catch (e) {
            console.error(`Failed to get encuestados ${e}`);
            return 'Error al obtener encuestados';
        }
    }

    async getRespondentById(id) {
        try {
            const result = await this.client.query('SELECT * FROM users WHERE id = $1 AND rol = 3', [id]);
            return result.rows[0];
        } catch (e) {
            console.error(`Failed to get respondent by id ${e}`);
            return 'Error al obtener encuestado';
        }
    }

    async updateRespondent(request_json, id) {
        try {
            await this.client.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 AND rol = 3', [request_json.name, request_json.email, id]);
            return 'Encuestado actualizado exitosamente';
        } catch (e) {
            console.error(`Failed to update respondent ${e}`);
            return 'Error al actualizar encuestado';
        }
    }

    async deleteRespondent(id) {
        try {
            await this.client.query('DELETE FROM users WHERE id = $1 AND rol = 3', [id]);
            return 'Encuestado eliminado exitosamente';
        } catch (e) {
            console.error(`Failed to delete respondent ${e}`);
            return 'Error al eliminar encuestado';
        }
    }
}

module.exports.Database = Database;

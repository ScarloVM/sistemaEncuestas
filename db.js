const { Client } = require('pg');

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

    async getTasks() {
        try {
            const res = await this.client.query('SELECT * FROM tasks');
            return res.rows;
        } catch (e) {
            console.error(`Failed to get tasks ${e}`);
        }
    }

    async getTaskById(id) {
        try {
            const res = await this.client.query('SELECT * FROM tasks WHERE id = $1', [id]);
            return res.rows[0];
        } catch (e) {
            console.error(`Failed to get task by id ${e}`);
        }
    }

    async createTask(request_json) {
        try {
            const res = await this.client.query('INSERT INTO tasks (title, description, status, due_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [request_json.title, request_json.description, request_json.status, request_json.due_date, request_json.user_id]);
            return res.rows[0];
        } catch (e) {
            console.error(`Failed to create task ${e}`);
        }
    }

    async updateTask(request_json, id) {
        try {
            const res = await this.client.query('UPDATE tasks SET title = $1, description = $2, status = $3 , due_date = $4 WHERE id = $5 RETURNING *', [request_json.title, request_json.description, request_json.status, request_json.due_date, id]);
            return res.rows[0];
        } catch (e) {
            console.error(`Failed to update task ${e}`);
        }
    }

    async verifyUser(id) {
        try {
            const res = await this.client.query('SELECT * FROM users WHERE id = $1', [id]);
            // Verificar si se encontró algún usuario con el ID dado
            if (res.rows.length > 0) {
                // Si hay al menos un resultado, el usuario existe
                return true;
            } else {
                // Si no se encontró ningún resultado, el usuario no existe
                return false;
            }
        } catch (e) {
            console.error(`Failed to get user by id ${e}`);
            // En caso de error, también puedes retornar false
            return false;
        }
    }
    

    async deleteTask(id) {
        try {
            const res = await this.client.query('DELETE FROM tasks WHERE id = $1', [id]);
            return id;
        } catch (e) {
            console.error(`Failed to delete task ${e}`);
        }
    }

    async getUserbyName(username){
        try{
            const res = await this.client.query('SELECT * FROM users WHERE name = $1', [username]);
            return res.rows[0];
        }
        catch (e) {
            console.error(`Failed to get username ${e}`);
        }
    }

    async createUserdb(user,password){
        try {
            const res = await this.client.query('INSERT INTO users (name, password) VALUES ($1, $2)', [user, password]);
            return res.rows[0];
        }
        catch (e) {
            console.error(`Failed to get username ${e}`);
        }
    }

    
}

module.exports.Database = Database;

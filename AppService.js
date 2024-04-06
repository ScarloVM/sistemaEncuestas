class AppService {
    constructor(database) {
        this.database = database;
    }

    async getTasks() {
        try{
            return await this.database.getTasks();
        }
        catch(e){
            console.error(`Failed to get tasks ${e}`);
        }
    }

    async getTaskById(id) {
        try{
            return await this.database.getTaskById(id);
        }
        catch(e){
            console.error(`Failed to get task by id ${e}`);
        }
    }

    async createTask(request_json) {
        try{
            return await this.database.createTask(request_json);
        }
        catch(e){
            console.error(`Failed to create task ${e}`);
        }
    }

    async updateTask(request_json, id) {
        try{
            return await this.database.updateTask(request_json, id);
        }
        catch(e){
            console.error(`Failed to update task ${e}`);
        }
    }

    async deleteTask(id) {
        try{
            return await this.database.deleteTask(id);
        }
        catch(e){
            console.error(`Failed to delete task ${e}`);
        }
    }

    async getUserByUsername(username) {
        // Implementa la lógica para consultar la base de datos y obtener el usuario por su nombre de usuario
        // Por ejemplo, utilizando un método de consulta SQL
        try {
            return await this.database.getUserbyName(username); // Devuelve el primer usuario encontrado con ese nombre de usuario
        } catch (error) {
            console.error('Error al obtener el usuario por nombre de usuario:', error);
            throw error;
        }
    }

    async createUser(user,password){
        try {
            return await this.database.createUserdb(user, password);// Devuelve el primer usuario encontrado con ese nombre de usuario
        } catch (error) {
            console.error('Error al obtener el usuario por nombre de usuario:', error);
            throw error;
        }
    }


}

module.exports.AppService = AppService;
class AppService {
    constructor(database) {
        this.database = database;
    }
// Autenticacion y Autorizacion
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
            return await this.database.createUser(user, password);// Devuelve el primer usuario encontrado con ese nombre de usuario
        } catch (error) {
            console.error('Error al obtener el usuario por nombre de usuario:', error);
            throw error;
        }
    }

// Usuarios
    async getUsers() {
        try{
            return await this.database.getUsers();
        }
        catch(e){
            console.error(`Failed to get users ${e}`);
        }
    }

    async getUserById(id) {
        try{
            return await this.database.getUserById(id);
        }
        catch(e){
            console.error(`Failed to get user by id ${e}`);
        }
    }


    async updateUser(request_json, id) {
        try{
            return await this.database.updateUser(request_json, id);
        }
        catch(e){
            console.error(`Failed to update user ${e}`);
        }
    }

    async deleteUser(id) {
        try{
            return await this.database.deleteUser(id);
        }
        catch(e){
            console.error(`Failed to delete user ${e}`);
        }
    }

// Encuestas

    async createSurvey(request_json) {
        try{
            return await this.database.createSurvey(request_json);
        }
        catch(e){
            console.error(`Failed to create survey ${e}`);
        }
    }

    async getSurveys() {
        try{
            return await this.database.getSurveys();
        }
        catch(e){
            console.error(`Failed to get surveys ${e}`);
        }
    }

    async getSurveyById(id) {
        try{
            return await this.database.getSurveyById(id);
        }
        catch(e){
            console.error(`Failed to get survey by id ${e}`);
        }
    }

    async updateSurvey(request_json, id) {
        try{
            return await this.database.updateSurvey(request_json, id);
        }
        catch(e){
            console.error(`Failed to update survey ${e}`);
        }
    }

    async deleteSurvey(id) {
        try{
            return await this.database.deleteSurvey(id);
        }
        catch(e){
            console.error(`Failed to delete survey ${e}`);
        }
    }

    async publishSurvey(id) {
        try{
            return await this.database.publishSurvey(id);
        }
        catch(e){
            console.error(`Failed to publish survey ${e}`);
        }
    }

// Preguntas de encuestas

    async createQuestion(request_json, survey_id) {
        try{
            return await this.database.createQuestion(request_json, survey_id);
        }
        catch(e){
            console.error(`Failed to create question ${e}`);
        }
    }

    async getQuestions(survey_id) {
        try{
            return await this.database.getQuestions(survey_id);
        }
        catch(e){
            console.error(`Failed to get questions ${e}`);
        }
    }

    async updateQuestion(request_json, question_id) {
        try{
            return await this.database.updateQuestion(request_json, question_id);
        }
        catch(e){
            console.error(`Failed to update question ${e}`);
        }
    }

    async deleteQuestion(question_id) {
        try{
            return await this.database.deleteQuestion(question_id);
        }
        catch(e){
            console.error(`Failed to delete question ${e}`);
        }
    }

// Respuestas de encuestas

    async createResponse(request_json, question_id) {
        try{
            return await this.database.createResponse(request_json, question_id);
        }
        catch(e){
            console.error(`Failed to create response ${e}`);
        }
    }

    async getResponse(question_id) {
        try{
            return await this.database.getResponses(question_id);
        }
        catch(e){
            console.error(`Failed to get response ${e}`);
        }
    }

// Encuestados

    async createRespondent(request_json) {
        try{
            return await this.database.createRespondent(request_json);
        }
        catch(e){
            console.error(`Failed to create respondent ${e}`);
        }
    }

    async getRespondents() {
        try{
            return await this.database.getRespondents();
        }
        catch(e){
            console.error(`Failed to get respondents ${e}`);
        }
    }

    async getRespondentById(id) {
        try{
            return await this.database.getRespondentById(id);
        }
        catch(e){
            console.error(`Failed to get respondent by id ${e}`);
        }
    }

    async updateRespondent(request_json, id) {
        try{
            return await this.database.updateRespondent(request_json, id);
        }
        catch(e){
            console.error(`Failed to update respondent ${e}`);
        }
    }

    async deleteRespondent(id) {
        try{
            return await this.database.deleteRespondent(id);
        }
        catch(e){
            console.error(`Failed to delete respondent ${e}`);
        }
    }

// Reportes y analisis

    async getAnalysis(survey_id) {
        try{
            return await this.database.getAnalysis(survey_id);
        }
        catch(e){
            console.error(`Failed to get analysis ${e}`);
        }
    }

}

module.exports.AppService = AppService;
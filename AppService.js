const tiempoExpi = 60;
class AppService {
    constructor(database,database2, redisClient) {
        this.database = database;
        this.database2 = database2;
        this.redisClient = redisClient;      
    }
// Autenticacion y Autorizacion
    async getUserByEmail(username) {
        // Implementa la lógica para consultar la base de datos y obtener el usuario por su nombre de usuario
        // Por ejemplo, utilizando un método de consulta SQL
        try {
            return await this.database.getUserByEmail(username); // Devuelve el primer usuario encontrado con ese nombre de usuario
        } catch (error) {
            console.error('Error al obtener el usuario por nombre de usuario:', error);
            throw error;
        }
    }

    async createUser(user, email, password, rol){
        try {
            return await this.database.createUser(user, email, password, rol);// Devuelve el primer usuario encontrado con ese nombre de usuario
        } catch (error) {
            console.error('Error al obtener el usuario por nombre de usuario:', error);
            throw error;
        }
    }

// Usuarios

    async getUsers() {
        try {
            // Intentamos obtener los usuarios desde la caché de Redis
            const cachedUsers = await this.redisClient.get('users');
            console.log('cachedUsers:', cachedUsers);

            if (cachedUsers) {
                // Si encontramos usuarios en la caché, los devolvemos
                console.log('Usuarios obtenidos de la caché de Redis');
                return JSON.parse(cachedUsers);

            } else {
                console.log('No se encontraron usuarios en la caché de Redis');
                // Si no hay usuarios en la caché, los obtenemos de la base de datos
                const users = await this.database.getUsers();

                // Guardamos los usuarios en la caché de Redis para futuras consultas
                await this.redisClient.set('users', JSON.stringify(users));
                await this.redisClient.expire('users', tiempoExpi); // Expira en 60 segundos

                // Devolvemos los usuarios obtenidos de la base de datos
                return users;
            }
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    }

    async getUserById(id) {
        try{
            const cachedUserId = await this.redisClient.get(`user:${id}`);
            console.log('cachedUserId:', cachedUserId);

            if (cachedUserId) {
                console.log('Usuario obtenido de la caché de Redis');
                return JSON.parse(cachedUserId);
            }
            else {
                console.log('No se encontró el usuario en la caché de Redis');
                const user = await this.database.getUserById(id);
                await this.redisClient.set(`user:${id}`, JSON.stringify(user));
                await this.redisClient.expire(`user:${id}`, tiempoExpi); // Expira en 60 segundos
                return user;
            
            }
        }
        catch(e){
            console.error(`Failed to get user by id ${e}`);
            throw e;
        }
    }

    async updateUser(request_json, id) {
        try{
            const cachedUserId = await this.redisClient.get(`user:${id}`);
            const cachedUsers = await this.redisClient.get('users');

            if (cachedUserId) {
                await this.redisClient.del(`user:${id}`);
                console.log(`User with ID ${id} deleted from cache`);
            } else {
                console.log(`User with ID ${id} not found in cache`);
            }

            if (cachedUsers) {
                await this.redisClient.del('users');
                console.log('Users deleted from cache');
            }
            else {
                console.log('Users not found in cache');
            }

            return await this.database.updateUser(request_json, id);
        }
        catch(e){
            console.error(`Failed to update user ${e}`);
            throw e;
        }
    }

    async deleteUser(id) {
        try{
            const cachedUserId = await this.redisClient.get(`user:${id}`);
            const cachedUsers = await this.redisClient.get('users');

            if (cachedUserId) {
                await this.redisClient.del(`user:${id}`);
                console.log(`User with ID ${id} deleted from cache`);
            } else {
                console.log(`User with ID ${id} not found in cache`);
            }

            if (cachedUsers) {
                await this.redisClient.del('users');
                console.log('Users deleted from cache');
            }
            else {
                console.log('Users not found in cache');
            }

            return await this.database.deleteUser(id);
        }
        catch(e){
            console.error(`Failed to delete user ${e}`);
            throw e;
        }
    }


// Encuestas

    async createSurvey(request_json) {
        try{
            const cachedSurveys = await this.redisClient.get('surveys');

            if (cachedSurveys){
                await this.redisClient.del('surveys');
                console.log('Surveys deleted from cache');
            }
            else{
                console.log('Surveys not found in cache');
            }

            return await this.database2.insertSurvey(request_json);
        }
        catch(e){
            console.error(`Failed to create survey ${e}`);
            throw e;
        }
    }


  



    async getSurveys(collectionName) {
        try{
            const cachedSurveys = await this.redisClient.get('surveys');
            console.log('cachedSurveys:', cachedSurveys);
            if(cachedSurveys){
                console.log('Surveys obtained from Redis cache');
                return JSON.parse(cachedSurveys);
            }
            else{
                console.log('Surveys not found in Redis cache');

                const surveys = await this.database2.findAllSurveys(collectionName);
                await this.redisClient.set('surveys', JSON.stringify(surveys));
                await this.redisClient.expire('surveys', tiempoExpi); // Expires in 60 seconds

                return surveys
            }
        }
        catch(e){
            console.error(`Failed to get surveys ${e}`);
            throw e;
        }
    }

    async getSurveyById(id) {
        try{
            const cachedSurveyId = await this.redisClient.get(`survey:${id}`);
            console.log('cachedSurveyId:', cachedSurveyId);
            if(cachedSurveyId){
                console.log('Survey obtained from Redis cache');
                return JSON.parse(cachedSurveyId);
            }
            else{
                console.log('Survey not found in Redis cache');
                const survey = await this.database2.findSurveyById(id);
                await this.redisClient.set(`survey:${id}`, JSON.stringify(survey));
                await this.redisClient.expire(`survey:${id}`, tiempoExpi); // Expires in 60 seconds
                return survey
            }
        }
        catch(e){
            console.error(`Failed to get survey by id ${e}`);
            throw e;
        }
    }

    async updateSurvey(id, request_json) {
        try{
            const cachedSurveyId = await this.redisClient.get(`survey:${id}`);
            const cachedSurveys = await this.redisClient.get('surveys');
            
            if (cachedSurveyId){
                await this.redisClient.del(`survey:${id}`);
                console.log(`Survey with ID ${id} deleted from cache`);
            }
            else{
                console.log(`Survey with ID ${id} not found in cache`);
            }

            if (cachedSurveys){
                await this.redisClient.del('surveys');
                console.log('Surveys deleted from cache');
            }
            else{
                console.log('Surveys not found in cache');
            }

            return await this.database2.updateSurveyById(id, request_json);
        }
        catch(e){
            console.error(`Failed to update survey ${e}`);
            throw e;
        }
    }

    async deleteSurvey(id) {
        try{
            const cachedSurveyId = await this.redisClient.get(`survey:${id}`);
            const cachedSurveys = await this.redisClient.get('surveys');
            
            if (cachedSurveyId){
                await this.redisClient.del(`survey:${id}`);
                console.log(`Survey with ID ${id} deleted from cache`);
            }
            else{
                console.log(`Survey with ID ${id} not found in cache`);
            }

            if (cachedSurveys){
                await this.redisClient.del('surveys');
                console.log('Surveys deleted from cache');
            }
            else{
                console.log('Surveys not found in cache');
            }

            return await this.database2.deleteSurveyById(id);
        }
        catch(e){
            console.error(`Failed to delete survey ${e}`);
            throw e;
        }
    }

    async publishSurvey(surveyId) {
        try {
            const updatedDocument = { 'estado': 'public' };
            const result = await this.database2.updateSurveyById(surveyId, updatedDocument);
            return result > 0; // Devuelve true si se actualizó al menos un documento
        } catch (error) {
            console.error(`Failed to publish survey: ${error}`);
            return false;
        }
    }


// Preguntas de encuestas

    async addQuestionToSurvey(surveyId, newQuestion) {
        try {
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return false; 
            }  
            existingSurvey.questions.push(newQuestion);
            const result = await this.database2.updateSurveyById(surveyId, existingSurvey);

            const cachedSurveyId = await this.redisClient.get(`survey:${surveyId}`);
            const cachedSurveys = await this.redisClient.get('surveys');

            if (cachedSurveyId){
                await this.redisClient.del(`survey:${surveyId}`);
                console.log(`Survey with ID ${surveyId} deleted from cache`);
            }
            else{
                console.log(`Survey with ID ${surveyId} not found in cache`);
            }

            if (cachedSurveys){
                await this.redisClient.del('surveys');
                console.log('Surveys deleted from cache');
            }
            else{
                console.log('Surveys not found in cache');
            }

            return result > 0; 
        } catch (error) {
            console.error(`Failed to add question to survey: ${error}`);
            throw error;
        }
    }

// ---------
    async getSurveyQuestions(surveyId) {
        try {

            const cachedSurveyId = await this.redisClient.get(`survey:${surveyId}`);
            if (cachedSurveyId){
                return JSON.parse(cachedSurveyId).questions;
            }
            
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return null; 
            }

            const survey = await this.database2.findSurveyById(surveyId);
            await this.redisClient.set(`survey:${surveyId}`, JSON.stringify(survey));
            await this.redisClient.expire(`survey:${surveyId}`, tiempoExpi); // Expires in 60 seconds
            return existingSurvey.questions;
        } catch (error) {
            console.error(`Failed to get survey questions: ${error}`);
            throw error;
        }
    }
    
    async updateSurveyQuestion(surveyId, questionId, updatedQuestion) {
        try {       
            // Obtener la encuesta por su ID
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return false; // Encuesta no encontrada
            }
            
            // Buscar la pregunta por su ID dentro de la encuesta
            const questionIndex = existingSurvey.questions.findIndex(q => q.idPregunta === parseInt(questionId));
            if (questionIndex === -1) {
                return false; // Pregunta no encontrada en la encuesta
            }
            
            // Actualizar la pregunta con la nueva información
            existingSurvey.questions[questionIndex] = updatedQuestion;
            
            // Actualizar la encuesta en la base de datos
            const result = await this.database2.updateSurveyById(surveyId, existingSurvey);

            const cachedSurveyId = await this.redisClient.get(`survey:${surveyId}`);
            const cachedSurveys = await this.redisClient.get('surveys');

            if (cachedSurveyId){
                await this.redisClient.del(`survey:${surveyId}`);
                console.log(`Survey with ID ${surveyId} deleted from cache`);
            }
            else{
                console.log(`Survey with ID ${surveyId} not found in cache`);
            }

            if (cachedSurveys){
                await this.redisClient.del('surveys');
                console.log('Surveys deleted from cache');
            }
            else{
                console.log('Surveys not found in cache');
            }

            
            return result > 0; // Devolver true si la encuesta se actualizó correctamente
        } catch (error) {
            console.error(`Error al actualizar la pregunta de la encuesta: ${error}`);
            throw error;
        }
    }
    
    async deleteSurveyQuestion(surveyId, questionId) {
        try {
            // Obtener la encuesta por su ID
            const existingSurvey = await this.database2.findSurveyById(surveyId);
            if (!existingSurvey) {
                return false; // Encuesta no encontrada
            }
            
            // Filtrar la lista de preguntas para eliminar la pregunta específica por su ID
            existingSurvey.questions = existingSurvey.questions.filter(q => q.idPregunta !== parseInt(questionId));
            
            // Actualizar la encuesta en la base de datos para reflejar los cambios
            const result = await this.database2.updateSurveyById(surveyId, existingSurvey);

            const cachedSurveyId = await this.redisClient.get(`survey:${surveyId}`);
            const cachedSurveys = await this.redisClient.get('surveys');

            if (cachedSurveyId){
                await this.redisClient.del(`survey:${surveyId}`);
                console.log(`Survey with ID ${surveyId} deleted from cache`);
            }
            else{
                console.log(`Survey with ID ${surveyId} not found in cache`);
            }

            if (cachedSurveys){
                await this.redisClient.del('surveys');
                console.log('Surveys deleted from cache');
            }
            else{
                console.log('Surveys not found in cache');
            }
            
            return result > 0; // Devolver true si la encuesta se actualizó correctamente
        } catch (error) {
            console.error(`Error al eliminar la pregunta de la encuesta: ${error}`);
            throw error;
        }
    }
    

// Respuestas de encuestas

    async insertResponse(request_json, survey_id) {
        try{
            const cachedSurveyId = await this.redisClient.get(`survey:${survey_id}`);
            const cachedSurveys = await this.redisClient.get('surveys');

            if (cachedSurveyId){
                await this.redisClient.del(`survey:${survey_id}`);
                console.log(`Survey with ID ${survey_id} deleted from cache`);
            }
            else{
                console.log(`Survey with ID ${survey_id} not found in cache`);
            }

            if (cachedSurveys){
                await this.redisClient.del('surveys');
                console.log('Surveys deleted from cache');
            }
            else{
                console.log('Surveys not found in cache');
            }

            return await this.database2.insertResponse(request_json, survey_id);
        }
        catch(e){
            console.error(`Failed to create response ${e}`);
            throw e;
        }
    }

    async getResponses(survey_id) {
        try{
            const cachedResponses = await this.redisClient.get(`responses:${survey_id}`);
            if(cachedResponses){
                console.log('Responses obtained from Redis cache');
                return JSON.parse(cachedResponses);
            }
            else{
                console.log('Responses not found in Redis cache');
                const responses = await this.database2.getResponses(survey_id);
                await this.redisClient.set(`responses:${survey_id}`, JSON.stringify(responses));
                await this.redisClient.expire(`responses:${survey_id}`, tiempoExpi); // Expires in 60 seconds
                return responses;
            }
        }
        catch(e){
            console.error(`Failed to get response ${e}`);
            throw e;
        }
    }

// Encuestados

    async createRespondent(user, email, password) {
        try{
            const cachedRespondents = await this.redisClient.get('respondents');
            if(cachedRespondents){
                await this.redisClient.del('respondents');
                console.log('Respondents deleted from cache');
            }
            else{
                console.log('Respondents not found in cache');
            }
            return await this.database.createRespondent(user, email, password);
        }
        catch(e){
            console.error(`Failed to create respondent ${e}`);
            throw e;
        }
    }

    async getRespondents() {
        try{
            const cachedRespondents = await this.redisClient.get('respondents');
            if(cachedRespondents){
                console.log('Respondents obtained from Redis cache');
                return JSON.parse(cachedRespondents);
            }
            else{
                console.log('Respondents not found in Redis cache');
                const respondents = await this.database.getRespondents();
                await this.redisClient.set('respondents', JSON.stringify(respondents));
                await this.redisClient.expire('respondents', tiempoExpi); // Expires in 60 seconds
                return respondents;
            }    
        }
        catch(e){
            console.error(`Failed to get respondents ${e}`);
            throw e;
        }
    }

    async getRespondentById(id) {
        try{
            const cachedRespondentId = await this.redisClient.get(`respondent:${id}`);
            if(cachedRespondentId){
                console.log('Respondent obtained from Redis cache');
                return JSON.parse(cachedRespondentId);
            }
            else{
                console.log('Respondent not found in Redis cache');
                const respondent = await this.database.getRespondentById(id);
                if (respondent) {
                    await this.redisClient.set(`respondent:${id}`, JSON.stringify(respondent));
                    await this.redisClient.expire(`respondent:${id}`, tiempoExpi); // Expires in 60 seconds
                    return respondent;
                } else {
                    console.log('Respondent not found in database');
                    return null; // or handle the case where respondent is not found
                }
            }
        }
        catch(e){
            console.error(`Failed to get respondent by id ${e}`);
            throw e;
        }
    }

    async updateRespondent(request_json, id) {
        try{
            const cachedRespondentId = await this.redisClient.get(`respondent:${id}`);
            const cachedRespondents = await this.redisClient.get('respondents');
            
            if (cachedRespondentId){
                await this.redisClient.del(`respondent:${id}`);
                console.log(`Respondent with ID ${id} deleted from cache`);
            } 
            else{
                console.log(`Respondent with ID ${id} not found in cache`);
            }

            if (cachedRespondents){
                await this.redisClient.del('respondents');
                console.log('Respondents deleted from cache');
            }
            else{
                console.log('Respondents not found in cache');
            }

            return await this.database.updateRespondent(request_json, id);
        }
        catch(e){
            console.error(`Failed to update respondent ${e}`);
            throw e;
        }
    }

    async deleteRespondent(id) {
        try{
            const cachedRespondentId = await this.redisClient.get(`respondent:${id}`);
            const cachedRespondents = await this.redisClient.get('respondents');
            
            if (cachedRespondentId){
                await this.redisClient.del(`respondent:${id}`);
                console.log(`Respondent with ID ${id} deleted from cache`);
            } 
            else{
                console.log(`Respondent with ID ${id} not found in cache`);
            }

            if (cachedRespondents){
                await this.redisClient.del('respondents');
                console.log('Respondents deleted from cache');
            }
            else{
                console.log('Respondents not found in cache');
            }

            return await this.database.deleteRespondent(id);
        }
        catch(e){
            console.error(`Failed to delete respondent ${e}`);
            throw e;
        }
    }

// Reportes y analisis

    async getAnalysis(survey_id) {
        try{
            const cachedAnalysis = await this.redisClient.get(`analysis:${survey_id}`);
            if(cachedAnalysis){
                console.log('Analysis obtained from Redis cache');
                return JSON.parse(cachedAnalysis);
            }
            else{
                console.log('Analysis not found in Redis cache');
                const analysis = await this.database2.getAnalysis(survey_id);
                await this.redisClient.set(`analysis:${survey_id}`, JSON.stringify(analysis));
                await this.redisClient.expire(`analysis:${survey_id}`, tiempoExpi); // Expires in 60 seconds
                return analysis;
            }
        }
        catch(e){
            console.error(`Failed to get analysis ${e}`);
            throw e;
        }
    }

}

module.exports.AppService = AppService;
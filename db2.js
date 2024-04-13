const { MongoClient } = require('mongodb');

class Database2 {
    constructor(database, url, username, password) {
        this.database = database;
        this.url = url;
        this.username = username;
        this.password = password;
        this.client = new MongoClient(this.url, { auth: { username: this.username, password: this.password } });
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('Connected to the MongoDB database');
            this.db = this.client.db(this.database);
        } catch (e) {
            console.error(`Failed to connect to MongoDB: ${e}`);
        }
    }


    async disconnect() {
        try {
            await this.client.close();
            console.log('Disconnected from the MongoDB database');
        } catch (e) {
            console.error(`Failed to disconnect from MongoDB: ${e}`);
        }
    }

    // Encuestas
    async insertSurvey(document) {
        try {
            const collection = this.db.collection('encuestas');
            const result = await collection.insertOne(document);
            console.log('Document inserted successfully:', result.insertedId);
            return result.insertedId;
        } catch (e) {
            console.error(`Failed to insert document: ${e}`);
        }
    }

    async findSurveyById(collectionName, id) {
        try {
            const collection = this.db.collection(collectionName);
            const result = await collection.findOne({ _id: id });
            return result;
        } catch (e) {
            console.error(`Failed to find document by ID: ${e}`);
        }
    }

    async findAllSurveys(collectionName) {
        try {
            const collection = this.db.collection(collectionName);
            const result = await collection.find({}).toArray();
            return result;
        } catch (e) {
            console.error(`Failed to find all documents in collection: ${e}`);
        }
    }
   
    async updateSurveyById(collectionName, id, updatedDocument) {
        try {
            const collection = this.db.collection(collectionName);
            const result = await collection.updateOne({ _id: id }, { $set: updatedDocument });
            console.log('Document updated successfully:', result.modifiedCount);
            return result.modifiedCount;
        } catch (e) {
            console.error(`Failed to update document by ID: ${e}`);
        }
    }

    async deleteSurveyById(collectionName, id) {
        try {
            const collection = this.db.collection(collectionName);
            const result = await collection.deleteOne({ _id: id });
            console.log('Document deleted successfully:', result.deletedCount);
            return result.deletedCount;
        } catch (e) {
            console.error(`Failed to delete document by ID: ${e}`);
        }
    }

    // Preguntas de encuestas

    async insertResponse(response, survey_id) {
        try {
            const collection = this.db.collection('encuestas');
            const result = await collection.updateOne({ 'idEncuesta': parseInt(survey_id) }, { $push: { 'respuestas': response } });
            console.log('Response inserted successfully:', result.modifiedCount);
            return result.modifiedCount;
        } catch (e) {
            console.error(`Failed to insert response: ${e}`);
        }
    }

    async getResponses(survey_id) {
        try {
            const collection = this.db.collection('encuestas');
            const result = await collection.findOne({ 'idEncuesta': parseInt(survey_id)});
            if (result) {
                return result.respuestas;
            } else {
                console.error(`Survey with id ${survey_id} not found`);
                return [];
            }
        } catch (e) {
            console.error(`Failed to get response ${e}`);
            return [];
        }
    }
}
module.exports.Database2 = Database2;

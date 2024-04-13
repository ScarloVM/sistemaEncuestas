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
}

module.exports.Database2 = Database2;

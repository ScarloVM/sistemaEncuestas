const { AppService } = require('../AppService');

// Mock para el objeto database
const mockDatabase = {
  createUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
};

const mockDatabase2 = {
    createUser: jest.fn(),
    insertSurvey: jest.fn(),
    getSurveys: jest.fn(),
    findAllSurveys: jest.fn(),
    getSurveyById: jest.fn(),
    findSurveyById: jest.fn(),
    updateSurvey: jest.fn(),
    updateSurveyById: jest.fn(),
    deleteSurvey: jest.fn(),
    deleteSurveyById: jest.fn(),
    publishSurvey: jest.fn(),


  };
  
  // Simular que la inserción en la base de datos falla

  
// Mock para el objeto redisClient
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  expire: jest.fn(),
  del: jest.fn()
};

// Crear una instancia de AppService con los mocks


// crear casos de cache en los gets
const appService = new AppService(mockDatabase, mockDatabase2,mockRedisClient);

describe('AppService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSurvey', () => {
    it('should create a new survey', async () => {
        // Arrange
        const request_json = { titulo: 'Encuesta de satisfacción del cliente' };
        const surveyFromDatabase = { titulo: 'Encuesta de satisfacción del cliente' };
        const cachedSurveys = [{ titulo: 'Encuesta de satisfacción del cliente' }];
        
        // Simular que hay encuestas en caché
        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedSurveys));
        
        // Simular que la inserción en la base de datos tiene éxito
        mockDatabase2.insertSurvey.mockResolvedValue(surveyFromDatabase);
        
        // Act
        const result = await appService.createSurvey(request_json);
        
        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith('surveys');
        expect(mockRedisClient.del).toHaveBeenCalledWith('surveys');
        expect(mockDatabase2.insertSurvey).toHaveBeenCalledWith(request_json);
        expect(result).toEqual(surveyFromDatabase);
    });
  
    it('should throw an error if createSurvey fails', async () => {
        // Arrange
        const surveyData = { titulo: 'Encuesta de satisfacción del cliente' };
        const errorMessage = 'Database error';
        mockDatabase2.insertSurvey.mockRejectedValue(new Error(errorMessage));
      
        // Act and Assert
        await expect(appService.createSurvey(surveyData)).rejects.toThrowError(errorMessage);
    });
    
});


describe('getSurveys', () => {
    it('should return surveys from Redis cache if available', async () => {
        // Arrange
        const cachedSurveys = [{ titulo: 'Encuesta de satisfacción del cliente'}];
        const collectionName = 'encuestas';

        // Simular que hay encuestas en caché en Redis
        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedSurveys));

        // Act
        const result = await appService.getSurveys(collectionName);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith('surveys');
        expect(mockRedisClient.set).not.toHaveBeenCalled(); // No debería llamar a set si las encuestas están en caché
        expect(mockDatabase2.findAllSurveys).not.toHaveBeenCalled(); // No debería llamar a findAllSurveys si las encuestas están en caché
        expect(result).toEqual(cachedSurveys);
    });

    it('should return surveys from database if not available in Redis cache', async () => {
        // Arrange
        const surveysFromDatabase = [{ titulo: 'Encuesta de satisfacción del cliente'}];
        const collectionName = 'encuestas';

        // Simular que no hay encuestas en caché en Redis
        mockRedisClient.get.mockResolvedValue(null);

        // Simular que las encuestas se encuentran en la base de datos
        mockDatabase2.findAllSurveys.mockResolvedValue(surveysFromDatabase);

        // Act
        const result = await appService.getSurveys(collectionName);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith('surveys');
        expect(mockRedisClient.set).toHaveBeenCalledWith('surveys', JSON.stringify(surveysFromDatabase));
        expect(mockRedisClient.expire).toHaveBeenCalledWith('surveys', expect.any(Number)); // Verificar que expire se haya llamado con un valor adecuado
        expect(mockDatabase2.findAllSurveys).toHaveBeenCalledWith(collectionName);
        expect(result).toEqual(surveysFromDatabase);
    });

    it('should throw an error if getSurveys fails', async () => {
        // Arrange
        const errorMessage = 'Failed to get surveys';
        const collectionName = 'encuestas';

        // Simular que se produce un error al obtener encuestas de Redis
        mockRedisClient.get.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.getSurveys(collectionName)).rejects.toThrowError(errorMessage);

        // Verificar que no se llamó a otras funciones
        expect(mockRedisClient.get).toHaveBeenCalledWith('surveys');
        expect(mockRedisClient.set).not.toHaveBeenCalled();
        expect(mockDatabase2.findAllSurveys).not.toHaveBeenCalled();
        expect(mockRedisClient.expire).not.toHaveBeenCalled();
    });
});


describe('getSurveyById', () => {
    it('should return survey from Redis cache if available', async () => {
        // Arrange
        const id = '77';
        const cachedSurvey = { titulo: 'Encuesta de satisfacción del cliente'};

        // Simular que la encuesta está en caché en Redis
        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedSurvey));

        // Act
        const result = await appService.getSurveyById(id);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith(`survey:${id}`);
        expect(mockDatabase2.findSurveyById).not.toHaveBeenCalled(); // No debería llamar a findSurveyById si la encuesta está en caché
        expect(mockRedisClient.set).not.toHaveBeenCalled(); // No debería llamar a set si la encuesta está en caché
        expect(result).toEqual(cachedSurvey);
    });

    it('should throw an error if getSurveyById fails', async () => {
        // Arrange
        const id = '77';
        const errorMessage = 'Failed to get survey';

        // Simular que se produce un error al obtener la encuesta de Redis
        mockRedisClient.get.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.getSurveyById(id)).rejects.toThrowError(errorMessage);

        // Verificar que no se llamó a otras funciones
        expect(mockRedisClient.get).toHaveBeenCalledWith(`survey:${id}`);
        expect(mockDatabase2.findSurveyById).not.toHaveBeenCalled();
        expect(mockRedisClient.set).not.toHaveBeenCalled();
    });
});


describe('updateSurvey', () => {
    it('should update survey and delete from Redis cache if survey found in cache', async () => {
        // Arrange
        const id = '77';
        const request_json = { titulo: 'Encuesta de satisfacción del cliente'};
        const modifiedCount = 1;

        // Simular que la encuesta está en caché en Redis
        mockRedisClient.get.mockResolvedValue(JSON.stringify(request_json));

        // Simular que la actualización en la base de datos tiene éxito
        mockDatabase2.updateSurveyById.mockResolvedValue(modifiedCount);

        // Act
        const result = await appService.updateSurvey(id, request_json);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith(`survey:${id}`);
        expect(mockRedisClient.del).toHaveBeenCalledWith(`survey:${id}`);
        expect(mockRedisClient.del).toHaveBeenCalledWith('surveys'); // Corregido para verificar que 'surveys' se borra de la caché
        expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(id, request_json);
        expect(result).toEqual(modifiedCount);
    });

    it('should throw an error if updateSurvey fails', async () => {
        // Arrange
        const id = '77';
        const request_json = { /* datos de encuesta a actualizar */ };
        const errorMessage = 'Database error';
        mockRedisClient.get.mockResolvedValue(null); // Simular que la encuesta no está en caché
        mockDatabase2.updateSurveyById.mockRejectedValue(new Error(errorMessage)); // Simular un error al actualizar en la base de datos

        // Act and Assert
        await expect(appService.updateSurvey(id, request_json)).rejects.toThrowError(errorMessage);
    });


    describe('deleteSurvey', () => {
        it('should delete survey and delete from Redis cache if survey found in cache', async () => {
            // Arrange
            const id = '77';
            const deletedCount = 1;

            // Simulate that the survey is cached in Redis
            mockRedisClient.get.mockResolvedValue('someCachedSurveyId');
            mockRedisClient.del.mockResolvedValue();
            mockDatabase2.deleteSurveyById.mockResolvedValue(deletedCount);

            // Act
            const result = await appService.deleteSurvey(id);

            // Assert
            expect(mockRedisClient.get).toHaveBeenCalledWith(`survey:${id}`);
            expect(mockRedisClient.del).toHaveBeenCalledWith(`survey:${id}`);
            expect(mockRedisClient.del).toHaveBeenCalledWith('surveys'); 
            expect(mockDatabase2.deleteSurveyById).toHaveBeenCalledWith(id);
            expect(result).toEqual(deletedCount);
        });

        it('should return false if publishing the survey fails', async () => {
            // Arrange
            const surveyId = '77';
            const errorMessage = 'Database error';
            
            // Simulate error while updating the survey in the database
            mockDatabase2.updateSurveyById.mockRejectedValue(new Error(errorMessage));
            
            // Act
            const result = await appService.publishSurvey(surveyId);
            
            // Assert
            expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(surveyId, { 'estado': 'public' });
            expect(result).toBe(false);
        });

    });



    describe('publishSurvey', () => {
        it('should publish the survey', async () => {
            // Arrange
            const surveyId = '77';
            const updatedDocument = { 'estado': 'public' };
            const modifiedCount = 1;
            
            // Simulate successful update in the database
            mockDatabase2.updateSurveyById.mockResolvedValue(modifiedCount);
            
            // Act
            const result = await appService.publishSurvey(surveyId);
            
            // Assert
            expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(surveyId, updatedDocument);
            expect(result).toBe(true);
        });

        it('should return false if publishing the survey fails', async () => {
            // Arrange
            const surveyId = '77';
            const errorMessage = 'Database error';
            
            // Simulate error while updating the survey in the database
            mockDatabase2.updateSurveyById.mockRejectedValue(new Error(errorMessage));
            
            // Act
            const result = await appService.publishSurvey(surveyId);
            
            // Assert
            expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(surveyId, { 'estado': 'public' });
            expect(result).toBe(false);
        });
    });

});





});

// npx jest --testPathPattern=testUnitarioJuli.js
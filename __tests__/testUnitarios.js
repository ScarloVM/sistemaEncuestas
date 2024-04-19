const { AppService } = require('../AppService');

// Mock para el objeto database
const consoleSpy = jest.spyOn(console, 'log');

const mockDatabase = {
    createUser: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    createRespondent: jest.fn(),
    getRespondents: jest.fn(),
    getRespondentById: jest.fn(),
    updateRespondent: jest.fn(),
    deleteRespondent: jest.fn()
  };

const mockDatabase2 = {
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
    insertResponse: jest.fn(),
    getResponses: jest.fn(),
    getAnalysis: jest.fn()

  };

// Mock para el objeto redisClient
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  expire: jest.fn(),
  del: jest.fn()
};

// Crear una instancia de AppService con los mocks
const appService = new AppService(mockDatabase, mockDatabase2,mockRedisClient);

describe('AppService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // Arrange
      const user = { name: 'John', email: 'john@example.com', password: 'password', rol: 'user' };
      mockDatabase.createUser.mockResolvedValue(user);

      // Act
      const result = await appService.createUser(user.name, user.email, user.password, user.rol);

      // Assert
      expect(mockDatabase.createUser).toHaveBeenCalledWith(user.name, user.email, user.password, user.rol);
      expect(result).toEqual(user);
    });

    it('should throw an error if createUser fails', async () => {
      // Arrange
      const user = { name: 'John', email: 'john@example.com', password: 'password', rol: 'user' };
      const errorMessage = 'Database error';
      mockDatabase.createUser.mockRejectedValue(new Error(errorMessage));

      // Act and Assert
      await expect(appService.createUser(user.name, user.email, user.password, user.rol)).rejects.toThrowError(errorMessage);
    });
  });

  describe('getUsers', () => {
    it('should get users from cache if available', async () => {
      // Arrange
      const cachedUsers = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedUsers));

      // Act
      const result = await appService.getUsers();

      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith('users');
      expect(result).toEqual(cachedUsers);
    });

    it('should get users from database if not available in cache', async () => {
      // Arrange
      const usersFromDatabase = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
      mockRedisClient.get.mockResolvedValue(null);
      mockDatabase.getUsers.mockResolvedValue(usersFromDatabase);

      // Act
      const result = await appService.getUsers();

      // Assert
      expect(mockDatabase.getUsers).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalledWith('users', JSON.stringify(usersFromDatabase));
      expect(mockRedisClient.expire).toHaveBeenCalledWith('users', expect.any(Number));
      expect(result).toEqual(usersFromDatabase);
    });

    it('should throw an error if getUsers fails', async () => {
      // Arrange
      const errorMessage = 'Database error';
      mockRedisClient.get.mockResolvedValue(null);
      mockDatabase.getUsers.mockRejectedValue(new Error(errorMessage));

      // Act and Assert
      await expect(appService.getUsers()).rejects.toThrowError(errorMessage);
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      // Arrange
      const userEmail = 'john@example.com';
      const user = { id: 1, name: 'John', email: userEmail, password: 'password', rol: 'user' };
      mockDatabase.getUserByEmail.mockResolvedValue(user);
  
      // Act
      const result = await appService.getUserByEmail(userEmail);
  
      // Assert
      expect(mockDatabase.getUserByEmail).toHaveBeenCalledWith(userEmail);
      expect(result).toEqual(user);
    });
  
    it('should throw an error if getUserByEmail fails', async () => {
      // Arrange
      const userEmail = 'john@example.com';
      const errorMessage = 'Database error';
      mockDatabase.getUserByEmail.mockRejectedValue(new Error(errorMessage));
  
      // Act and Assert
      await expect(appService.getUserByEmail(userEmail)).rejects.toThrowError(errorMessage);
    });
  });
  
  describe('getUserById', () => {
    it('should get user by id from cache', async () => {
      // Arrange
      const userId = 1;
      const user = { id: userId, name: 'John', email: 'john@example.com', password: 'password', rol: 'user' };
      const cachedUser = JSON.stringify(user);
      mockRedisClient.get.mockResolvedValue(cachedUser);
      mockDatabase.getUserById.mockResolvedValue(user);
  
      // Act
      const result = await appService.getUserById(userId);
  
      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith(`user:${userId}`);
      expect(result).toEqual(user);
    });
  
    it('should set user in cache if not found in cache', async () => {
      // Arrange
      const userId = 1;
      const user = { id: userId, name: 'John', email: 'john@example.com', password: 'password', rol: 'user' };
      mockRedisClient.get.mockResolvedValue(null);
      mockDatabase.getUserById.mockResolvedValue(user);
  
      // Act
      const result = await appService.getUserById(userId);
  
      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockDatabase.getUserById).toHaveBeenCalledWith(userId);
      expect(mockRedisClient.set).toHaveBeenCalledWith(`user:${userId}`, JSON.stringify(user));
      expect(mockRedisClient.expire).toHaveBeenCalledWith(`user:${userId}`, expect.any(Number));
      expect(result).toEqual(user);
    });
  
    it('should throw an error if getUserById fails', async () => {
      // Arrange
      const userId = 1;
      const errorMessage = 'Database error';
      mockRedisClient.get.mockResolvedValue(null);
      mockDatabase.getUserById.mockRejectedValue(new Error(errorMessage));
  
      // Act and Assert
      await expect(appService.getUserById(userId)).rejects.toThrowError(errorMessage);
    });
  });
  
  describe('updateUser', () => {
    it('should update user', async () => {
      // Arrange
      const userId = 1;
      const userUpdate = { name: 'Updated John', email: 'updated@example.com', password: 'updatedPassword', rol: 'admin' };
      const updatedUser = { id: userId, ...userUpdate };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(updatedUser));
      mockDatabase.updateUser.mockResolvedValue(true);
  
      // Act
      const result = await appService.updateUser(userUpdate, userId);
  
      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockRedisClient.del).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockDatabase.updateUser).toHaveBeenCalledWith(userUpdate, userId);
      expect(result).toBeTruthy();
    });
  
    it('should delete users cache if not found in cache', async () => {
      // Arrange
      const userId = 1;
      const userUpdate = { name: 'Updated John', email: 'updated@example.com', password: 'updatedPassword', rol: 'admin' };
      const updatedUser = { id: userId, ...userUpdate };
      mockRedisClient.get.mockResolvedValue(userUpdate);
      mockDatabase.updateUser.mockResolvedValue(true);
  
      // Act
      const result = await appService.updateUser(userUpdate, userId);
  
      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockRedisClient.del).toHaveBeenCalledWith('users');
      expect(mockDatabase.updateUser).toHaveBeenCalledWith(userUpdate, userId);
      expect(result).toBeTruthy();
    });
  
    it('should throw an error if updateUser fails', async () => {
      // Arrange
      const userId = 1;
      const userUpdate = { name: 'Updated John', email: 'updated@example.com', password: 'updatedPassword', rol: 'admin' };
      const errorMessage = 'Database error';
      mockRedisClient.get.mockResolvedValue(null);
      mockDatabase.updateUser.mockRejectedValue(new Error(errorMessage));
  
      // Act and Assert
      await expect(appService.updateUser(userUpdate, userId)).rejects.toThrowError(errorMessage);
    });
  });

  describe('deleteUser', () => {
    it('should delete user from cache if found', async () => {
        // Arrange
        const userId = 123;
        const cachedUserId = `user:${userId}`;
        mockRedisClient.get.mockResolvedValue(cachedUserId);

        // Act
        await appService.deleteUser(userId);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith(cachedUserId);
        expect(mockRedisClient.del).toHaveBeenCalledWith(cachedUserId);
        expect(consoleSpy).toHaveBeenCalledWith(`User with ID ${userId} deleted from cache`);
    });

    it('should delete users from cache if found', async () => {
        // Arrange
        const cachedUsersKey = 'users';
        mockRedisClient.get.mockResolvedValue(null);
        mockRedisClient.get.mockResolvedValue(cachedUsersKey);

        // Act
        await appService.deleteUser(123);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith('users');
        expect(mockRedisClient.del).toHaveBeenCalledWith('users');
        expect(consoleSpy).toHaveBeenCalledWith('Users deleted from cache');
    });

    it('should delete user from database', async () => {
        // Arrange
        const userId = 123;
        const mockedUserDeletionResponse = 'User deleted successfully';
        mockRedisClient.get.mockResolvedValue(null);
        mockDatabase.deleteUser.mockResolvedValue(mockedUserDeletionResponse);

        // Act
        const result = await appService.deleteUser(userId);

        // Assert
        expect(mockDatabase.deleteUser).toHaveBeenCalledWith(userId);
        expect(result).toEqual(mockedUserDeletionResponse);
    });


    it('should handle error when deleting user from database', async () => {
        // Arrange
        const userId = 123;
        const errorMessage2 = 'Error deleting user from database';
        mockDatabase.deleteUser.mockRejectedValue(new Error(errorMessage2));

        // Act and Assert
        await expect(appService.deleteUser(userId)).rejects.toThrowError(errorMessage2);
    });

    
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

describe('insertResponse', () => {
    it('should insert a new response', async () => {
        // Arrange
        const response = {
    "correoEncuestado": "charlie@example.com",
    "respuesta": [
      {
        "idPregunta": 1,
        "tipo": "abierta",
        "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
        "respuesta": "Decente"
      }]};
        mockDatabase2.insertResponse.mockResolvedValue(response);

        // Act
        const result = await appService.insertResponse(response, 1);

        // Assert
        expect(mockDatabase2.insertResponse).toHaveBeenCalledWith(response, 1);
        expect(result).toEqual(response);
    });

    it('should throw an error if insertResponse fails', async () => {
        // Arrange
        const response = {
            "correoEncuestado": "charlie@example.com",
            "respuesta": [
              {
                "idPregunta": 1,
                "tipo": "abierta",
                "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
                "respuesta": "Decente"
              }]};
        const errorMessage = 'Database error';
        mockDatabase2.insertResponse.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.insertResponse(response, 1)).rejects.toThrowError(errorMessage);
    });
});

describe('getResponses', () => {
    it('should get responses from cache if available', async () => {
        // Arrange
        const cachedResponses = [
            {
                "correoEncuestado": 1,
                "respuesta": [
                    {
                        "idPregunta": 1,
                        "tipo": "abierta",
                        "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
                        "respuesta": "Muy malo"
                    }
                ]
            },
            {
                "correoEncuestado": 2,
                "respuesta": [
                    {
                        "idPregunta": 1,
                        "tipo": "abierta",
                        "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
                        "respuesta": "Regular"
                    }
                ]
            }];
        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedResponses));

        // Act
        const result = await appService.getResponses(1);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith('responses:1');
        expect(result).toEqual(cachedResponses);  
    });

     it('should get responses from database if not available in cache', async () => {
         // Arrange
         const responsesFromDatabase = [
             {
                 "correoEncuestado": 1,
                 "respuesta": [
                     {
                         "idPregunta": 1,
                         "tipo": "abierta",
                         "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
                         "respuesta": "Muy malo"
                     }
                 ]
             },
             {
                 "correoEncuestado": 2,
                 "respuesta": [
                     {
                         "idPregunta": 1,
                         "tipo": "abierta",
                         "texto": "¿Cuál es tu opinión sobre nuestro servicio?",
                         "respuesta": "Regular"
                     }
                 ]
             }];
         mockRedisClient.get.mockResolvedValue(null);
         mockDatabase2.getResponses.mockResolvedValue(responsesFromDatabase);

         // Act
         const result = await appService.getResponses(1);

        // Assert
        expect(mockDatabase2.getResponses).toHaveBeenCalledWith(1);
        expect(mockRedisClient.set).toHaveBeenCalledWith('responses:1', JSON.stringify(responsesFromDatabase));
        expect(mockRedisClient.expire).toHaveBeenCalledWith('responses:1', expect.any(Number));
        expect(result).toEqual(responsesFromDatabase);
    });

    it('should throw an error if getResponses fails', async () => {
        // Arrange
        const errorMessage = 'Database error';
        mockRedisClient.get.mockResolvedValue(null);
        mockDatabase2.getResponses.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.getResponses(1)).rejects.toThrowError(errorMessage);
    });
});

describe('createRespondent', () => {
    it('should create a new respondent', async () => {
        // Arrange
        const respondent = {
            "name": "Pedro",
            "email": "pedro@gmail.com",
            "password": "1234"
        }

        mockDatabase.createRespondent.mockResolvedValue(respondent);

        // Act
        const result = await appService.createRespondent(respondent.name, respondent.email, respondent.password);

        // Assert
        expect(mockDatabase.createRespondent).toHaveBeenCalledWith(respondent.name, respondent.email, respondent.password);
        expect(result).toEqual(respondent);
    });

    it('should throw an error if createRespondent fails', async () => {
        // Arrange
        const respondent = {
            "name": "Pedro",
            "email": "pedro@gmail.com",
            "password": "1234"
        }

        const errorMessage = 'Database error';
        mockDatabase.createRespondent.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.createRespondent(respondent.name, respondent.email, respondent.password)).rejects.toThrowError(errorMessage);
    });
});

describe('getRespondents', () => {
    it('should get respondents from cache if available', async () => {
        // Arrange
        const cachedRespondents = [
            {
                "id": 1,
                "name": "Guillermo",
                "email": "juan@example.com",
                "password": "1234",
                "rol": 3
            },
            {
                "id": 2,
                "name": "Samuel",
                "email": "Samuel@example.com",
                "password": "1234",
                "rol": 3
            }
        ]
        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedRespondents));

        // Act
        const result = await appService.getRespondents();

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith('respondents');
        expect(result).toEqual(cachedRespondents);
    });

    it('should get respondents from database if not available in cache', async () => {
        // Arrange
        const RespondentsFromDatabase = [
            {
                "id": 1,
                "name": "Guillermo",
                "email": "juan@example.com",
                "password": "1234",
                "rol": 3
            },
            {
                "id": 2,
                "name": "Samuel",
                "email": "Samuel@example.com",
                "password": "1234",
                "rol": 3
            }
        ]

        mockRedisClient.get.mockResolvedValue(null);
        mockDatabase.getRespondents.mockResolvedValue(RespondentsFromDatabase);

        // Act
        const result = await appService.getRespondents();

        // Assert
        expect(mockDatabase.getRespondents).toHaveBeenCalled();
        expect(mockRedisClient.set).toHaveBeenCalledWith('respondents', JSON.stringify(RespondentsFromDatabase));
        expect(mockRedisClient.expire).toHaveBeenCalledWith('respondents', expect.any(Number));
        expect(result).toEqual(RespondentsFromDatabase);
    });

    it('should throw an error if getRespondents fails', async () => {
        // Arrange
        const errorMessage = 'Database error';
        mockRedisClient.get.mockResolvedValue(null);
        mockDatabase.getRespondents.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.getRespondents()).rejects.toThrowError(errorMessage);
    });
});

describe('getRespondentById', () => {
    it('should get respondent by id', async () => {
        // Arrange
        const respondent = {
            "id": 1,
            "name": "Guillermo",
            "email": "juan@example.com",
            "password": "1234",
            "rol": 3
        }

        mockDatabase.getRespondentById.mockResolvedValue(respondent);

        // Act
        const result = await appService.getRespondentById(1);

        // Assert
        expect(mockDatabase.getRespondentById).toHaveBeenCalledWith(1);
        expect(result).toEqual(respondent);
    });

    it('should throw an error if getRespondentById fails', async () => {
        // Arrange
        const errorMessage = 'Database error';
        mockDatabase.getRespondentById.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.getRespondentById(1)).rejects.toThrowError(errorMessage);
    });
});

describe('updateRespondent', () => {
    it('should update respondent', async () => {
        // Arrange
        const respondent = {
            "id": 1,
            "name": "Guillermo",
            "email": "juan@example.com",
            "password": "1234",
            "rol": 3
        }

        mockDatabase.updateRespondent.mockResolvedValue(respondent);

        // Act
        const result = await appService.updateRespondent(respondent, 1);

        // Assert
        expect(mockDatabase.updateRespondent).toHaveBeenCalledWith(respondent, 1);
        expect(result).toEqual(respondent);
    });

    it('should throw an error if updateRespondent fails', async () => {
        // Arrange
        const respondent = {
            "id": 1,
            "name": "Guillermo",
            "email": "juan@example.com",
            "password": "1234",
            "rol": 3
        }

        const errorMessage = 'Database error';
        mockDatabase.updateRespondent.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.updateRespondent(respondent, 1)).rejects.toThrowError(errorMessage);
    });
});

describe('deleteRespondent', () => {
    it('should delete respondent', async () => {
        // Arrange
         const respondent = {
            "id": 1,
            "name": "Guillermo",
            "email": "juan@example.com",
            "password": "1234",
            "rol": 3
        }

        mockDatabase.deleteRespondent.mockResolvedValue(respondent);

        // Act
        const result = await appService.deleteRespondent(1);

        // Assert
        expect(mockDatabase.deleteRespondent).toHaveBeenCalledWith(1);
    });

    it('should throw an error if deleteRespondent fails', async () => {
        // Arrange
        const errorMessage = 'Database error';
        mockDatabase.deleteRespondent.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.deleteRespondent(1)).rejects.toThrowError(errorMessage);
    });
});

describe('getAnalysis', () => {
    it('should get analysis from cache if available', async () => {
        // Arrange
        const cachedAnalysis = {
            "pregunta": "¿Cuál es tu opinión sobre nuestro servicio?",
            "tipo": "abierta",
            "respuestas": [
                {
                    "respuesta": "Muy malo",
                    "cantidad": 2
                },
                {
                    "respuesta": "Regular",
                    "cantidad": 1
                }
            ]
        }

        mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedAnalysis));

        // Act
        const result = await appService.getAnalysis(1);

        // Assert
        expect(mockRedisClient.get).toHaveBeenCalledWith('analysis:1');
        expect(result).toEqual(cachedAnalysis);
    });

    it('should get analysis from database', async () => {
        // Arrange
        const analysisFromDatabase = {
            "pregunta": "¿Cuál es tu opinión sobre nuestro servicio?",
            "tipo": "abierta",
            "respuestas": [
                {
                    "respuesta": "Muy malo",
                    "cantidad": 2
                },
                {
                    "respuesta": "Regular",
                    "cantidad": 1
                }
            ]
        }

        mockRedisClient.get.mockResolvedValue(null);
        mockDatabase2.getAnalysis.mockResolvedValue(analysisFromDatabase);

        // Act
        const result = await appService.getAnalysis(1);

        // Assert
        expect(mockDatabase2.getAnalysis).toHaveBeenCalledWith(1);
        expect(mockRedisClient.set).toHaveBeenCalledWith('analysis:1', JSON.stringify(analysisFromDatabase));
        expect(mockRedisClient.expire).toHaveBeenCalledWith('analysis:1', expect.any(Number));
        expect(result).toEqual(analysisFromDatabase);
    });

    it('should throw an error if getAnalysis fails', async () => {
        // Arrange
        const errorMessage = 'Database error';
        mockDatabase2.getAnalysis.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.getAnalysis(1)).rejects.toThrowError(errorMessage);
    });
});

describe('addQuestionToSurvey', () => {
    it('should add a new question to a survey', async () => {
        // Arrange
        const surveyId = 'exampleSurveyId';
        const existingSurvey = { id: surveyId, questions: [] };
        const newQuestion = 'What is your favorite color?';
        const updatedSurvey = { ...existingSurvey, questions: [newQuestion] };

        // Mocks
        mockDatabase2.findSurveyById.mockResolvedValue(existingSurvey);
        mockDatabase2.updateSurveyById.mockResolvedValue(1); // Assuming one row affected

        // Act
        const result = await appService.addQuestionToSurvey(surveyId, newQuestion);

        // Assert
        expect(mockDatabase2.findSurveyById).toHaveBeenCalledWith(surveyId);
        expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(surveyId, updatedSurvey);
        expect(result).toBe(true);
    });

    it('should throw an error if findSurveyById fails', async () => {
        // Arrange
        const surveyId = 'exampleSurveyId';
        const newQuestion = 'What is your favorite color?';
        const errorMessage = 'Database error';
        mockDatabase2.findSurveyById.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.addQuestionToSurvey(surveyId, newQuestion)).rejects.toThrowError(errorMessage);
    });

    it('should throw an error if updateSurveyById fails', async () => {
        // Arrange
        const surveyId = 'exampleSurveyId';
        const existingSurvey = { id: surveyId, questions: [] };
        const newQuestion = 'What is your favorite color?';
        const errorMessage = 'Database error';
        mockDatabase2.findSurveyById.mockResolvedValue(existingSurvey);
        mockDatabase2.updateSurveyById.mockRejectedValue(new Error(errorMessage));

        // Act and Assert
        await expect(appService.addQuestionToSurvey(surveyId, newQuestion)).rejects.toThrowError(errorMessage);
    });


});

describe('getSurveyQuestions', () => {
    it('should get survey from cache if available', async () => {
      // Arrange
      const surveyId = 'exampleSurveyId'; // Solo el ID, sin el prefijo "survey:"
      const cachedSurvey = { id: 'exampleSurveyId', questions: ['What is your favorite color?'] };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedSurvey));
  
      // Act
      const result = await appService.getSurveyQuestions(surveyId);
  
      // Assert
      expect(mockRedisClient.get).toHaveBeenCalledWith('survey:exampleSurveyId'); // Utiliza solo el ID aquí
      expect(result).toEqual(cachedSurvey.questions);
    });

    it('should get survey from database if not available in cache', async () => {
      // Arrange
      const surveyId = 'exampleSurveyId';
      const surveyFromDatabase = { id: 'exampleSurveyId', questions: ['What is your favorite color?'] };
      mockRedisClient.get.mockResolvedValue(null);
      mockDatabase2.findSurveyById.mockResolvedValue(surveyFromDatabase);
  
      // Act
      const result = await appService.getSurveyQuestions(surveyId);
  
      // Assert
      expect(mockDatabase2.findSurveyById).toHaveBeenCalledWith(surveyId);
      expect(mockRedisClient.set).toHaveBeenCalledWith(`survey:${surveyId}`, JSON.stringify(surveyFromDatabase));
      expect(mockRedisClient.expire).toHaveBeenCalledWith(`survey:${surveyId}`, expect.any(Number));
      expect(result).toEqual(surveyFromDatabase.questions);
    });

    it('should throw an error if findSurveyById fails', async () => {
        // Arrange
        const surveyId = 'exampleSurveyId';
        const errorMessage = 'Database error';
        mockRedisClient.get.mockResolvedValue(null);
        mockDatabase2.findSurveyById.mockRejectedValue(new Error(errorMessage));
  
        // Act and Assert
        await expect(appService.getSurveyQuestions(surveyId)).rejects.toThrowError(errorMessage);
    });

  });

describe('updateQuestionFromSurvey', () => {
  it('should update a question from a survey', async () => {
    // Arrange
    const surveyId = '21';
    const questionId = '1';
    const updatedQuestion = 'What is your new favorite color?';
    const existingSurvey = {
        idEncuesta: surveyId,
        questions: [{ idPregunta: questionId, text: 'What is your favorite color?' }]
    };

    // Establecer el mock de findIndex para devolver un valor diferente de -1
    const mockFindIndex = jest.fn().mockReturnValue(0); // Supongamos que la pregunta se encuentra en la posición 0 del array
    jest.spyOn(existingSurvey.questions, 'findIndex').mockImplementation(mockFindIndex);

    // Mocks adicionales
    mockDatabase2.findSurveyById.mockResolvedValue(existingSurvey);
    mockDatabase2.updateSurveyById.mockResolvedValue(true);

    // Act
    const result = await appService.updateSurveyQuestion(surveyId, questionId, updatedQuestion);

    // Assert
    expect(mockDatabase2.findSurveyById).toHaveBeenCalledWith(surveyId);
    expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(surveyId, existingSurvey);
    expect(result).toBe(true);
});

  it('should return false if survey is not found', async () => {
      // Arrange
      const surveyId = 'exampleSurveyId';
      const questionId = 'exampleQuestionId';
      const updatedQuestion = 'What is your new favorite color?';
      mockDatabase2.findSurveyById.mockResolvedValue(null);

      // Act
      const result = await appService.updateSurveyQuestion(surveyId, questionId, updatedQuestion);

      // Assert
      expect(result).toBe(false);
  });

  it('should return false if question is not found in the survey', async () => {
      // Arrange
      const surveyId = 'exampleSurveyId';
      const questionId = 'exampleQuestionId';
      const updatedQuestion = 'What is your new favorite color?';
      const existingSurvey = {
          idEncuesta: surveyId,
          questions: [{ idPregunta: 'anotherQuestionId', text: 'What is your favorite color?' }]
      };
      mockDatabase2.findSurveyById.mockResolvedValue(existingSurvey);

      // Act
      const result = await appService.updateSurveyQuestion(surveyId, questionId, updatedQuestion);

      // Assert
      expect(result).toBe(false);
  });
});

describe('deleteSurveyQuestion', () => {
  it('should delete a question from a survey', async () => {
      // Arrange
      const surveyId = 'exampleSurveyId';
      const questionId = 'exampleQuestionId';
      const existingSurvey = { id: surveyId, questions: [{ idPregunta: 1 }, { idPregunta: 2 }, { idPregunta: 3 }] };

      // Mocks
      mockDatabase2.findSurveyById.mockResolvedValue(existingSurvey);
      mockDatabase2.updateSurveyById.mockResolvedValue(1); // Assuming one row affected

      // Act
      const result = await appService.deleteSurveyQuestion(surveyId, questionId);

      // Assert
      expect(mockDatabase2.findSurveyById).toHaveBeenCalledWith(surveyId);
      expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(surveyId, existingSurvey);
      expect(result).toBe(true);
  });

  it('should return false if survey is not found', async () => {
      // Arrange
      const surveyId = 'nonExistentSurveyId';
      const questionId = 'exampleQuestionId';

      // Mock
      mockDatabase2.findSurveyById.mockResolvedValue(null);

      // Act
      const result = await appService.deleteSurveyQuestion(surveyId, questionId);

      // Assert
      expect(result).toBe(false);
  });

  it('should throw an error if findSurveyById fails', async () => {
      // Arrange
      const surveyId = 'exampleSurveyId';
      const questionId = 'exampleQuestionId';
      const errorMessage = 'Database error';
      mockDatabase2.findSurveyById.mockRejectedValue(new Error(errorMessage));

      // Act and Assert
      await expect(appService.deleteSurveyQuestion(surveyId, questionId)).rejects.toThrowError(errorMessage);
  });

  it('should throw an error if updateSurveyById fails', async () => {
      // Arrange
      const surveyId = 'exampleSurveyId';
      const questionId = 'exampleQuestionId';
      const existingSurvey = { id: surveyId, questions: [{ idPregunta: 1 }, { idPregunta: 2 }, { idPregunta: 3 }] };
      const errorMessage = 'Database error';
      mockDatabase2.findSurveyById.mockResolvedValue(existingSurvey);
      mockDatabase2.updateSurveyById.mockRejectedValue(new Error(errorMessage));

      // Act and Assert
      await expect(appService.deleteSurveyQuestion(surveyId, questionId)).rejects.toThrowError(errorMessage);
  });
});


  

  // Añade pruebas similares para las demás funciones (getUserById, updateUser, deleteUser)...
});

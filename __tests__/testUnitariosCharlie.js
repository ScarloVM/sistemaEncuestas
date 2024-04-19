const { AppService } = require('../AppService');

// Mock para el objeto database
const mockDatabase = {
  createUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  createRespondent: jest.fn(),
  getRespondents: jest.fn(),
  getRespondentById: jest.fn(),
  updateRespondent: jest.fn(),
  deleteRespondent: jest.fn()
};

const mockDatabase2 = {
    createUser: jest.fn(),
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
            "respuesta": "Decente",
            "required": true
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
                    "respuesta": "Decente",
                    "required": true
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
                            "respuesta": "Muy malo",
                            "required": true
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
                            "respuesta": "Regular",
                            "required": true
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
                             "respuesta": "Muy malo",
                             "required": true
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
                             "respuesta": "Regular",
                             "required": true
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
});

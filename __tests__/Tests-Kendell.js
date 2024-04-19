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
    findSurveyById: jest.fn(),
    updateSurveyById: jest.fn()
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
            id: surveyId,
            questions: [{ idPregunta: questionId, text: 'What is your favorite color?' }]
          };
      
          // Mocks
          mockDatabase2.findSurveyById.mockResolvedValue(existingSurvey);
          
          mockDatabase2.updateSurveyById.mockResolvedValue(1); // Assuming one row affected
      
          // Act
          const result = await appService.updateSurveyQuestion(surveyId, questionId, updatedQuestion);
      
          // Assert
          expect(mockDatabase2.findSurveyById).toHaveBeenCalledWith(surveyId);
          expect(mockDatabase2.updateSurveyById).toHaveBeenCalledWith(surveyId, questionId, updatedQuestion);
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
            id: surveyId,
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

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

  // Añade pruebas similares para las demás funciones (getUserById, updateUser, deleteUser)...
});

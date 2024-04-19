const { AppService } = require('../AppService');

// Mock para el objeto database
const consoleSpy = jest.spyOn(console, 'log');

const mockDatabase = {
  createUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
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

  

  

  // Añade pruebas similares para las demás funciones (getUserById, updateUser, deleteUser)...
});

const request = require('supertest');
const express = require('express');
const { showAllUsers, showUserById } = require('../../routes/users/usersController');
const User = require('../../config/usersSchema');

// Mocking the User model
jest.mock('../../config/usersSchema');

const app = express();
app.use(express.json());
app.get('/api/v1/users', showAllUsers);
app.get('/api/v1/users/:id', showUserById);

describe('Users Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should show all users', async () => {
    const users = [{ username: 'testuser1' }, { username: 'testuser2' }];
    User.find.mockResolvedValue(users);
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(users);
  });

  test('should show a specific user by id', async () => {
    const user = { username: 'testuser1' };
    User.findById.mockResolvedValue(user);
    const res = await request(app).get('/api/v1/users/645b775e7386fa932a29c5a5');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(user);
  });

  test('should return 404 when a user does not exist', async () => {
    User.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/v1/users/645b775e7386fa932a29c5a5');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ message: 'User does not exist' });
  });

  test('should return 500 when there is a database error for showAllUsers', async () => {
    User.find.mockRejectedValue(new Error('Database error'));
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ message: 'Database error' });
  });

  test('should return 500 when there is a database error for showUserById', async () => {
    User.findById.mockRejectedValue(new Error('Database error'));
    const res = await request(app).get('/api/v1/users/645b775e7386fa932a29c5a5');
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({ message: 'Database error' });
  });

});

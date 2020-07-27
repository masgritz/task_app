const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    populateDatabase
} = require('./fixtures/db')

beforeEach(populateDatabase)

// CREATE
test('Should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Matheus',
            email: 'matheus@example.com',
            password: 'MyPass!79'
        }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'Matheus',
            email: 'matheus@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass!79')
})

test('Should not signup user with invalid email', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Matheus',
            password: 'MyPass!79'
        }).expect(400)
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistant user', async () => {
    await request(app).post('/users/login').send({
        email: 'noneczist@example.com',
        password: 'notreal8574'
    }).expect(400)
})

test('Should upload avatar picture', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

// READ
test('Should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unathenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})


// UPDATE
test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Tester One',
            age: 27
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Tester One')
    expect(user.age).toBe(27)
})

test('Should not update user with invalid name', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: ''
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            location: 'New York'
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Tester Two'
        })
        .expect(401)
})

// DELETE
test('Should delete user account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete user if unauthenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

//
// User Test Ideas
//
// Should not signup/update user with invalid password

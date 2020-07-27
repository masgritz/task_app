const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    populateDatabase
} = require('./fixtures/db')

beforeEach(populateDatabase)

// CREATE
test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

// READ
test('Should get all tasks for user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)
})

test('Should get only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(1)
})

test('Should get only incompleted tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(1)
})

test('Should get user task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)

    const task = Task.findById(response.body._id)
    expect(task).not.toBeNull()

})

test('Should not get other users task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
    
    expect(taskThree.owner).not.toBe(userOne._id)
})

test('Should not get user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${taskTwo._id}`)
        .send()
        .expect(401)
})

// UPDATE
test('Should update task for user', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .send({
            completed: true
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(true)
})

test('Should not update other users tasks', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .send({
            completed: true
        })
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task.completed).not.toBe(true)
})


// DELETE
test('Should delete user tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskThree._id)
    expect(task).toBeNull()
})

test('Should not delete other users tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})



//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks
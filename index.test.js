import { app, server } from './index.js'
import request from 'supertest'
import User from './users/model.js'
import sequelize from './shared/database/database.js'
import { Sequelize } from 'sequelize'

describe('User', () => {
    let data
    let mockedSequelize
    let originalEnv

    beforeAll(async () => {
        // Initialize the database before tests
        await sequelize.sync({ force: true })
    })

    beforeEach(async () => {
        data = {
            "dni": "1234567890",
            "name": "Test"
        }
        jest.spyOn(console, 'log').mockImplementation(jest.fn())
        jest.spyOn(sequelize, 'log').mockImplementation(jest.fn())
        mockedSequelize = new Sequelize({
            database: '<any name>',
            dialect: 'sqlite',
            username: 'root',
            password: '',
            validateOnly: true,
            models: [__dirname + '/models'],
        })
        await mockedSequelize.sync({ force: true })
    })

    afterEach(async () => {
        jest.clearAllMocks()
        await mockedSequelize.close()
    })

    afterAll(async () => {
        await sequelize.close()
        server.close()
    })

    describe('Environment-specific behavior', () => {
        beforeEach(() => {
            originalEnv = process.env.NODE_ENV
        })

        afterEach(() => {
            process.env.NODE_ENV = originalEnv
        })

        test('should not log in test environment', async () => {
            process.env.NODE_ENV = 'test'
            const consoleSpy = jest.spyOn(console, 'log')
            
            // Import index.js again to trigger the environment check
            const { app: testApp } = await import('./index.js')
            
            expect(consoleSpy).not.toHaveBeenCalled()
        })

        test('should log in development environment', async () => {
            process.env.NODE_ENV = 'development'
            const consoleSpy = jest.spyOn(console, 'log')
            
            // Import index.js again to trigger the environment check
            const { app: testApp } = await import('./index.js')
            
            expect(consoleSpy).toHaveBeenCalled()
        })
    })

    test('Get users', async () => {
        jest.spyOn(User, 'findAll').mockResolvedValue([data])
        const response = await request(app).get('/api/users')

        expect(response.status).toBe(200)
        expect(response.body).toEqual([data])
    })

    test('Get user', async () => {
        jest.spyOn(User, 'findByPk').mockResolvedValue({...data, "id": 1})
        const response = await request(app).get('/api/users/1')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({...data, "id": 1})
    })

    test('Create user', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null)
        jest.spyOn(User, 'create').mockResolvedValue({...data, "id": 1})
        const response = await request(app).post('/api/users').send(data)

        expect(response.status).toBe(201)
        expect(response.body).toEqual({...data, "id": 1})
    })
})

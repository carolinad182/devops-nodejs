import sequelize from './shared/database/database.js'
import { usersRouter } from "./users/router.js"
import express from 'express'

const app = express()
// Disable Express version disclosure
app.disable('x-powered-by')

const PORT = 8000

// Only log in development environment
if (process.env.NODE_ENV !== 'test') {
    sequelize.sync({ force: true }).then(() => console.log('db is ready'))
}

app.use(express.json())
app.use('/api/users', usersRouter)

const server = app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log('Server running on port', PORT)
    }
})

export { app, server }
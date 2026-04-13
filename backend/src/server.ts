import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { routes } from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.use(errorHandler)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`🚀 ClickBeard Server running on port ${PORT}`)
})

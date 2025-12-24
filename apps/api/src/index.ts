import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { authRoutes } from './routes/auth.js'
import { ticketRoutes } from './routes/tickets.js'
import { tenantRoutes } from './routes/tenants.js'
import { productRoutes } from './routes/products.js'
import { userRoutes } from './routes/users.js'
import { epicRoutes } from './routes/epics.js'
import { featureRoutes } from './routes/features.js'
import { taskRoutes } from './routes/tasks.js'
import { ideaRoutes } from './routes/ideas.js'
import { teamRoutes } from './routes/teams.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = parseInt(process.env.PORT || '4000')
const HOST = process.env.HOST || '0.0.0.0'

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/tenants', tenantRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/epics', epicRoutes)
app.use('/api/features', featureRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/ideas', ideaRoutes)
app.use('/api/teams', teamRoutes)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, HOST, () => {
  console.log(`API server listening on ${HOST}:${PORT}`)
  console.log(`  Local:   http://localhost:${PORT}`)
  if (HOST === '0.0.0.0') {
    console.log(`  Network: http://<your-ip>:${PORT}`)
  }
})

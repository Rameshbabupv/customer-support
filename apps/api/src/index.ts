import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.js'
import { ticketRoutes } from './routes/tickets.js'
import { tenantRoutes } from './routes/tenants.js'

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/tenants', tenantRoutes)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

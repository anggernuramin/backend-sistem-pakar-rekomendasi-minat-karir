import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import routes from '@routes/index'

const app: Application = express()
const port: number = 3000

// middleware
app.use(express.json())
app.use(cors())
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  next()
})

// routes
routes(app)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

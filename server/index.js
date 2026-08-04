import path from 'node:path'
import express from 'express'
import morgan from 'morgan'
import apiHandler from '../api/functions.js'

const port = process.env.PORT || 3000
const app = express()
const indexPath = path.resolve(process.cwd(), 'src/index.html')

app.use(morgan('dev'))
app.use(express.json())
app.use(express.static('src', {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store')
}))

app.get('/', (req, res) => {
  res.sendFile(indexPath)
})

app.get(/^\/(?!api\/)(?!.*\.[^/]+$).*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(indexPath)
})

app.post('/api/functions', (req, res) => apiHandler(req, res))

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export default app

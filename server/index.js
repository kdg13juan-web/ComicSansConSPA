import express from 'express'
import morgan from 'morgan'

const port = process.env.PORT || 3000
const app = express()

app.use(morgan('dev'))
app.use(express.static('src', {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store')
}))

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/src/index.html`)
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})  
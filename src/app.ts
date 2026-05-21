import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import path from 'path'
import router from './routes/routes'
import cookieParser from 'cookie-parser'
import { getUrls, initDB } from './database/bd'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(router)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
  const urls = await getUrls(req.cookies.userId)
  res.render('example', { title: 'Short URL', shortUrl: null, urls, message: '' })
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
  })
}).catch(console.error)
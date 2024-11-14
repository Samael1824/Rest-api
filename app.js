const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')

const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./Schemas/movies')
const app = express()
app.use(express.json())

app.use(cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev'
      ]
  
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
  
      if (!origin) {
        return callback(null, true)
      }
  
      return callback(new Error('Not allowed by CORS'))
    }
  }))
// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS
app.disable('x-powered-by') // deshabilita el header x-powered-by de expresss
const PORT = process.env.PORT ?? 1234

app.get('/movies', (req,res) => {
    const { genre } = req.query
    if(genre) {
        const filterMovies = movies.filter(
            movie => movie.genre.some(valor => valor.toLowerCase() === genre.toLowerCase())
        ) 
        return res.json(filterMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req,res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)

    if(movie) return res.json(movie)

    res.status(404).json({  message: 'Movie not found'  })
})

app.post('/movies',(req,res) => {


    //const {title,genre,year,director,duration,rate,poster} = req.body
    const result = validateMovie(req.body)

    if(result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }
    /*
        esto se aplicaria en caso de yo tener validar campo por campo pero como ya lo tengo validado entonces
        ahora si puedo hacer la insercion de todo al json de movies
    */
    // const newMovie = {
    //     id: crypto.randomUUID(), //identificador unico universal
    //     title,
    //     genre,
    //     year,
    //     director,
    //     duration,
    //     rate: rate ?? 0,
    //     poster
    // }

    /*
    Esto no sería REST, porque estamos guardando
    el estado de la aplicación en memoria
    aqui se inserta al json la nueva pelicula
    */
    movies.push(newMovie)
    res.status(201).json(newMovie) // actualizar la cache del cliente
})

app.patch('/movies/:id', (req,res) => {
    const result = validatePartialMovie(req.body)
    
    if(!result.success)
    {
        return res.status(400).json({ error: JSON.parse(result.error.message)})
    }
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id = id)

    if(movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found'})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    movies.splice(movieIndex, 1)
  
    return res.json({ message: 'Movie deleted' })
  })

app.listen(PORT, () => {
    console.log(`La direccion del puerto es http://localhost:${PORT}`)
})
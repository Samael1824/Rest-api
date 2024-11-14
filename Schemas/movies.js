const zod = require('zod')

    // midu le puso movieSchema
const movieValidation = zod.object({
    title: zod.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
    }),
    year: zod.number().min(1900).max(2024),
    director: zod.string(),
    duration: zod.number().int().positive(),
    rate: zod.number().min(0).max(10).default(5.5),
    poster: zod.string().url({
    message: 'Poster must be a valid url'
    }),
    genre: zod.array(
        zod.enum(['action','Adventure','Comedy','Crime','Drama','Fantasy','Horror','Sci-Fi','thriller']),
        {
            required_error: 'Movie Genre is Required',
            invalid_type_error: 'Movie Genre must be of Enum Genre'
        }
    )
})

function validateMovie(object) {
    return movieValidation.safeParse(object)
}

function validatePartialMovie (object) {
    return movieValidation.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}
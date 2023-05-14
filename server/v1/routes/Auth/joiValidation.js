const Joi = require('@hapi/joi');

// Define a schema
const joiProductSchema = Joi.object({
    name: Joi.string().min(2).max(50).strict(),
    numericPrice: Joi.number().greater(0).strict(),
    category: Joi.string().min(2).max(50).strict(),
    description: Joi.string().min(5).max(255).strict(),
    postedDate: Joi.date().strict(),
    seller: Joi.string().strict(),
}).unknown(false);

module.exports = joiProductSchema;
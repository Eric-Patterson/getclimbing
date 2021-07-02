       const BaseJoi = require('joi')
       const sanitizeHtml = require('sanitize-html');
       // if(!req.body.gym) throw new ExpressError('Invalid Camground Date', 400) //basic logic to see if request.body contains gym
        // this schema below will validate before its inserted into mongoose, its a joi schema
        // this is used to help people from not making stuff by using postman/ajax to bypass the client side validation
        // mongoose server side validation is slow and clunky

        // ========================= SANITIZING HTML ===================================
        const extension = (joi) => ({
            type: 'string',
            base: joi.string(),
            messages: {
                'string.escapeHTML': '{{#label}} must not include HTML!'
            },
            rules: {
                escapeHTML: {
                    validate(value, helpers) {
                        const clean = sanitizeHtml(value, {
                            allowedTags: [],
                            allowedAttributes: {},
                        });
                        if (clean !== value) return helpers.error('string.escapeHTML', { value })
                        return clean;
                    }
                }
            }
        });
    // with this, we can now use escapeHTML() on our joi variables below
    const Joi = BaseJoi.extend(extension)

        module.exports.gymSchema = Joi.object({
            gym: Joi.object({
                title: Joi.string().required().escapeHTML(),
                price: Joi.number().required().min(0),
                // image: Joi.string().required(),
                location: Joi.string().required().escapeHTML(),
                description: Joi.string().required().escapeHTML()
            }).required(),
            deleteImages: Joi.array()
        });

        module.exports.reviewSchema = Joi.object({
            review: Joi.object({
                rating: Joi.number().required(),
                body: Joi.string().required().escapeHTML()
            }).required()
        })

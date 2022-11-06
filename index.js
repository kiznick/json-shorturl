const url_list = require('./url_list.json');
const fastify = require('fastify')({ logger: true })
const path = require('path')

const port = process.env.PORT || 3000

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
})

fastify.register(require("@fastify/view"), {
    engine: {
        ejs: require("ejs"),
    }
})

fastify.get('/', async (request, reply) => {
    return reply.view('./views/link_not_found.ejs')
})

fastify.get('/:unique', async (request, reply) => {
    let viewUrl = false
    let { unique } = request.params;

    if(unique.endsWith('+')) {
        viewUrl = true
        unique = unique.slice(0, -1);
    }

    const url = solve(unique)
    if (url) {

        if(viewUrl) {
            return reply.view('./views/view_link.ejs', { url: url })
        }

        return reply.redirect(url.target)
    }

    return reply.view('./views/link_not_found.ejs')
})

const start = async () => {
    try {
        await fastify.listen({ port: port })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()

function solve(unique) {
    return url_list.find(list => {  
        return list.unique === unique
    }) || null
}
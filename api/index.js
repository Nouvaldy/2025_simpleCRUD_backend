const Hapi = require('@hapi/hapi');

// Sample routes
const routes = [
    {
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return { message: 'Hello from Hapi API!' };
        }
    },
    {
        method: 'GET',
        path: '/api/users',
        handler: (request, h) => {
            // Sample data
            return {
                users: [
                    { id: 1, name: 'John Doe', email: 'john@example.com' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                ]
            };
        }
    },
    {
        method: 'POST',
        path: '/api/users',
        handler: (request, h) => {
            const { name, email } = request.payload;
            return {
                message: 'User created',
                user: { id: Date.now(), name, email }
            };
        }
    },
    {
        method: 'PUT',
        path: '/api/users/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            const { name, email } = request.payload;
            return {
                message: 'User updated',
                user: { id: parseInt(id), name, email }
            };
        }
    },
    {
        method: 'DELETE',
        path: '/api/users/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            return { message: `User ${id} deleted` };
        }
    }
];

// Serverless handler untuk Vercel
module.exports = async (req, res) => {
    const server = Hapi.server({
        host: '0.0.0.0',
        port: process.env.PORT || 3000,
        routes: {
            cors: {
                origin: ['*'], // Allow all origins for development
                headers: ['Accept', 'Content-Type'],
                additionalHeaders: ['X-Requested-With']
            }
        }
    });

    // Add routes
    server.route(routes);

    // Initialize server
    await server.initialize();

    // Handle the request
    const { method, url, headers, body } = req;
    
    const response = await server.inject({
        method: method,
        url: url,
        headers: headers,
        payload: method !== 'GET' && method !== 'DELETE' ? body : undefined
    });

    // Set response headers
    Object.keys(response.headers).forEach(key => {
        res.setHeader(key, response.headers[key]);
    });

    res.statusCode = response.statusCode;
    res.end(response.payload);
};

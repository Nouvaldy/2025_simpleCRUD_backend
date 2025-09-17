// api/index.js - Main API handler
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
        path: '/users',
        handler: (request, h) => {
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
        path: '/users',
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
        path: '/users/{id}',
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
        path: '/users/{id}',
        handler: (request, h) => {
            const { id } = request.params;
            return { message: `User ${id} deleted` };
        }
    }
];

// Serverless handler for Vercel
module.exports = async (req, res) => {
    try {
        const server = Hapi.server({
            host: '0.0.0.0',
            port: process.env.PORT || 3000,
            routes: {
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Content-Type', 'Authorization'],
                    additionalHeaders: ['X-Requested-With']
                }
            }
        });

        // Add routes
        server.route(routes);

        // Initialize server
        await server.initialize();

        // Parse request body for POST/PUT requests
        let payload;
        if (req.method !== 'GET' && req.method !== 'DELETE') {
            payload = '';
            req.on('data', chunk => {
                payload += chunk.toString();
            });
            await new Promise(resolve => {
                req.on('end', resolve);
            });
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                payload = {};
            }
        }

        // Handle the request
        const response = await server.inject({
            method: req.method,
            url: req.url,
            headers: req.headers,
            payload: payload
        });

        // Set response headers
        Object.keys(response.headers).forEach(key => {
            res.setHeader(key, response.headers[key]);
        });
        
        res.statusCode = response.statusCode;
        res.end(response.payload);
        
    } catch (error) {
        console.error('Server error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
};

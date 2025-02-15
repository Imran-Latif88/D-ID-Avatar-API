//import Fastify from 'fastify';
import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import dotenv from 'dotenv';
import fs from 'fs';
import { webhookRoute } from './webhook'; 
//import authentication from './middleware/authentication';
import standardAvatarRoutes from './routes/standaravatar';
import premiumAvatarRoutes from './routes/preiumeavatar';
import expressAvatarRoutes from './routes/expressavatar';
import consentprocess from './routes/consentcreate';
import fastifyJwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import cors from '@fastify/cors';

dotenv.config();

const options = {
  https: {
    key: fs.readFileSync('key.pem'),   //only fro local development testing
    cert: fs.readFileSync('cert.pem'),
  },
  logger: true, // Enable Fastify built-in logging
  bodylimit: '100mb', // Set the maximum request body size to 100mb
};

const server = fastify(options);

server.register(cors, {
  origin: '*',
  methods: ['POST', 'GET', 'DELETE', 'OPTIONS', 'PUT', 'PATCH'],
});

// Register the swagger plugin and swagger ui
server.register(swagger, {
  swagger: {
    info: {
      title: 'Chatter API Did',
      description: 'D-id REST APIs App',
      version: '1.0.0',
    },
    host: '127.0.0.1:443',
    schemes: ['https'],                     // D-id API support only HTTPS requests 
    consumes: ['application/json'],
    produces: ['application/json'],
  },
});

server.register(swaggerUi, {
  routePrefix: '/docs',   // This is the URL endpoint where Swagger UI will be accessible
  staticCSP: false,        // Enable Content Security Policy for Swagger UI
  uiConfig: {},           // UI configurations can be added here
  uiHooks: {},            // Optional hooks
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;  // Optionally transform the Swagger spec
  },
});



const tempPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApQx0LKz/FmrBGqSUftdP
eW/eNNltbWzYl/Ncn1Z9R8S34mEG0yr7So4VBVZ/TAhyNq/eWDO5R+2cUYdiAIDz
Se4jB2XQsPwZiusqW0l2CqXvY29CY+ADfw+mCGc0DU/pPEsxe6JW1LnZB801I+Nz
9sL5SQTLjLLsTMNxunbQrvZ2LJCNR08kTpTbT3k6jTOJVxK/HI/5seGNOQHeg0EP
xpnKHmFnUab9C+spfxAmCi1VjZADdGJ1uQBrtMXPAOsqB3pKMM0Pn1C6o0WywSEX
PtAvTf2ubfOanLWW48frCR8OQvKIARDoDpVRMZRoF7eV4l24PfeA9lavx/OBt2GY
3QIDAQAB
-----END PUBLIC KEY-----`;

server.register(fastifyJwt, {
  secret: {
    public: tempPublicKey,
  },
});

server.decorate('auth', async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    delete (err as { code?: any }).code;
    reply.send(err);
  }
});

// Register the authentication middleware
//server.register(authentication);

// Register the webhook route
server.register(webhookRoute);

// Register the avatar routes
server.register(standardAvatarRoutes, { prefix: '/standardavatar' });
//server.register(premiumAvatarRoutes, { prefix: '/createpremiumavatar' });  //enable feature not used this time 
server.register(expressAvatarRoutes, { prefix: '/expressavatar' });
server.register(consentprocess, { prefix: '/consent' });



// Start the server
server.listen({ host: '0.0.0.0', port: 443 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is listening at ${address}`);
});

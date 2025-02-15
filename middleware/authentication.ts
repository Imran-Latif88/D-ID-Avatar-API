// import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
// import fjwt, { JWT } from '@fastify/jwt';

// declare module 'fastify' {
//   interface FastifyInstance {
//     jwt: JWT;
//   }
//   interface FastifyRequest {
//     user: (string | object | Buffer<ArrayBufferLike>) 
//   }
// }

// const authentication: FastifyPluginAsync = async (fastify) => {
//   if (!process.env.AUTH_TOKEN) {
//     fastify.log.error('AUTH_TOKEN is not defined in the environment variables.');
//     throw new Error('AUTH_TOKEN is not defined in the environment variables.');
//   }

//   // Register JWT plugin
//   fastify.register(fjwt, {
//     secret: process.env.AUTH_TOKEN,
//   });

//   fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
//     // Skip authentication for the /webhook route
//     // if (request.raw.url?.startsWith('/webhook')) {
//     //   return;
//     // }

//     try {
//       await request.jwtVerify();
//       fastify.log.info('Authentication successful');
//     } catch (err) {
//       fastify.log.warn('Unauthorized: Invalid token');
//       reply.status(401).send({ error: 'Unauthorized: Invalid token' });
//     }
//   });
// };

// export default authentication;

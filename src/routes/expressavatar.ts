import Fastify, { FastifyInstance, FastifyPluginOptions } from 'fastify';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.API_KEY; 

interface CreateExpressAvatarRequest {
  source_url: string;
  consent_id?: string;
  webhook?: string;
  user_data?: string;
  show?: boolean;
  persist?: boolean;
  thumbnail_url?: string;
  name?: string;
  is_greenscreen?: boolean;
  userId: string; 
}

// Define the schema for request validation
const createExpressAvatarSchema = {
  type: 'object',
  required: ['source_url', 'userId'], // Required fields
  properties: {
    source_url: { type: 'string' },
    consent_id: { type: 'string' },
    webhook: { type: 'string' },
    user_data: { type: 'string', maxLength: 1000 },
    show: { type: 'boolean' },
    persist: { type: 'boolean' },
    thumbnail_url: { type: 'string' },
    name: { type: 'string' },
    is_greenscreen: { type: 'boolean' },
    userId: { type: 'string' }, // Required for metadata
  },
};

// Export the route as a Fastify plugin
export default async function expressAvatarRoutes(
  server: FastifyInstance,
  options: FastifyPluginOptions
) {
  server.post('/create-express-avatars', {
    schema: {
      //body: createExpressAvatarSchema,
      querystring: createExpressAvatarSchema,
    },
  }, async (request, reply) => {
    const {
      source_url,
      consent_id,
      webhook,
      user_data,
      show,
      persist,
      thumbnail_url,
      name,
      is_greenscreen,
      userId,
    } = request.query as CreateExpressAvatarRequest;

    try {
      const response = await axios.post(
        'https://api.d-id.com/scenes/avatars',
        {
          source_url,
          consent_id,
          webhook: 'https://127.0.0.1:444/webhook', // Update this to your actual webhook URL
          user_data,
          show: show ?? true, // Default to true if not provided
          persist: persist ?? true, // Default to true if not provided
          thumbnail_url,
          name,
          greenscreen: {
            similarity: '0.12',
            blend: '0.1',
          },
          metadata: {
            user_id: userId, 
            operation: 'create_express_avatar',
          },
        },
        {
          headers: {
            Authorization: `Basic ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Express avatar created successfully:', response.data); //only for local development testing
      return response.data;
    } catch (error) {
      server.log.error('Error creating express avatar:', error);
      //console.log('Error creating express avatar:', error);  //only for local development testing
      
      reply.status(500).send({ error: 'Something went wrong' });
    }
  });
}
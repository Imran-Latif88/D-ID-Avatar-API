// premiumavatar.ts

import Fastify, { FastifyInstance, FastifyPluginOptions } from 'fastify';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.API_KEY; 

interface CreatePremiumAvatarRequest {
  source_url: string;
  name: string;
  gender: string;
  consent_id?: string;
  webhook?: string;
  userId: string; 
}

// Define the schema for Premium+ avatar request validation
const createPremiumAvatarSchema = {
  type: 'object',
  required: ['source_url', 'gender', 'userId'], 
  properties: {
    source_url: { type: 'string' },
    name: { type: 'string' },
    gender: { type: 'string', enum: ['male', 'female'] },
    consent_id: { type: 'string' },
    webhook: { type: 'string' },
    userId: { type: 'string' }, 
  },
};

// Export the route as a Fastify plugin
export default async function premiumAvatarRoutes(
  server: FastifyInstance,
  options: FastifyPluginOptions
) {
  server.post('/create-premium-avatar', {
    schema: {
      //body: createPremiumAvatarSchema,   
      querystring:createPremiumAvatarSchema,
    },
  }, async (request, reply) => {
    const { source_url, name, gender, consent_id, webhook, userId } = request.query as CreatePremiumAvatarRequest;

    try {
      const response = await axios.post(
        'https://api.d-id.com/clips/avatars',
        {
          source_url,
          name,
          gender,
          consent_id,
          webhook: 'https://127.0.0.1:443/webhook', // Update this to your actual webhook URL
          config: {
            is_greenscreen: 'false',
          },
          metadata: {
            user_id: userId, // Use the userId from the request body
            operation: 'create_premium_avatar',
          },
        },
        {
          headers: {
            Authorization: `Basic ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  });
}
// standardavatar.ts

import Fastify, { FastifyInstance, FastifyPluginOptions } from 'fastify';
import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https'; 
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.API_KEY; 

interface CreateAvatarRequest {
  imgFileUrl: string;
  audioFileUrl: string;
  userId: string;
}

const createAvatarSchema = {
  type: 'object',
  required: ['imgFileUrl', 'audioFileUrl', 'userId'],
  properties: {
    imgFileUrl: { type: 'string' },
    audioFileUrl: { type: 'string' },
    userId: { type: 'string' },
  },
};

async function pollVideoStatus(server: FastifyInstance, talkId: string, userId: string) {
  const maxAttempts = 30;
  const interval = 5000;

  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axiosInstance.get(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          Authorization: `Basic ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const { status, result_url } = response.data;

      if (status === 'done' && result_url) {
        await axiosInstance.post('https://127.0.0.1:443/webhook', {
          event: 'video.completed',
          data: {
            metadata: {
              user_id: userId,
              operation: 'create_avatar',
            },
            result_url,
          },
        });
        server.log.info(`Video created for ${userId} with result URL: ${result_url}`);
        return result_url;
      }
    } catch (error) {
      server.log.error(`Polling attempt ${attempt + 1} failed: ${error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return null;
}

export default async function standardAvatarRoutes(
  server: FastifyInstance,
  options: FastifyPluginOptions
) {
  server.post('/create-avatar-with-voice', {
    schema: {
      querystring: createAvatarSchema,
    },
  }, async (request, reply) => {
    const { imgFileUrl, audioFileUrl, userId } = request.query as CreateAvatarRequest;

    try {
      const response = await axios.post(
        'https://api.d-id.com/talks',
        {
          source_url: imgFileUrl,
          script: {
            type: 'audio',
            audio_url: audioFileUrl,
          },
          webhook: 'https://127.0.0.1:443/webhook',
          metadata: {
            user_id: userId,
          },
        },
        {
          headers: {
            Authorization: `Basic ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { id: talkId } = response.data;
      server.log.info(`Avatar creation request received for user ${userId}, Talk ID: ${talkId}`);

      const result_url = await pollVideoStatus(server, talkId, userId);

      return reply.send({ ...response.data, result_url });
    } catch (error) {
      server.log.error(`Error in /create-avatar-with-voice: ${error}`);
      reply.status(500).send({ error: 'Something went wrong' });
    }
  });
}

import Fastify, { FastifyInstance, FastifyPluginOptions } from 'fastify';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import { query } from 'express';
dotenv.config();


const API_KEY = process.env.API_KEY; 


const options = {
  https: {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  },
};


const server = Fastify(options);

// Define the type for creating a consent
interface CreateConsentRequest {
    language: string;
  }
  
  // Define the schema for creating a consent
  const createConsentSchema = {
    type: 'object',
    required: ['language'],
    properties: {
      language: { type: 'string' },
    },
  };
  
  // Define the type for completing a consent
  interface CompleteConsentRequest {
    name: string;
    source_url: string;
    webhook?: string;
  }
  
  // Define the schema for completing a consent
  const completeConsentSchema = {
    type: 'object',
    required: ['name', 'source_url'],
    properties: {
      name: { type: 'string' },
      source_url: { type: 'string' },
      webhook: { type: 'string' },
    },
  };
  
  // Endpoint to create a consent
  export default async function consentprocess(server: FastifyInstance, options: FastifyPluginOptions) {

  server.post('/create-consent', {
    schema: {
      //body: createConsentSchema,
      querystring: createConsentSchema, 
    },
  }, async (request, reply) => {
    const { language } = request.query as CreateConsentRequest;
  
    try {
      const response = await axios.post(
        'https://api.d-id.com/consents',
        {
          language,
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
      console.error('Error creating consent:', error);
      reply.status(500).send( {rror: 'Failed to create consent'});
    }
  });
  
  // Endpoint to complete a consent
  server.post('/complete-consent/:id', {
    schema: {
      //body: completeConsentSchema,
      querystring: completeConsentSchema
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, source_url, webhook } = request.body as CompleteConsentRequest;
  
    try {
      const response = await axios.post(
        `https://api.d-id.com/consents/${id}`,
        {
          name,
          source_url,
          webhook,
        },
        {
          headers: {
            Authorization: `Basic ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('consent sucessfully:', response.data); //for testing purposes only
      return response.data;
    } catch (error) {
      server.log.error('Error completing consent:', error);
      reply.status(500).send({ error: 'Failed to complete consent' });
    }
  });
}
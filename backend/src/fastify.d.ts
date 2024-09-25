import { User } from 'jsonwebtoken'; // Assuming you will use the payload from JWT
import { FastifyRequest } from 'fastify'; // Import Fastify types

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; username: string }; // Add the user property with id and username
  }
}

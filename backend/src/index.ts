import dotenv from 'dotenv';
import Fastify from 'fastify';
import pool from './db';
import cors from '@fastify/cors';
import bcrypt from 'bcrypt'; // For hashing passwords
import jwt, { JwtPayload } from 'jsonwebtoken'; // For creating JWT tokens

dotenv.config()

const server = Fastify({ logger: true });

const JWT_SECRET = process.env.JWT_SECRET_KEY; // Replace with your secret key
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

server.register(cors, {
  origin: 'http://localhost:3000', // Allow requests from frontend
});

server.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const parsedBody = JSON.parse(body.toString()); // Convert Buffer to string if necessary
    done(null, parsedBody);
  } catch (err) {
    done(err as Error);
  }
});


// Route to get all articles
server.get('/articles', async (request, reply) => {
  try {
    const { rows } = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    return rows;
  } catch (err) {
    reply.status(500).send(err);
  }
});

// Route to retrieve a single article by its id
server.get('/articles/:id', async (request, reply) => {
  const { id } = request.params as { id: string }; // Get the article ID from the route parameter

  try {
    const { rows } = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    
    if (rows.length) {
      return rows[0]; // If the article is found, return it
    } else {
      reply.status(404).send({ message: 'Article not found' }); // If no article is found, return 404
    }
  } catch (err) {
    reply.status(500).send(err); // Handle any errors
  }
});

// PUT route to update an article by its id
server.put('/articles/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { title, content, author } = request.body as {
    title?: string;
    content?: string;
    author?: string;
  };

  try {
    const { rowCount } = await pool.query(
      `UPDATE articles SET 
        title = COALESCE($1, title), 
        content = COALESCE($2, content), 
        author = COALESCE($3, author), 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4`,
      [title, content, author, id]
    );

    if (rowCount) {
      reply.send({ message: 'Article updated successfully' });
    } else {
      reply.status(404).send({ message: 'Article not found' });
    }
  } catch (err) {
    reply.status(500).send(err);
  }
});

// Route to insert a new article
server.post('/articles', async (request, reply) => {
  const { title, content, author } = request.body as {
    title: string;
    content: string;
    author?: string;
  };

  try {
    const { rows } = await pool.query(
      'INSERT INTO articles (title, content, author) VALUES ($1, $2, $3) RETURNING *',
      [title, content, author || 'Anonymous']
    );
    reply.status(201).send(rows[0]); // Send back the newly created article
  } catch (err) {
    reply.status(500).send(err);
  }
});

// DELETE route to delete an article by its id
server.delete('/articles/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  try {
    const { rowCount } = await pool.query('DELETE FROM articles WHERE id = $1', [id]);
 
    if (rowCount) {
      reply.send({ message: 'Article deleted successfully' });
    } else {
      reply.status(404).send({ message: 'Article not found' });
    }
  } catch (err) {
    reply.status(500).send(err);
  }
});

// // Route to get articles only for the logged-in user
// server.get('/my-articles', async (request, reply) => {
//   // Ensure the user is authenticated
//   const user = request.user as { id: string; username: string };

//   if (!user) {
//     return reply.status(401).send({ message: 'Unauthorized' });
//   }

//   try {
//     const { rows } = await pool.query('SELECT * FROM articles WHERE author = $1 ORDER BY created_at DESC', [user.username]);
//     reply.send(rows);
//   } catch (err) {
//     reply.status(500).send(err);
//   }
// });


// ------------------- USER AUTHENTICATION ROUTES -------------------

// Route for user signup
server.post('/signup', async (request, reply) => {
  const { username, password } = request.body as { username: string; password: string };

  // Check if the user already exists
  const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (userExists.rows.length > 0) {
    return reply.status(400).send({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user into the database
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    reply.status(201).send({ message: 'User created successfully' });
  } catch (err) {
    reply.status(500).send(err);
  }
});

// Route for user login
server.post('/login', async (request, reply) => {
  const { username, password } = request.body as { username: string; password: string };

  // Find the user by username
  const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = userResult.rows[0];

  if (!user) {
    return reply.status(400).send({ message: 'Invalid username or password' });
  }

  // Compare the password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return reply.status(400).send({ message: 'Invalid username or password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

  // Send the token back to the client
  reply.send({ token });
});

// ------------------- AUTHENTICATION MIDDLEWARE -------------------

// // Middleware to protect routes
// server.addHook('onRequest', async (request, reply) => {
//   if (request.url.startsWith('/articles')) {
//     const authHeader = request.headers.authorization;

//     if (!authHeader) {
//       return reply.status(401).send({ message: 'Unauthorized' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//       const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; // Explicitly cast to JwtPayload

//       // Check if decoded token is an object with id and username
//       if (typeof decoded !== 'string' && decoded.id && decoded.username) {
//         request.user = {
//           id: decoded.id,
//           username: decoded.username,
//         };
//       } else {
//         return reply.status(401).send({ message: 'Invalid token payload' });
//       }
//     } catch (err) {
//       return reply.status(401).send({ message: 'Invalid token' });
//     }
//   }
// });

const start = async () => {
  try {
    await server.listen({ port: 4000 });
    console.log('Backend server is running on http://localhost:4000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();

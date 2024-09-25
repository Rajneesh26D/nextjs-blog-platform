'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createArticle } from '../../../api/articlesApi'; // API function to create article
import { Container, TextField, Button, Typography } from '@mui/material';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

interface DecodedToken {
  id: number;
  username: string;
}

const CreateArticlePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the JWT token
      const decoded: DecodedToken = jwtDecode(token);
      // Set the author to the username from the decoded token
      setAuthor(decoded.username);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArticle({ title, content, author });
      router.push('/'); // Redirect to My Articles after creation
    } catch (err) {
      console.error('Failed to create article', err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Article
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          required
        />
        <TextField
          label="Author"
          value={author}
          fullWidth
          margin="normal"
          disabled // Disable the author field since it should be auto-filled
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '20px' }}>
          Create Article
        </Button>
      </form>
    </Container>
  );
};

export default CreateArticlePage;

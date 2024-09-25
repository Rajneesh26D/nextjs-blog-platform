'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getArticleById, updateArticle } from '../../../../api/articlesApi';
import { Container, TextField, Button, Typography } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: number;
  username: string;
}

const EditArticlePage = () => {
  const { id } = useParams(); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const article = await getArticleById(Number(id));
        setTitle(article.title);
        setContent(article.content);

        // Get the token from localStorage and decode it
        const token = localStorage.getItem('token');
        if (token) {
          const decoded: DecodedToken = jwtDecode(token);
          setAuthor(decoded.username); // Autofill the author with the logged-in user's username
        }
      } catch (err) {
        console.error('Failed to load article', err);
      }
    };

    fetchArticle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateArticle(Number(id), { title, content, author });
      router.push('/');
    } catch (err) {
      console.error('Failed to update article', err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Article
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
          disabled 
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '20px' }}>
          Update Article
        </Button>
      </form>
    </Container>
  );
};

export default EditArticlePage;

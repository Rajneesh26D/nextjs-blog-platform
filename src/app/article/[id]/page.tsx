/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getArticleById } from '../../../api/articlesApi'; // Import the getArticleById API function
import { Container, Typography, Button, CircularProgress, Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode'; // To decode the JWT for user info

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

interface DecodedToken {
  id: number;
  username: string;
}

const ArticleDetailPage = ({ params }: { params: { id: string } }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null); // Logged-in user
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleById(Number(id)); // Fetch the article by ID
        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    // Check if the user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUser(decoded); // Set logged-in user info
    }

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ marginTop: '40px' }}>
      {article && (
        <>
          <Box
            sx={{
              backgroundColor: '#424242', 
              padding: '16px',
              marginBottom: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            {/* Centered Title */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#ffffff' }}>
              {article.title}
            </Typography>

            {/* Right-Aligned Author and Date */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end', 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                color: '#ffffff', 
              }}
            >
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                By {article.author}
              </Typography>
              <Typography variant="body2">
                {new Date(article.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {/* Content Box */}
          <Box
            sx={{
              backgroundColor: '#f5f5f5', 
              padding: '16px',
              borderRadius: '8px',
            }}
          >
            <Typography variant="body1" paragraph>
              {article.content}
            </Typography>
          </Box>

          {/* Show Edit button only if the logged-in user is the author */}
          {user && user.username === article.author && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/article/${article.id}/edit`)}
              sx={{
                marginTop: '20px',
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#115293',
                },
              }}
            >
              Edit Article
            </Button>
          )}
        </>
      )}
    </Container>
  );
};

export default ArticleDetailPage;

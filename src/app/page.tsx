'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getArticles, deleteArticle } from '../api/articlesApi'; // Add deleteArticle API
import { Container, Typography, Card, CardContent, Button, Box, CircularProgress, Divider } from '@mui/material';
import { jwtDecode } from 'jwt-decode'; // To decode JWT

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

const HomePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null); // To store logged-in user's info
  const router = useRouter();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getArticles(); // Fetch all articles
        setArticles(data);
      } catch (err) {
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    // Check if the user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      setUser(decoded); // Set the logged-in user's info
    }

    fetchArticles();
  }, []);

  const handleDelete = async (articleId: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(articleId);
        setArticles(articles.filter((article) => article.id !== articleId)); // Remove deleted article from UI
      } catch (err) {
        console.error('Failed to delete article', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token from localStorage
    setUser(null); // Reset user state
    router.push('/'); // Redirect to home page
  };

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
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ marginBottom: '16px' }}>
        <Typography variant="h4" component="h1">
          Blog Articles
        </Typography>

        {/* Display Login, Signup, or Logout buttons based on user login status */}
        {user ? (
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/auth/login')}
              sx={{ marginRight: '8px' }}
            >
              Login
            </Button>
            <Button variant="outlined" color="primary" onClick={() => router.push('/auth/signup')}>
              Signup
            </Button>
          </Box>
        )}
      </Box>

      {/* Show Create Article button if user is logged in */}
      {user && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/article/new')}
          sx={{ marginBottom: '16px' }}
        >
          Create New Article
        </Button>
      )}

      {articles.length > 0 ? (
        articles.map((article) => (
          <Card
            key={article.id}
            sx={{
              marginBottom: '16px',
              backgroundColor: '#f5f5f5', // Light grey background for cards
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Optional: Add subtle shadow for effect
              position: 'relative',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box onClick={() => router.push(`/article/${article.id}`)} sx={{ cursor: 'pointer' }}>
                  {/* Title with dark grey text */}
                  <Typography variant="h5" component="h2" sx={{ color: '#424242' }}>
                    {article.title}
                  </Typography>

                  {/* Author and Date */}
                  <Typography variant="body2" color="textSecondary">
                    {article.author} | {new Date(article.created_at).toLocaleDateString()}
                  </Typography>

                  {/* Divider between Author and Content */}
                  <Divider sx={{ margin: '8px 0' }} />

                  {/* Content */}
                  <Typography variant="body1">{article.content}</Typography>
                </Box>

                {/* Show Edit and Delete buttons only for the author's own articles */}
                {user && user.username === article.author && (
                  <Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => router.push(`/article/${article.id}/edit`)}
                      sx={{ marginRight: '8px' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No articles found.</Typography>
      )}
    </Container>
  );
};

export default HomePage;

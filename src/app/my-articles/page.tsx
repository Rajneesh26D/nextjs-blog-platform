'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyArticles } from '../../api/articlesApi'; // Make sure this API function exists
import { Container, Typography, Card, CardContent, CircularProgress, Button, Box } from '@mui/material';

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

const MyArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMyArticles = async () => {
      try {
        const data = await getMyArticles(); // Fetch only the logged-in user's articles
        setArticles(data);
      } catch (err) {
        setError('Failed to load your articles');
      } finally {
        setLoading(false);
      }
    };

    fetchMyArticles();
  }, []);

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
      <Typography variant="h4" component="h1" gutterBottom>
        My Articles
      </Typography>
      {articles.length > 0 ? (
        articles.map((article) => (
          <Card key={article.id} sx={{ marginBottom: '16px', position: 'relative' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box onClick={() => router.push(`/article/${article.id}`)} sx={{ cursor: 'pointer' }}>
                  <Typography variant="h5" component="h2">
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {article.author} | {new Date(article.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">{article.content}</Typography>
                </Box>
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

export default MyArticlesPage;

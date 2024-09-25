'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../api/articlesApi'; // Import the login function
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import Link from 'next/link'; // Import Link to navigate to signup page

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      localStorage.setItem('token', response.token); // Save token in localStorage
      router.push('/'); // Redirect to home page after login
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleLogin}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '20px' }}>
          Login
        </Button>
      </form>

      <Box sx={{ marginTop: '20px' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link href="/auth/signup">
            <Button sx={{ textTransform: 'none' }}>Sign Up</Button>
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;

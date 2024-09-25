'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '../../../api/articlesApi'; // Import the signup function
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import Link from 'next/link'; // Import Link to navigate to login page

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await signup({ username, password });
      if (response.message === 'User created successfully') {
        router.push('/auth/login'); // Redirect to login page after successful signup
      }
    } catch (err) {
      setError('Signup failed');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSignup}>
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
          Sign Up
        </Button>
      </form>

      <Box sx={{ marginTop: '20px' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link href="/auth/login">
            <Button sx={{ textTransform: 'none' }}>Login</Button>
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Signup;

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ bgcolor: 'primary.dark', color: 'white', pt: 6, pb: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              ShopEasy
            </Typography>
            <Typography variant="body2" paragraph>
              Your one-stop shop for all your shopping needs. Quality products at affordable prices with fast delivery.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/products" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Products
            </Link>
            <Link component={RouterLink} to="/cart" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Cart
            </Link>
            <Link component={RouterLink} to="/profile" color="inherit" sx={{ display: 'block', mb: 1 }}>
              My Account
            </Link>
            <Link component={RouterLink} to="/orders" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Order Tracking
            </Link>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1 }} />
              <Typography variant="body2">
                123 Shopping Street, Retail City, Country
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone sx={{ mr: 1 }} />
              <Typography variant="body2">
                +1 (555) 123-4567
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="body2">
                support@shopeasy.com
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Typography variant="body2" align="center" sx={{ pt: 2 }}>
          © {currentYear} ShopEasy. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

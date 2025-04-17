import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFeaturedProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Paper,
  useTheme,
  Skeleton,
  useMediaQuery
} from '@mui/material';

// Custom Components
import ProductCard from '../components/ProductCard';

// Carousel
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Hero banner image
const HeroBanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Paper 
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: '#fff',
        mb: 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url(https://source.unsplash.com/random?shopping)`,
        height: 400,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,.4)',
        }}
      />
      
      {/* Banner Content */}
      <Container maxWidth="lg">
        <Box sx={{ position: 'relative', p: { xs: 3, md: 6 } }}>
          <Typography component="h1" variant="h2" color="inherit" gutterBottom>
            Shop With Ease
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Discover amazing products at competitive prices with our secure shopping platform.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Shop Now
          </Button>
        </Box>
      </Container>
    </Paper>
  );
};

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { featuredProducts, loading } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);
  
  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  
  // Featured Product Skeletons for loading state
  const renderSkeletons = () => (
    Array(4).fill().map((_, index) => (
      <Box key={index} sx={{ padding: 1, height: '100%' }}>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ pt: 0.5 }}>
          <Skeleton />
          <Skeleton width="60%" />
          <Skeleton width="80%" />
        </Box>
      </Box>
    ))
  );

  return (
    <>
      <HeroBanner />
      
      
    </>
  );
};

export default HomePage;
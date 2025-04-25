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
  
  // Updated slider settings to ensure dots are always visible
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false, // Disable arrows if you only want dots
    dotsClass: 'slick-dots featured-dots', // Custom class for styling
    // Always show controls regardless of item count
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true
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
      
      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ my: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Featured Products
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/products')}
            >
              View All
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ position: 'relative' }} className="featured-products-slider">
            {loading ? (
              <Slider {...sliderSettings}>
                {renderSkeletons()}
              </Slider>
            ) : featuredProducts && featuredProducts.length > 0 ? (
              <Slider {...sliderSettings}>
                {featuredProducts.map(product => (
                  <Box key={product._id} sx={{ padding: 1, height: '100%' }}>
                    <ProductCard product={product} />
                  </Box>
                ))}
              </Slider>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No featured products available at this time.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
      
      {/* Explore Categories Section */}
      <Container maxWidth="lg" sx={{ my: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Explore Categories
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/products')}
            >
              Browse All
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {categories && categories.length > 0 ? (
              categories.slice(0, 4).map(category => (
                <Grid item xs={6} md={3} key={category._id}>
                  <Card 
                    sx={{ 
                      height: 200, 
                      cursor: 'pointer',
                      backgroundImage: `url(${category.image || 'https://source.unsplash.com/random/300x200?category'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    onClick={() => navigate(`/products?category=${category._id}`)}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      bgcolor: 'rgba(0,0,0,0.6)',
                      p: 2,
                      borderBottomLeftRadius: 'inherit',
                      borderBottomRightRadius: 'inherit'
                    }}>
                      <Typography variant="h6" component="div" color="white">
                        {category.name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Categories will appear here
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
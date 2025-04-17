import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Rating,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';

import {
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { products: wishlistItems } = useSelector(state => state.wishlist);
  
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Check if product is in wishlist
  useEffect(() => {
    if (wishlistItems && product) {
      const exists = wishlistItems.some(item => item._id === product._id);
      setIsInWishlist(exists);
    }
  }, [wishlistItems, product]);
  
  // Extract rating information correctly
  const getRatingInfo = (product) => {
    // Handle different API response formats for ratings
    if (!product) return { average: 0, count: 0 };
    
    let average = 0;
    let count = 0;
    
    if (product.ratings) {
      // Format: product.ratings = { average: 4.5, count: 10 }
      average = product.ratings.average || 0;
      count = product.ratings.count || 0;
    } else if (product.rating || product.rating === 0) {
      // Format: product.rating = 4.5, product.numReviews = 10
      average = product.rating;
      count = product.numReviews || product.reviewCount || 0;
    } else if (product.reviews && Array.isArray(product.reviews)) {
      // Format: product.reviews = [{rating: 5}, {rating: 4}]
      count = product.reviews.length;
      if (count > 0) {
        average = product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / count;
      }
    }
    
    return { average, count };
  };

  const { average: ratingAverage, count: ratingCount } = getRatingInfo(product);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Added to cart',
          severity: 'success'
        });
      })
      .catch(error => {
        setSnackbar({
          open: true,
          message: error || 'Failed to add to cart',
          severity: 'error'
        });
      });
  };
  
  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirect: '/products' } });
      return;
    }
    
    setLoading(true);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id))
        .unwrap()
        .then(() => {
          setSnackbar({
            open: true,
            message: 'Removed from wishlist',
            severity: 'success'
          });
          setIsInWishlist(false);
        })
        .catch(error => {
          setSnackbar({
            open: true,
            message: error || 'Failed to remove from wishlist',
            severity: 'error'
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      dispatch(addToWishlist(product._id))
        .unwrap()
        .then(() => {
          setSnackbar({
            open: true,
            message: 'Added to wishlist',
            severity: 'success'
          });
          setIsInWishlist(true);
        })
        .catch(error => {
          setSnackbar({
            open: true,
            message: error || 'Failed to add to wishlist',
            severity: 'error'
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  
  const handleProductClick = () => {
    navigate(`/products/${product._id}`);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Check if product is on sale
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const currentPrice = isOnSale ? product.salePrice : product.price;
  
  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      {/* Wishlist button */}
      <IconButton 
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          bgcolor: 'rgba(255,255,255,0.7)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.9)',
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleWishlist();
        }}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={20} color="primary" />
        ) : isInWishlist ? (
          <FavoriteIcon color="error" />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>
      
      {/* Product image */}
      <CardMedia
        component="img"
        height="200"
        image={product.images && product.images.length > 0 
          ? product.images[0] 
          : "https://via.placeholder.com/300"}
        alt={product.name}
        sx={{ 
          objectFit: 'contain', 
          p: 2,
          cursor: 'pointer'
        }}
        onClick={handleProductClick}
      />
      
      <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={handleProductClick}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.name}
        </Typography>
        
        {/* Rating display */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={ratingAverage} 
            precision={0.5} 
            readOnly 
            size="small"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            ({ratingCount})
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          {isOnSale ? (
            <>
              <Typography variant="h6" color="primary" component="span">
                ${product.salePrice.toFixed(2)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                component="span"
                sx={{ textDecoration: 'line-through', ml: 1 }}
              >
                ${product.price.toFixed(2)}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" color="primary">
              ${product.price.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button 
          variant="contained" 
          fullWidth 
          startIcon={<CartIcon />}
          disabled={product.stock <= 0}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardActions>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default ProductCard;

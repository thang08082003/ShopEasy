import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Skeleton,
  Chip,
  Rating,
  CardActions,
  Button,
  IconButton
} from '@mui/material';
import { 
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';

const ProductCard = ({ product, loading = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist);
  const wishlistItems = wishlist?.items || [];
  const { isAuthenticated } = useSelector(state => state.auth);

  // More robust check if product is in wishlist
  const isInWishlist = React.useMemo(() => {
    if (!Array.isArray(wishlistItems) || !product?._id) return false;
    return wishlistItems.some(item => {
      // Handle both cases - when item is full object or just has _id
      const itemId = typeof item === 'object' ? item._id : item;
      return itemId === product._id;
    });
  }, [wishlistItems, product]);

  // Wishlist toggle handler
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Show login prompt or redirect to login
      navigate('/login', { state: { redirect: `/products?sort=-createdAt` } });
      return;
    }

    console.log("Toggling wishlist for product:", product._id);
    console.log("Current wishlist status:", isInWishlist);
    
    // Add optimistic UI update for better user experience
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id))
        .unwrap()
        .then(() => console.log("Product removed from wishlist"))
        .catch(error => console.error("Error removing from wishlist:", error));
    } else {
      dispatch(addToWishlist(product))
        .unwrap()
        .then(() => console.log("Product added to wishlist"))
        .catch(error => console.error("Error adding to wishlist:", error));
    }
  };

  // If in loading state, show skeleton UI
  if (loading) {
    return (
      <Card className="product-card-hover" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton width="80%" height={24} />
          <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
          <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  // Handle missing product data
  if (!product) return null;
  
  const { _id, name, price, salePrice, images, ratings } = product;
  const isOnSale = salePrice > 0 && salePrice < price;

  return (
    <Card 
      className="product-card-hover" 
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardActionArea onClick={() => navigate(`/products/${_id}`)}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={images?.[0] || "https://via.placeholder.com/200"}
            alt={name}
            sx={{ objectFit: 'contain' }}
          />
          {isOnSale && (
            <Chip
              label={`${Math.round(((price - salePrice) / price) * 100)}% OFF`}
              color="secondary"
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating 
              value={ratings?.average || 0} 
              precision={0.5} 
              size="small" 
              readOnly 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({ratings?.count || 0})
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isOnSale ? (
              <>
                <Typography 
                  variant="h6" 
                  color="primary" 
                  sx={{ fontWeight: 'bold', mr: 1 }}
                >
                  ${salePrice.toFixed(2)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ textDecoration: 'line-through' }}
                >
                  ${price.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                ${price.toFixed(2)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
        >
          Add to Cart
        </Button>
        <IconButton 
          color={isInWishlist ? "error" : "default"}
          onClick={handleWishlistToggle}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          size="small"
        >
          {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ProductCard;

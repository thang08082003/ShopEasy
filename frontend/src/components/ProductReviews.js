import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import productAPI from '../api/productAPI';  // Import productAPI

// MUI components
import {
  Box,
  Typography,
  Rating,
  Button,
  Divider,
  Card,
  CardContent,
  TextField,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Alert,
  CircularProgress
} from '@mui/material';

// MUI Icons
import { Person as PersonIcon } from '@mui/icons-material';

// Formik and Yup for form handling and validation
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Review validation schema
const reviewSchema = Yup.object({
  rating: Yup.number()
    .min(1, 'Please provide a rating')
    .required('Rating is required'),
  comment: Yup.string()
    .min(5, 'Comment must be at least 5 characters')
    .required('Comment is required')
});

const ProductReviews = ({ productId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewNotification, setReviewNotification] = useState(null);
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Fetch reviews using productAPI
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        console.log('No productId provided to fetch reviews');
        return;
      }
      
      try {
        setLoading(true);
        const response = await productAPI.getProductReviews(productId);
        
        setReviews(response.reviews || []);
        setTotalPages(Math.ceil((response.reviews?.length || 0) / 5));
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err.message);
        setError(`Failed to load reviews: ${err.message}`);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, page]);
  
  // Check if the user has already reviewed this product
  useEffect(() => {
    const checkUserReview = async () => {
      if (!isAuthenticated || !productId) {
        return;
      }
      
      try {
        const userReviewData = await productAPI.getUserReview(productId);
        setUserReview(userReviewData);
      } catch (err) {
        console.log('No existing user review found');
        setUserReview(null);
      }
    };
    
    checkUserReview();
  }, [productId, isAuthenticated, user]);
  
  // Form handling with optimized submission
  const formik = useFormik({
    initialValues: {
      rating: userReview?.rating || 0,
      comment: userReview?.comment || ''
    },
    enableReinitialize: true,
    validationSchema: reviewSchema,
    onSubmit: async (values) => {
      if (!isAuthenticated) {
        navigate('/login', { state: { redirect: `/products/${productId}` } });
        return;
      }
      
      if (!productId) {
        setError('Missing product ID, cannot submit review');
        return;
      }
      
      setSubmitLoading(true);
      try {
        const reviewData = {
          rating: values.rating,
          comment: values.comment,
          productId
        };
        
        let result;
        if (userReview && userReview._id) {
          console.log('Updating existing review with ID:', userReview._id);
          result = await productAPI.updateReview(productId, userReview._id, reviewData);
        } else {
          console.log('Creating new review');
          result = await productAPI.createReview(productId, reviewData);
        }
        
        setUserReview(result);
        await refreshReviews();
        
        setDialogOpen(false);
        setPage(1);
        setError(null);
      } catch (err) {
        console.error('Review submission error:', err);
        if (err.response?.status === 400 && err.response?.data?.message?.includes('already reviewed')) {
          // If user already has a review, try to find it and update instead
          try {
            const existingReview = await productAPI.getUserReview(productId);
            if (existingReview && existingReview._id) {
              const reviewData = { rating: values.rating, comment: values.comment };
              const result = await productAPI.updateReview(productId, existingReview._id, reviewData);
              setUserReview(result);
              await refreshReviews();
              setDialogOpen(false);
              return;
            }
          } catch (findErr) {
            console.error('Failed to find existing review:', findErr);
          }
        }
        
        if (err.statusCode === 401 || err.response?.status === 401) {
          setError('You must be logged in to submit a review.');
          setTimeout(() => {
            navigate('/login', { state: { redirect: `/products/${productId}` } });
          }, 2000);
        } else {
          setError(`Failed to submit review: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        }
      } finally {
        setSubmitLoading(false);
      }
    }
  });

  // Simplified refreshReviews function
  const refreshReviews = async () => {
    try {
      const response = await productAPI.getProductReviews(productId);
      setReviews(response.reviews || []);
      setTotalPages(Math.ceil((response.reviews?.length || 0) / 5));
    } catch (err) {
      console.error('Error refreshing reviews:', err.message);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Handle review dialog open
  const handleOpenReviewDialog = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirect: `/products/${productId}` } });
      return;
    }
    
    // Show notification when user already has a review
    if (userReview) {
      setReviewNotification("You've already reviewed this product. You can edit your existing review below.");
    } else {
      setReviewNotification(null);
    }
    
    setDialogOpen(true);
    if (userReview) {
      formik.setValues({
        rating: userReview.rating || 0,
        comment: userReview.comment || ''
      });
    } else {
      formik.setValues({
        rating: 0,
        comment: ''
      });
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Review Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 4 }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating value={averageRating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            
            <Box sx={{ flexGrow: 1 }}>
              {reviews.length > 0 ? (
                <Typography variant="body1" gutterBottom>
                  This product has {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}.
                </Typography>
              ) : (
                <Typography variant="body1" gutterBottom>
                  Be the first to share your thoughts!
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            fullWidth
            onClick={handleOpenReviewDialog}
          >
            Review This Product
          </Button>
        </CardContent>
      </Card>
      
      {/* Reviews List */}
      <Typography variant="h6" gutterBottom>
        Customer Reviews ({reviews.length})
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            This product has no reviews yet. Be the first to review it!
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={2} sx={{ mb: 3 }}>
            {reviews.map((review, index) => {
              // Calculate dynamic styling based on database values
              const isUserReview = user && review.user && user._id === review.user._id;
              const ratingLevel = review.rating >= 4 ? 'high' : review.rating >= 2 ? 'medium' : 'low';
              
              // Dynamic styles based on review data
              const cardStyle = {
                borderLeft: isUserReview ? '4px solid #1976d2' : 'none',
                backgroundColor: isUserReview ? 'rgba(25, 118, 210, 0.05)' : 'inherit'
              };
              
              // Rating color based on score
              const ratingColor = {
                high: 'success.main',
                medium: 'warning.main',
                low: 'error.main'
              }[ratingLevel];
              
              return (
                <Card 
                  key={review._id || `review-${index}`} 
                  variant="outlined"
                  sx={cardStyle}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: isUserReview ? 'primary.main' : 'grey.400' }}>
                          {review.user?.name?.charAt(0) || <PersonIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {review.user?.name || 'Anonymous User'}
                            {isUserReview && (
                              <Typography 
                                component="span"
                                variant="caption"
                                sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}
                              >
                                You
                              </Typography>
                            )}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating 
                              value={review.rating || 0} 
                              readOnly 
                              size="small"
                              sx={{ 
                                '& .MuiRating-iconFilled': {
                                  color: ratingColor
                                }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1,
                        fontStyle: review.comment?.length > 100 ? 'normal' : 'italic',
                        fontWeight: review.rating >= 4 ? 500 : 400
                      }}
                    >
                      {review.comment || 'No comment provided'}
                    </Typography>
                    
                    {/* Action buttons for user's own review */}
                    {user && review.user && user._id === review.user._id && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          size="small" 
                          onClick={() => {
                            // Set userReview to this specific review before opening dialog
                            setUserReview(review);
                            setDialogOpen(true);
                          }}
                          variant="outlined"
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(e, value) => setPage(value)} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
      
      {/* Review Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {userReview ? 'Edit Your Review' : 'Write a Review'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            {reviewNotification && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {reviewNotification}
              </Alert>
            )}
            
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography component="legend" gutterBottom>
                Your Rating*
              </Typography>
              <Rating
                name="rating"
                size="large"
                value={formik.values.rating}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rating', newValue);
                }}
              />
              {formik.touched.rating && formik.errors.rating && (
                <Typography color="error" variant="caption">
                  {formik.errors.rating}
                </Typography>
              )}
            </Box>
            
            <TextField
              fullWidth
              id="comment"
              name="comment"
              label="Your Review*"
              multiline
              rows={4}
              value={formik.values.comment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.comment && Boolean(formik.errors.comment)}
              helperText={formik.touched.comment && formik.errors.comment}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitLoading}
            >
              {submitLoading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductReviews;

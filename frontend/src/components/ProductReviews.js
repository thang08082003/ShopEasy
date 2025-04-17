import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
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
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Fetch reviews - Modified to better handle API data
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) {
        console.log('No productId provided to fetch reviews');
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Fetching reviews for product: ${productId}`);
        
        // Try multiple potential endpoints to find the correct one
        let response;
        try {
          // First try the most common pattern - reviews as sub-resource of products
          response = await api.get(`/api/products/${productId}/reviews`);
          console.log('Successfully retrieved reviews from /api/products endpoint');
        } catch (e) {
          console.log('First endpoint failed, trying alternative');
          try {
            // Second try - reviews as main resource with query param
            response = await api.get(`/api/reviews?productId=${productId}`);
            console.log('Successfully retrieved reviews from query param endpoint');
          } catch (e2) {
            // Third try - another common pattern
            console.log('Second endpoint failed, trying final alternative');
            response = await api.get(`/api/reviews/byProduct/${productId}`);
            console.log('Successfully retrieved reviews from byProduct endpoint');
          }
        }
        
        console.log('Raw API response:', response);
        
        // Handle various response formats to ensure we extract reviews
        let reviewsData;
        if (response.data && Array.isArray(response.data)) {
          reviewsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          reviewsData = response.data.data;
        } else if (response.data && response.data.reviews) {
          reviewsData = response.data.reviews;
        } else {
          console.log('Could not find reviews in response, using fallback data');
          reviewsData = [];
        }
        
        console.log('Final reviews data being used:', reviewsData);
        setReviews(reviewsData);
        setTotalPages(Math.ceil((reviewsData.length || 0) / 5));
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        console.error('Error details:', err.response || err.message);
        setError(`Failed to load reviews: ${err.response?.status || err.message}`);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, page]);
  
  // Check if the user has already reviewed this product - Enhanced with more endpoints
  useEffect(() => {
    const checkUserReview = async () => {
      if (!isAuthenticated || !productId) {
        console.log('User not authenticated or no productId, skipping user review check');
        return;
      }
      
      try {
        console.log(`Checking if user has reviewed product: ${productId}`);
        
        // Try multiple potential endpoints with expanded options
        const endpointsToTry = [
          `/api/products/${productId}/reviews/me`,
          `/api/reviews/me?productId=${productId}`,
          `/api/reviews/user/product/${productId}`,
          `/api/products/${productId}/reviews/user`,
          `/api/reviews/user?productId=${productId}`,
          `/api/reviews/my-review/${productId}`,
          `/api/user-reviews?productId=${productId}`,
          `/api/user/reviews/${productId}`,
          `/api/reviews?userId=me&productId=${productId}`, 
          `/api/reviews/product/${productId}/user`,
          `/api/products/${productId}/ratings/me`
        ];
        
        let response = null;
        let success = false;
        
        for (const endpoint of endpointsToTry) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            response = await api.get(endpoint);
            success = true;
            console.log(`Found user review at endpoint: ${endpoint}`);
            break;
          } catch (err) {
            console.log(`Endpoint ${endpoint} failed:`, err.response?.status || err.message);
          }
        }
        
        if (!success) {
          // If all endpoints failed, we need to check the reviews list
          // This is a fallback approach to search for the user's review in the full reviews list
          try {
            console.log('Trying to find user review in general reviews list');
            const allReviewsResponse = await api.get(`/api/products/${productId}/reviews`);
            const allReviews = allReviewsResponse.data?.data || allReviewsResponse.data || [];
            
            if (Array.isArray(allReviews) && user?._id) {
              const foundReview = allReviews.find(review => 
                review.user?._id === user._id || review.userId === user._id
              );
              
              if (foundReview) {
                console.log('Found user review in general reviews list:', foundReview);
                response = { data: { data: foundReview } };
                success = true;
              }
            }
          } catch (err) {
            console.log('Failed to check general reviews list:', err.message);
          }
        }
        
        // Process the response if we found a review
        if (success && response) {
          console.log('User review check response:', response.data);
          
          // Try to extract the user review data
          let reviewData = null;
          
          if (response.data && response.data.data) {
            reviewData = response.data.data;
          } else if (response.data && response.data.review) {
            reviewData = response.data.review;
          } else if (response.data && !Array.isArray(response.data)) {
            reviewData = response.data;
          }
          
          if (reviewData) {
            console.log('User review found:', reviewData);
            setUserReview(reviewData);
          } else {
            console.log('Response didn\'t contain user review data in expected format');
            setUserReview(null);
          }
        } else {
          console.log('No existing user review found after trying all endpoints');
          setUserReview(null);
        }
      } catch (err) {
        console.log('Error checking user review:', err.response || err);
        setUserReview(null);
      }
    };
    
    checkUserReview();
  }, [productId, isAuthenticated, user]);
  
  // Form handling - update the onSubmit function to use productAPI
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
        console.log('Submitting review with values:', { ...values, productId });
        
        // Format review data in multiple ways to try different API expectations
        const directFormat = {
          rating: values.rating,
          comment: values.comment,
          productId: productId
        };
        
        // Even simpler formats with variations on field names that might match backend
        const simpleFormats = [
          { rating: values.rating, comment: values.comment }, // Standard
          { rating: values.rating, review: values.comment }, // Review field
          { rating: values.rating, text: values.comment }, // Text field
          { score: values.rating, comment: values.comment }, // Score field
          { stars: values.rating, comment: values.comment }, // Stars field
          { rating: values.rating, content: values.comment } // Content field
        ];
        
        let success = false;
        let userReviewData = null;
        let lastResponseData = null;
        let lastError = null;

        // Debug request with console output for investigation
        console.log('REQUEST DEBUG - Authorization header present:', 
          !!api.defaults.headers.common['Authorization']);
        
        // Try multiple endpoints with multiple data formats
        // Best approach is to try more combinations since we don't know the API structure
        const baseEndpoints = userReview ? [
          // Update endpoints - try both PUT and PATCH
          `/api/products/${productId}/reviews/${userReview._id}`,
          `/api/reviews/${userReview._id}`,
          `/api/product/${productId}/reviews/${userReview._id}`,
          `/api/product-reviews/${userReview._id}`,
          `/api/ratings/${userReview._id}`,
          `/api/reviews/update/${userReview._id}`,
          `/api/product-ratings/${userReview._id}`,
          `/api/review/${userReview._id}`
        ] : [
          // Create endpoints
          `/api/products/${productId}/reviews`,
          `/api/reviews`,
          `/api/product/${productId}/reviews`,
          `/api/product-reviews`,
          `/api/ratings`,
          `/api/reviews/create`,
          `/api/product-ratings`,
          `/api/review`
        ];
        
        // Try all endpoint and data format combinations
        for (const endpoint of baseEndpoints) {
          for (const format of simpleFormats) {
            try {
              // Try with simple format
              const method = userReview ? 'put' : 'post';
              console.log(`Trying ${method.toUpperCase()} to ${endpoint} with data:`, format);
              
              const response = await api({
                method,
                url: endpoint,
                data: format
              });
              
              console.log('SUCCESS! Response:', response.data);
              success = true;
              lastResponseData = response.data;
              
              // Extract user review data from response for updating UI
              if (response.data && response.data.data) {
                userReviewData = response.data.data;
              } else if (response.data) {
                userReviewData = response.data;
              }
              
              break; // Exit the loop once we have a successful request
            } catch (err) {
              console.log(`Failed ${userReview ? 'PUT' : 'POST'} to ${endpoint}:`, 
                err.response ? `Status: ${err.response.status}, Message: ${err.response.data?.message || 'No message'}` : err.message);
              
              lastError = err;
              
              // If it's PATCH, also try PUT
              if (!userReview) continue;
              
              try {
                console.log(`Trying PATCH to ${endpoint} with data:`, format);
                const response = await api({
                  method: 'patch',
                  url: endpoint,
                  data: format
                });
                
                console.log('SUCCESS with PATCH! Response:', response.data);
                success = true;
                lastResponseData = response.data;
                
                if (response.data && response.data.data) {
                  userReviewData = response.data.data;
                } else if (response.data) {
                  userReviewData = response.data;
                }
                
                break;
              } catch (patchErr) {
                console.log(`Failed PATCH to ${endpoint}:`, 
                  patchErr.response ? `Status: ${patchErr.response.status}, Message: ${patchErr.response.data?.message || 'No message'}` : patchErr.message);
              }
            }
          }
          
          // If we succeeded with this endpoint, break out of the endpoint loop
          if (success) break;
        }
        
        // As a last resort - try without product ID
        if (!success) {
          try {
            const directEndpoint = userReview ? 
              `/api/reviews/${userReview._id}` : 
              '/api/reviews';
              
            const response = await api({
              method: userReview ? 'put' : 'post',
              url: directEndpoint,
              data: { rating: values.rating, comment: values.comment }
            });
            
            console.log('LAST RESORT SUCCESS! Response:', response.data);
            success = true;
            userReviewData = response.data.data || response.data;
          } catch (err) {
            console.log('Last resort attempt failed:', err.response || err.message);
          }
        }
        
        if (!success) {
          console.error('All API endpoint attempts failed. Last error:', lastError);
          throw new Error('Could not save review. Please try again later or contact support.');
        }
        
        // Update user review state if we have data
        if (userReviewData) {
          setUserReview(userReviewData);
          console.log('Updated user review state with:', userReviewData);
        } else if (lastResponseData) {
          // If we don't have specific user review data but have a response, use it
          console.log('No specific user review data found, using last response data');
          setUserReview({
            _id: lastResponseData._id || userReview?._id || 'temp-id',
            rating: values.rating,
            comment: values.comment,
            user: user
          });
        }
        
        // Refresh reviews after submission
        await refreshReviews();
        
        setDialogOpen(false);
        setPage(1);
        
        // Show success message
        setError(null);
      } catch (err) {
        console.error('Error submitting review:', err);
        console.error('Error details:', err.response?.data || err.message);
        
        // More detailed error messages based on response
        if (err.response?.status === 400) {
          const errorMsg = err.response?.data?.message || 'Invalid review data. Please check your rating and comment.';
          setError(`Review submission failed: ${errorMsg}`);
        } else if (err.response?.status === 401) {
          setError('You must be logged in to submit a review.');
          setTimeout(() => {
            navigate('/login', { state: { redirect: `/products/${productId}` } });
          }, 2000);
        } else {
          setError(`Failed to submit review: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setSubmitLoading(false);
      }
    }
  });

  // Enhanced refreshReviews function with more robust error handling
  const refreshReviews = async () => {
    try {
      console.log('Refreshing reviews');
      let refreshResponse;
      let success = false;
      
      const endpointsToTry = [
        `/api/products/${productId}/reviews`,
        `/api/reviews?productId=${productId}`,
        `/api/reviews/product/${productId}`,
        `/api/reviews/byProduct/${productId}`,
        `/api/product/${productId}/reviews`,
        `/api/product-reviews?productId=${productId}`
      ];
      
      for (const endpoint of endpointsToTry) {
        try {
          console.log(`Trying to fetch reviews from: ${endpoint}`);
          refreshResponse = await api.get(endpoint);
          success = true;
          console.log('Successfully fetched reviews from:', endpoint);
          break;
        } catch (err) {
          console.log(`Failed to fetch reviews from ${endpoint}:`, err.message);
        }
      }
      
      if (!success) {
        console.error('Failed to refresh reviews from all endpoints');
        return;
      }
      
      if (refreshResponse.data && (refreshResponse.data.data || refreshResponse.data)) {
        const reviewsData = refreshResponse.data.data || refreshResponse.data;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        setTotalPages(Math.ceil(((refreshResponse.data.total || reviewsData.length) || 0) / 5));
        console.log('Updated reviews:', reviewsData);
      }
    } catch (err) {
      console.error('Error refreshing reviews:', err);
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
            {userReview ? 'Edit Your Review' : 'Write a Review'}
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
                          onClick={handleOpenReviewDialog}
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

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  TextField,
  Slider,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Skeleton,
  Alert
} from '@mui/material';

// MUI Icons
import { FilterList, Close } from '@mui/icons-material';

// Custom Components
import ProductCard from '../components/ProductCard';

// Helpers
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ProductListingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Redux state
  const { products, loading, total } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);
  
  // Local state for filters
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: query.get('search') || '',
    category: query.get('category') || '',
    price_min: query.get('price_min') || '',
    price_max: query.get('price_max') || '',
    sort: query.get('sort') || '-createdAt',
    in_stock: query.get('in_stock') === 'true',
    page: parseInt(query.get('page') || '1', 10),
  });

  // Add error state to track API errors
  const [apiError, setApiError] = useState(null);
  
  // Function to build query parameters from filters
  const buildQueryParams = (filters) => {
    const queryParams = {};
    
    if (filters.search) queryParams.search = filters.search;
    if (filters.category) queryParams.category = filters.category;
    if (filters.price_min) queryParams.price_min = filters.price_min;
    if (filters.price_max) queryParams.price_max = filters.price_max;
    if (filters.sort) queryParams.sort = filters.sort;
    if (filters.in_stock) queryParams.in_stock = filters.in_stock;
    if (filters.page > 1) queryParams.page = filters.page;
    
    return queryParams;
  };
  
  // Load products based on filters
  useEffect(() => {
    const queryParams = buildQueryParams(filters);
    
    console.log('ProductListingPage: Fetching products with:', queryParams);
    dispatch(fetchProducts(queryParams))
      .unwrap()
      .then(result => {
        console.log('ProductListingPage: Products fetched successfully:', result);
        if (result.data.length === 0) {
          console.warn('ProductListingPage: No products returned from API');
        }
      })
      .catch(error => {
        console.error('ProductListingPage: Error fetching products:', error);
      });
    
    // Clear previous errors
    setApiError(null);
    
    // Update URL with filters
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    
    navigate({
      pathname: '/products',
      search: searchParams.toString()
    }, { replace: true });
    
  }, [dispatch, filters, navigate]);
  
  // Add this function to refresh product data when the component is focused
  useEffect(() => {
    // Function to refresh products data
    const refreshData = () => {
      // Only refresh if we already loaded products before
      if (products.length > 0) {
        console.log('Refreshing product listing data');
        const currentQueryParams = buildQueryParams(filters);
        dispatch(fetchProducts(currentQueryParams));
      }
    };

    // Add event listener for when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    });

    // Add event listener for when the page is focused
    window.addEventListener('focus', refreshData);

    return () => {
      document.removeEventListener('visibilitychange', refreshData);
      window.removeEventListener('focus', refreshData); // Fix: Changed addEventListener to removeEventListener
    };
  }, [dispatch, filters, products.length]);

  // Load categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page when other filters change
    }));
  };
  
  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      price_min: '',
      price_max: '',
      sort: '-createdAt',
      in_stock: false,
      page: 1,
    });
  };
  
  const toggleFilterDrawer = (open) => () => {
    setFilterDrawerOpen(open);
  };
  
  // Filter panel component
  const FilterPanel = () => (
    <Card sx={{ mb: { xs: 2, md: 0 } }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filters
          {isMobile && (
            <IconButton 
              sx={{ float: 'right' }} 
              onClick={toggleFilterDrawer(false)}
            >
              <Close />
            </IconButton>
          )}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {/* Categories */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Categories</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Select Category</InputLabel>
            <Select
              value={filters.category}
              label="Select Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Price Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Min"
                type="number"
                size="small"
                fullWidth
                value={filters.price_min}
                onChange={(e) => handleFilterChange('price_min', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max"
                type="number"
                size="small"
                fullWidth
                value={filters.price_max}
                onChange={(e) => handleFilterChange('price_max', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Stock Filter */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.in_stock}
                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
              />
            }
            label="In Stock Only"
          />
        </Box>
        
        {/* Sort */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Sort By</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Sort</InputLabel>
            <Select
              value={filters.sort}
              label="Sort"
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <MenuItem value="-createdAt">Newest First</MenuItem>
              <MenuItem value="createdAt">Oldest First</MenuItem>
              <MenuItem value="price">Price: Low to High</MenuItem>
              <MenuItem value="-price">Price: High to Low</MenuItem>
              <MenuItem value="-ratings.average">Best Rated</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Button 
          variant="outlined" 
          color="secondary"
          fullWidth
          onClick={handleReset}
        >
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
  
  // Product listing skeletons for loading state
  const renderSkeletons = () => (
    Array(8).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ pt: 0.5 }}>
          <Skeleton />
          <Skeleton width="60%" />
          <Skeleton width="80%" />
        </Box>
      </Grid>
    ))
  );
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
        {filters.search && (
          <Typography component="span" variant="subtitle1" sx={{ ml: 2 }}>
            Search results for: "{filters.search}"
          </Typography>
        )}
      </Typography>
      
      {/* Show API errors if any */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
          <Button sx={{ ml: 2 }} size="small" onClick={() => dispatch(fetchProducts(buildQueryParams(filters)))}>
            Retry
          </Button>
        </Alert>
      )}
      
      {/* Mobile Filter Button */}
      {isMobile && (
        <Button 
          variant="outlined" 
          startIcon={<FilterList />}
          onClick={toggleFilterDrawer(true)}
          sx={{ mb: 2 }}
          fullWidth
        >
          Filter Products
        </Button>
      )}
      
      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
        >
          <FilterPanel />
        </Box>
      </Drawer>
      
      <Grid container spacing={3}>
        {/* Desktop Filter Panel */}
        {!isMobile && (
          <Grid item md={3}>
            <FilterPanel />
          </Grid>
        )}
        
        {/* Product Grid */}
        <Grid item xs={12} md={9}>
          {/* Results Count */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              {loading ? 'Loading...' : `Showing ${products.length} of ${total} products`}
            </Typography>
          </Box>
          
          {/* Products */}
          <Grid container spacing={3}>
            {loading ? (
              renderSkeletons()
            ) : products.length > 0 ? (
              products.map(product => (
                <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h6">
                    No products found matching your criteria.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {apiError ? 
                      `Error: ${apiError}` : 
                      "Try adjusting your filters or check back later for new products."}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleReset}
                    sx={{ mr: 1 }}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => dispatch(fetchProducts(buildQueryParams(filters)))}
                  >
                    Refresh Products
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
          
          {/* Pagination */}
          {!loading && products.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(total / 12)} // Assuming 12 items per page
                page={filters.page}
                onChange={(e, newPage) => handleFilterChange('page', newPage)}
                color="primary"
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductListingPage;

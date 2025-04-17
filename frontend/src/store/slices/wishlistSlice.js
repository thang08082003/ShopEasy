import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistAPI from '../../api/wishlistAPI';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) return { products: [] };
      
      const response = await wishlistAPI.getWishlist();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('Please log in to add items to wishlist');
      }
      
      const response = await wishlistAPI.addToWishlist(productId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      return { productId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove from wishlist');
    }
  }
);

export const updateWishlist = createAsyncThunk(
  'wishlist/updateWishlist',
  async (productIds, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.updateWishlist(productIds);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update wishlist');
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // If the API returns updated wishlist data
        if (action.payload.data && action.payload.data.products) {
          state.products = action.payload.data.products;
        } else {
          // Otherwise filter out the removed product
          state.products = state.products.filter(
            product => product._id !== action.payload.productId
          );
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update wishlist
      .addCase(updateWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
      })
      .addCase(updateWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearWishlistError } = wishlistSlice.actions;

export default wishlistSlice.reducer;

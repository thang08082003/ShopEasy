import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Get all coupons
export const getCoupons = createAsyncThunk(
  'adminCoupons/getCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/coupons');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get single coupon
export const getCouponDetails = createAsyncThunk(
  'adminCoupons/getCouponDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/coupons/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create new coupon
export const createCoupon = createAsyncThunk(
  'adminCoupons/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/coupons', couponData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update coupon
export const updateCoupon = createAsyncThunk(
  'adminCoupons/updateCoupon',
  async ({ id, couponData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/coupons/${id}`, couponData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete coupon
export const deleteCoupon = createAsyncThunk(
  'adminCoupons/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/coupons/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Make sure the initialState has the correct structure
const initialState = {
  coupons: [],
  coupon: null,
  loading: false,
  error: null,
  success: false,
};

const adminCouponSlice = createSlice({
  name: 'adminCoupons',
  initialState,
  reducers: {
    resetCouponState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearCouponDetails: (state) => {
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all coupons
      .addCase(getCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data;
      })
      .addCase(getCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get coupon details
      .addCase(getCouponDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCouponDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload.data;
      })
      .addCase(getCouponDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coupons.push(action.payload.data);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coupon = action.payload.data;
        state.coupons = state.coupons.map(coupon => 
          coupon._id === action.payload.data._id ? action.payload.data : coupon
        );
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter(coupon => coupon._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCouponState, clearCouponDetails } = adminCouponSlice.actions;
export default adminCouponSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import adminCouponReducer from './slices/adminCouponSlice';

const store = configureStore({
  reducer: {
    adminCoupons: adminCouponReducer,
  },
});

export default store;
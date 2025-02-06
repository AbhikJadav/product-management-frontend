import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const initialState = {
  data: {
    totalProducts: 0,
    activeProducts: 0,
    totalValue: 0,
    categoryPrices: [],
    priceRanges: [],
    productsWithoutMedia: []
  },
  loading: false,
  error: null
};

export const fetchStatistics = createAsyncThunk(
  'statistics/fetchStatistics',
  async () => {
    const response = await axios.get(API_ENDPOINTS.statistics);
    return response.data;
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default statisticsSlice.reducer;

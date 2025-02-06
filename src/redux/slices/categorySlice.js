import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { message } from 'antd';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = 'http://localhost:5000/api';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await axios.get(API_ENDPOINTS.categories);
    return response.data;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryName) => {
    const hideLoading = message.loading('Adding new category...', 0);
    try {
      const response = await axios.post(API_ENDPOINTS.categories, {
        category_name: categoryName.trim(),
      });
      hideLoading();
      message.success('Category added successfully');
      return response.data;
    } catch (error) {
      hideLoading();
      message.error(error.response?.data?.message || 'Failed to add category');
      throw error;
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default categorySlice.reducer;

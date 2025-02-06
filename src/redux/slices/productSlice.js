import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { message } from 'antd';

const API_URL = 'http://localhost:5000/api';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ current, pageSize, filters = {} }) => {
    const queryParams = new URLSearchParams({
      page: current || 1,
      limit: pageSize || 10,
      ...filters,
    });
    const response = await axios.get(`${API_URL}/products?${queryParams}`);
    return response.data;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData) => {
    const hideLoading = message.loading('Creating product...', 0);
    try {
      const response = await axios.post(`${API_URL}/products`, productData);
      hideLoading();
      message.success('Product created successfully');
      return response.data;
    } catch (error) {
      hideLoading();
      message.error(error.response?.data?.message || 'Failed to create product');
      throw error;
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }) => {
    const hideLoading = message.loading('Updating product...', 0);
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, productData);
      hideLoading();
      message.success('Product updated successfully');
      return response.data;
    } catch (error) {
      hideLoading();
      message.error(error.response?.data?.message || 'Failed to update product');
      throw error;
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id) => {
    const hideLoading = message.loading('Deleting product...', 0);
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      hideLoading();
      message.success('Product deleted successfully');
      return id;
    } catch (error) {
      hideLoading();
      message.error(error.response?.data?.message || 'Failed to delete product');
      throw error;
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    totalProducts: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      });
  },
});

export default productSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { message } from 'antd';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = 'http://localhost:5000/api';

export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async () => {
    const response = await axios.get(API_ENDPOINTS.materials);
    return response.data;
  }
);

export const createMaterial = createAsyncThunk(
  'materials/createMaterial',
  async (materialName) => {
    const hideLoading = message.loading('Adding new material...', 0);
    try {
      const response = await axios.post(API_ENDPOINTS.materials, {
        material_name: materialName.trim(),
      });
      hideLoading();
      message.success('Material added successfully');
      return response.data;
    } catch (error) {
      hideLoading();
      message.error(error.response?.data?.message || 'Failed to add material');
      throw error;
    }
  }
);

const materialSlice = createSlice({
  name: 'materials',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default materialSlice.reducer;

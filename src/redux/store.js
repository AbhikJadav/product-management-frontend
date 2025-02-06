import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productSlice';
import categoriesReducer from './slices/categorySlice';
import materialsReducer from './slices/materialSlice';
import statisticsReducer from './slices/statisticsSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    materials: materialsReducer,
    statistics: statisticsReducer
  }
});

export default store;

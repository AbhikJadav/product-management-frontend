import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@material-ui/core';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function ProductForm({ product, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    SKU: '',
    product_name: '',
    category_id: '',
    material_ids: [],
    price: '',
    status: 'active'
  });

  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    // Fetch categories and materials when component mounts
    const fetchData = async () => {
      try {
        const [categoriesRes, materialsRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/materials`)
        ]);
        setCategories(categoriesRes.data);
        setMaterials(materialsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        SKU: product.SKU || '',
        product_name: product.product_name || '',
        category_id: product.category_id?._id || '',
        material_ids: product.material_ids?.map(m => m._id) || [],
        price: product.price || '',
        status: product.status || 'active'
      });
    }
  }, [product]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="SKU"
            name="SKU"
            value={formData.SKU}
            onChange={handleChange}
            disabled={product}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Materials</InputLabel>
            <Select
              multiple
              name="material_ids"
              value={formData.material_ids}
              onChange={handleChange}
              renderValue={(selected) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selected.map((value) => {
                    const material = materials.find(m => m._id === value);
                    return (
                      <Chip 
                        key={value} 
                        label={material ? material.material_name : value} 
                      />
                    );
                  })}
                </div>
              )}
            >
              {materials.map((material) => (
                <MenuItem key={material._id} value={material._id}>
                  {material.material_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginRight: 8 }}
          >
            {product ? 'Update' : 'Create'}
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default ProductForm;

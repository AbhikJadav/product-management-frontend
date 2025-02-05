import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography
} from '@material-ui/core';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import axios from 'axios';
import ProductForm from './components/ProductForm';
import Statistics from './components/Statistics';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    SKU: '',
    product_name: '',
    category_id: '',
    material_ids: '',
    status: ''
  });

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });

      const response = await axios.get(`${API_URL}/products?${queryParams}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setOpenDialog(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSubmit = async (productData) => {
    try {
      if (selectedProduct) {
        delete productData.SKU;
        await axios.put(`${API_URL}/products/${selectedProduct._id}`, productData);
      } else {
        await axios.post(`${API_URL}/products`, productData);
      }
      setOpenDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.error || 'Error saving product');
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Statistics />
        </Grid>
        
        <Grid item xs={12}>
          <Paper style={{ padding: '1rem' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                >
                  Add Product
                </Button>
              </Grid>
              <Grid item xs>
                <TextField
                  name="SKU"
                  label="SKU"
                  value={filters.SKU}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="product_name"
                  label="Product Name"
                  value={filters.product_name}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="category_id"
                  label="Category"
                  value={filters.category_id}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="status"
                  label="Status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  size="small"
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </TextField>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Materials</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.SKU}</TableCell>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>{product.category_id?.category_name}</TableCell>
                      <TableCell>
                        {product.material_ids?.map(m => m.material_name).join(', ')}
                      </TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.status}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEdit(product)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(product._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalPages * rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent>
          <ProductForm
            product={selectedProduct}
            onSubmit={handleSubmit}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default App;

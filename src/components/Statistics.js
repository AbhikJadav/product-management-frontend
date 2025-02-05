import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Statistics() {
  const [stats, setStats] = useState({
    categoryHighestPrice: [],
    priceRangeCount: {},
    productsWithNoMedia: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/statistics`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStats();
  }, []);

  const priceRangeData = Object.entries(stats.priceRangeCount).map(([range, data]) => ({
    range,
    count: data[0]?.count || 0
  }));

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper style={{ padding: '1rem', height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Category-wise Highest Price
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Highest Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.categoryHighestPrice.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.category[0]?.category_name}</TableCell>
                    <TableCell align="right">₹{item.highestPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper style={{ padding: '1rem', height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Price Range Distribution
          </Typography>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={priceRangeData}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper style={{ padding: '1rem', height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Products with No Media ({stats.productsWithNoMedia.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>SKU</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.productsWithNoMedia.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.SKU}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Statistics;

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Spin
} from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';

const { Title } = Typography;
const API_URL = 'http://localhost:5000/api';

function Statistics({ refreshTrigger }) {
  const [stats, setStats] = useState({
    categoryHighestPrice: [],
    priceRangeCount: {},
    productsWithNoMedia: []
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products/statistics`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]); // Refresh when trigger changes

  const priceRangeData = Object.entries(stats.priceRangeCount)
    .map(([range, countArray]) => ({
      range: `$${range}`,
      count: countArray[0]?.count || 0
    }))
    .sort((a, b) => {
      if (a.range.includes('+')) return 1;
      if (b.range.includes('+')) return -1;
      return parseInt(a.range.split('-')[0].substring(1)) - parseInt(b.range.split('-')[0].substring(1));
    });

  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: ['category', '0', 'category_name'],
      key: 'category'
    },
    {
      title: 'Highest Price',
      dataIndex: 'highestPrice',
      key: 'price',
      render: (price) => `₹${(price).toFixed(2)}`
    }
  ];

  const noMediaColumns = [
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price.toFixed(2)}`
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}><strong>Price Range:</strong> {label}</p>
          <p style={{ margin: 0 }}><strong>Number of Products:</strong> {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Category-wise Highest Price</Title>
            <Table
              dataSource={stats.categoryHighestPrice}
              columns={categoryColumns}
              pagination={false}
              size="small"
              rowKey={(record) => record.category[0]._id}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Products by Price Range</Title>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={priceRangeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5}>Products Without Media</Title>
            <Table
              dataSource={stats.productsWithNoMedia}
              columns={noMediaColumns}
              pagination={false}
              size="small"
              rowKey="_id"
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}

export default Statistics;

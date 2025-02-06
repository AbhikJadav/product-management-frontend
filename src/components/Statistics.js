import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Statistic, Table, Empty, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShoppingOutlined, DollarOutlined, TagOutlined } from '@ant-design/icons';
import { fetchStatistics } from '../redux/slices/statisticsSlice';

const Statistics = () => {
  const dispatch = useDispatch();
  const { data: stats, loading, error } = useSelector((state) => state.statistics);

  useEffect(() => {
    dispatch(fetchStatistics());
  }, [dispatch]);

  if (error) {
    return (
      <Card>
        <Empty
          description={
            <span style={{ color: 'red' }}>
              Error loading statistics: {error}
            </span>
          }
        />
      </Card>
    );
  }
console.log(stats,"stats");
  // Prepare data for price range chart
  const priceRangeData = [
    { name: '₹0-500', count: stats.priceRangeCount?.['0-500']?.[0]?.count || 0 },
    { name: '₹501-1000', count: stats.priceRangeCount?.['501-1000']?.[0]?.count || 0 },
    { name: '₹1000+', count: stats.priceRangeCount?.['1000+']?.[0]?.count || 0 }
  ];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Price Range: {label}</p>
          <p style={{ margin: 0 }}>Number of Products: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Category price analysis table columns
  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category)
    },
    {
      title: 'Highest Price',
      dataIndex: 'highestPrice',
      key: 'highestPrice',
      render: value => `₹${parseFloat(value).toFixed(2)}`,
      sorter: (a, b) => a.highestPrice - b.highestPrice,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Product Count',
      dataIndex: 'productCount',
      key: 'productCount',
      sorter: (a, b) => a.productCount - b.productCount
    }
  ];

  // Products without media table columns
  const mediaColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      sorter: (a, b) => a.sku.localeCompare(b.sku)
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category)
    }
  ];

  // Prepare products without media data
  const productsWithNoMediaData = stats.productsWithNoMedia?.map(product => ({
    key: product._id,
    sku: product.SKU,
    name: product.product_name,
    category: product.category_id?.category_name || 'N/A'
  })) || [];

  // Prepare category price data
  const categoryPriceData = stats.categoryHighestPrice?.map(cat => ({
    key: cat._id,
    category: cat.category?.[0]?.category_name || 'N/A',
    highestPrice: cat.highestPrice || 0,
    productCount: cat.productCount || 0
  })).sort((a, b) => b.highestPrice - a.highestPrice) || [];

  return (
    <Spin spinning={loading}>
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Products"
                value={stats.totalProducts || 0}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Active Products"
                value={stats.activeProducts || 0}
                prefix={<TagOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Value"
                value={stats.totalValue || 0}
                precision={2}
                prefix={<DollarOutlined />}
                formatter={value => `₹${value}`}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card title="Product Price Range Distribution">
              {priceRangeData.some(item => item.count > 0) ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={priceRangeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="count" fill="#1890ff" name="Number of Products" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty description="No price range data available" />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card title="Category-wise Price Analysis">
              <Table 
                columns={categoryColumns}
                dataSource={categoryPriceData}
                pagination={false}
                locale={{ emptyText: 'No category data available' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card title="Products Without Media">
              <Table 
                columns={mediaColumns}
                dataSource={productsWithNoMediaData}
                pagination={{ 
                  pageSize: 5,
                  showTotal: (total) => `Total ${total} items`
                }}
                locale={{ emptyText: 'No products without media' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Statistics;

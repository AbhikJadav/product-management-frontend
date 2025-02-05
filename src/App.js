import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Input,
  Button,
  Modal,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Form,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import ProductForm from "./components/ProductForm";
import Statistics from "./components/Statistics";

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const API_URL = "http://localhost:5000/api";

function App() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    SKU: "",
    product_name: "",
    category_id: "",
    material_ids: "",
    status: "",
  });

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: params.current || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        ...filters,
      });

      const response = await axios.get(`${API_URL}/products?${queryParams}`);
      setProducts(response.data.products);
      setPagination({
        ...pagination,
        total: response.data.totalProducts,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, refreshTrigger]);

  const handleTableChange = (newPagination) => {
    fetchProducts({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleDelete = async (product) => {
    const hideLoading = message.loading('Deleting product...', 0);
    try {
      const response = await axios.delete(`${API_URL}/products/${product._id}`);
      hideLoading();
      if (response.status === 200) {
        message.success({
          content: 'Product deleted successfully',
          duration: 3
        });
        refreshData();
      }
    } catch (error) {
      hideLoading();
      message.error({
        content: error.response?.data?.message || 'Failed to delete product',
        duration: 3
      });
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setOpenModal(true);
  };

  const handleSubmit = async (values) => {
    const hideLoading = message.loading(
      selectedProduct ? 'Updating product...' : 'Creating product...',
      0
    );
    try {
      let response;
      if (selectedProduct) {
        response = await axios.put(`${API_URL}/products/${selectedProduct._id}`, values);
      } else {
        response = await axios.post(`${API_URL}/products`, values);
      }

      hideLoading();
      if (response.status === 200 || response.status === 201) {
        message.success({
          content: selectedProduct 
            ? 'Product updated successfully'
            : 'Product created successfully',
          duration: 3
        });
        setOpenModal(false);
        refreshData();
      }
    } catch (error) {
      hideLoading();
      message.error({
        content: error.response?.data?.message || 
          (selectedProduct ? 'Failed to update product' : 'Failed to create product'),
        duration: 3
      });
      console.error("Error submitting product:", error);
    }
  };

  const columns = [
    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search SKU"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => {
              confirm();
              setFilters((prev) => ({ ...prev, SKU: selectedKeys[0] }));
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Product Name"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => {
              confirm();
              setFilters((prev) => ({
                ...prev,
                product_name: selectedKeys[0],
              }));
            }}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category_id", "category_name"],
      key: "category",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${(price).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Media",
      dataIndex: "media_url",
      key: "media_url",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View Media
          </a>
        ) : (
          "No Media"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: "24px" }}>
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <Statistics refreshTrigger={refreshTrigger} />
          </Col>
          <Col span={24}>
            <Card>
              <Space
                style={{
                  marginBottom: 16,
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Title level={4}>Products</Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Add Product
                </Button>
              </Space>

              <Table
                columns={columns}
                dataSource={products}
                rowKey="_id"
                pagination={pagination}
                onChange={handleTableChange}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          title={selectedProduct ? "Edit Product" : "Add Product"}
          open={openModal}
          onCancel={() => {
            setOpenModal(false);
            setSelectedProduct(null);
          }}
          footer={null}
          width={800}
          destroyOnClose={true}
        >
          <ProductForm
            product={selectedProduct}
            onSubmit={handleSubmit}
            onCancel={() => {
              setOpenModal(false);
              setSelectedProduct(null);
            }}
          />
        </Modal>
      </Content>
    </Layout>
  );
}

export default App;

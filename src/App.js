import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Table,
  Button,
  Modal,
  Space,
  Typography,
  Card,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ProductForm from "./components/ProductForm";
import Statistics from "./components/Statistics";
import { fetchProducts, deleteProduct } from './redux/slices/productSlice';
import { fetchStatistics } from './redux/slices/statisticsSlice';
import './styles/antd-overrides.css';

const { Content } = Layout;
const { Title } = Typography;

function App() {
  const dispatch = useDispatch();
  const { items: products, totalProducts, loading } = useSelector(state => state.products);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const refreshData = async () => {
    await Promise.all([
      dispatch(fetchProducts({ ...pagination })),
      dispatch(fetchStatistics())
    ]);
  };

  useEffect(() => {
    refreshData();
  }, [dispatch, pagination]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleDelete = async (product) => {
    try {
      await dispatch(deleteProduct(product._id)).unwrap();
      await refreshData();
    } catch (error) {
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

  const columns = [
    {
      title: "SKU",
      dataIndex: "SKU",
      key: "SKU",
      sorter: true,
      fixed: 'left',
      width: 120,
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      sorter: true,
      fixed: 'left',
      width: 200,
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: ["category_id", "category_name"],
      key: "category",
      sorter: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: "Materials",
      dataIndex: "material_ids",
      key: "materials",
      width: 200,
      ellipsis: true,
      render: (materials) =>
        materials?.map((m) => m.material_name).join(", ") || "N/A",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: true,
      width: 120,
      render: (price) => `₹${price.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      width: 100,
    },
    {
      title: "Media URL",
      dataIndex: "media_url",
      key: "media_url",
      width: 120,
      ellipsis: true,
      render: (url) => url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Media
        </a>
      ) : (
        <span style={{ color: '#999' }}>No media</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px" }}>
      <Content>
        <Card style={{ marginBottom: "20px" }}>
          <Statistics />
        </Card>

        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3}>Products</Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Add Product
              </Button>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={products}
            rowKey="_id"
            pagination={{
              ...pagination,
              total: totalProducts,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} items`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            loading={loading}
            scroll={{ x: 1200 }}
            sticky
          />

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
            keyboard={false}
            maskClosable={false}
            centered
            className="product-modal"
            bodyStyle={{ padding: 0 }}
          >
            <ProductForm
              product={selectedProduct}
              productsData={products}
              onSubmit={async () => {
                setOpenModal(false);
                await refreshData();
              }}
              onCancel={() => {
                setOpenModal(false);
                setSelectedProduct(null);
              }}
            />
          </Modal>
        </Card>
      </Content>
    </Layout>
  );
}

export default App;

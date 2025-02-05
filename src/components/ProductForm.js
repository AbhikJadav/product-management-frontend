import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  message,
  Divider,
  Card,
  Row,
  Col,
  Typography
} from 'antd';
import { PlusOutlined, SaveOutlined, CloseOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const API_URL = 'http://localhost:5000/api';

function ProductForm({ product, onSubmit, onCancel }) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [validating, setValidating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      message.error({
        content: 'Failed to load categories',
        duration: 3
      });
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API_URL}/materials`);
      if (response.status === 200) {
        setMaterials(response.data);
      }
    } catch (error) {
      message.error({
        content: 'Failed to load materials',
        duration: 3
      });
      console.error('Error fetching materials:', error);
    }
  };

  useEffect(() => {
    message.loading('Loading form data...', 0.5);
    fetchCategories();
    fetchMaterials();

    // Set form values if product is provided (edit mode)
    if (product) {
      const categoryId = product.category_id?.category_id || product.category_id;
      const materialIds = product.material_ids?.map(m => m.material_id || m) || [];
      
      form.setFieldsValue({
        SKU: product.SKU,
        product_name: product.product_name,
        category_id: categoryId,
        material_ids: materialIds,
        price: product.price,
        status: product.status,
        media_url: product.media_url
      });
      message.success('Product loaded successfully');
    }
  }, [product, form]);

  const validateSKU = async (_, value) => {
    if (!value || (product && product.SKU === value)) {
      return Promise.resolve();
    }

    setValidating(true);
    try {
      const response = await axios.get(`${API_URL}/products`);
      const products = response.data;
      const exists = products.some(p => p.SKU === value);
      
      if (exists) {
        setValidating(false);
        message.warning('SKU already exists');
        return Promise.reject('SKU already exists!');
      }
      
      setValidating(false);
      return Promise.resolve();
    } catch (error) {
      setValidating(false);
      message.error('Error validating SKU');
      return Promise.reject('Error validating SKU');
    }
  };

  const handleSubmit = async (values) => {
    const loadingMessage = message.loading({
      content: product ? 'Updating product...' : 'Creating product...',
      duration: 0,
    });

    try {
      const formData = {
        ...values,
        category_id: values.category_id.toString(),
        material_ids: values.material_ids.map(id => id.toString())
      };
      console.log("Submitting form data:", formData);
      await onSubmit(formData);
      loadingMessage();
      message.success({
        content: product ? 'Product updated successfully!' : 'Product created successfully!',
        duration: 3,
      });
      form.resetFields();
    } catch (error) {
      loadingMessage();
      message.error({
        content: product ? 'Failed to update product' : 'Failed to create product',
        duration: 3,
      });
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    onCancel();
    form.resetFields();
    message.info('Form cancelled');
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) {
      message.error({
        content: 'Please enter a category name',
        duration: 3
      });
      return;
    }

    const hideLoading = message.loading({
      content: 'Adding new category...',
      duration: 0
    });

    try {
      const response = await axios.post(`${API_URL}/categories`, {
        category_name: newCategoryName.trim()
      });
      
      hideLoading();
      if (response.status === 200 || response.status === 201) {
        message.success({
          content: 'Category added successfully',
          duration: 3
        });
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (error) {
      hideLoading();
      message.error({
        content: error.response?.data?.message || 'Failed to add category',
        duration: 3
      });
      console.error('Error adding category:', error);
    }
  };

  const addNewMaterial = async () => {
    if (!newMaterialName.trim()) {
      message.error({
        content: 'Please enter a material name',
        duration: 3
      });
      return;
    }

    const hideLoading = message.loading({
      content: 'Adding new material...',
      duration: 0
    });

    try {
      const response = await axios.post(`${API_URL}/materials`, {
        material_name: newMaterialName.trim()
      });
      
      hideLoading();
      if (response.status === 200 || response.status === 201) {
        message.success({
          content: 'Material added successfully',
          duration: 3
        });
        setNewMaterialName('');
        fetchMaterials();
      }
    } catch (error) {
      hideLoading();
      message.error({
        content: error.response?.data?.message || 'Failed to add material',
        duration: 3
      });
      console.error('Error adding material:', error);
    }
  };

  return (
    <Card 
      bordered={false} 
      className="product-form-card"
      style={{ 
        maxWidth: 1000, 
        margin: '0 auto',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Title level={2} style={{ marginBottom: '24px', textAlign: 'center' }}>
        {product ? 'Edit Product' : 'Create New Product'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          SKU: '',
          product_name: '',
          category_id: '',
          material_ids: [],
          price: '',
          status: 'active',
          media_url: ''
        }}
        style={{ padding: '20px' }}
      >
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="SKU"
              label="SKU"
              rules={[
                { required: true, message: 'Please input SKU!' },
                // { validator: validateSKU }
              ]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Input 
                disabled={!!product}
                placeholder="Enter SKU"
                style={{ borderRadius: '6px' }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="product_name"
              label="Product Name"
              rules={[{ required: true, message: 'Please input product name!' }]}
            >
              <Input 
                placeholder="Enter product name"
                style={{ borderRadius: '6px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: 'Please select category!' }]}
            >
              <Select
                showSearch
                placeholder="Select a category"
                optionFilterProp="children"
                style={{ borderRadius: '6px' }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Space style={{ padding: '0 8px 4px' }}>
                      <Input
                        placeholder="Enter new category"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        style={{ borderRadius: '6px' }}
                      />
                      <Button 
                        type="primary"
                        icon={<PlusOutlined />} 
                        onClick={addNewCategory}
                        style={{ borderRadius: '6px' }}
                      >
                        Add
                      </Button>
                    </Space>
                  </>
                )}
              >
                {categories.map((category) => (
                  <Select.Option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="material_ids"
              label="Materials"
              rules={[{ required: true, message: 'Please select at least one material!' }]}
            >
              <Select
                mode="multiple"
                showSearch
                placeholder="Select materials"
                optionFilterProp="children"
                allowClear
                style={{ borderRadius: '6px' }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Space style={{ padding: '0 8px 4px' }}>
                      <Input
                        placeholder="Enter new material"
                        value={newMaterialName}
                        onChange={(e) => setNewMaterialName(e.target.value)}
                        style={{ borderRadius: '6px' }}
                      />
                      <Button 
                        type="primary"
                        icon={<PlusOutlined />} 
                        onClick={addNewMaterial}
                        style={{ borderRadius: '6px' }}
                      >
                        Add
                      </Button>
                    </Space>
                  </>
                )}
              >
                {materials.map((material) => (
                  <Select.Option key={material.material_id} value={material.material_id}>
                    {material.material_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please input price!' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%', borderRadius: '6px' }}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select style={{ borderRadius: '6px' }}>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="media_url"
          label="Media URL"
        >
          <Input 
            placeholder="Enter media URL"
            style={{ borderRadius: '6px' }}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: '32px', textAlign: 'right' }}>
          <Space size="middle">
            <Button 
              onClick={handleClose}
              icon={<CloseOutlined />}
              style={{ 
                borderRadius: '6px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              style={{ 
                borderRadius: '6px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              {product ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default ProductForm;

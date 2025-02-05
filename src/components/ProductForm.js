import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  message
} from 'antd';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function ProductForm({ product, onSubmit, onCancel }) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    // Fetch categories
    axios.get(`${API_URL}/categories`)
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));

    // Fetch materials
    axios.get(`${API_URL}/materials`)
      .then(response => setMaterials(response.data))
      .catch(error => console.error('Error fetching materials:', error));

    // Set form values if product is provided (edit mode)
    if (product) {
      form.setFieldsValue({
        SKU: product.SKU,
        product_name: product.product_name,
        category_id: product.category_id._id, // Use the _id from the category object
        material_ids: product.material_ids.map(m => m._id), // Map material objects to their _ids
        price: product.price,
        status: product.status
      });
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
        return Promise.reject('SKU already exists!');
      }
      
      setValidating(false);
      return Promise.resolve();
    } catch (error) {
      setValidating(false);
      return Promise.reject('Error validating SKU');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      // Only reset form after successful submission
      form.resetFields();
    } catch (error) {
      message.error('Error submitting form');
    }
  };
  const handleClose=() => {
    onCancel();
    form.resetFields();
  }

  return (
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
        status: 'active'
      }}
    >
      <Form.Item
        name="SKU"
        label="SKU"
        rules={[
          { required: true, message: 'Please input SKU!' },
          { validator: validateSKU }
        ]}
        validateTrigger={['onChange', 'onBlur']}
      >
        <Input disabled={!!product} />
      </Form.Item>

      <Form.Item
        name="product_name"
        label="Product Name"
        rules={[{ required: true, message: 'Please input product name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="category_id"
        label="Category"
        rules={[{ required: true, message: 'Please select category!' }]}
      >
        <Select>
          {categories.map((category) => (
            <Select.Option key={category._id} value={category._id}>
              {category.category_name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="material_ids"
        label="Materials"
        rules={[{ required: true, message: 'Please select at least one material!' }]}
      >
        <Select mode="multiple">
          {materials.map((material) => (
            <Select.Option key={material._id} value={material._id}>
              {material.material_name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: 'Please input price!' }]}
      >
        <InputNumber
          min={0}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select status!' }]}
      >
        <Select>
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={validating}>
            {product ? 'Update' : 'Create'} Product
          </Button>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default ProductForm;

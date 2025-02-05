import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  message,
  Divider
} from 'antd';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';

const API_URL = 'http://localhost:5000/api';

function ProductForm({ product, onSubmit, onCancel }) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [validating, setValidating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');

  const fetchCategories = () => {
    axios.get(`${API_URL}/categories`)
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  };

  const fetchMaterials = () => {
    axios.get(`${API_URL}/materials`)
      .then(response => setMaterials(response.data))
      .catch(error => console.error('Error fetching materials:', error));
  };
console.log(product);
  useEffect(() => {
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
      const formData = {
        ...values,
        category_id: values.category_id.toString(),
        material_ids: values.material_ids.map(id => id.toString())
      };
      console.log("Submitting form data:", formData);
      await onSubmit(formData);
      form.resetFields();
    } catch (error) {
      message.error('Error submitting form');
    }
  };

  const handleClose = () => {
    onCancel();
    form.resetFields();
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) {
      message.error('Please enter a category name');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/categories`, {
        category_name: newCategoryName.trim()
      });
      
      if (response.data) {
        message.success('Category added successfully');
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (error) {
      message.error('Failed to add category');
      console.error('Error adding category:', error);
    }
  };

  const addNewMaterial = async () => {
    if (!newMaterialName.trim()) {
      message.error('Please enter a material name');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/materials`, {
        material_name: newMaterialName.trim()
      });
      
      if (response.data) {
        message.success('Material added successfully');
        setNewMaterialName('');
        fetchMaterials();
      }
    } catch (error) {
      message.error('Failed to add material');
      console.error('Error adding material:', error);
    }
  };

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
        status: 'active',
        media_url: ''
      }}
    >
      <Form.Item
        name="SKU"
        label="SKU"
        rules={[
          { required: true, message: 'Please input SKU!' },
          // { validator: validateSKU }
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
        <Select
          showSearch
          placeholder="Select a category"
          optionFilterProp="children"
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <Space style={{ padding: '0 8px 4px' }}>
                <Input
                  placeholder="Enter new category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button type="text" icon={<PlusOutlined />} onClick={addNewCategory}>
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
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <Space style={{ padding: '0 8px 4px' }}>
                <Input
                  placeholder="Enter new material"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                />
                <Button type="text" icon={<PlusOutlined />} onClick={addNewMaterial}>
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

      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: 'Please input price!' }]}
      >
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/₹\s?|(,*)/g, '')}
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

      <Form.Item
        name="media_url"
        label="Media URL"
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {product ? 'Update' : 'Create'}
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

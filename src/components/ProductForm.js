import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  InputNumber,
  Space,
  message,
  Divider,
  Typography
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { createProduct, updateProduct } from "../redux/slices/productSlice";
import { fetchCategories, createCategory } from "../redux/slices/categorySlice";
import { fetchMaterials, createMaterial } from "../redux/slices/materialSlice";
import "./ProductForm.css";

const { Option } = Select;
const { Title } = Typography;

const ProductForm = ({ product, productsData, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [skuError, setSkuError] = useState("");

  const categories = useSelector((state) => state.categories.items);
  const materials = useSelector((state) => state.materials.items);
  const categoriesLoading = useSelector((state) => state.categories.loading);
  const materialsLoading = useSelector((state) => state.materials.loading);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        ...product,
        category_id: product.category_id?.category_id,
        material_ids: product.material_ids?.map((m) => m._id || m),
        media_url: product.media_url,
      });
    }
  }, [product, form]);

  const handleSkuChange = (e) => {
    const sku = e.target.value;
    if (!sku) {
      setSkuError("");
      return;
    }

    const existingProduct = productsData?.find(
      p => p.SKU === sku && p._id !== (product?._id)
    );
    if (existingProduct) {
      setSkuError("This SKU already exists");
    } else {
      setSkuError("");
    }
  };

  const handleFinish = async (values) => {
    if (skuError) {
      message.error("Please fix the SKU error before submitting");
      return;
    }
    try {
      const formData = {
        ...values,
        material_ids: values.material_ids?.map(String) || [],
        price: Number(values.price || 0),
      };

      if (product) {
        await dispatch(updateProduct({ id: product._id, productData: formData })).unwrap();
      } else {
        await dispatch(createProduct(formData)).unwrap();
      }
      onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error("Failed to save product. Please try again.");
    }
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await dispatch(createCategory(newCategoryName)).unwrap();
      setNewCategoryName("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const addNewMaterial = async () => {
    if (!newMaterialName.trim()) return;
    try {
      await dispatch(createMaterial(newMaterialName)).unwrap();
      setNewMaterialName("");
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  return (
    <div className="product-form-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: "active",
        }}
        className="product-form"
      >
        <div className="form-section">
          <Title level={5}>Basic Information</Title>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="SKU"
                label="SKU"
                validateStatus={skuError ? 'error' : ''}
                help={skuError}
                rules={[{ required: true, message: "Please enter SKU" }]}
              >
                <Input 
                  placeholder="Enter SKU" 
                  onChange={handleSkuChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="product_name"
                label="Product Name"
                rules={[{ required: true, message: "Please enter product name" }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="form-section">
          <Title level={5}>Classification</Title>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category_id"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select
                  loading={categoriesLoading}
                  placeholder="Select category"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div className="add-new-section">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="New category name"
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={addNewCategory}
                        >
                          Add Category
                        </Button>
                      </div>
                    </>
                  )}
                >
                  {categories.map((category) => (
                    <Option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="material_ids"
                label="Materials"
                rules={[{ required: true, message: "Please select materials" }]}
              >
                <Select
                  mode="multiple"
                  loading={materialsLoading}
                  placeholder="Select materials"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div className="add-new-section">
                        <Input
                          value={newMaterialName}
                          onChange={(e) => setNewMaterialName(e.target.value)}
                          placeholder="New material name"
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={addNewMaterial}
                        >
                          Add Material
                        </Button>
                      </div>
                    </>
                  )}
                >
                  {materials.map((material) => (
                    <Option key={material.material_id} value={material.material_id}>
                      {material.material_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="form-section">
          <Title level={5}>Product Details</Title>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter price"
                  min={0}
                  step={0.01}
                  precision={2}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="media_url"
                label="Media URL"
                rules={[
                  {
                    type: "url",
                    message: "Please enter a valid URL",
                  },
                ]}
              >
                <Input placeholder="Enter media URL" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="form-actions">
          <Space>
            <Button type="primary" htmlType="submit" disabled={!!skuError}>
              {product ? "Update Product" : "Create Product"}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default ProductForm;

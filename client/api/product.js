// src/api/product.js

export async function addProduct(productData, token) {
  
  const response = await fetch("http://localhost:5050/api/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Only token, no Content-Type for FormData
    },
    body: data,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to add product");
  }
  return productData;
}



  export async function getMyProducts(token) {
    const response = await fetch('http://localhost:5050/api/products/my-products', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    return data.products; // array of products
  }


  export async function deleteProduct(productId, token) {
    const response = await fetch(`http://localhost:5050/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete product');
    }
    return data; // usually { message: "Product deleted successfully" }
  }

export async function updateProduct(productId, updatedData, token) {
    const response = await fetch(`http://localhost:5050/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update product');
    }
    return data; // updated product object
  }

// Product image utilities
export const getProductImage = (productName, productType) => {
  const name = productName.toLowerCase();
  const type = productType.toLowerCase();

  // Specific product images
  if (name.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1546470427-e9e826f9e5dc?q=80&w=1000&auto=format&fit=crop';
  }
  if (name.includes('banana')) {
    return 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?q=80&w=1000&auto=format&fit=crop';
  }
  if (name.includes('potato')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1000&auto=format&fit=crop';
  }
  if (name.includes('carrot')) {
    return 'https://images.unsplash.com/photo-1582515073490-39981397c445?q=80&w=1000&auto=format&fit=crop';
  }
  if (name.includes('spinach')) {
    return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=1000&auto=format&fit=crop';
  }
  if (name.includes('apple')) {
    return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=1000&auto=format&fit=crop';
  }
  if (name.includes('mango')) {
    return 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1000&auto=format&fit=crop';
  }

  // Category-based images
  if (type === 'vegetable' || type === 'vegetables') {
    return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=1000&auto=format&fit=crop';
  }
  if (type === 'fruit' || type === 'fruits') {
    return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop';
  }

  // Default fallback
  return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2042&auto=format&fit=crop';
};

// Convert file to base64 for upload
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
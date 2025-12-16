// Ảnh minh họa mặc định (Mercedes-Benz C-Class)
export const DEFAULT_PRODUCT_IMG = "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg";
export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = DEFAULT_PRODUCT_IMG;
};
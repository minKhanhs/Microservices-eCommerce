package com.product.product_service.Service;

import com.product.product_service.Model.Category;
import com.product.product_service.Model.Product;
import com.product.product_service.Repo.CategoryRepo;
import com.product.product_service.Repo.ProductRepo;
import com.product.product_service.dto.CategoryDTO;
import com.product.product_service.dto.ProductRequest;
import com.product.product_service.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepo productRepo;
    private final CategoryRepo categoryRepo;

    // 1. Tạo Danh Mục
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        Category category = Category.builder().name(categoryDTO.getName()).build();
        categoryRepo.save(category);
        categoryDTO.setId(category.getId());
        return categoryDTO;
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepo.findAll().stream()
                .map(c -> new CategoryDTO(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    // 2. Tạo Sản Phẩm
    @Transactional
    public void createProduct(ProductRequest request) {
        List<Category> categories = categoryRepo.findAllById(request.getCategoryIds());

        if (categories.isEmpty()) {
            throw new RuntimeException("Không tìm thấy danh mục nào hợp lệ");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .categories(categories) // Gán List<Category> vào đây
                .build();

        productRepo.save(product);
    }

    // 3. Lấy tất cả sản phẩm
    public List<ProductResponse> getAllProducts() {
        return productRepo.findAll().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }
    // 4. Lấy sản phẩm theo Category
    public List<ProductResponse> getProductsByCategory(UUID categoryId) {
        return productRepo.findByCategories_Id(categoryId).stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }
    // 5. Xem chi tiết sản phẩm
    public ProductResponse getProductById(UUID id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        return mapToProductResponse(product);
    }

    // 6. Cập nhật sản phẩm
    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        // Tìm sản phẩm cũ
        Product existingProduct = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm để cập nhật"));

        // Cập nhật thông tin cơ bản
        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setStock(request.getStock());

        // Cập nhật danh mục (Nếu có gửi lên danh sách mới)
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            List<Category> newCategories = categoryRepo.findAllById(request.getCategoryIds());
            if (newCategories.isEmpty()) {
                throw new RuntimeException("Danh sách danh mục không hợp lệ");
            }
            existingProduct.setCategories(newCategories);
        }

        // Lưu lại
        Product updatedProduct = productRepo.save(existingProduct);
        return mapToProductResponse(updatedProduct);
    }

    // 7. Xóa sản phẩm
    public void deleteProduct(UUID id) {
        if (!productRepo.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm để xóa");
        }
        productRepo.deleteById(id);
    }
    // 8. Tìm kiếm sản phẩm
    public List<ProductResponse> searchProducts(String keyword) {
        // Gọi hàm repo, truyền keyword vào cả 2 chỗ
        List<Product> products = productRepo.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);

        return products.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void reduceStock(UUID productId, int quantity) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ hàng (Còn: " + product.getStock() + ")");
        }

        product.setStock(product.getStock() - quantity);
        productRepo.save(product);
    }

    @Transactional
    public void increaseStock(UUID productId, int quantity) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        product.setStock(product.getStock() + quantity);
        productRepo.save(product);
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .categoryNames(product.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toList()))
                .build();
    }

}

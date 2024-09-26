package org.example.back.services.imp;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.example.back.entities.BrandEntity;
import org.example.back.entities.CategoryEntity;
import org.example.back.entities.ProductEntity;
import org.example.back.models.Product;
import org.example.back.repositories.BrandRepository;
import org.example.back.repositories.CategoryRepository;
import org.example.back.repositories.ProductRepository;
import org.example.back.services.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImp implements ProductService{

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private CategoryRepository  categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Override
    public Product createProduct(Product product) {
        // Validar los campos requeridos del producto
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        if (product.getName() == null || product.getName().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }

        if (product.getBrand() == null || product.getBrand().getName() == null || product.getBrand().getName().isEmpty()) {
            throw new IllegalArgumentException("Brand name cannot be empty");
        }

        if (product.getCategory() == null || product.getCategory().getName() == null || product.getCategory().getName().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }

        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }

        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        // Verificar si ya existe un producto con el mismo nombre
        if (productRepository.existsByNameIgnoreCase(product.getName())) {
            throw new IllegalArgumentException("Product with the same name already exists");
        }

        // Mapear el producto a la entidad y guardar la entidad
        ProductEntity entity = modelMapper.map(product, ProductEntity.class);
        entity.setActive(true);
        ProductEntity savedEntity = productRepository.save(entity);

        // Mapear la entidad guardada al modelo y devolverlo
        Product createdProduct = modelMapper.map(savedEntity, Product.class);
        return createdProduct;
    }

    @Override
    public Product updateProduct(Long productId, Product product) {
        // Validar los campos requeridos del producto
        if (product == null || product.getId() == null) {
            throw new IllegalArgumentException("Product or Product ID cannot be null");
        }

        if (product.getName() == null || product.getName().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }

        if (product.getBrand() == null || product.getBrand().getName() == null || product.getBrand().getName().isEmpty()) {
            throw new IllegalArgumentException("Brand name cannot be empty");
        }

        if (product.getCategory() == null || product.getCategory().getName() == null || product.getCategory().getName().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }

        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }

        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }

        // Verificar si el producto existe
        ProductEntity entity = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Mapear los campos actualizables del producto a la entidad
        entity.setName(product.getName());
        entity.setDescription(product.getDescription());
        entity.setPrice(product.getPrice());
        entity.setImageUrls(product.getImageUrls());
        entity.setStock(product.getStock());
        entity.setBrand(modelMapper.map(product.getBrand(), BrandEntity.class));
        entity.setCategory(modelMapper.map(product.getCategory(), CategoryEntity.class));

        // Guardar la entidad actualizada
        ProductEntity updatedEntity = productRepository.save(entity);

        // Mapear la entidad actualizada al modelo y devolverlo
        Product updatedProduct = modelMapper.map(updatedEntity, Product.class);
        return updatedProduct;
    }

    @Override
    public List<Product> getAllProducts() {
        List<ProductEntity> entities = productRepository.findAll();
        return entities.stream()
                .map(entity -> modelMapper.map(entity, Product.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<Product> getAllProductsActive() {
        List<ProductEntity> entities = productRepository.findByActiveTrue();

        if (entities.isEmpty()) {
            throw new IllegalArgumentException("No products found active");
        }
        return entities.stream()
                .map(entity -> modelMapper.map(entity, Product.class))
                .collect(Collectors.toList());
    }

    @Override
public List<Product> getAllProductsByCategory(Long categoryId) {

    if (categoryId == null) {
        throw new IllegalArgumentException("Category ID cannot be null");
    }

    CategoryEntity categoryEntity = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));

    if (!categoryEntity.isActive()) {
        throw new IllegalArgumentException("Category is not active");
    }

    List<ProductEntity> entities = productRepository.findByCategoryId(categoryId);

    if (entities.isEmpty()) {
        throw new IllegalArgumentException("No products found for this category");
    }

    // Filtrar solo los productos activos
    List<ProductEntity> activeEntities = entities.stream()
            .filter(ProductEntity::isActive)
            .collect(Collectors.toList());

    if (activeEntities.isEmpty()) {
        throw new IllegalArgumentException("No active products found for this category");
    }

    return activeEntities.stream()
            .map(entity -> modelMapper.map(entity, Product.class))
            .collect(Collectors.toList());
}

@Override
public List<Product> getAllProductsByBrand(Long brandId) {

    if (brandId == null) {
        throw new IllegalArgumentException("Brand ID cannot be null");
    }

    BrandEntity brandEntity = brandRepository.findById(brandId)
            .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

    if (!brandEntity.isActive()) {
        throw new IllegalArgumentException("Brand is not active");
    }

    List<ProductEntity> entities = productRepository.findByBrandId(brandId);

    if (entities.isEmpty()) {
        throw new IllegalArgumentException("No products found for this brand");
    }

    // Filtrar solo los productos activos
    List<ProductEntity> activeEntities = entities.stream()
            .filter(ProductEntity::isActive)
            .collect(Collectors.toList());

    if (activeEntities.isEmpty()) {
        throw new IllegalArgumentException("No active products found for this brand");
    }

    return activeEntities.stream()
            .map(entity -> modelMapper.map(entity, Product.class))
            .collect(Collectors.toList());
}

    @Override
    public List<Product> getAllProductsDesactive() {
        List<ProductEntity> entities = productRepository.findByActiveFalse();

        if (entities.isEmpty()) {
            throw new IllegalArgumentException("No products found desactive");
        }

        return entities.stream()
                .map(entity -> modelMapper.map(entity, Product.class))
                .collect(Collectors.toList());
    }

    @Override
    public Product deteleProduct(Long productId) {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }

        ProductEntity entity = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (entity.isActive()) {
            entity.setActive(false);
            ProductEntity updatedEntity = productRepository.save(entity);
            return modelMapper.map(updatedEntity, Product.class);
        } else {
            throw new IllegalArgumentException("Product is already inactive");
        }
    }

    @Override
    public Product reactiveProduct(Long productId) {
        if(productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }

        ProductEntity entity = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!entity.isActive()) {
            entity.setActive(true);
            ProductEntity updatedEntity = productRepository.save(entity);
            return modelMapper.map(updatedEntity, Product.class);
        } else {
            throw new IllegalArgumentException("Product is already active");
        }
    }
    
}
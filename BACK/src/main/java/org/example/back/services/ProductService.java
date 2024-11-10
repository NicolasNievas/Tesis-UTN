package org.example.back.services;

import java.util.List;

import org.example.back.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public interface ProductService {
    Product createProduct (Product product);
    Product updateProduct(Long productId, Product product);
    List<Product> getAllProducts();
    Page<Product> getAllProducts(Pageable pageable);
    List<Product> getAllProductsActive();
    Page<Product> getAllProductsActive(Pageable pageable);
    List<Product> getAllProductsByCategory(Long categoryId);
    List<Product> getAllProductsByBrand(Long brandId);
    List<Product> getAllProductsDesactive();
    Product deteleProduct(Long productId);
    Product reactiveProduct(Long productId);
    Product getProductById(Long productId);
    List<Product> getAllProductsWithNoStock();
}

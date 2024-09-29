package org.example.back.services.imp;

import java.util.List;
import java.util.stream.Collectors;

import org.example.back.dtos.BrandDTO;
import org.example.back.dtos.CategoryDTO;
import org.example.back.entities.BrandEntity;
import org.example.back.entities.CategoryEntity;
import org.example.back.models.Brand;
import org.example.back.models.Category;
import org.example.back.repositories.BrandRepository;
import org.example.back.repositories.CategoryRepository;
import org.example.back.services.BrandService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BrandServiceImp implements BrandService{

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public Brand createBrand(BrandDTO brandDTO) {
        if (brandDTO == null || brandDTO.getName() == null) {
            throw new IllegalArgumentException("Brand cannot be null");
        }

        if (brandDTO.getName().isEmpty()) {
            throw new IllegalArgumentException("Brand name cannot be empty");
        }

        if (brandRepository.existsByNameIgnoreCase(brandDTO.getName())) {
            throw new IllegalArgumentException("Brand with the same name already exists");
        }

        BrandEntity entity = modelMapper.map(brandDTO, BrandEntity.class);
        entity.setActive(true);
        BrandEntity savedEntity = brandRepository.save(entity);
        Brand createdBrand = modelMapper.map(savedEntity, Brand.class);
        return createdBrand;
    }

    @Override
    public Brand updateBrand(Long brandId, BrandDTO brandDTO) {
        if (brandId == null) {
            throw new IllegalArgumentException("Brand ID cannot be null");
        }
    
        BrandEntity entity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));
    
        if (brandDTO.getName() != null && !brandDTO.getName().isEmpty()) {
            if (brandRepository.existsByName(brandDTO.getName())) {
                throw new IllegalArgumentException("Brand with the same name already exists");
            }
            entity.setName(brandDTO.getName());
        }
    
        BrandEntity updatedEntity = brandRepository.save(entity);
        Brand updatedBrand = modelMapper.map(updatedEntity, Brand.class);
        return updatedBrand;
    }

    @Override
    public List<Brand> getAllBrandsActive() {
        List<BrandEntity> entities = brandRepository.findByActiveTrue();
        return entities.stream()
                .map(entity -> modelMapper.map(entity, Brand.class))
                .collect(Collectors.toList());
    }


    @Override
    public List<Brand> getAllBrands() {
        List<BrandEntity> entities = brandRepository.findAll();
        return entities.stream()
                .map(entity -> modelMapper.map(entity, Brand.class))
                .collect(Collectors.toList());
    }

    @Override
    public Category createCategory(Long brandId, CategoryDTO categoryDTO) {
        if (categoryDTO == null || categoryDTO.getName() == null) {
            throw new IllegalArgumentException("Category or Category name cannot be null");
        }

        BrandEntity brandEntity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        if(!brandEntity.isActive()) {
            throw new IllegalArgumentException("Brand is not active");
        }

        if(categoryDTO.getName().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }

        if (categoryRepository.existsByNameAndBrand(categoryDTO.getName(), brandEntity)) {
            throw new IllegalArgumentException("Category with the same name already exists for this brand");
        }

        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setBrandId(brandId);

        CategoryEntity entity = modelMapper.map(category, CategoryEntity.class);
        entity.setBrand(brandEntity);
        entity.setActive(true);
        CategoryEntity savedEntity = categoryRepository.save(entity);
        return modelMapper.map(savedEntity, Category.class);
    }

    @Override
    public Category updateCategory(Long brandId, Category category) {
        if (category == null || category.getId() == null) {
            throw new IllegalArgumentException("Category or Category ID cannot be null");
        }

        BrandEntity brandEntity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        CategoryEntity entity = (CategoryEntity) categoryRepository.findByIdAndBrand(category.getId(), brandEntity)
                .orElseThrow(() -> new IllegalArgumentException("Category not found for this brand"));

        if (category.getName() != null && !category.getName().isEmpty()) {
            if (categoryRepository.existsByNameAndBrand(category.getName(), brandEntity)) {
                throw new IllegalArgumentException("Category with the same name already exists for this brand");
            }
            entity.setName(category.getName());
        }

        CategoryEntity updatedEntity = categoryRepository.save(entity);
        Category updatedCategory = modelMapper.map(updatedEntity, Category.class);
        return updatedCategory;
    }

    @Override
    public List<Category> getAllCategoriesByBrand(Long brandId) {
        if(brandId == null) {
            throw new IllegalArgumentException("Brand id cannot be null");
        }

        BrandEntity brandEntity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        if (!brandEntity.isActive()) {
            throw new IllegalArgumentException("Brand is not active");
        }

        List<CategoryEntity> categoryEntities = categoryRepository.findByBrandAndActiveTrue(brandEntity);

        if(categoryEntities == null || categoryEntities.isEmpty()) {
            throw new IllegalArgumentException("No categories found for this brand");
        }

        return categoryEntities.stream().map(categoryEntity -> modelMapper.map(categoryEntity, Category.class)).collect(Collectors.toList());
    }

    @Override
    public Brand deleteBrand(Long brandId) {
        if(brandId == null) {
            throw new IllegalArgumentException("Brand id cannot be null");
        }

        BrandEntity entity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        if(entity.isActive()){
            entity.setActive(false);
            BrandEntity updatedEntity = brandRepository.save(entity);
            return modelMapper.map(updatedEntity, Brand.class);
        } else {
            throw new IllegalArgumentException("Brand is already inactive");
        }
    }

    @Override
    public Brand reactivateBrand(Long brandId) {
        if(brandId == null) {
            throw new IllegalArgumentException("Brand id cannot be null");
        }

        BrandEntity entity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        if(!entity.isActive()){
            entity.setActive(true);
            BrandEntity updatedEntity = brandRepository.save(entity);
            return modelMapper.map(updatedEntity, Brand.class);
        } else {
            throw new IllegalArgumentException("Brand is already active");
        }
    }

    @Override
    public Category deleteCategory(Long brandId, Long categoryId) {
        if(brandId == null || categoryId == null) {
            throw new IllegalArgumentException("Brand id or Category id cannot be null");
        }

        BrandEntity brandEntity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        CategoryEntity entity = (CategoryEntity) categoryRepository.findByIdAndBrand(categoryId, brandEntity)
                .orElseThrow(() -> new IllegalArgumentException("Category not found for this brand"));

        if(entity.isActive()){
            entity.setActive(false);
            CategoryEntity updatedEntity = categoryRepository.save(entity);
            return modelMapper.map(updatedEntity, Category.class);
        } else {
            throw new IllegalArgumentException("Category is already inactive");
        }
    }

    @Override
    public Category reactivateCategory(Long brandId, Long categoryId) {
        if(brandId == null || categoryId == null) {
            throw new IllegalArgumentException("Brand id or Category id cannot be null");
        }

        BrandEntity brandEntity = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        CategoryEntity entity = (CategoryEntity) categoryRepository.findByIdAndBrand(categoryId, brandEntity)
                .orElseThrow(() -> new IllegalArgumentException("Category not found for this brand"));

        if(!entity.isActive()){
            entity.setActive(true);
            CategoryEntity updatedEntity = categoryRepository.save(entity);
            return modelMapper.map(updatedEntity, Category.class);
        } else {
            throw new IllegalArgumentException("Category is already active");
        }
    }
    
}

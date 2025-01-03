package org.example.back.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@RestController
@RequestMapping("/api/schema")
public class SchemaController {
    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/export")
    public List<Map<String, Object>> exportSchema() {
        List<Map<String, Object>> schema = new ArrayList<>();
        entityManager.getMetamodel().getEntities().forEach(entityType -> {
            Map<String, Object> table = new HashMap<>();
            table.put("table", entityType.getName());
            List<Map<String, String>> columns = new ArrayList<>();
            entityType.getAttributes().forEach(attribute -> {
                Map<String, String> column = new HashMap<>();
                column.put("name", attribute.getName());
                column.put("type", attribute.getJavaType().getSimpleName());
                columns.add(column);
            });
            table.put("columns", columns);
            schema.add(table);
        });
        return schema;
    }
}
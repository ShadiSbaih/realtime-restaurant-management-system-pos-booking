package com.savora.common.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
public class PaginatedResponse<T> {
    private List<T> data;
    private long totalItems;
    private int itemsPerPage;
    private int currentPage;
    private int totalPages;
    private boolean hasNextPage;
    private boolean hasPrevPage;

    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return PaginatedResponse.<T>builder()
                .data(page.getContent())
                .totalItems(page.getTotalElements())
                .itemsPerPage(page.getSize())
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .hasNextPage(page.hasNext())
                .hasPrevPage(page.hasPrevious())
                .build();
    }
}

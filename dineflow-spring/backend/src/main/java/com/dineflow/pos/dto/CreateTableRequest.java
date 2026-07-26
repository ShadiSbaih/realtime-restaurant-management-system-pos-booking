package com.dineflow.pos.dto;

import com.dineflow.pos.entity.TableShape;
import lombok.Data;

@Data
public class CreateTableRequest {
    private String name;
    private Integer seats;
    private String section;
    private TableShape shape;
}

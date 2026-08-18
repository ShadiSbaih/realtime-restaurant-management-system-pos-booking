package com.savora.pos.dto;

import com.savora.pos.entity.TableShape;
import lombok.Data;

@Data
public class CreateTableRequest {
    private String name;
    private Integer seats;
    private String section;
    private TableShape shape;
}

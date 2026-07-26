package com.dineflow.auth.dto;

import com.dineflow.auth.entity.User;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserDto {
    private UUID id;
    private String name;
    private String email;
    private String role;
    private String image;
    private Boolean banned;
    private String status;
    private String phone;
    private Integer age;
    private String gender;

    public static UserDto fromUser(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .image(user.getImage())
                .banned(user.getBanned())
                .status(user.getStatus())
                .phone(user.getPhone())
                .age(user.getAge())
                .gender(user.getGender())
                .build();
    }
}

package com.dineflow.user.controller;

import com.dineflow.auth.dto.UserDto;
import com.dineflow.auth.entity.Role;
import com.dineflow.auth.entity.User;
import com.dineflow.auth.repository.RefreshTokenRepository;
import com.dineflow.auth.repository.TokenBlacklistRepository;
import com.dineflow.auth.repository.UserRepository;
import com.dineflow.auth.service.JwtService;
import com.dineflow.common.dto.PaginatedResponse;
import com.dineflow.dashboard.service.ActivityLogService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ActivityLogService activityLogService;
    private final JwtService jwtService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PaginatedResponse<UserDto>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role
    ) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Role roleEnum = null;
        if (role != null && !role.trim().isEmpty() && !role.equalsIgnoreCase("all")) {
            try {
                roleEnum = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : "";
        Page<User> users;
        if (roleEnum == null) {
            users = userRepository.searchUsersWithoutRole(searchParam, pageRequest);
        } else {
            users = userRepository.searchUsers(searchParam, roleEnum, pageRequest);
        }
        Page<UserDto> dtos = users.map(UserDto::fromUser);
        return ResponseEntity.ok(PaginatedResponse.from(dtos));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER', 'STAFF', 'KITCHEN')")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(UserDto.fromUser(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateRole(
            @PathVariable UUID id,
            @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        userRepository.save(user);
        activityLogService.log(currentUser, "UPDATE_USER_ROLE",
                "User " + user.getEmail() + " role → " + request.getRole());
        return ResponseEntity.ok(UserDto.fromUser(user));
    }

    @PostMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> banUser(
            @PathVariable UUID id,
            @RequestBody BanRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
        user.setBanned(true);
        user.setBanReason(request.getReason());
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.revokeAllByUserId(user.getId());

        activityLogService.log(currentUser, "BAN_USER",
                "User " + user.getEmail() + " banned. Reason: " + request.getReason());
        return ResponseEntity.ok(UserDto.fromUser(user));
    }

    @PostMapping("/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> unbanUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
        user.setBanned(false);
        user.setBanReason(null);
        userRepository.save(user);
        activityLogService.log(currentUser, "UNBAN_USER", "User " + user.getEmail() + " unbanned");
        return ResponseEntity.ok(UserDto.fromUser(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
        userRepository.delete(user);
        activityLogService.log(currentUser, "DELETE_USER", "User deleted: " + user.getEmail());
        return ResponseEntity.noContent().build();
    }

    @Data static class UpdateRoleRequest { private String role; }
    @Data static class BanRequest { private String reason; }
}

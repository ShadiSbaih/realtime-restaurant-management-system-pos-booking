package com.dineflow.config;

import com.dineflow.auth.entity.Role;
import com.dineflow.auth.entity.User;
import com.dineflow.auth.repository.UserRepository;
import com.dineflow.menu.entity.Category;
import com.dineflow.menu.entity.MenuItem;
import com.dineflow.menu.repository.CategoryRepository;
import com.dineflow.menu.repository.MenuItemRepository;
import com.dineflow.pos.entity.RestaurantTable;
import com.dineflow.pos.entity.TableShape;
import com.dineflow.pos.entity.TableStatus;
import com.dineflow.pos.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedCategoriesAndMenuItems();
        seedTables();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@dineflow.com")) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@dineflow.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded admin user: admin@dineflow.com / admin123");
        }
        
        if (!userRepository.existsByEmail("manager@dineflow.com")) {
            User manager = User.builder()
                    .name("Manager User")
                    .email("manager@dineflow.com")
                    .passwordHash(passwordEncoder.encode("manager123"))
                    .role(Role.MANAGER)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(manager);
            System.out.println("Seeded manager user: manager@dineflow.com / manager123");
        }

        if (!userRepository.existsByEmail("staff@dineflow.com")) {
            User staff = User.builder()
                    .name("Staff Member")
                    .email("staff@dineflow.com")
                    .passwordHash(passwordEncoder.encode("staff123"))
                    .role(Role.STAFF)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(staff);
            System.out.println("Seeded staff user: staff@dineflow.com / staff123");
        }

        if (!userRepository.existsByEmail("kitchen@dineflow.com")) {
            User kitchen = User.builder()
                    .name("Kitchen Chef")
                    .email("kitchen@dineflow.com")
                    .passwordHash(passwordEncoder.encode("kitchen123"))
                    .role(Role.KITCHEN)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(kitchen);
            System.out.println("Seeded kitchen user: kitchen@dineflow.com / kitchen123");
        }

        if (!userRepository.existsByEmail("customer@dineflow.com")) {
            User customer = User.builder()
                    .name("John Customer")
                    .email("customer@dineflow.com")
                    .passwordHash(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(customer);
            System.out.println("Seeded customer user: customer@dineflow.com / customer123");
        }
    }

    private void seedCategoriesAndMenuItems() {
        if (categoryRepository.count() > 0) return;

        Category mains = Category.builder().name("Main Courses").slug("main-courses").build();
        Category sides = Category.builder().name("Sides").slug("sides").build();
        Category drinks = Category.builder().name("Drinks").slug("drinks").build();
        Category desserts = Category.builder().name("Desserts").slug("desserts").build();
        
        categoryRepository.saveAll(List.of(mains, sides, drinks, desserts));

        List<MenuItem> items = List.of(
            MenuItem.builder().name("Classic Burger").description("Juicy beef patty with cheese, lettuce, and tomato")
                .price(new BigDecimal("12.99")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(mains).image("https://images.unsplash.com/photo-1568901346375-23c9450c58cd").build(),
            MenuItem.builder().name("Margherita Pizza").description("Fresh tomatoes, mozzarella, and basil")
                .price(new BigDecimal("14.50")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(mains).image("https://images.unsplash.com/photo-1604068549290-dea0e4a30536").build(),
            MenuItem.builder().name("Grilled Salmon").description("Wild-caught salmon with seasonal roasted vegetables")
                .price(new BigDecimal("22.00")).discount(new BigDecimal("2.00")).isAvailable(true)
                .category(mains).image("https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2").build(),
            MenuItem.builder().name("French Fries").description("Crispy golden potato fries")
                .price(new BigDecimal("4.50")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(sides).image("https://images.unsplash.com/photo-1576107232684-1279f390859f").build(),
            MenuItem.builder().name("Onion Rings").description("Thick cut battered onion rings")
                .price(new BigDecimal("5.50")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(sides).image("https://images.unsplash.com/photo-1639024471283-03518883512d").build(),
            MenuItem.builder().name("Cola").description("Refreshing soda")
                .price(new BigDecimal("2.50")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(drinks).image("https://images.unsplash.com/photo-1622483767028-3f66f32aef97").build(),
            MenuItem.builder().name("Craft Beer").description("Local IPA on draft")
                .price(new BigDecimal("6.00")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(drinks).image("https://images.unsplash.com/photo-1532634922-8fe0b757fb13").build(),
            MenuItem.builder().name("Cheesecake").description("New York style cheesecake with strawberry compote")
                .price(new BigDecimal("7.00")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(desserts).image("https://images.unsplash.com/photo-1524351199678-941a58a3df50").build(),
            MenuItem.builder().name("Chocolate Lava Cake").description("Warm chocolate cake with a molten center")
                .price(new BigDecimal("8.50")).discount(BigDecimal.ZERO).isAvailable(true)
                .category(desserts).image("https://images.unsplash.com/photo-1511920170033-f8396924c348").build()
        );
        menuItemRepository.saveAll(items);
        System.out.println("Seeded " + items.size() + " menu items");
    }

    private void seedTables() {
        if (tableRepository.count() > 0) return;

        List<RestaurantTable> tables = List.of(
            RestaurantTable.builder().name("T1").seats(2).section("Main").shape(TableShape.square).status(TableStatus.AVAILABLE).build(),
            RestaurantTable.builder().name("T2").seats(2).section("Main").shape(TableShape.square).status(TableStatus.AVAILABLE).build(),
            RestaurantTable.builder().name("T3").seats(4).section("Main").shape(TableShape.rectangle).status(TableStatus.AVAILABLE).build(),
            RestaurantTable.builder().name("T4").seats(4).section("Main").shape(TableShape.rectangle).status(TableStatus.AVAILABLE).build(),
            RestaurantTable.builder().name("T5").seats(6).section("Window").shape(TableShape.rectangle).status(TableStatus.AVAILABLE).build(),
            RestaurantTable.builder().name("T6").seats(8).section("VIP").shape(TableShape.circle).status(TableStatus.AVAILABLE).build()
        );
        tableRepository.saveAll(tables);
        System.out.println("Seeded " + tables.size() + " tables");
    }
}

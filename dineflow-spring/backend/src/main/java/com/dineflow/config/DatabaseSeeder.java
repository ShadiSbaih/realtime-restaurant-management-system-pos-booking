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

import com.dineflow.pos.entity.Order;
import com.dineflow.pos.entity.OrderItem;
import com.dineflow.pos.entity.OrderType;
import com.dineflow.pos.entity.OrderStatus;
import com.dineflow.pos.entity.PaymentStatus;
import com.dineflow.pos.entity.PaymentMethod;
import com.dineflow.pos.repository.OrderRepository;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Random;
import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedCategoriesAndMenuItems();
        seedTables();
        seedOrders();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@savora.com")) {
            User admin = User.builder()
                    .name("Admin User")
                    .email("admin@savora.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded admin user: admin@savora.com / admin123");
        }
        
        if (!userRepository.existsByEmail("manager@savora.com")) {
            User manager = User.builder()
                    .name("Manager User")
                    .email("manager@savora.com")
                    .passwordHash(passwordEncoder.encode("manager123"))
                    .role(Role.MANAGER)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(manager);
            System.out.println("Seeded manager user: manager@savora.com / manager123");
        }

        if (!userRepository.existsByEmail("staff@savora.com")) {
            User staff = User.builder()
                    .name("Staff Member")
                    .email("staff@savora.com")
                    .passwordHash(passwordEncoder.encode("staff123"))
                    .role(Role.STAFF)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(staff);
            System.out.println("Seeded staff user: staff@savora.com / staff123");
        }

        if (!userRepository.existsByEmail("kitchen@savora.com")) {
            User kitchen = User.builder()
                    .name("Kitchen Chef")
                    .email("kitchen@savora.com")
                    .passwordHash(passwordEncoder.encode("kitchen123"))
                    .role(Role.KITCHEN)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(kitchen);
            System.out.println("Seeded kitchen user: kitchen@savora.com / kitchen123");
        }

        if (!userRepository.existsByEmail("customer@savora.com")) {
            User customer = User.builder()
                    .name("John Customer")
                    .email("customer@savora.com")
                    .passwordHash(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .status("active")
                    .banned(false)
                    .emailVerified(true)
                    .build();
            userRepository.save(customer);
            System.out.println("Seeded customer user: customer@savora.com / customer123");
        }
    }

    private void seedCategoriesAndMenuItems() {
        if (menuItemRepository.count() > 0) return;

        Category mains = Category.builder().name("Main Courses").slug("main-courses").build();
        Category sides = Category.builder().name("Sides").slug("sides").build();
        Category drinks = Category.builder().name("Drinks").slug("drinks").build();
        Category desserts = Category.builder().name("Desserts").slug("desserts").build();
        Category hotDrinks = Category.builder().name("Hot Drinks").slug("hot-drinks").build();
        Category appetizers = Category.builder().name("Appetizers").slug("appetizers").build();
        
        categoryRepository.saveAll(List.of(mains, sides, drinks, desserts, hotDrinks, appetizers));

        List<MenuItem> items = List.of(
            // Mains
            MenuItem.builder().name("Classic Burger").description("Juicy beef patty with cheese, lettuce, and tomato").price(new BigDecimal("12.99")).discount(BigDecimal.ZERO).isAvailable(true).category(mains).image("https://images.unsplash.com/photo-1568901346375-23c9450c58cd").build(),
            MenuItem.builder().name("Margherita Pizza").description("Fresh tomatoes, mozzarella, and basil").price(new BigDecimal("14.50")).discount(BigDecimal.ZERO).isAvailable(true).category(mains).image("https://images.unsplash.com/photo-1604068549290-dea0e4a30536").build(),
            MenuItem.builder().name("Grilled Salmon").description("Wild-caught salmon with seasonal roasted vegetables").price(new BigDecimal("22.00")).discount(new BigDecimal("2.00")).isAvailable(true).category(mains).image("https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2").build(),
            MenuItem.builder().name("Steak Frites").description("Ribeye steak with crispy french fries").price(new BigDecimal("28.00")).discount(BigDecimal.ZERO).isAvailable(true).category(mains).image("https://images.unsplash.com/photo-1600891964092-4316c288032e").build(),
            MenuItem.builder().name("Spaghetti Carbonara").description("Classic Italian pasta with pancetta and egg").price(new BigDecimal("16.50")).discount(BigDecimal.ZERO).isAvailable(true).category(mains).image("https://images.unsplash.com/photo-1612874742237-645011362f1a").build(),
            MenuItem.builder().name("Chicken Parmesan").description("Breaded chicken breast topped with marinara and cheese").price(new BigDecimal("18.00")).discount(BigDecimal.ZERO).isAvailable(true).category(mains).image("https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8").build(),
            MenuItem.builder().name("Vegan Buddha Bowl").description("Quinoa, roasted sweet potato, kale, and tahini").price(new BigDecimal("15.00")).discount(BigDecimal.ZERO).isAvailable(true).category(mains).image("https://images.unsplash.com/photo-1512621776951-a57141f2eefd").build(),
            
            // Sides
            MenuItem.builder().name("French Fries").description("Crispy golden potato fries").price(new BigDecimal("4.50")).discount(BigDecimal.ZERO).isAvailable(true).category(sides).image("https://images.unsplash.com/photo-1576107232684-1279f390859f").build(),
            MenuItem.builder().name("Onion Rings").description("Thick cut battered onion rings").price(new BigDecimal("5.50")).discount(BigDecimal.ZERO).isAvailable(true).category(sides).image("https://images.unsplash.com/photo-1639024471283-03518883512d").build(),
            MenuItem.builder().name("Garlic Bread").description("Toasted baguette with garlic butter").price(new BigDecimal("4.00")).discount(BigDecimal.ZERO).isAvailable(true).category(sides).image("https://images.unsplash.com/photo-1573140247632-f8fd74997d5c").build(),
            MenuItem.builder().name("Side Salad").description("Mixed greens with balsamic vinaigrette").price(new BigDecimal("5.00")).discount(BigDecimal.ZERO).isAvailable(true).category(sides).image("https://images.unsplash.com/photo-1512621776951-a57141f2eefd").build(),
            MenuItem.builder().name("Mac & Cheese").description("Creamy baked macaroni and cheese").price(new BigDecimal("6.50")).discount(BigDecimal.ZERO).isAvailable(true).category(sides).image("https://images.unsplash.com/photo-1543339494-b4cd4f7ba686").build(),

            // Drinks
            MenuItem.builder().name("Cola").description("Refreshing soda").price(new BigDecimal("2.50")).discount(BigDecimal.ZERO).isAvailable(true).category(drinks).image("https://images.unsplash.com/photo-1622483767028-3f66f32aef97").build(),
            MenuItem.builder().name("Craft Beer").description("Local IPA on draft").price(new BigDecimal("6.00")).discount(BigDecimal.ZERO).isAvailable(true).category(drinks).image("https://images.unsplash.com/photo-1532634922-8fe0b757fb13").build(),
            MenuItem.builder().name("Lemonade").description("Freshly squeezed lemons").price(new BigDecimal("3.00")).discount(BigDecimal.ZERO).isAvailable(true).category(drinks).image("https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd").build(),
            MenuItem.builder().name("Sparkling Water").description("Chilled carbonated water").price(new BigDecimal("2.50")).discount(BigDecimal.ZERO).isAvailable(true).category(drinks).image("https://images.unsplash.com/photo-1550505095-724bc275eb82").build(),
            MenuItem.builder().name("Orange Juice").description("Freshly squeezed orange juice").price(new BigDecimal("3.50")).discount(BigDecimal.ZERO).isAvailable(true).category(drinks).image("https://images.unsplash.com/photo-1621506289937-a8e4df240d0b").build(),

            // Desserts
            MenuItem.builder().name("Cheesecake").description("New York style cheesecake with strawberry compote").price(new BigDecimal("7.00")).discount(BigDecimal.ZERO).isAvailable(true).category(desserts).image("https://images.unsplash.com/photo-1524351199678-941a58a3df50").build(),
            MenuItem.builder().name("Chocolate Lava Cake").description("Warm chocolate cake with a molten center").price(new BigDecimal("8.50")).discount(BigDecimal.ZERO).isAvailable(true).category(desserts).image("https://images.unsplash.com/photo-1511920170033-f8396924c348").build(),
            MenuItem.builder().name("Tiramisu").description("Classic Italian coffee-flavored dessert").price(new BigDecimal("7.50")).discount(BigDecimal.ZERO).isAvailable(true).category(desserts).image("https://images.unsplash.com/photo-1571115177098-24ec42ed204d").build(),
            MenuItem.builder().name("Ice Cream Sundae").description("Vanilla ice cream with chocolate syrup and a cherry").price(new BigDecimal("6.00")).discount(BigDecimal.ZERO).isAvailable(true).category(desserts).image("https://images.unsplash.com/photo-1563805042-7684c8a9e9cb").build(),
            MenuItem.builder().name("Apple Pie").description("Warm apple pie with a flaky crust").price(new BigDecimal("6.50")).discount(BigDecimal.ZERO).isAvailable(true).category(desserts).image("https://images.unsplash.com/photo-1568571780765-9276ac8b75a2").build(),

            // Hot Drinks
            MenuItem.builder().name("Espresso").description("Strong black coffee").price(new BigDecimal("2.50")).discount(BigDecimal.ZERO).isAvailable(true).category(hotDrinks).image("https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04").build(),
            MenuItem.builder().name("Cappuccino").description("Espresso with steamed milk and foam").price(new BigDecimal("3.50")).discount(BigDecimal.ZERO).isAvailable(true).category(hotDrinks).image("https://images.unsplash.com/photo-1534040385115-33dcb3ac64b6").build(),
            MenuItem.builder().name("Latte").description("Espresso with lots of steamed milk").price(new BigDecimal("4.00")).discount(BigDecimal.ZERO).isAvailable(true).category(hotDrinks).image("https://images.unsplash.com/photo-1570968915860-54d5c301fa9f").build(),
            MenuItem.builder().name("Hot Chocolate").description("Rich chocolate with steamed milk").price(new BigDecimal("3.50")).discount(BigDecimal.ZERO).isAvailable(true).category(hotDrinks).image("https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed").build(),
            MenuItem.builder().name("Green Tea").description("Steaming hot cup of green tea").price(new BigDecimal("2.50")).discount(BigDecimal.ZERO).isAvailable(true).category(hotDrinks).image("https://images.unsplash.com/photo-1627492822012-70b991873130").build(),

            // Appetizers
            MenuItem.builder().name("Bruschetta").description("Toasted bread topped with tomatoes, basil, and garlic").price(new BigDecimal("6.50")).discount(BigDecimal.ZERO).isAvailable(true).category(appetizers).image("https://images.unsplash.com/photo-1572695157366-5e585ab2b69f").build(),
            MenuItem.builder().name("Spinach Dip").description("Creamy spinach and artichoke dip with tortilla chips").price(new BigDecimal("8.00")).discount(BigDecimal.ZERO).isAvailable(true).category(appetizers).image("https://images.unsplash.com/photo-1626078311545-21d960967cc9").build(),
            MenuItem.builder().name("Chicken Wings").description("Spicy buffalo chicken wings with ranch").price(new BigDecimal("9.50")).discount(BigDecimal.ZERO).isAvailable(true).category(appetizers).image("https://images.unsplash.com/photo-1569691899455-88464f6d3cb1").build(),
            MenuItem.builder().name("Calamari").description("Crispy fried squid rings with marinara sauce").price(new BigDecimal("10.50")).discount(BigDecimal.ZERO).isAvailable(true).category(appetizers).image("https://images.unsplash.com/photo-1599487405270-b28c04ed38c1").build(),
            MenuItem.builder().name("Nachos").description("Tortilla chips loaded with cheese, jalapenos, and salsa").price(new BigDecimal("8.50")).discount(BigDecimal.ZERO).isAvailable(true).category(appetizers).image("https://images.unsplash.com/photo-1513456852971-30c0b8199d4d").build()
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

    private void seedOrders() {
        if (orderRepository.count() >= 50) return;

        User admin = userRepository.findByEmail("admin@savora.com").orElse(null);
        List<MenuItem> items = menuItemRepository.findAll();
        List<RestaurantTable> tables = tableRepository.findAll();

        if (admin == null || items.isEmpty() || tables.isEmpty()) return;

        Random random = new Random();
        Instant now = Instant.now();
        List<Order> orders = new ArrayList<>();

        for (int i = 0; i < 60; i++) {
            Order order = Order.builder()
                .orderType(random.nextBoolean() ? OrderType.DINE_IN : OrderType.TAKEAWAY)
                .status(OrderStatus.SERVED)
                .paymentStatus(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.CARD)
                .user(admin)
                .table(random.nextBoolean() ? tables.get(random.nextInt(tables.size())) : null)
                .totalAmount(BigDecimal.ZERO)
                .build();

            int itemCount = random.nextInt(3) + 1;
            List<OrderItem> orderItems = new ArrayList<>();
            BigDecimal total = BigDecimal.ZERO;
            
            for (int j = 0; j < itemCount; j++) {
                MenuItem item = items.get(random.nextInt(items.size()));
                int qty = random.nextInt(2) + 1;
                BigDecimal price = item.getPrice();
                
                OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(item)
                    .quantity(qty)
                    .price(price)
                    .build();
                orderItems.add(orderItem);
                total = total.add(price.multiply(BigDecimal.valueOf(qty)));
            }
            
            order.setItems(orderItems);
            order.setTotalAmount(total);
            orders.add(order);
        }
        
        orderRepository.saveAll(orders);
        
        for (Order o : orders) {
            int daysAgo = random.nextInt(14);
            Instant createdAt = now.minus(daysAgo, ChronoUnit.DAYS).minus(random.nextInt(12), ChronoUnit.HOURS);
            entityManager.createNativeQuery("UPDATE orders SET created_at = :createdAt WHERE id = :id")
                .setParameter("createdAt", createdAt)
                .setParameter("id", o.getId())
                .executeUpdate();
        }
        System.out.println("Seeded " + orders.size() + " orders");
    }
}

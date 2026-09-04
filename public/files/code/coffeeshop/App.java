package introdb;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import io.javalin.Javalin;
import io.javalin.http.Context;
import java.time.Instant;

/**
 * This is a simple web application for a coffee shop that allows users to register, log in, view
 * products, make purchases, and view purchase history. It uses Javalin as the web server and
 * connects to DuckDB over JDBC for data storage.
 */
public class App {

    // DuckDB connection string for local file-based DB
    private static final String CONNECTION = "jdbc:duckdb:./coffee.db";

    private record Product(String productName, String description, int price) {
    }
    private record Purchase(String userName, String productName, String purchaseTime) {
    }

    /**
     * Main entry point. Starts the Javalin web server and sets up all routes.
     * 
     * @param args Command-line arguments (not used)
     */
    public static void main(String[] args) {
        Javalin.create(config -> {
            config.staticFiles.add("/");
            config.routes.get("/", ctx -> ctx.redirect("/index.html"));
            config.routes.post("/login", App::handleLogin);
            config.routes.get("/logout", App::handleLogout);
            config.routes.get("/products", App::renderProductsPage);
            config.routes.post("/purchase", App::handlePurchase);
            config.routes.get("/purchases", App::renderPurchasesPage);
            config.routes.get("/my-purchases", App::renderMyPurchasesPage);
            config.routes.post("/register", App::handleRegister);
        }).start(8080);
    }

    // --- SQL Query Methods ---
    /**
     * Checks if a user exists with the given username and password.
     * 
     * @param username The username to check
     * @param password The password to check
     * @return true if user exists and password matches, false otherwise
     */
    private static boolean loginUser(String username, String password) {
        String query = "select * from user where username = ? and password = ?";
        try (Connection conn = DriverManager.getConnection(CONNECTION);
                PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setString(1, username);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Inserts a new user into the database.
     * 
     * @param username The username for the new user
     * @param email The email for the new user
     * @param password The password for the new user
     * @return true if insertion was successful, false otherwise
     */
   private static boolean insertUser(String username, String email, String password){
        try (Connection conn = DriverManager.getConnection(CONNECTION);
        PreparedStatement ps = conn.prepareStatement(
            "insert into user values (?, ?, ?)");) {
                ps.setString(1, username);
                ps.setString(2, email);
                ps.setString(3, password);
                ps.executeUpdate();
            return true;
            } catch (SQLException e) {
        e.printStackTrace();
    return false;
    }
    }

    /**
     * Retrieves all products from the database.
     * 
     * @return List of Product records
     */
    private static List<Product> getProducts() {
        String query = "select productname, description, price from product";
        List<Product> products = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(CONNECTION);
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(query)) {
            while (rs.next()) {
                String productname = rs.getString("productname");
                String description = rs.getString("description");
                int price = rs.getInt("price");
                products.add(new Product(productname, description, price));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return products;
    }

    /**
     * Inserts a new purchase for a user and product.
     * 
     * @param username The username making the purchase
     * @param productname The product being purchased
     * @return true if insertion was successful, false otherwise
     */
    private static boolean insertPurchase(String username, String productname) {
        try (Connection conn = DriverManager.getConnection(CONNECTION);
        PreparedStatement ps = conn.prepareStatement(
            "insert into purchase values (?, ?, ?)");) {
                ps.setString(1, Instant.now().toString());
                ps.setString(2, productname);
                ps.setString(3, username);
                ps.executeUpdate();
            return true;
            } catch (SQLException e) {
        e.printStackTrace();
    return false;
    }
    }

    /**
     * Retrieves all purchases from the database, ordered by time descending.
     * 
     * @return List of Purchase records
     */
    private static List<Purchase> getAllPurchases() {
        String query =
                "select username, productname, purchasetime from purchase order by purchasetime desc";
        List<Purchase> purchases = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(CONNECTION);
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(query)) {
            while (rs.next()) {
                String username = rs.getString("username");
                String productname = rs.getString("productname");
                String purchasetime = rs.getString("purchasetime");
                purchases.add(new Purchase(username, productname, purchasetime));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return purchases;
    }

    /**
     * Retrieves all purchases for a specific user, ordered by time descending.
     * 
     * @param username The username whose purchases to retrieve
     * @return List of Purchase records for the user
     */
   private static List<Purchase> getUserPurchases(String username) {
        List<Purchase> purchases = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(CONNECTION);
        PreparedStatement ps = conn.prepareStatement(
        "select productname, purchasetime from purchase " + "where username = ? order by purchasetime desc")) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String productname = rs.getString("productname");
                    String purchasetime = rs.getString("purchasetime");
                    purchases.add(new Purchase(username, productname, purchasetime));
                }
            }
        } catch (SQLException e) {
        e.printStackTrace();
        }
        return purchases;
        }

    // --- Page Rendering Methods ---
    /**
     * Renders the products page as HTML and sends it to the client.
     * 
     * @param ctx The Javalin context for the request
     */
    private static void renderProductsPage(Context ctx) {
        String username = ctx.sessionAttribute("username");
        StringBuilder html = new StringBuilder();
        html.append(header("Products", username));
        html.append("<main><h2>Products</h2>");
        html.append("<ul class='product-list'>");
        for (Product product : getProducts()) {
            String productname = product.productName();
            String desc = product.description();
            int price = product.price();
            html.append("<li class='product'>");
            html.append("<h3>").append(productname).append(" - DKK ").append(price).append("</h3>");
            html.append("<p>").append(desc).append("</p>");
            if (username != null) {
                html.append("<form method='post' action='/purchase'>");
                html.append("<input type='hidden' name='productname' value='");
                html.append(productname).append("'>");
                html.append("<button type='submit'>Buy</button>").append("</form>");
            } else {
                html.append("<p><em>Login to purchase</em></p>");
            }
            html.append("</li>");
        }
        html.append("</ul>");
        html.append("</main>");
        html.append(footer());
        ctx.html(html.toString());
    }

    /**
     * Renders the all purchases page as HTML and sends it to the client.
     * 
     * @param ctx The Javalin context for the request
     */
    private static void renderPurchasesPage(Context ctx) {
        String username = ctx.sessionAttribute("username");
        StringBuilder html = new StringBuilder();
        html.append(header("All Purchases", username));
        html.append("<main><h2>All Purchases</h2>");
        html.append("<table class='purchases'><thead><tr><th>User</th>");
        html.append("<th>Product</th><th>Time</th></tr></thead><tbody>");
        for (Purchase purchase : getAllPurchases()) {
            html.append("<tr>").append("<td>").append(purchase.userName()).append("</td>");
            html.append("<td>").append(purchase.productName()).append("</td>").append("<td>");
            html.append(purchase.purchaseTime()).append("</td>").append("</tr>");
        }
        html.append("</tbody></table>");
        html.append("</main>");
        html.append(footer());
        ctx.html(html.toString());
    }

    /**
     * Renders the current user's purchases page as HTML and sends it to the client.
     * 
     * @param ctx The Javalin context for the request
     */
    private static void renderMyPurchasesPage(Context ctx) {
        String username = ctx.sessionAttribute("username");
        if (username == null) {
            ctx.status(401).result("You must be logged in to view your purchases.");
            return;
        }
        StringBuilder html = new StringBuilder();
        html.append(header("My Purchases", username));
        html.append("<main><h2>My Purchases</h2>");
        html.append("<table class='purchases'><thead><tr><th>Product</th>");
        html.append("<th>Time</th></tr></thead><tbody>");
        for (Purchase purchase : getUserPurchases(username)) {
            html.append("<tr>").append("<td>").append(purchase.productName()).append("</td>");
            html.append("<td>").append(purchase.purchaseTime()).append("</td>").append("</tr>");
        }
        html.append("</tbody></table>");
        html.append("</main>");
        html.append(footer());
        ctx.html(html.toString());
    }

    // --- Form Handlers ---
    /**
     * Handles login form submission, authenticates user, and sets session.
     * 
     * @param ctx The Javalin context for the request
     */
    private static void handleLogin(Context ctx) {
        String username = ctx.formParam("username");
        String password = ctx.formParam("password");
        if (username == null || password == null) {
            ctx.status(400).result("Missing username or password");
            return;
        }
        if (loginUser(username, password)) {
            ctx.sessionAttribute("username", username);
            ctx.redirect("/products");
        } else {
            ctx.status(401).result("Invalid username/password");
        }
    }

    /**
     * Handles logout by clearing session and redirecting to index.
     * 
     * @param ctx The Javalin context for the request
     */
    private static void handleLogout(Context ctx) {
        ctx.sessionAttribute("username", null);
        ctx.redirect("/index.html");
    }

    /**
     * Handles registration form submission, creates user, and sets session.
     * 
     * @param ctx The Javalin context for the request
     */
    private static void handleRegister(Context ctx) {
        String username = ctx.formParam("username");
        String email = ctx.formParam("email");
        String password = ctx.formParam("password");
        if (username == null || email == null || password == null) {
            ctx.status(400).result("Missing username, email, or password");
            return;
        }
        if (insertUser(username, email, password)) {
            ctx.sessionAttribute("username", username);
            ctx.redirect("/products");
        } else {
            ctx.status(500).result("Registration failed");
        }
    }

    /**
     * Handles purchase form submission, inserts purchase, and redirects.
     * 
     * @param ctx The Javalin context for the request
     */
    private static void handlePurchase(Context ctx) {
        String username = ctx.sessionAttribute("username");
        if (username == null) {
            ctx.status(401).result("You must be logged in to purchase.");
            return;
        }
        String productname = ctx.formParam("productname");
        if (productname == null || productname.isBlank()) {
            ctx.status(400).result("No product specified.");
            return;
        }
        if (insertPurchase(username, productname)) {
            ctx.redirect("/my-purchases");
        } else {
            ctx.status(500).result("Purchase failed");
        }
    }

    // small HTML header/footer helpers
    /**
     * Generates the HTML header for all pages.
     * 
     * @param title The page title
     * @param username The current logged-in username (may be null)
     * @return HTML header string
     */
    private static String header(String title, String username) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!doctype html><html><head><meta charset='utf-8'>");
        sb.append("<meta name='viewport' content='width=device-width,initial-scale=1'>");
        sb.append("<title>").append(title).append("</title>");
        sb.append("<link rel='stylesheet' href='style.css'>");
        sb.append("<link rel='icon' type='image/png' href='icon.png'>");
        sb.append("<header><h1>").append(title).append("</h1><nav>");
        sb.append("<a href='/'>Home</a> | <a href='/products'>Products</a> | ");
        sb.append("<a href='/purchases'>All Purchases</a>");
        if (username == null) {
            sb.append(" | <a href='/login.html'>Login</a> | <a href='/register.html'>Register</a>");
        } else {
            sb.append(" | <a href='/my-purchases'>My Purchases</a> | ");
            sb.append("<a href='/logout'>Logout (").append(username).append(")</a>");
        }
        sb.append("</nav></header>");
        return sb.toString();
    }

    /**
     * Generates the HTML footer for all pages.
     * 
     * @return HTML footer string
     */
    private static String footer() {
        return "<footer><p>&copy; Introduction to Database Systems - Coffee Shop</p>"
                + "</footer></body></html>";
    }
}

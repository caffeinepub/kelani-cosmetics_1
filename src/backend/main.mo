import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Bool "mo:core/Bool";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  var userProfiles = Map.empty<Principal, UserProfile>();

  func checkAdmin(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Category = {
    categoryId : Nat;
    name : Text;
    order : Nat;
    createdDate : Int;
    lastUpdatedDate : Int;
  };

  var categories = Map.empty<Nat, Category>();
  var lastCategoryId : Nat = 0;

  func getCurrentTimestamp() : Int {
    Time.now();
  };

  public shared ({ caller }) func createCategory(name : Text, order : Nat) : async Category {
    checkAdmin(caller);

    let categoryId = lastCategoryId + 1;
    let currentTime = getCurrentTimestamp();

    let newCategory = {
      categoryId;
      name;
      order;
      createdDate = currentTime;
      lastUpdatedDate = currentTime;
    };

    categories.add(categoryId, newCategory);
    lastCategoryId := categoryId;
    newCategory;
  };

  public shared ({ caller }) func updateCategory(categoryId : Nat, name : Text, order : Nat) : async Category {
    checkAdmin(caller);

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) {
        let updatedCategory = {
          category with
          name;
          order;
          lastUpdatedDate = getCurrentTimestamp();
        };
        categories.add(categoryId, updatedCategory);
        updatedCategory;
      };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async Bool {
    checkAdmin(caller);

    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.remove(categoryId);
        true;
      };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view categories");
    };
    categories.values().toArray().sort(
      func(a, b) {
        Nat.compare(a.order, b.order);
      }
    );
  };

  public query ({ caller }) func getCategoryById(categoryId : Nat) : async ?Category {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view categories");
    };
    categories.get(categoryId);
  };

  public shared ({ caller }) func reorderCategories(newOrder : [(Nat, Nat)]) : async Bool {
    checkAdmin(caller);

    for ((categoryId, order) in newOrder.values()) {
      switch (categories.get(categoryId)) {
        case (null) { Runtime.trap("Category not found: " # categoryId.toText()) };
        case (?category) {
          let updatedCategory = {
            category with order
          };
          categories.add(categoryId, updatedCategory);
        };
      };
    };
    true;
  };

  public type Product = {
    barcode : Text;
    name : Text;
    categoryId : Nat;
    description : ?Text;
    price : ?Float;
    inStock : Bool;
    isFeatured : Bool;
    photo : ?[Nat8];
    createdDate : Int;
    lastUpdatedDate : Int;
  };

  var products = Map.empty<Text, Product>();

  public type PaginatedResponse = {
    items : [Product];
    totalCount : Nat;
  };

  func filterProducts(search : Text, categoryId : ?Nat) : [Product] {
    products.values().toArray().filter(
      func(product) {
        if (switch (categoryId) {
          case (null) { false };
          case (?id) { product.categoryId != id };
        }) {
          return false;
        };

        if (search.size() > 0) {
          let searchText = search.toLower();
          if (isNumeric(search)) {
            if (not product.barcode.contains(#text searchText)) {
              return false;
            };
          } else {
            let nameMatch = product.name.toLower().contains(#text searchText);
            let barcodeMatch = product.barcode.toLower().contains(#text searchText);
            let descriptionMatch = switch (product.description) {
              case (null) { false };
              case (?desc) { desc.toLower().contains(#text searchText) };
            };
            if (not (nameMatch or barcodeMatch or descriptionMatch)) {
              return false;
            };
          };
        };
        true;
      }
    );
  };

  func numericCheck(c : Char) : Bool {
    switch (c) {
      case ('0') { true };
      case ('1') { true };
      case ('2') { true };
      case ('3') { true };
      case ('4') { true };
      case ('5') { true };
      case ('6') { true };
      case ('7') { true };
      case ('8') { true };
      case ('9') { true };
      case (_) { false };
    };
  };

  func isNumeric(search : Text) : Bool {
    search.chars().all(numericCheck);
  };

  func safeSlice(array : [Product], start : Nat, end : Nat) : [Product] {
    if (start >= array.size()) {
      return [];
    } else if (end > array.size()) {
      array.sliceToArray(start, array.size());
    } else {
      array.sliceToArray(start, end);
    };
  };

  public query ({ caller }) func getProductsPage(search : Text, categoryId : ?Nat, page : Nat, pageSize : Nat) : async PaginatedResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view products");
    };
    let filteredProducts = filterProducts(search, categoryId);
    let totalCount = filteredProducts.size();
    let start = page * pageSize;
    let end = start + pageSize;
    let pageItems = safeSlice(filteredProducts, start, end);

    {
      items = pageItems;
      totalCount;
    };
  };

  public shared ({ caller }) func createProduct(barcode : Text, name : Text, categoryId : Nat, description : ?Text, price : ?Float, inStock : Bool, isFeatured : Bool, photo : ?[Nat8]) : async Product {
    checkAdmin(caller);

    switch (products.get(barcode)) {
      case (null) {
        let currentTime = getCurrentTimestamp();
        let newProduct = {
          barcode;
          name;
          categoryId;
          description;
          price;
          inStock;
          isFeatured;
          photo;
          createdDate = currentTime;
          lastUpdatedDate = currentTime;
        };
        products.add(barcode, newProduct);
        newProduct;
      };
      case (?_) { Runtime.trap("Product with this barcode already exists") };
    };
  };

  public shared ({ caller }) func updateProduct(barcode : Text, name : Text, categoryId : Nat, description : ?Text, price : ?Float, inStock : Bool, isFeatured : Bool, photo : ?[Nat8]) : async Product {
    checkAdmin(caller);

    switch (products.get(barcode)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct = {
          barcode;
          name;
          categoryId;
          description;
          price;
          inStock;
          isFeatured;
          photo;
          createdDate = existingProduct.createdDate;
          lastUpdatedDate = getCurrentTimestamp();
        };
        products.add(barcode, updatedProduct);
        updatedProduct;
      };
    };
  };

  public shared ({ caller }) func toggleProductInStock(barcode : Text) : async Bool {
    checkAdmin(caller);

    switch (products.get(barcode)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with
          inStock = not product.inStock;
          lastUpdatedDate = getCurrentTimestamp();
        };
        products.add(barcode, updatedProduct);
        updatedProduct.inStock;
      };
    };
  };

  public query ({ caller }) func getProduct(barcode : Text) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view products");
    };
    if (barcode.size() == 0) {
      Runtime.trap("Barcode is required");
    };
    switch (products.get(barcode)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func deleteProduct(barcode : Text, password : Text) : async () {
    checkAdmin(caller);
    if (password != "DeleteIsUnsafe") {
      Runtime.trap("Incorrect password");
    };
    if (barcode.size() == 0) {
      Runtime.trap("Barcode is required");
    };
    switch (products.get(barcode)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(barcode);
      };
    };
  };

  public shared ({ caller }) func uploadProductPhoto(barcode : Text, photo : [Nat8]) : async Product {
    checkAdmin(caller);

    switch (products.get(barcode)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with
          photo = ?photo;
          lastUpdatedDate = getCurrentTimestamp();
        };
        products.add(barcode, updatedProduct);
        updatedProduct;
      };
    };
  };

  public query ({ caller }) func getProductPhoto(barcode : Text) : async [Nat8] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view product photos");
    };
    switch (products.get(barcode)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        switch (product.photo) {
          case (null) { Runtime.trap("No photo available for this product") };
          case (?photo) { photo };
        };
      };
    };
  };

  public query ({ caller }) func getTotalProductCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view product count");
    };
    filterProducts("", null).size();
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view featured products");
    };
    filterProducts("", null).filter(
      func(product) { product.isFeatured }
    );
  };

  public type SaleItem = {
    saleId : Nat;
    productBarcode : Text;
    barcode : Text;
    name : Text;
    description : ?Text;
    price : ?Float;
    salePrice : Float;
    discountPercentage : Float;
    categoryId : Nat;
    categoryName : Text;
    startDate : Int;
    endDate : Int;
    isActive : Bool;
    createdDate : Int;
    lastUpdatedDate : Int;
  };

  var saleItems = Map.empty<Nat, SaleItem>();
  var lastSaleId : Nat = 0;

  func calculateDiscountPercentage(originalPrice : Float, salePrice : Float) : Float {
    let discount = (originalPrice - salePrice) / originalPrice * 100;
    if (discount < 0) { 0.0 } else { discount };
  };

  public shared ({ caller }) func createSaleItem(productBarcode : Text, salePrice : Float, startDate : Int, endDate : Int) : async SaleItem {
    checkAdmin(caller);

    switch (products.get(productBarcode)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let saleId = lastSaleId + 1;
        let currentTime = getCurrentTimestamp();

        let discountPercentage = switch (product.price) {
          case (null) { 0.0 };
          case (?price) { calculateDiscountPercentage(price, salePrice) };
        };

        let newSaleItem = {
          saleId;
          productBarcode;
          barcode = product.barcode;
          name = product.name;
          description = product.description;
          price = product.price;
          salePrice;
          discountPercentage;
          categoryId = product.categoryId;
          categoryName = "Uncategorized";
          startDate;
          endDate;
          isActive = true;
          createdDate = currentTime;
          lastUpdatedDate = currentTime;
        };

        saleItems.add(saleId, newSaleItem);
        lastSaleId := saleId;
        newSaleItem;
      };
    };
  };

  public shared ({ caller }) func updateSaleItem(saleId : Nat, salePrice : Float, startDate : Int, endDate : Int) : async SaleItem {
    checkAdmin(caller);

    switch (saleItems.get(saleId)) {
      case (null) { Runtime.trap("Sale Item not found") };
      case (?existingSale) {
        let updatedSaleItem = {
          existingSale with
          salePrice;
          discountPercentage = switch (existingSale.price) {
            case (null) { 0.0 };
            case (?price) { calculateDiscountPercentage(price, salePrice) };
          };
          startDate;
          endDate;
          lastUpdatedDate = getCurrentTimestamp();
        };
        saleItems.add(saleId, updatedSaleItem);
        updatedSaleItem;
      };
    };
  };

  public shared ({ caller }) func toggleSaleItemActiveStatus(saleId : Nat) : async Bool {
    checkAdmin(caller);

    switch (saleItems.get(saleId)) {
      case (null) { Runtime.trap("Sale Item not found") };
      case (?saleItem) {
        let currentTime = getCurrentTimestamp();

        if (currentTime > saleItem.endDate) {
          Runtime.trap("Cannot activate expired sale");
        };

        let updatedSaleItem = {
          saleItem with
          isActive = not saleItem.isActive;
          lastUpdatedDate = currentTime;
        };
        saleItems.add(saleId, updatedSaleItem);
        updatedSaleItem.isActive;
      };
    };
  };

  type SaleItemArray = {
    items : [SaleItem];
    totalCount : Nat;
  };

  func safeSliceSaleItem(array : [SaleItem], start : Nat, end : Nat) : [SaleItem] {
    if (start >= array.size()) {
      return [];
    } else if (end > array.size()) {
      array.sliceToArray(start, array.size());
    } else {
      array.sliceToArray(start, end);
    };
  };

  public query ({ caller }) func getSaleItemsPage(search : Text, page : Nat, pageSize : Nat, includeInactive : Bool) : async SaleItemArray {
    checkAdmin(caller);

    let filteredSaleItems = saleItems.values().toArray().filter(
      func(saleItem) {
        if (search.size() > 0 and not (
          saleItem.name.toLower().contains(#text (search.toLower()))
        )) {
          return false;
        };

        if (not includeInactive and not saleItem.isActive) {
          return false;
        };

        true;
      }
    );

    let totalCount = filteredSaleItems.size();
    let start = page * pageSize;
    let end = start + pageSize;
    let pageItems = safeSliceSaleItem(filteredSaleItems, start, end);

    {
      items = pageItems;
      totalCount;
    };
  };

  public shared ({ caller }) func deleteSaleItem(saleId : Nat) : async Bool {
    checkAdmin(caller);

    switch (saleItems.get(saleId)) {
      case (null) { Runtime.trap("Sale Item not found") };
      case (?_) {
        saleItems.remove(saleId);
        true;
      };
    };
  };

  public query ({ caller }) func getActiveSales() : async [SaleItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view sales");
    };

    let currentTime = getCurrentTimestamp();
    saleItems.values().toArray().filter(
      func(sale) {
        currentTime >= sale.startDate and currentTime <= sale.endDate and sale.isActive
      }
    );
  };

  public query ({ caller }) func filterProductsForSales(search : Text) : async [Product] {
    checkAdmin(caller);

    if (search.size() < 2) { return [] };

    let filteredProducts = filterProducts(search, null);
    filteredProducts.filter(
      func(product) {
        switch (product.price) {
          case (null) { false };
          case (_) { true };
        };
      }
    );
  };

  //------------------------------------
  // Store Persistence (Two Stores)
  //------------------------------------
  public type StoreDetails = {
    storeId : Nat;
    name : Text;
    address : Text;
    phone : Text;
    email : Text;
    facebook : ?Text;
    instagram : ?Text;
    website : ?Text;
    coordinates : Text;
    storeHours : [(Text, Text)];
    createdDate : Int;
    lastUpdated : Int;
    isActive : Bool;
  };

  var storeDetails = Map.empty<Nat, StoreDetails>();

  let store1Default : StoreDetails = {
    storeId = 1;
    name = "Variety Discount Store";
    address = "1460 Merritt Blvd, Dundalk, MD 21222";
    phone = "(410) 288-6792";
    email = "variety.discount.store@example.com";
    facebook = ?"/VarietyDiscountBaltimore";
    instagram = null;
    website = null;
    coordinates = "{ \"lat\": 39.266422, \"lng\": -76.505659 }";
    storeHours = [
      ("Monday", "9:00 AM - 9:00 PM"),
      ("Tuesday", "9:00 AM - 9:00 PM"),
      ("Wednesday", "9:00 AM - 9:00 PM"),
      ("Thursday", "9:00 AM - 9:00 PM"),
      ("Friday", "9:00 AM - 9:00 PM"),
      ("Saturday", "9:00 AM - 9:00 PM"),
    ];
    createdDate = 1718136388582;
    lastUpdated = 1718136388582;
    isActive = true;
  };

  let store2Default : StoreDetails = {
    storeId = 2;
    name = "Variety Discount Store II";
    address = "5850 Hollins Ferry Road, Baltimore, MD 21227";
    phone = "(443) 234-0005";
    email = "variety.discount.store2@example.com";
    facebook = ?"/VarietyDiscountBaltimore";
    instagram = null;
    website = null;
    coordinates = "{ \"lat\": 39.236383, \"lng\": -76.704709 }";
    storeHours = [
      ("Monday", "10:00 AM - 9:00 PM"),
      ("Tuesday", "10:00 AM - 9:00 PM"),
      ("Wednesday", "10:00 AM - 9:00 PM"),
      ("Thursday", "10:00 AM - 9:00 PM"),
      ("Friday", "10:00 AM - 9:00 PM"),
      ("Saturday", "10:00 AM - 9:00 PM"),
    ];
    createdDate = 1718136388582;
    lastUpdated = 1718136388582;
    isActive = true;
  };

  //------------------------------------
  // Store Management API
  //------------------------------------
  public shared ({ caller }) func getStoreDetails(storeId : Nat) : async StoreDetails {
    checkAdmin(caller); // Restrict to admin for now

    switch (storeDetails.get(storeId)) {
      case (?details) { details };
      case (null) {
        switch (storeId) {
          case (1) { store1Default };
          case (2) { store2Default };
          case (_) { Runtime.trap("Store not found") };
        };
      };
    };
  };

  public shared ({ caller }) func updateStoreDetails(storeId : Nat, details : StoreDetails) : async () {
    checkAdmin(caller); // Restrict to admin for now

    if (storeId < 1 or storeId > 2) {
      Runtime.trap("Invalid storeId: Must be 1 or 2");
    };

    let updatedDetails : StoreDetails = {
      details with lastUpdated = getCurrentTimestamp();
    };

    storeDetails.add(storeId, updatedDetails);
  };
};

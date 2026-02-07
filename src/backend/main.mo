import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";

// Specify the migration module
(with migration = Migration.run)
actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Get the caller's own profile (requires user permission)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get any user's profile (own profile or admin viewing others)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save the caller's own profile (requires user permission)
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

  var categories : Map.Map<Nat, Category> = Map.empty<Nat, Category>();
  var lastCategoryId : Nat = 0;

  func getCurrentTimestamp() : Int {
    Time.now();
  };

  public shared ({ caller }) func createCategory(name : Text, order : Nat) : async Category {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };

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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };

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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };

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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reorder categories");
    };

    for ((categoryId, order) in newOrder.values()) {
      switch (categories.get(categoryId)) {
        case (null) { Runtime.trap("Category not found: " # categoryId.toText()) };
        case (?category) {
          let updatedCategory = {
            category with
            order
          };
          categories.add(categoryId, updatedCategory);
        };
      };
    };
    true;
  };
};

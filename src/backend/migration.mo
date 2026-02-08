import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";

module {
  // Original types
  type UserProfile = {
    name : Text;
  };

  type Category = {
    categoryId : Nat;
    name : Text;
    order : Nat;
    createdDate : Int;
    lastUpdatedDate : Int;
  };

  type Product = {
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

  type SaleItem = {
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

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    categories : Map.Map<Nat, Category>;
    lastCategoryId : Nat;
    products : Map.Map<Text, Product>;
    saleItems : Map.Map<Nat, SaleItem>;
    lastSaleId : Nat;
  };

  // New types
  type StoreDetails = {
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

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    categories : Map.Map<Nat, Category>;
    lastCategoryId : Nat;
    products : Map.Map<Text, Product>;
    saleItems : Map.Map<Nat, SaleItem>;
    lastSaleId : Nat;
    storeDetails : Map.Map<Nat, StoreDetails>;
  };

  public func run(old : OldActor) : NewActor {
    { old with storeDetails = Map.empty<Nat, StoreDetails>() };
  };
};

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Category {
    categoryId: bigint;
    order: bigint;
    name: string;
    createdDate: bigint;
    lastUpdatedDate: bigint;
}
export interface CategorizedProductWithSale {
    categoryId: bigint;
    totalProducts: bigint;
    categoryName: string;
    products: Array<ProductWithSale>;
}
export interface HomepageSearchResult {
    categoryId: bigint;
    productImageUrl?: string;
    categoryName: string;
    name: string;
    salePercentage?: number;
    barcode: string;
    salePrice?: number;
    price?: number;
    saleIsActive: boolean;
}
export interface ExportPayload {
    categories: Array<Category>;
    itemCounts: {
        categories: bigint;
        products: bigint;
    };
    products: Array<ExportProduct>;
    exportTimestamp: bigint;
}
export interface StoreDetails {
    storeId: bigint;
    instagram?: string;
    name: string;
    lastUpdated: bigint;
    createdDate: bigint;
    whatsapp: string;
    storeHours: Array<[string, string]>;
    isActive: boolean;
    email: string;
    website?: string;
    facebook?: string;
    address: string;
    phone: string;
    coordinates: string;
}
export interface PaginatedResponse {
    totalCount: bigint;
    items: Array<Product>;
}
export interface ImportResult {
    importedCategoryCount: bigint;
    importedProductCount: bigint;
    errorMessages: Array<string>;
    success: boolean;
}
export interface HomepageCategoriesResult {
    categories: Array<CategorizedProductWithSale>;
    totalCategories: bigint;
}
export interface SaleItemArray {
    totalCount: bigint;
    items: Array<SaleItem>;
}
export interface ExportProduct {
    categoryId: bigint;
    inStock: boolean;
    name: string;
    createdDate: bigint;
    description?: string;
    isFeatured: boolean;
    barcode: string;
    lastUpdatedDate: bigint;
    price?: number;
}
export interface ProductWithSale {
    isOnSale: boolean;
    salePrice?: number;
    discountPercentage?: number;
    product: Product;
}
export interface ImportData {
    categories: Array<Category>;
    products: Array<Product>;
}
export interface SaleItem {
    categoryId: bigint;
    categoryName: string;
    saleId: bigint;
    endDate: bigint;
    name: string;
    createdDate: bigint;
    description?: string;
    isActive: boolean;
    barcode: string;
    lastUpdatedDate: bigint;
    salePrice: number;
    price?: number;
    discountPercentage: number;
    productBarcode: string;
    startDate: bigint;
}
export interface Product {
    categoryId: bigint;
    inStock: boolean;
    name: string;
    createdDate: bigint;
    description?: string;
    isFeatured: boolean;
    barcode: string;
    lastUpdatedDate: bigint;
    photo?: Uint8Array;
    price?: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    batchImportData(importData: ImportData): Promise<ImportResult>;
    createCategory(name: string, order: bigint): Promise<Category>;
    createProduct(barcode: string, name: string, categoryId: bigint, description: string | null, price: number | null, inStock: boolean, isFeatured: boolean, photo: Uint8Array | null): Promise<Product>;
    createSaleItem(productBarcode: string, salePrice: number, startDate: bigint, endDate: bigint): Promise<SaleItem>;
    deleteCategory(categoryId: bigint): Promise<boolean>;
    deleteProduct(barcode: string, password: string): Promise<void>;
    deleteSaleItem(saleId: bigint): Promise<boolean>;
    exportAllData(): Promise<ExportPayload>;
    filterProductsForSales(search: string): Promise<Array<Product>>;
    getActiveSales(): Promise<Array<SaleItem>>;
    getAllCategories(): Promise<Array<Category>>;
    getBothStoreDetails(): Promise<Array<[bigint, StoreDetails]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryById(categoryId: bigint): Promise<Category | null>;
    getCategoryProductCounts(): Promise<Array<[bigint, bigint]>>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getHomepageCategories(page: bigint, pageSize: bigint): Promise<HomepageCategoriesResult>;
    getProduct(barcode: string): Promise<Product>;
    getProductPhoto(barcode: string): Promise<Uint8Array>;
    getProductsPage(search: string, categoryId: bigint | null, page: bigint, pageSize: bigint): Promise<PaginatedResponse>;
    getSaleItemsPage(search: string, page: bigint, pageSize: bigint, includeInactive: boolean): Promise<SaleItemArray>;
    getStoreDetails(storeId: bigint): Promise<StoreDetails>;
    getTotalProductCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderCategories(newOrder: Array<[bigint, bigint]>): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchHomepageProducts(searchQuery: string): Promise<Array<HomepageSearchResult>>;
    toggleProductInStock(barcode: string): Promise<boolean>;
    toggleSaleItemActiveStatus(saleId: bigint): Promise<boolean>;
    updateCategory(categoryId: bigint, name: string, order: bigint): Promise<Category>;
    updateProduct(barcode: string, name: string, categoryId: bigint, description: string | null, price: number | null, inStock: boolean, isFeatured: boolean, photo: Uint8Array | null): Promise<Product>;
    updateSaleItem(saleId: bigint, salePrice: number, startDate: bigint, endDate: bigint): Promise<SaleItem>;
    updateStoreDetails(storeId: bigint, details: StoreDetails): Promise<void>;
    uploadProductPhoto(barcode: string, photo: Uint8Array): Promise<Product>;
}

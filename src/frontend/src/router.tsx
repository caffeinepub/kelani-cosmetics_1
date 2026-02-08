import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import AdminRoute from './pages/admin/AdminRoute';
import DashboardHomePage from './pages/admin/DashboardHomePage';
import ProductsPage from './pages/admin/ProductsPage';
import OnSaleProductsPage from './pages/admin/OnSaleProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import StoreDetailsPage from './pages/admin/StoreDetailsPage';
import ExportPage from './pages/admin/ExportPage';
import ImportPage from './pages/admin/ImportPage';
import PublicLayout from './layouts/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import ContactoPage from './pages/public/ContactoPage';
import PrivacyPage from './pages/public/PrivacyPage';
import CategoryPage from './pages/public/CategoryPage';
import ProductPage from './pages/public/ProductPage';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public routes with PublicLayout
const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: PublicLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/',
  component: HomePage,
});

const contactoRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/contacto',
  component: ContactoPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/privacy',
  component: PrivacyPage,
});

const categoryRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/category/$id',
  component: CategoryPage,
});

const productRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/product/$barcode',
  component: ProductPage,
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminRoute,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: DashboardHomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/products',
  component: ProductsPage,
});

const onSaleProductsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/on-sale-products',
  component: OnSaleProductsPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/categories',
  component: CategoriesPage,
});

const storeDetailsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/store-details',
  component: StoreDetailsPage,
});

const exportRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/export',
  component: ExportPage,
});

const importRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/import',
  component: ImportPage,
});

export const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    contactoRoute,
    privacyRoute,
    categoryRoute,
    productRoute,
  ]),
  adminRoute.addChildren([
    adminIndexRoute,
    productsRoute,
    onSaleProductsRoute,
    categoriesRoute,
    storeDetailsRoute,
    exportRoute,
    importRoute,
  ]),
]);

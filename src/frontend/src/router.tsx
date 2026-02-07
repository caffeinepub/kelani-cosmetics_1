import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import AdminRoute from './pages/admin/AdminRoute';
import DashboardHomePage from './pages/admin/DashboardHomePage';
import ProductsPage from './pages/admin/ProductsPage';
import OnSaleProductsPage from './pages/admin/OnSaleProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import StoreDetailsPage from './pages/admin/StoreDetailsPage';
import ExportPage from './pages/admin/ExportPage';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

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

export const routeTree = rootRoute.addChildren([
  adminRoute.addChildren([
    adminIndexRoute,
    productsRoute,
    onSaleProductsRoute,
    categoriesRoute,
    storeDetailsRoute,
    exportRoute,
  ]),
]);

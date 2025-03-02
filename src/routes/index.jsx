import { Routes, Route } from 'react-router-dom';

const AppRoutes = () => (
  <Routes>
    {/* Authentication */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* Supplier Routes */}
    <Route path="/supplier">
      <Route path="dashboard" element={<SupplierDashboard />} />
      <Route path="inventory" element={<SupplierInventory />} />
      <Route path="orders" element={<SupplierOrders />} />
    </Route>

    {/* Manufacturer Routes */}
    <Route path="/manufacturer">
      <Route path="dashboard" element={<ManufacturerDashboard />} />
      <Route path="production" element={<ProductionManagement />} />
      <Route path="quality" element={<QualityControl />} />
    </Route>

    {/* Distributor Routes */}
    <Route path="/distributor">
      <Route path="dashboard" element={<DistributorDashboard />} />
      <Route path="warehouse" element={<WarehouseManagement />} />
      <Route path="shipping" element={<ShippingManagement />} />
    </Route>

    {/* Pharmacy Routes */}
    <Route path="/pharmacy">
      <Route path="dashboard" element={<PharmacyDashboard />} />
      <Route path="inventory" element={<PharmacyInventory />} />
      <Route path="orders" element={<PharmacyOrders />} />
    </Route>

    {/* Common Routes */}
    <Route path="/tracking" element={<ProductTracking />} />
    <Route path="/profile" element={<UserProfile />} />
    
    {/* Admin Routes */}
    <Route path="/admin">
      <Route path="users" element={<UserManagement />} />
      <Route path="settings" element={<SystemSettings />} />
    </Route>
  </Routes>
);

export default AppRoutes;
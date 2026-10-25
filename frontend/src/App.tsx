import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainPage } from './pages/MainPage';
import { ItemCreatePage } from './pages/ItemCreatePage';
import { LoginPage } from './pages/LoginPage';
import { UserCreatePage } from './pages/UserCreatePage';
import { UserDetailPage } from './pages/UserDetailPage';
import { ShelfDetailPage } from './pages/ShelfDetailPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { AllItemsPage } from './pages/AllItemsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/items/new" element={<ItemCreatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/users/new" element={<UserCreatePage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/shelves/:id" element={<ShelfDetailPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/items" element={<AllItemsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;


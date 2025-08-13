import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import Notification from './Notification';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-craft-50 via-earth-50 to-warm-50 flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <Notification />
    </div>
  );
};

export default Layout;

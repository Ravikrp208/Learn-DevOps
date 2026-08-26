import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import AIAssistant from "../components/AIAssistant";
import "./globals.css";

export const metadata = {
  title: "GEN AI - Premium Crimson Shop",
  description: "A premium shopping experience featuring hand-crafted sneakers, tech items, timepieces, and accessories in stunning crimson design.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                var unregistered = false;
                var promises = registrations.map(function(reg) {
                  return reg.unregister().then(function(success) {
                    if (success) unregistered = true;
                  });
                });
                Promise.all(promises).then(function() {
                  if (unregistered) {
                    window.location.reload();
                  }
                });
              });
            }
          `
        }} />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <AIAssistant />
        </CartProvider>
      </body>
    </html>
  );
}

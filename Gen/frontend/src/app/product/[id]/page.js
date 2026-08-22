import ProductDetailClient from "./ProductDetailClient";
import { products } from "../../../data/products";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default async function ProductPage({ params }) {
  // Await params to handle Next.js 15 promise-based params safely, 
  // which works as a standard object in Next.js 13/14 too.
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div style={styles.notFound}>
        <HelpCircle size={64} color="var(--primary)" style={{ marginBottom: 16 }} />
        <h2>Product Not Found</h2>
        <p style={{ color: "var(--text-muted)", margin: "8px 0 24px 0" }}>
          The product you are looking for does not exist or has been removed from our inventory.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}

const styles = {
  notFound: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "24px",
  },
};
export const dynamicParams = true;

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

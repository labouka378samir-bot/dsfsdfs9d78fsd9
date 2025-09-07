import React from 'react';
import { Layout } from '../components/Layout/Layout';
import { ProductGrid } from '../components/Product/ProductGrid';

export function HomePage() {
  return (
    <Layout>
      <ProductGrid />
    </Layout>
  );
}
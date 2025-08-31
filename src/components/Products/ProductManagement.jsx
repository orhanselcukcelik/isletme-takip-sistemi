import React from "react";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

export default function ProductManagement({
  newProduct, setNewProduct, productsLoading,
  sortedProducts, sortType, setSortType,
  editingProduct, editForm, setEditForm,
  onAddProduct, onToggleFavorite, onStartEditProduct, onCancelEditProduct, onSaveEditProduct, onDeleteProduct
}) {
  return (
    <div>
      <ProductForm newProduct={newProduct} setNewProduct={setNewProduct} onAdd={onAddProduct} loading={productsLoading} />
      <ProductTable
        sortedProducts={sortedProducts}
        sortType={sortType} setSortType={setSortType}
        editingProduct={editingProduct} editForm={editForm} setEditForm={setEditForm}
        onToggleFavorite={onToggleFavorite}
        onStartEdit={onStartEditProduct}
        onCancelEdit={onCancelEditProduct}
        onSaveEdit={onSaveEditProduct}
        onDelete={onDeleteProduct}
      />
    </div>
  );
}

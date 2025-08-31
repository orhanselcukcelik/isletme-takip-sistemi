import React from "react";
import { Plus } from "lucide-react";

export default function ProductForm({ newProduct, setNewProduct, onAdd, loading }) {
  return (
    <div className="content-card">
      <div className="content-header"><h2>Yeni Ürün Ekle</h2></div>
      <div className="content-body">
        <div className="form-row">
          <input type="text" placeholder="Ürün adı" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="form-input" />
          <input type="number" placeholder="Maliyet fiyatı (₺)" value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })} className="form-input" />
          <input type="number" placeholder="Satış fiyatı (₺)" value={newProduct.sellPrice} onChange={e => setNewProduct({ ...newProduct, sellPrice: e.target.value })} className="form-input" />
          <input type="number" placeholder="Vergi oranı (%)" value={newProduct.taxRate} onChange={e => setNewProduct({ ...newProduct, taxRate: e.target.value })} className="form-input" />
          <input type="number" placeholder="Stok adedi" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="form-input" />
          <button onClick={onAdd} className="btn btn-primary" disabled={loading}>
            <Plus className="btn-icon" /> {loading ? "Ekleniyor..." : "Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}

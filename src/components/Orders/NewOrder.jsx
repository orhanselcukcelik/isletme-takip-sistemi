import React from "react";
import { ShoppingCart, Star } from "lucide-react";
import { isLowStock, formatCurrency } from "../../utils/calculations";

export default function NewOrder({
  products, selectedProducts, setSelectedProducts,
  onToggleFavorite, onAddOrder, loading
}) {
  return (
    <div className="content-card">
      <div className="content-body">
        <div className="products-grid">
          {products.map(p => (
            <div key={p.id} className={`product-card ${p.isFavorite ? 'product-card-favorite' : ''} ${isLowStock(p.stock) ? 'product-card-low-stock' : ''}`}>
              <div className="product-header">
                <h3>{p.name}</h3>
                <button onClick={() => onToggleFavorite(p.id, p.isFavorite)} className="favorite-btn-small" aria-label={p.isFavorite ? "Favoriden çıkar" : "Favoriye ekle"}>
                  <Star size={16} className={p.isFavorite ? "star-filled" : "star-empty"} fill={p.isFavorite ? "#fbbf24" : "none"} />
                </button>
              </div>
              <p className="product-price">Fiyat: {formatCurrency(p.sellPrice)}</p>
              <p className="product-stock">Stok: {p.stock} adet</p>
              <div className="quantity-input">
                <label>Adet:</label>
                <input
                  type="number" min="0" max={p.stock}
                  value={selectedProducts[p.id] ?? ""}
                  onChange={e => {
                    const raw = e.target.value;
                    const v = raw === "" ? 0 : Math.max(0, Math.floor(Number(raw)));
                    if (v <= p.stock) setSelectedProducts(prev => ({ ...prev, [p.id]: v }));
                  }}
                  className="quantity-field"
                />
              </div>
              {isLowStock(p.stock) && <div className="stock-warning">⚠️ Stok az!</div>}
            </div>
          ))}
        </div>

        <button onClick={onAddOrder} className="btn btn-success btn-large" disabled={loading}>
          <ShoppingCart className="btn-icon" /> {loading ? "Kaydediliyor..." : "Siparişi Kaydet"}
        </button>
      </div>
    </div>
  );
}

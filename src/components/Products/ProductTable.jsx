import React from "react";
import { Star, Edit2, Trash2, Check, X } from "lucide-react";
import { formatCurrency, calculateProfitMargin, isLowStock } from "../../utils/calculations";

export default function ProductTable({
  sortedProducts, sortType, setSortType,
  editingProduct, editForm, setEditForm,
  onToggleFavorite, onStartEdit, onCancelEdit, onSaveEdit, onDelete
}) {
  return (
    <div className="content-card">
      <div className="content-header">
        <h2>Ürün Listesi</h2>
        <div className="sort-controls">
          <label htmlFor="sortSelect">Sıralama:</label>
          <select id="sortSelect" value={sortType} onChange={e => setSortType(e.target.value)} className="sort-select">
            <option value="default">Varsayılan</option>
            <option value="stock-asc">Stok Sayısı (Az → Çok)</option>
            <option value="profit-margin-asc">Kar Marjı (Az → Çok)</option>
          </select>
        </div>
      </div>

      <div className="content-body">
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Favori</th><th>Ürün Adı</th><th>Maliyet</th><th>Satış Fiyatı</th><th>Vergi Oranı</th><th>Stok</th><th>Kar Marjı</th><th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map(p => {
                const isEditing = editingProduct === p.id;
                const margin = calculateProfitMargin(p.costPrice, p.sellPrice);
                return (
                  <tr key={p.id}>
                    <td>
                      <button onClick={() => onToggleFavorite(p.id, p.isFavorite)} className="favorite-btn" aria-label={p.isFavorite ? "Favoriden çıkar" : "Favoriye ekle"}>
                        <Star size={20} className={p.isFavorite ? "star-filled" : "star-empty"} fill={p.isFavorite ? "#fbbf24" : "none"} />
                      </button>
                    </td>

                    <td className={p.isFavorite ? "favorite-product" : ""}>
                      {isEditing ? <input type="text" className="edit-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /> : p.name}
                    </td>

                    <td>{isEditing ? <input type="number" className="edit-input" value={editForm.costPrice} onChange={e => setEditForm({ ...editForm, costPrice: e.target.value })} /> : formatCurrency(p.costPrice)}</td>
                    <td>{isEditing ? <input type="number" className="edit-input" value={editForm.sellPrice} onChange={e => setEditForm({ ...editForm, sellPrice: e.target.value })} /> : formatCurrency(p.sellPrice)}</td>
                    <td>{isEditing ? <input type="number" className="edit-input" value={editForm.taxRate} onChange={e => setEditForm({ ...editForm, taxRate: e.target.value })} /> : `%${p.taxRate}`}</td>

                    <td className={isLowStock(p.stock) ? "low-stock" : ""}>
                      {isEditing ? <input type="number" className="edit-input" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} /> : p.stock}
                    </td>

                    <td className="profit">%{margin.toFixed(1)}</td>

                    <td>
                      <div className="action-buttons">
                        {isEditing ? (
                          <>
                            <button onClick={onSaveEdit} className="btn-save" title="Kaydet"><Check size={16} /></button>
                            <button onClick={onCancelEdit} className="btn-cancel" title="İptal"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => onStartEdit(p)} className="btn-edit" title="Düzenle"><Edit2 size={16} /></button>
                            <button onClick={() => onDelete(p.id)} className="btn-delete" title="Sil"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

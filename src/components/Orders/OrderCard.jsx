import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { formatCurrency } from "../../utils/calculations";

export default function OrderCard({
  order, isEditing, editOrderDate, setEditOrderDate,
  editOrderForm, setEditOrderForm,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete
}) {
  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-info">
          <h3>Sipariş #{order.id}</h3>
          {isEditing ? (
            <input type="datetime-local" value={editOrderDate} onChange={e => setEditOrderDate(e.target.value)} className="order-date-input" />
          ) : (
            <p className="order-date">{new Date(order.date).toLocaleString("tr-TR")}</p>
          )}
        </div>

        <div className="order-summary">
          <p className="order-total">{formatCurrency(order.totalRevenue)}</p>
          <p className="order-profit">Kar: {formatCurrency(order.profit)}</p>
        </div>

        <div className="order-actions">
          {isEditing ? (
            <>
              <button onClick={onSaveEdit} className="btn-save" title="Kaydet"><Check size={16} /></button>
              <button onClick={onCancelEdit} className="btn-cancel" title="İptal"><X size={16} /></button>
            </>
          ) : (
            <>
              <button onClick={() => onStartEdit(order)} className="btn-edit" title="Düzenle"><Edit2 size={16} /></button>
              <button onClick={() => onDelete(order.id)} className="btn-delete" title="Sil"><Trash2 size={16} /></button>
            </>
          )}
        </div>
      </div>

      <div className="order-items">
        {isEditing ? (
          editOrderForm.map((item, i) => (
            <div key={i} className="order-item order-item-edit">
              <span className="item-name">{item.productName}</span>
              <div className="item-quantity">
                <label>Adet:</label>
                <input
                  type="number" min="1" value={item.quantity}
                  onChange={e => {
                    const q = Math.max(1, parseInt(e.target.value) || 1);
                    const next = [...editOrderForm]; next[i] = { ...item, quantity: q }; setEditOrderForm(next);
                  }}
                  className="quantity-edit-input"
                />
              </div>
              <span className="item-total">{formatCurrency(item.sellPrice * item.quantity)}</span>
            </div>
          ))
        ) : (
          order.items.map((it, idx) => (
            <div key={idx} className="order-item">
              <span>{it.productName} x{it.quantity}</span>
              <span>{formatCurrency(it.totalRevenue)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

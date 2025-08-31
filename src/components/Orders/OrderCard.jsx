import React from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { formatCurrency } from "../../utils/calculations";
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "../../utils/constants";

export default function OrderCard({
  order, isEditing, editOrderDate, setEditOrderDate,
  editOrderForm, setEditOrderForm,
  editOrderStatus, setEditOrderStatus, // Yeni prop'lar
  onStartEdit, onSaveEdit, onCancelEdit, onDelete,
  onToggleStatus // Yeni prop
}) {
  const handleStatusToggle = (e) => {
    e.stopPropagation(); // Kart tıklamasını engelle
    onToggleStatus(order.id);
  };

  // Sipariş durumunu al (eski siparişler için varsayılan)
  const currentStatus = order.status || ORDER_STATUS.UNPAID;

  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-info">
          <div className="order-title-row">
            <h3>Sipariş #{order.id}</h3>
            
            {/* Sipariş Durumu Badge'i */}
            {!isEditing && (
              <button
                onClick={handleStatusToggle}
                className={`status-badge status-${ORDER_STATUS_COLORS[currentStatus]}`}
                title="Durumu değiştirmek için tıklayın"
              >
                {ORDER_STATUS_LABELS[currentStatus]}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="edit-controls">
              <input 
                type="datetime-local" 
                value={editOrderDate} 
                onChange={e => setEditOrderDate(e.target.value)} 
                className="order-date-input" 
              />
              
              {/* Düzenleme modunda durum seçici */}
              <div className="edit-status-selector">
                <label>Durum:</label>
                <select
                  value={editOrderStatus}
                  onChange={(e) => setEditOrderStatus(e.target.value)}
                  className="status-select"
                >
                  <option value={ORDER_STATUS.UNPAID}>
                    {ORDER_STATUS_LABELS[ORDER_STATUS.UNPAID]}
                  </option>
                  <option value={ORDER_STATUS.PAID}>
                    {ORDER_STATUS_LABELS[ORDER_STATUS.PAID]}
                  </option>
                </select>
              </div>
            </div>
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

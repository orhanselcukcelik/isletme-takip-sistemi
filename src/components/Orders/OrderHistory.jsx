import React from "react";
import OrderCard from "./OrderCard";

export default function OrderHistory({
  orders, editingOrder, editOrderForm, setEditOrderForm, editOrderDate, setEditOrderDate,
  editOrderStatus, setEditOrderStatus, // Yeni prop'lar
  onStartEditOrder, onSaveEditOrder, onCancelEditOrder, onDeleteOrder,
  onToggleOrderStatus // Yeni prop
}) {
  if (orders.length === 0) return <div className="content-card"><div className="content-body"><p className="no-orders">Henüz sipariş kaydı bulunmuyor.</p></div></div>;

  return (
    <div className="content-card">
      <div className="content-body">
        <div className="orders-list">
          {orders.map(o => (
            <OrderCard
              key={o.id}
              order={o}
              isEditing={editingOrder === o.id}
              editOrderDate={editOrderDate}
              setEditOrderDate={setEditOrderDate}
              editOrderForm={editOrderForm}
              setEditOrderForm={setEditOrderForm}
              editOrderStatus={editOrderStatus} // Yeni prop
              setEditOrderStatus={setEditOrderStatus} // Yeni prop
              onStartEdit={onStartEditOrder}
              onSaveEdit={onSaveEditOrder}
              onCancelEdit={onCancelEditOrder}
              onDelete={onDeleteOrder}
              onToggleStatus={onToggleOrderStatus} // Yeni prop
            />
          ))}
        </div>
      </div>
    </div>
  );
}

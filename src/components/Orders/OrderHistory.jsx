import React from "react";
import OrderCard from "./OrderCard";

export default function OrderHistory({
  orders, editingOrder, editOrderForm, setEditOrderForm, editOrderDate, setEditOrderDate,
  onStartEditOrder, onSaveEditOrder, onCancelEditOrder, onDeleteOrder
}) {
  if (orders.length === 0) return <div className="content-card"><div className="content-body"><p className="no-orders">Henüz sipariş kaydı bulunmuyor.</p></div></div>;

  return (
    <div className="content-card">
      <div className="content-body">
        <div className="orders-list">
          {orders.slice().reverse().map(o => (
            <OrderCard
              key={o.id}
              order={o}
              isEditing={editingOrder === o.id}
              editOrderDate={editOrderDate}
              setEditOrderDate={setEditOrderDate}
              editOrderForm={editOrderForm}
              setEditOrderForm={setEditOrderForm}
              onStartEdit={onStartEditOrder}
              onSaveEdit={onSaveEditOrder}
              onCancelEdit={onCancelEditOrder}
              onDelete={onDeleteOrder}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import NewOrder from "./NewOrder";
import OrderHistory from "./OrderHistory";
import { ORDER_SUB_TABS } from "../../utils/constants";

export default function OrderManagement({
  activeSubTab, setActiveSubTab,
  products, selectedProducts, setSelectedProducts, onToggleFavorite,
  orders, ordersLoading,
  editingOrder, editOrderForm, setEditOrderForm, editOrderDate, setEditOrderDate,
  editOrderStatus, setEditOrderStatus, // Yeni prop'lar
  newOrderStatus, setNewOrderStatus, // Yeni prop'lar
  onAddOrder, onDeleteOrder, onStartEditOrder, onSaveEditOrder, onCancelEditOrder,
  onToggleOrderStatus // Yeni prop
}) {
  return (
    <div>
      <div className="sub-tabs">
        <button onClick={() => setActiveSubTab(ORDER_SUB_TABS.NEW_ORDER)} className={`sub-tab ${activeSubTab === ORDER_SUB_TABS.NEW_ORDER ? "active" : ""}`}>Sipariş Ver</button>
        <button onClick={() => setActiveSubTab(ORDER_SUB_TABS.ORDER_HISTORY)} className={`sub-tab ${activeSubTab === ORDER_SUB_TABS.ORDER_HISTORY ? "active" : ""}`}>Sipariş Geçmişi</button>
      </div>

      {activeSubTab === ORDER_SUB_TABS.NEW_ORDER && (
        <NewOrder
          products={products}
          selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts}
          onToggleFavorite={onToggleFavorite}
          onAddOrder={onAddOrder}
          loading={ordersLoading}
          newOrderStatus={newOrderStatus} setNewOrderStatus={setNewOrderStatus} // Yeni prop'lar
        />
      )}

      {activeSubTab === ORDER_SUB_TABS.ORDER_HISTORY && (
        <OrderHistory
          orders={orders}
          editingOrder={editingOrder}
          editOrderForm={editOrderForm} setEditOrderForm={setEditOrderForm}
          editOrderDate={editOrderDate} setEditOrderDate={setEditOrderDate}
          editOrderStatus={editOrderStatus} setEditOrderStatus={setEditOrderStatus} // Yeni prop'lar
          onStartEditOrder={onStartEditOrder}
          onSaveEditOrder={onSaveEditOrder}
          onCancelEditOrder={onCancelEditOrder}
          onDeleteOrder={onDeleteOrder}
          onToggleOrderStatus={onToggleOrderStatus} // Yeni prop
        />
      )}
    </div>
  );
}

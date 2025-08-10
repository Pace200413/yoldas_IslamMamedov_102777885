// context/OrderContext.js
import React, { createContext, useReducer, useContext } from 'react';

const OrderContext = createContext();
const stages = ['Preparing', 'Cooking', 'On the way', 'Delivered'];

function orderReducer(state, action) {
  switch (action.type) {
    case 'PLACE':
      return {
        order: {
          id: Date.now().toString(),
          items: action.payload.items,
          total: action.payload.total,
          stageIndex: 0,
        },
      };
    case 'ADVANCE':
      if (!state.order) return state;
      return {
        order: {
          ...state.order,
          stageIndex: Math.min(state.order.stageIndex + 1, stages.length - 1),
        },
      };
    case 'CLEAR':
      return { order: null };
    default:
      return state;
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, { order: null });
  return (
    <OrderContext.Provider value={{ order: state.order, dispatch, stages }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be inside an <OrderProvider>');
  return ctx;
}

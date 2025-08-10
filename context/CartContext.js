import React, { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();
const DispatchCtx = createContext();

const initialState = { items: [], total: 0 };

const makeKey = (p) => {
  const parts = (p.customizations || [])
    .map(c => `${c.groupId}:${c.optionId}`)
    .sort()
    .join('|');
  return `${p.id}#${parts}`;
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const payload = action.payload;
      const key = payload.lineKey || makeKey(payload);

      const idx = state.items.findIndex(i => i.lineKey === key);
      const unit = Number(payload.price);

      if (idx !== -1) {
        const items = [...state.items];
        items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 };
        return { items, total: state.total + unit };
      }

      return {
        items: [...state.items, { ...payload, lineKey: key, qty: 1 }],
        total: state.total + unit,
      };
    }

    case 'REMOVE': {
      const { id, customizations, lineKey } = action.payload ?? {};
      const key = lineKey ?? makeKey({ id, customizations: customizations || [] });

      const idx = state.items.findIndex(i => i.lineKey === key)
              ?? state.items.findIndex(i => i.id === id); // fallback
      if (idx === -1) return state;

      const target   = state.items[idx];
      const newQty   = (target.qty || 1) - 1;
      const newTotal = state.total - Number(target.price);

      const items =
        newQty > 0
          ? state.items.map(i => (i.lineKey === target.lineKey ? { ...i, qty: newQty } : i))
          : state.items.filter(i => i.lineKey !== target.lineKey);

      return { items, total: Math.max(0, newTotal) };
    }

    case 'CLEAR':
    case 'PLACE':
      return initialState;

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  const state    = useContext(CartContext);
  const dispatch = useContext(DispatchCtx);

  const add    = (item)                  => dispatch({ type: 'ADD',    payload: item });
  const remove = (id, customizations=[]) => dispatch({ type: 'REMOVE', payload: { id, customizations } });
  const clear  = ()                      => dispatch({ type: 'CLEAR' });

  return { ...state, add, remove, clear };
}

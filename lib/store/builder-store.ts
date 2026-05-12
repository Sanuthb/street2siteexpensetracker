import { create } from 'zustand';

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
};

interface BuilderState {
  items: LineItem[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  
  addItem: () => void;
  updateItem: (id: string, field: keyof LineItem, value: string | number) => void;
  removeItem: (id: string) => void;
  calculateTotals: () => void;
  setItems: (items: LineItem[]) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  items: [],
  subTotal: 0,
  taxTotal: 0,
  grandTotal: 0,

  addItem: () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      amount: 0,
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  updateItem: (id, field, value) => {
    set((state) => {
      const newItems = state.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Auto-calculate amount
          if (field === 'quantity' || field === 'unitPrice') {
             updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      });
      return { items: newItems };
    });
    get().calculateTotals();
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    get().calculateTotals();
  },

  calculateTotals: () => {
    const { items } = get();
    let subTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      subTotal += amount;
      taxTotal += amount * (Number(item.taxRate) / 100);
    });

    set({ subTotal, taxTotal, grandTotal: subTotal + taxTotal });
  },

  setItems: (items) => {
    set({ items });
    get().calculateTotals();
  },

  reset: () => set({ items: [], subTotal: 0, taxTotal: 0, grandTotal: 0 }),
}));

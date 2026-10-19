import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FiltersState {
  q: string;
  category: string;
  paymentMethod: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date' | 'amount';
  order: 'asc' | 'desc';
  page: number;
  limit: number;
}

export const initialFilters: FiltersState = {
  q: '',
  category: '',
  paymentMethod: '',
  from: '',
  to: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFilters,
  reducers: {
    // Change any filter or sort option. Going back to page 1 is important:
    // page 5 of the old results may not exist in the new results.
    setFilter(state, action: PayloadAction<Partial<Omit<FiltersState, 'page'>>>) {
      Object.assign(state, action.payload);
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters() {
      return initialFilters;
    },
  },
});

export const { setFilter, setPage, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;

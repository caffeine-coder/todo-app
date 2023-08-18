import { createSlice } from '@reduxjs/toolkit';

const todoSlice = createSlice(
  {
    name: 'todo',
    initialState: [],
    reducers: {
      addAll(state, action) {
        while (state.length > 0) {
          state.pop();
        }
        action.payload.forEach((todo) => state.push(todo));
      },
      insertTodo(state, action) {
        state.push(action.payload);
      },
      updateTodo(state, action) {
        // state.splice(state.findIndex((todo) => todo.id === action.payload.id), 1);
        // state.push(action.payload);
        return state.map((todo) => (todo.id === action.payload.id ? action.payload
          : todo));
      },
      remove(state, action) {
        state.splice(state.findIndex((todo) => todo.id === action.payload), 1);
      },
    },
  },
);

export const {
  addAll, remove, insertTodo, updateTodo,
} = todoSlice.actions;
export default todoSlice.reducer;

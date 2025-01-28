import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 2182;

export const getTodos = (USER_ID: number) => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const createTodo = (todo: Omit<Todo, 'id'>) => {
  return client.post<Todo>('/todos', todo);
};

export const updateTodo = (id: number, todo: Partial<Todo>) => {
  return client.patch<Todo>(`/todos/${id}`, todo);
};

export const deleteTodo = (id: number) => {
  return client.delete(`/todos/${id}`);
};

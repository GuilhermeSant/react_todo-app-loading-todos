import React, { useState, useEffect, useRef } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID, getTodos, createTodo, updateTodo, deleteTodo } from './api/todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    setLoading(true);
    getTodos(USER_ID)
      .then(setTodos)
      .catch(() => setError('Unable to load todos'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleAddTodo = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTodo.trim()) {
      setError('Title should not be empty');
      return;
    }

    setError(''); // Hide error before new request
    setLoading(true);
    createTodo({
      userId: USER_ID,
      title: newTodo.trim(),
      completed: false,
    })
      .then(todo => setTodos([...todos, todo]))
      .catch(() => setError('Unable to add a todo'))
      .finally(() => {
        setLoading(false);
        setNewTodo('');
      });
  };

  const handleToggleTodo = (id: number) => {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return;

    setError(''); // Hide error before new request
    setLoading(true);
    updateTodo(id, { completed: !todo.completed })
      .then(updatedTodo => {
        setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
      })
      .catch(() => setError('Unable to update a todo'))
      .finally(() => setLoading(false));
  };

  const handleDeleteTodo = (id: number) => {
    setError(''); // Hide error before new request
    setLoading(true);
    deleteTodo(id)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
      })
      .catch(() => setError('Unable to delete a todo'))
      .finally(() => setLoading(false));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return true;
  });

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={`todoapp__toggle-all ${todos.every(todo => todo.completed) ? 'active' : ''}`}
            data-cy="ToggleAllButton"
            onClick={() => {
              const allCompleted = todos.every(todo => todo.completed);
              todos.forEach(todo => handleToggleTodo(todo.id));
            }}
            disabled={loading}
          />

          <form onSubmit={handleAddTodo}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              ref={inputRef}
              disabled={loading}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodos.map(todo => (
            <div key={todo.id} data-cy="Todo" className={`todo ${todo.completed ? 'completed' : ''}`}>
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  disabled={loading}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => handleDeleteTodo(todo.id)}
                disabled={loading}
              >
                ×
              </button>

              {loading && (
                <div data-cy="TodoLoader" className="modal overlay is-active">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              )}
            </div>
          ))}
        </section>

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => setFilter('all')}
              >
                All
              </a>
              <a
                href="#/active"
                className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => setFilter('active')}
              >
                Active
              </a>
              <a
                href="#/completed"
                className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilter('completed')}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={() => todos.filter(todo => todo.completed).forEach(todo => handleDeleteTodo(todo.id))}
              disabled={loading || todos.every(todo => !todo.completed)}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal closehidden ${error ? '' : 'hidden'}`}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" onClick={() => setError('')} />
        {error}
      </div>
    </div>
  );
};
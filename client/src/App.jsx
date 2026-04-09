import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    setAdding(true);
    try {
      const response = await axios.post(API_URL, { title: newTodo });
      setTodos([response.data, ...todos]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setAdding(false);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      // Optimistic update
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
      await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
    } catch (error) {
      console.error('Error toggling todo:', error);
      // Revert on error
      fetchTodos();
    }
  };

  const deleteTodo = async (id) => {
    try {
      setTodos(todos.filter(t => t.id !== id));
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting todo:', error);
      fetchTodos();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl glass-panel p-6 md:p-10 transform transition-all mt-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-teal-400 bg-clip-text text-transparent">
            Task Master
          </h1>
          <p className="text-slate-400 mt-2">Manage your tasks with elegance and speed.</p>
        </header>

        <form onSubmit={addTodo} className="flex gap-3 mb-10">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-dark-900 border border-dark-700 text-slate-100 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-500"
            disabled={adding}
          />
          <button 
            type="submit" 
            disabled={adding || !newTodo.trim()} 
            className="btn-primary flex items-center justify-center min-w-[60px]"
          >
            {adding ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
          </button>
        </form>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-10 text-slate-500 border border-dashed border-dark-700 rounded-xl">
              No tasks yet. Add one above!
            </div>
          ) : (
            todos.map(todo => (
              <div 
                key={todo.id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group ${
                  todo.completed 
                    ? 'bg-dark-800/40 border-dark-700/50 opacity-70' 
                    : 'bg-dark-800 border-dark-700 hover:border-primary-500/50 hover:-translate-y-0.5'
                }`}
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                >
                  <button className="text-slate-400 hover:text-primary-500 transition-colors focus:outline-none">
                    {todo.completed ? (
                      <CheckCircle2 className="text-primary-500" size={24} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  <span className={`text-lg transition-all duration-300 ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {todo.title}
                  </span>
                </div>
                
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:outline-none p-2 rounded-lg hover:bg-dark-700/50"
                  aria-label="Delete task"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

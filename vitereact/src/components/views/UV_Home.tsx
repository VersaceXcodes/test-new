import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Task, CreateTaskInput } from '@schema';

const UV_Home: React.FC = () => {
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);

  const queryClient = useQueryClient();
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('incomplete');

  const fetchTasks = useQuery({
    queryKey: ['tasks', currentUser?.id, searchQuery, filterStatus],
    queryFn: async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks`, {
      params: {
        search_query: searchQuery,
        filter_status: filterStatus,
      },
      headers: { Authorization: `Bearer ${authToken}` },
    });
      return data;
    },
    enabled: !!authToken && !!currentUser,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const createTask = useMutation((newTask: CreateTaskInput) =>
    axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks`, newTask, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  );

  const updateTask = useMutation(
    (updatedTask: { task_id: string; is_complete: boolean }) =>
      axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${updatedTask.task_id}`, 
        { is_complete: updatedTask.is_complete },
        { headers: { Authorization: `Bearer ${authToken}` } }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
      }
    }
  );

  const deleteTask = useMutation(
    (taskId: string) =>
      axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
      }
    }
  );

  const handleAddTask = () => {
    if (!taskName.trim()) return;
    
    createTask.mutate(
      { task_name: taskName.trim(), due_date: dueDate || null, is_complete: false },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['tasks', currentUser?.id, searchQuery, filterStatus]);
          setTaskName('');
          setDueDate('');
        },
      }
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome {currentUser?.name}</h1>
          <div className="space-y-6 mb-12">
            <div>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Enter task name"
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 mb-4"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 mb-4"
              />
              <button
                onClick={handleAddTask}
                disabled={!taskName.trim() || createTask.isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200"
              >
                {createTask.isLoading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks"
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 mt-4"
              >
                <option value="incomplete">Incomplete Tasks</option>
                <option value="complete">Complete Tasks</option>
              </select>
            </div>
          </div>

          {!fetchTasks.isFetching && fetchTasks.data ? (
            <ul className="space-y-4">
              {fetchTasks.data.map((task: Task) => (
                <li key={task.task_id} className={`flex justify-between items-center p-4 rounded-lg shadow-lg ${task.is_complete ? 'bg-gray-100 opacity-75' : 'bg-white'}`}>
                  <div>
                    <h2 className={`text-xl font-bold ${task.is_complete ? 'line-through text-gray-600' : ''}`}>{task.task_name}</h2>
                    <p className="text-sm text-gray-600">
                      {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                      {task.is_complete && <span className="ml-2 text-green-600 font-medium">✓ Completed</span>}
                    </p>
                  </div>
                  <div className="space-x-4">
                    {!task.is_complete && (
                      <button 
                        onClick={() => updateTask.mutate({ task_id: task.task_id, is_complete: true })}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={updateTask.isLoading}
                      >
                        Mark Complete
                      </button>
                    )}
                    <Link 
                      to={`/task/${task.task_id}`}
                      className="text-green-600 hover:text-green-800"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          deleteTask.mutate(task.task_id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteTask.isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading tasks...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_Home;
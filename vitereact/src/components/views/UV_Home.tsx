import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Task, CreateTaskInput } from '@/DB:zodschemas';

const UV_Home: React.FC = () => {
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);

  const queryClient = useQueryClient();
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('incomplete');

  const fetchTasks = useQuery(['tasks', currentUser?.id, searchQuery, filterStatus], async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks`, {
      params: {
        user_id: currentUser?.id,
        search_query: searchQuery,
        filter_status: filterStatus,
      },
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return data;
  });

  const createTask = useMutation((newTask: CreateTaskInput) =>
    axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks`, newTask, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  );

  const handleAddTask = () => {
    createTask.mutate(
      { user_id: currentUser?.id!, task_name: taskName, due_date: dueDate, is_complete: false },
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
              >
                Add Task
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
                <li key={task.task_id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-lg">
                  <div>
                    <h2 className="text-xl font-bold">{task.task_name}</h2>
                    <p className="text-sm text-gray-600">{task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}</p>
                  </div>
                  <div className="space-x-4">
                    <button className="text-blue-600 hover:text-blue-800">Mark Complete</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
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
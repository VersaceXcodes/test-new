import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, updateTaskInputSchema } from '@/schema';
import { useAppStore } from '@/store/main';

const fetchTaskDetails = async (task_id: string, authToken: string | null) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return data;
};

const UV_TaskDetails: React.FC = () => {
  const { task_id } = useParams();
  const queryClient = useQueryClient();

  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data, error, isLoading } = useQuery<Task, Error>({
    queryKey: ['task', task_id],
    queryFn: () => fetchTaskDetails(task_id!, authToken),
    enabled: !!task_id && !!authToken,
  });

  useEffect(() => {
    if (data) {
      setTaskName(data.task_name);
      setDueDate(data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : '');
      setIsComplete(data.is_complete);
    }
  }, [data]);

  const updateTaskMutation = useMutation({
    mutationFn: async (values: { task_name: string; due_date: string; is_complete: boolean }) => {
      const validatedInput = updateTaskInputSchema.parse({
        task_id,
        task_name: values.task_name,
        due_date: values.due_date,
        is_complete: values.is_complete,
      });
      return axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`,
        validatedInput,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task_id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleSave = async () => {
    try {
      await updateTaskMutation.mutateAsync({ task_name: taskName, due_date: dueDate, is_complete: isComplete });
      setValidationError(null);
    } catch (error: any) {
      setValidationError(error?.response?.data?.message || 'Failed to update the task.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTaskMutation.mutateAsync();
    }
  };

  if (isLoading) {
    return <div>Loading task details...</div>;
  }

  if (error || !data) {
    return <div>Error loading task details or task does not exist.</div>;
  }

  return (
    <>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Task Details</h2>

          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
              <p>{validationError}</p>
            </div>
          )}

          <label className="block mb-4">
            <span className="text-gray-700">Task Name</span>
            <input
              type="text"
              value={taskName}
              onChange={(e) => { setTaskName(e.target.value); setValidationError(null); }}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700">Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); setValidationError(null); }}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={isComplete}
              onChange={() => setIsComplete(!isComplete)}
              className="form-checkbox mr-2"
            />
            <span className="text-gray-700">Complete</span>
          </label>

          <div className="flex justify-between">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Save
            </button>
            <Link to="/" className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200">
              Cancel
            </Link>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_TaskDetails;
// src/component/ConfirmDialog.js
import React from 'react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'bg-red-500 hover:bg-red-600',
  cancelColor = 'bg-gray-300 hover:bg-gray-400 text-gray-800'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${cancelColor}`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  console.error(error);

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'An unexpected error has occurred.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'An unexpected error has occurred.';
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">Oops!</h1>
        <p className="text-2xl text-gray-800 dark:text-gray-200 mb-2">Sorry, an unexpected error has occurred.</p>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          <i>{errorMessage}</i>
        </p>
        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

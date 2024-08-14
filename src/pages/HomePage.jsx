import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4 text-center">Video Tools</h1>
            <p className="text-gray-200 mb-8 text-center max-w-md">
                simple browser-based tools to help you work with videos.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                    to="/compress"
                    className="bg-blue-700 text-white border border-blue-600 px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-center"
                >
                    <span className="text-sm sm:text-base">compress video</span>
                </Link>
                <div className="bg-gray-700 text-gray-300 border border-gray-600 px-4 sm:px-6 py-3 rounded-lg opacity-50 cursor-not-allowed text-center">
                    <span className="text-sm sm:text-base">coming soon...</span>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
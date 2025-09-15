import { useState } from "react";

export default function Account() {
  // Profile state
  const [profileName, setProfileName] = useState("Rahul");
  const [profileUniversity, setProfileUniversity] = useState("Chitkara University");
  const [preferences, setPreferences] = useState("Veg • No onions");

  // Simulated save function
  const handleSave = () => {
    alert("Changes saved successfully!");
    // Here you would call your backend API to update user info
  };

  // Simulated logout function
  const handleLogout = () => {
    alert("Logged out successfully!");
    // Add your logout logic here (clear tokens, redirect, etc)
  };

  return (
    <section className="max-w-4xl mx-auto p-8 space-y-10">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
        Account Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 grid gap-10 sm:grid-cols-2">
        {/* Profile Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label
                htmlFor="university"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                University
              </label>
              <input
                id="university"
                type="text"
                value={profileUniversity}
                onChange={(e) => setProfileUniversity(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Preferences
          </h2>
          <div className="space-y-4">
            <label
              htmlFor="preferences"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Dietary Preferences
            </label>
            <textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="E.g., Veg, No onions, Gluten-free..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition"
        >
          Save Changes
        </button>

        <button
          onClick={handleLogout}
          className="px-6 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-md shadow-md transition"
        >
          Logout
        </button>
      </div>
    </section>
  );
}

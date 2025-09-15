import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // success or error message

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !contact.trim() || !message.trim()) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    // Simulate sending message
    setStatus({ type: "success", message: "Message sent successfully!" });

    // Clear form fields
    setName("");
    setContact("");
    setMessage("");

    // Here, you can add your API call to send the message
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
        Contact Us
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            required
          />
          <input
            type="text"
            placeholder="Email or Phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            required
          />
          <textarea
            placeholder="Message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            required
          />

          <button
            type="submit"
            className="w-fit px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition"
          >
            Send
          </button>
        </form>

        {status && (
          <p
            className={`mt-4 text-sm ${
              status.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>
    </section>
  );
}

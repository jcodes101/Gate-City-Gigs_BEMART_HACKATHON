import { useState } from "react";
import Navbar from "../components/Navbar";
import Chatbot from "../components/chatbot/chatbot";

export default function ProfilePage() {
  const [user, setUser] = useState({
    fname: "Monica", 
    lname: "Jennings",
    username: "monicajennings",
    email: "monica.jennings@example.com",
    avatar_url: "https://i.pravatar.cc/150?img=47",
    background_url:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1400&q=80",
    Bio: "I am a resident of the city and I love to report problems in my community.",
    certifications: [
      { id: 1, name: "Community Safety Training.pdf" },
      { id: 2, name: "Volunteer Program Completion.jpg" },
    ],
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(user);
  const [preview, setPreview] = useState(user.avatar_url);
  const [bgPreview, setBgPreview] = useState(user.background_url);
  const [uploadedCerts, setUploadedCerts] = useState(user.certifications);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      if (type === "avatar") {
        setPreview(imgUrl);
        setFormData((prev) => ({ ...prev, avatar_url: imgUrl }));
      } else if (type === "background") {
        setBgPreview(imgUrl);
        setFormData((prev) => ({ ...prev, background_url: imgUrl }));
      }
    }
  };

  const handleCertUpload = (e) => {
    const files = Array.from(e.target.files);
    const newCerts = files.map((file, idx) => ({
      id: uploadedCerts.length + idx + 1,
      name: file.name,
    }));
    setUploadedCerts((prev) => [...prev, ...newCerts]);
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, ...newCerts],
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser(formData);
    setEditMode(false);
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen pb-12">
        {/* Cover Section */}
        <div className="relative w-full h-44 md:h-52 bg-gray-200">
          <img
            src={bgPreview}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-14 left-6 flex items-end gap-4">
            <img
              src={preview}
              alt="Profile"
              className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div className="flex items-center justify-between w-[calc(100vw-12rem)]">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {user.fname} {user.lname}
                </h2>
                <p className="text-gray-600 text-sm">@{user.username}</p>
              </div>

              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition mr-6"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition mr-6"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body Layout */}
        <div className="max-w-6xl mx-auto mt-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: About Section */}
          <div className="bg-white p-5 rounded-xl shadow-md md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
            {!editMode ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Full Name:</strong> {user.fname} {user.lname}
                </p>
                <p>
                  <strong>Username:</strong> @{user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-800 font-medium">Bio</p>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    {user.Bio || "No bio provided yet."}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="Bio"
                    rows="3"
                    value={formData.Bio}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture
                  </label>
                  <div className="border-2 border-dashed border-green-400 rounded-lg p-3 text-center bg-green-50 hover:bg-green-100 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "avatar")}
                      className="w-full text-sm text-gray-600 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a new profile photo
                    </p>
                  </div>
                </div>

                {/* Background Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Image
                  </label>
                  <div className="border-2 border-dashed border-green-400 rounded-lg p-3 text-center bg-green-50 hover:bg-green-100 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "background")}
                      className="w-full text-sm text-gray-600 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a new background image
                    </p>
                  </div>
                </div>

                {/* Certifications Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications
                  </label>
                  <div className="border-2 border-dashed border-green-400 rounded-lg p-3 text-center bg-green-50 hover:bg-green-100 transition">
                    <input
                      type="file"
                      multiple
                      onChange={handleCertUpload}
                      className="w-full text-sm text-gray-600 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload certification files (PDF, JPG, PNG)
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded-md text-sm hover:bg-green-700"
                >
                  Save Changes
                </button>
              </form>
            )}
          </div>

          {/* Right: Jobs & Certifications */}
          <div className="md:col-span-2 space-y-6">
            {/* Recent Jobs */}
            <div className="bg-white p-5 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Jobs Worked
                </h3>
                <button className="text-green-600 text-sm font-medium hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: 1, title: "City Data Entry – Parks & Recreation" },
                  { id: 2, title: "Community Reporting: Downtown Cleanup" },
                  { id: 3, title: "Resident Feedback: Bus Route Expansion" },
                ].map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <p className="text-gray-700 text-sm">{job.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Section */}
            <div className="bg-white p-5 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Certifications
              </h3>

              {uploadedCerts.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No certifications uploaded yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {uploadedCerts.map((cert) => (
                    <li
                      key={cert.id}
                      className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-white transition"
                    >
                      📄 {cert.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </>
  );
}

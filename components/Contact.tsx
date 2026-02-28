import React, { useState } from "react";
import { Mail, Phone, MapPin, Twitter, Instagram, Linkedin, Facebook } from "lucide-react";

const Contact: React.FC = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState("");

  // Phone Validation (10 digits OR +91XXXXXXXXXX)
  const validatePhone = (phone: string) => {
    const regex = /^(\+91)?[6-9]\d{9}$/;
    return regex.test(phone);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Allow only numbers and +
      if (!/^\+?\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!validatePhone(formData.phone))
      newErrors.phone = "Enter valid 10 digit number or +91XXXXXXXXXX";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4">
            Connect
          </h2>
          <h1 className="text-5xl font-serif font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Have questions about a package or need custom planning?
            Our travel experts are standing by.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* CONTACT FORM */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] shadow-2xl">

            <div className="space-y-6">

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="text"
                  placeholder="+91XXXXXXXXXX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your dream trip..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-32 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-4 rounded-xl font-bold text-white hover:scale-[1.02] transition-all"
              >
                Send Message
              </button>

              {success && (
                <p className="text-green-400 text-sm mt-2">{success}</p>
              )}

            </div>
          </div>

          {/* RIGHT SIDE INFO */}
          <div className="space-y-12">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

              <div>
                <h4 className="text-white font-bold text-xl mb-4">
                  Direct Contact
                </h4>
                <div className="space-y-4 text-gray-400">
                  <p className="flex items-center gap-3">
                    <Mail size={18} /> hello@destinix.travel
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone size={18} /> +1 800-TRAVEL-AI
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold text-xl mb-4">
                  Office HQ
                </h4>
                <p className="text-gray-400 flex items-start gap-3">
                  <MapPin size={18} />
                  123 Nebula Heights, Sky Tower 7,
                  Silicon Valley, CA 94025
                </p>
              </div>

            </div>

            {/* GOOGLE MAP */}
            <div className="h-64 rounded-[40px] overflow-hidden border border-white/10">
              <iframe
                title="Google Map"
                width="100%"
                height="100%"
                frameBorder="0"
                src="https://www.google.com/maps?q=Silicon+Valley,+CA&output=embed"
                allowFullScreen
              />
            </div>

            {/* SOCIAL ICONS */}
            <div className="flex space-x-6">
              <Twitter className="text-gray-400 hover:text-indigo-400 cursor-pointer" />
              <Instagram className="text-gray-400 hover:text-indigo-400 cursor-pointer" />
              <Linkedin className="text-gray-400 hover:text-indigo-400 cursor-pointer" />
              <Facebook className="text-gray-400 hover:text-indigo-400 cursor-pointer" />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
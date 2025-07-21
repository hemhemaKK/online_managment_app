import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About Card */}
        <div className="bg-gray-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-bold mb-3 text-blue-900"><b>About AsyncEvent</b></h2>
          <p className="text-gray-300 text-sm">
           <b> AsyncEvent is your all-in-one solution for hosting, managing, and tracking online events efficiently. Plan smarter, execute better.
          </b>
          </p>
        </div>

        {/* Quick Links Card */}
        <div className="bg-gray-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-bold mb-3 text-blue-900"><b>Quick Links</b></h2>
          <ul className="space-y-2 text-gray-900 text-sm">
            <li><a href="/" className="hover:text-white"> <b>Home</b></a></li>
            <li><a href="/" className="hover:text-white"> <b>Contact Us</b></a></li>
            <li><a href="/" className="hover:text-white"> <b>Support</b></a></li>
            <li><a href="/" className="hover:text-white"> <b>Dashboard</b></a></li>
          </ul>
        </div>

        {/* Contact + Map Card */}
        <div className="bg-gray-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-bold mb-3 text-blue-900"><b>Contact Us</b></h2>
          <p className="text-gray-300 text-sm"><b>📧 support@asyncevent.com</b></p>
          <p className="text-gray-300 text-sm"><b>📞 +91 98765 43210</b></p>
          <div className="mt-4 rounded-md overflow-hidden">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387144.0075830038!2d-74.25819450162287!3d40.70582536804317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c250b5769a5c0d%3A0xd5f9f5ee2d70b8d3!2sNew%20York%20City!5e0!3m2!1sen!2sin!4v1619914695455!5m2!1sen!2sin"
              className="w-full h-32 border-0"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-gray-500 mt-8 text-sm">
        &copy; {new Date().getFullYear()} AsyncEvent. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

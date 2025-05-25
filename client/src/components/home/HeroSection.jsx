import { Link } from "wouter";

const HeroSection = () => {
  return (
    <div className="max-w-4xl mx-auto text-center mb-16">
      <h1 className="text-3xl mt-[70px] md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
        Manage Your Health Efficiently
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Book appointments, access records, and get medical help with ease.
      </p>      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/register"
          className="bg-[#4caf50] hover:bg-[#087f23] text-white font-semibold px-6 py-3 rounded-md transition-colors text-center"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="bg-[#1e5631] hover:bg-[#143e22] text-white font-semibold px-6 py-3 rounded-md transition-colors text-center"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;

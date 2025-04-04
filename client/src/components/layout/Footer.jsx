import { Link } from "wouter";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#1e5631] text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-4 mb-2">
          <Link href="/" className="hover:text-[#ffd700]">Home</Link>
          <Link href="/appointments" className="hover:text-[#ffd700]">Appointments</Link>
          <Link href="/records" className="hover:text-[#ffd700]">Records</Link>
          <Link href="/contact" className="hover:text-[#ffd700]">Contact</Link>
        </div>
        <p>© {currentYear} University Clinic Management System</p>
        <p className="text-sm text-white/80 mt-1">Final Project for Web Development</p>
      </div>
    </footer>
  );
};

export default Footer;

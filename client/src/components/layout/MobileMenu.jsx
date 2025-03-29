import { Link } from "wouter";

const MobileMenu = ({ isOpen, currentPath }) => {
  if (!isOpen) return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/appointments", label: "Appointments" },
    { href: "/records", label: "Records" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <div className="md:hidden bg-[#143e22]">
      <div className="container mx-auto px-4 py-2 flex flex-col space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-white${
              currentPath !== link.href ? "/90 hover:text-white" : ""
            } font-medium py-2 ${
              currentPath === link.href
                ? "border-l-4 border-white pl-2"
                : "hover:border-l-4 hover:border-white pl-2 transition-all"
            }`}
          >
            {link.label}
          </Link>
        ))}

        <div className="flex space-x-2 py-2">
          <Link
            href="/login"
            className="bg-[#ffd700] text-[#1e5631] px-4 py-1.5 rounded-md font-semibold flex-1 text-center"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-[#ffd700] text-[#1e5631] px-4 py-1.5 rounded-md font-semibold flex-1 text-center"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#1e5631] text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>© {currentYear} University Clinic Management System</p>
      </div>
    </footer>
  );
};

export default Footer;

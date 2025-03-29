import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";
import ContactMap from "@/components/contact/ContactMap";

const Contact = () => {
  return (
    <section id="contact" className="bg-[#f5f5f5] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contact Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="col-span-1">
              <ContactInfo />
            </div>

            {/* Contact Form */}
            <div className="col-span-2">
              <ContactForm />
            </div>
          </div>

          {/* Map */}
          <ContactMap />
        </div>
      </div>
    </section>
  );
};

export default Contact;

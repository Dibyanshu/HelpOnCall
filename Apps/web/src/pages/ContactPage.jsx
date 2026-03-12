import ContactForm from '../components/forms/ContactForm';

export default function ContactPage() {
  return (
    <section id="contact" className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Contact Us</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 sm:text-base">
          Share your care needs and our team will get back to you with a tailored support plan.
        </p>
        <div className="mt-8 sm:mt-10">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
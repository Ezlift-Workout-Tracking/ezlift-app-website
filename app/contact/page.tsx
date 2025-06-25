import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/forms/ContactForm";
import { FadeIn } from "@/components/animations/FadeIn";

export default function Contact() {
  return (
    <>
      <Header hideMenu />
      <main className="flex-1 py-24">
        <div className="container px-4 mx-auto">
          <FadeIn>
            <div className="max-w-2xl mx-auto">
              <ContactForm />
            </div>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
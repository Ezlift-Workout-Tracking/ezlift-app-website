import { Header } from "@/components/layout/Header"
import { FadeIn } from "@/components/animations/FadeIn"
import { Footer } from "@/components/layout/Footer";
import { AndroidWaitListForm } from "@/components/forms/AndroidWaitListForm"

export default function AndroidWaitList() {
  return (
    <>
      <Header hideMenu />
      <main className="flex-1 py-24">
        <div className="container px-4 mx-auto">
          <FadeIn>
            <div className="max-w-2xl mx-auto">
              <AndroidWaitListForm />
            </div>
          </FadeIn>
        </div>
      </main>
            <Footer />
    </>
  );
}

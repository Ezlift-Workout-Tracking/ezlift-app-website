import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FileX } from "lucide-react";

export default function BlogNotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <EmptyState
              icon={<FileX className="w-12 h-12 text-muted-foreground" />}
              title="Article Not Found"
              description="Sorry, the article you're looking for doesn't exist or has been removed."
              action={
                <Button asChild>
                  <Link href="/blog">
                    Back to Blog
                  </Link>
                </Button>
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
import LandingFeatures from "@/components/landing-features";
import LandingHero from "@/components/landing-hero";
import { Button } from "@/components/ui/button";
import { IndianRupee } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-screen ">
      <header className="border-b flex items-center justify-center lg:px-16 px-8">
        <div className="container flex h-16 items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-2 font-bold">
            <IndianRupee className="size-6 font-bold text-blue-500" />
            <span className="text-primary">Ease</span> Expense
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <a href="/login">Login</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/signup">Sign Up</a>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EaseExpense. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

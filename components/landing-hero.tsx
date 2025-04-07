import { Button } from "./ui/button";

export default function LandingHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container md:px-6 lg:px-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] px-8 lg:px-4">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
               Smart Expense Tracking for Better Financial Control
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Track, categorize, and analyze your expenses in real-time. Make
                smarter financial decisions with intuitive insights.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <a href="/signup">Get Started</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/login">Sign In</a>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-full md:h-[400px] lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg shadow-lg flex items-center justify-center">
                <div className="w-4/5 h-4/5 bg-background rounded-lg shadow-lg p-6">
                  <div className="space-y-4">
                    <div className="h-8 w-1/2 bg-muted rounded-md"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded-md"></div>
                      <div className="h-4 w-4/5 bg-muted rounded-md"></div>
                      <div className="h-4 w-3/5 bg-muted rounded-md"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-primary/50 rounded-md"></div>
                      <div className="h-8 w-24 bg-muted rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { BarChart3, Tag, PieChart, Clock, Zap, Shield } from "lucide-react";

const LandingFeatures = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracker-tighter md:text-4xl">
              Everything You Need to Manage Expenses
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our expense manager provides powerful tools to help you track,
              categorize, and analyze your spending habits.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Real-time Tracking</h3>
            <p className="text-center text-muted-foreground">
              Track your expenses in real-time and stay on top of your spending.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Smart Categorization</h3>
            <p className="text-center text-muted-foreground">
              Automatically categorize your expenses for better organization.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Insightful Reports</h3>
            <p className="text-center text-muted-foreground">
              Generate detailed reports to understand your spending patterns.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Expense History</h3>
            <p className="text-center text-muted-foreground">
              Access your complete expense history anytime, anywhere.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Fast Performance</h3>
            <p className="text-center text-muted-foreground">
              Enjoy a smooth and responsive experience with our optimized app.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Data</h3>
            <p className="text-center text-muted-foreground">
              Your financial data is encrypted and securely stored.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;

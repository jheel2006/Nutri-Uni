
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9fafa] to-[#fefdf9] text-[#303030] font-poppins">

      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-[1400px] bg-[#fff9f0] rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between z-50">
        <div className="text-2xl text-[#2c6e7f]">Nutri-UnI</div>
        <SignedOut>
          <SignInButton>
            <button className="bg-[#95ae45] hover:bg-[#819a3b] text-white px-5 py-2 rounded-2xl transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </header>

      <div className="h-24"></div>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl text-[#2c6e7f] mb-4">Eat Smart, Stay Strong</h2>
        <p className="text-lg max-w-2xl mx-auto text-[#4b4b4b]">
          Personalized dining recommendations, allergen-aware filtering, and admin tools — all in one smart platform.
        </p>
        <div className="mt-8">
          <SignedOut>
            <SignInButton>
              <button className="bg-[#2c6e7f] hover:bg-[#1d5a69] text-white px-6 py-3 rounded-full shadow">
                Get Started
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <a href="/dashboard">
              <button className="bg-[#2c6e7f] hover:bg-[#1d5a69] text-white px-6 py-3 rounded-full shadow">
                Go to Dashboard
              </button>
            </a>
          </SignedIn>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 px-8 pb-20 max-w-[1200px] mx-auto">
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-[#ffa41b]">
          <h3 className="text-lg font-semibold mb-2">Smart Meal Discovery</h3>
          <p className="text-sm text-[#555]">Search and discover meals by ingredients, halls, and dietary tags.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-[#95ae45]">
          <h3 className="text-lg font-semibold mb-2">Allergy-Safe Filtering</h3>
          <p className="text-sm text-[#555]">Filter out allergens and unwanted ingredients with ease.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-[#2c6e7f]">
          <h3 className="text-lg font-semibold mb-2">Admin Control Center</h3>
          <p className="text-sm text-[#555]">Add meals, update menus, and manage nutrition data visually.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-[#7a7a7a] bg-[#e9fafa]">
        © 2025 Nutri-UnI. Made with care.
      </footer>
    </div>
  );
}

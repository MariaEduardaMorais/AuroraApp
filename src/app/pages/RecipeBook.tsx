import React, { useState } from "react";
import { Search, ChefHat, Heart, Clock, Menu, Star, ChevronRight } from "lucide-react";

export function RecipeBook() {
  const [activeTab, setActiveTab] = useState("all");

  const recipes = [
    {
      id: 1,
      title: "Bolo de Cenoura com Cobertura de Chocolate",
      time: "45 min",
      difficulty: "Fácil",
      rating: 4.8,
      category: "Doces",
      image: "https://images.unsplash.com/photo-1633111855870-ce0a28539ae1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb3QlMjBjYWtlJTIwd2l0aCUyMGNob2NvbGF0ZXxlbnwxfHx8fDE3NzU2NjMyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 2,
      title: "Pão de Queijo Mineiro Tradicional",
      time: "40 min",
      difficulty: "Médio",
      rating: 4.9,
      category: "Salgados",
      image: "https://images.unsplash.com/photo-1598142982901-df6cec10ae35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBjaGVlc2UlMjBicmVhZCUyMHAlQzMlQTNvJTIwZGUlMjBxdWVpam98ZW58MXx8fHwxNzc1NjYzMjc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 3,
      title: "Lasanha Clássica à Bolonhesa",
      time: "60 min",
      difficulty: "Médio",
      rating: 4.7,
      category: "Prato Principal",
      image: "https://images.unsplash.com/photo-1709429790175-b02bb1b19207?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXNhZ25hJTIwYm9sb2duZXNlfGVufDF8fHx8MTc3NTY2MzI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 4,
      title: "Torta de Frango Cremosa com Catupiry",
      time: "50 min",
      difficulty: "Fácil",
      rating: 4.6,
      category: "Salgados",
      image: "https://images.unsplash.com/photo-1650917331384-1fd06afa3230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwcGllfGVufDF8fHx8MTc3NTY2MzI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
    }
  ];

  const filteredRecipes = activeTab === "all" ? recipes : recipes.filter(r => r.category.toLowerCase() === activeTab);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <header className="bg-white px-5 py-6 shadow-sm rounded-b-3xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-amber-600">
            <ChefHat className="w-8 h-8" />
            <h1 className="text-2xl font-bold font-serif">Receitas de Família</h1>
          </div>
          <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar receitas, ingredientes..." 
            className="w-full bg-stone-100 border-none rounded-2xl py-3 pl-10 pr-4 text-stone-700 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 outline-none transition-shadow"
          />
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto pb-24">
        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          {['all', 'doces', 'salgados', 'prato principal'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? "bg-amber-600 text-white shadow-md shadow-amber-200" 
                  : "bg-white text-stone-600 border border-stone-200"
              }`}
            >
              {tab === 'all' ? 'Todas' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4 font-serif text-stone-800">Sugestões do Dia</h2>

        <div className="grid gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer hover:shadow-md transition-shadow">
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-400 hover:text-red-500 hover:bg-white transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-amber-700">
                  {recipe.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-lg leading-tight text-stone-800">{recipe.title}</h3>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{recipe.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 text-stone-500 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4" />
                    <span>{recipe.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Fake Bottom Navigation to complete the app feel */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-stone-100 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-amber-600">
            <ChefHat className="w-6 h-6" />
            <span className="text-[10px] font-medium">Receitas</span>
          </button>
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-stone-400">
            <Heart className="w-6 h-6" />
            <span className="text-[10px] font-medium">Favoritos</span>
          </button>
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-stone-400">
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
import React, { useState } from "react";
import { Search, ChefHat, Heart, Clock, Menu, Star, ChevronRight, ArrowLeft, Settings, User, Bell, Bookmark } from "lucide-react";

export function RecipeBook() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const [bottomNav, setBottomNav] = useState<'home' | 'favorites' | 'menu'>('home');
  const [likedRecipes, setLikedRecipes] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedRecipes(prev => 
      prev.includes(id) ? prev.filter(recipeId => recipeId !== id) : [...prev, id]
    );
  };

  const recipes = [
    {
      id: 1,
      title: "Bolo de Cenoura com Cobertura de Chocolate",
      time: "45 min",
      difficulty: "Fácil",
      rating: 4.8,
      category: "Doces",
      image: "https://static.itdg.com.br/images/640-400/b2b92774c7fec4a05604e5573ef5a294/365326-original.jpg",
      ingredients: [
        "3 cenouras médias (descascadas e picadas)",
        "4 ovos",
        "1 xícara de óleo de soja",
        "2 xícaras de açúcar",
        "2 xícaras de farinha de trigo",
        "1 colher (sopa) de fermento em pó"
      ],
      instructions: [
        "Em um liquidificador, adicione as cenouras, os ovos, e o óleo. Bata até formar uma mistura homogênea.",
        "Despeje a mistura em uma tigela e misture o açúcar e a farinha de trigo peneirada aos poucos.",
        "Por último, adicione o fermento e misture delicadamente com uma colher ou espátula.",
        "Despeje a massa em uma forma untada e enfarinhada.",
        "Asse em forno preaquecido (180°C) por 40 minutos ou até dourar."
      ]
    },
    {
      id: 2,
      title: "Pão de Queijo Mineiro Tradicional",
      time: "40 min",
      difficulty: "Médio",
      rating: 4.9,
      category: "Salgados",
      image: "https://images.unsplash.com/photo-1598142982901-df6cec10ae35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBjaGVlc2UlMjBicmVhZCUyMHAlQzMlQTNvJTIwZGUlMjBxdWVpam98ZW58MXx8fHwxNzc1NjYzMjc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      ingredients: [
        "500g de polvilho doce",
        "250ml de leite integral",
        "100ml de óleo",
        "2 ovos grandes",
        "3 xícaras de queijo minas padrão ralado (ou meia cura)",
        "1 colher (chá) de sal"
      ],
      instructions: [
        "Ferva o leite junto com o óleo e o sal em uma panela média.",
        "Coloque o polvilho em uma tigela grande e despeje a mistura fervente para escaldar o polvilho. Misture bem e deixe amornar.",
        "Adicione os ovos, um a um, misturando bem a cada adição.",
        "Adicione o queijo ralado e amasse bem com as mãos até obter uma massa que não gruda.",
        "Faça bolinhas do tamanho desejado e coloque em uma assadeira sem untar.",
        "Asse em forno preaquecido a 200°C por cerca de 25-30 minutos, até dourarem."
      ]
    },
    {
      id: 3,
      title: "Lasanha Clássica à Bolonhesa",
      time: "60 min",
      difficulty: "Médio",
      rating: 4.7,
      category: "Prato Principal",
      image: "https://images.unsplash.com/photo-1709429790175-b02bb1b19207?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXNhZ25hJTIwYm9sb2duZXNlfGVufDF8fHx8MTc3NTY2MzI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      ingredients: [
        "1 pacote de massa para lasanha (pré-cozida)",
        "500g de carne moída",
        "2 sachês de molho de tomate",
        "400g de queijo mussarela fatiado",
        "400g de presunto fatiado",
        "1 cebola e 2 dentes de alho picados",
        "Azeite, sal e orégano a gosto"
      ],
      instructions: [
        "Em uma panela, refogue a cebola e o alho no azeite até dourarem.",
        "Adicione a carne moída, tempere com sal e pimenta, e cozinhe até perder a cor avermelhada.",
        "Adicione os molhos de tomate e deixe cozinhar por 10 minutos em fogo baixo. Reserve.",
        "Em um refratário, faça camadas na seguinte ordem: molho, massa, presunto, mussarela. Repita até os ingredientes acabarem.",
        "Finalize com uma camada de queijo e polvilhe orégano.",
        "Leve ao forno preaquecido (180°C) por cerca de 20 minutos para gratinar o queijo."
      ]
    },
    {
      id: 4,
      title: "Torta de Frango Cremosa com Catupiry",
      time: "50 min",
      difficulty: "Fácil",
      rating: 4.6,
      category: "Salgados",
      image: "https://images.unsplash.com/photo-1650917331384-1fd06afa3230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwcGllfGVufDF8fHx8MTc3NTY2MzI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      ingredients: [
        "2 peitos de frango cozidos e desfiados",
        "1 lata de milho verde",
        "1 copo de requeijão ou catupiry",
        "1 xícara de azeitonas picadas",
        "3 xícaras de farinha de trigo (para a massa)",
        "2 xícaras de leite (para a massa)",
        "1 xícara de óleo (para a massa)",
        "3 ovos (para a massa)"
      ],
      instructions: [
        "Para o recheio, refogue o frango desfiado com temperos a gosto, adicione o milho e as azeitonas. Misture o requeijão no final e reserve.",
        "Para a massa, bata todos os ingredientes líquidos no liquidificador.",
        "Em uma tigela, misture o líquido com a farinha e o fermento.",
        "Despeje metade da massa em uma forma untada, espalhe o recheio por cima e cubra com o restante da massa.",
        "Asse em forno preaquecido a 180°C por aproximadamente 45 minutos."
      ]
    }
  ];

  const baseRecipes = bottomNav === 'favorites' 
    ? recipes.filter(r => likedRecipes.includes(r.id))
    : recipes;

  const filteredRecipes = activeTab === "all" 
    ? baseRecipes 
    : baseRecipes.filter(r => r.category.toLowerCase() === activeTab);

  const currentRecipe = selectedRecipe ? recipes.find(r => r.id === selectedRecipe) : null;

  if (currentRecipe) {
    return (
      <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pb-24">
        <div className="relative h-64 w-full">
          <img 
            src={currentRecipe.image} 
            alt={currentRecipe.title} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => setSelectedRecipe(null)}
            className="absolute top-6 left-5 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-700 hover:bg-white transition-colors shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => toggleLike(currentRecipe.id)}
            className={`absolute top-6 right-5 p-2 bg-white/80 backdrop-blur-sm rounded-full transition-colors shadow-sm ${
              likedRecipes.includes(currentRecipe.id) ? "text-red-500" : "text-stone-400 hover:text-red-500 hover:bg-white"
            }`}
          >
            <Heart className={`w-6 h-6 ${likedRecipes.includes(currentRecipe.id) ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="bg-stone-50 -mt-6 relative rounded-t-3xl px-5 pt-8">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="text-2xl font-bold font-serif text-stone-800 leading-tight">
              {currentRecipe.title}
            </h1>
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl shrink-0">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-semibold">{currentRecipe.rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-around py-4 border-y border-stone-200/60 mb-8">
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-stone-600">{currentRecipe.time}</span>
            </div>
            <div className="w-px h-8 bg-stone-200"></div>
            <div className="flex flex-col items-center gap-1">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-stone-600">{currentRecipe.difficulty}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 font-serif text-stone-800">Ingredientes</h2>
            <ul className="space-y-3">
              {currentRecipe.ingredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                  <span className="text-stone-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 font-serif text-stone-800">Modo de Preparo</h2>
            <div className="space-y-5">
              {currentRecipe.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-stone-700 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <header className="bg-white px-5 py-6 shadow-sm rounded-b-3xl sticky top-0 z-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-amber-600">
            <ChefHat className="w-8 h-8" />
            <h1 className="text-2xl font-bold font-serif">
              {bottomNav === 'favorites' ? 'Meus Favoritos' : bottomNav === 'menu' ? 'Menu' : 'Receitas de Família'}
            </h1>
          </div>
          {bottomNav !== 'menu' && (
            <button 
              onClick={() => setBottomNav('menu')}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {bottomNav !== 'menu' && (
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar receitas, ingredientes..." 
              className="w-full bg-stone-100 border-none rounded-2xl py-3 pl-10 pr-4 text-stone-700 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 outline-none transition-shadow"
            />
          </div>
        )}
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto pb-24">
        {bottomNav === 'menu' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-stone-100 mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-800">Minha Conta</h3>
                <p className="text-stone-500 text-sm">Visualizar perfil</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              {[
                { icon: Bookmark, label: "Minhas Listas de Compras" },
                { icon: Bell, label: "Notificações" },
                { icon: Settings, label: "Configurações" }
              ].map((item, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3 text-stone-700">
                    <item.icon className="w-5 h-5 text-stone-400" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400" />
                </button>
              ))}
            </div>
            
            <button className="w-full mt-6 py-4 bg-stone-200 text-stone-600 font-bold rounded-2xl">
              Sair
            </button>
          </div>
        ) : (
          <>
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

        <h2 className="text-xl font-bold mb-4 font-serif text-stone-800">
          {bottomNav === 'favorites' ? 'Receitas Salvas' : 'Sugestões do Dia'}
        </h2>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p>Você ainda não curtiu nenhuma receita.</p>
            <p>Explore as opções e salve suas favoritas!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                onClick={() => setSelectedRecipe(recipe.id)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(recipe.id);
                    }}
                    className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full transition-colors ${
                      likedRecipes.includes(recipe.id) ? "text-red-500" : "text-stone-400 hover:text-red-500 hover:bg-white"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${likedRecipes.includes(recipe.id) ? "fill-current" : ""}`} />
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
        )}
      </>
    )}
  </main>

  {/* Fake Bottom Navigation to complete the app feel */}
  <nav className="fixed bottom-0 w-full bg-white border-t border-stone-100 pb-safe z-50">
    <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
      <button 
        onClick={() => setBottomNav('home')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          bottomNav === 'home' ? 'text-amber-600' : 'text-stone-400'
        }`}
      >
        <ChefHat className="w-6 h-6" />
        <span className="text-[10px] font-medium">Receitas</span>
      </button>
      <button 
        onClick={() => setBottomNav('favorites')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          bottomNav === 'favorites' ? 'text-amber-600' : 'text-stone-400'
        }`}
      >
        <Heart className={`w-6 h-6 ${bottomNav === 'favorites' ? 'fill-current' : ''}`} />
        <span className="text-[10px] font-medium">Favoritos</span>
      </button>
      <button 
        onClick={() => setBottomNav('menu')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
          bottomNav === 'menu' ? 'text-amber-600' : 'text-stone-400'
        }`}
      >
        <Menu className="w-6 h-6" />
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </div>
  </nav>
</div>
);
}
import React, { useState, useEffect } from 'react';
import useSpeechRecognition from './useSpeechRecognition';
import { MOCK_CATALOG } from './catalog';

const CATEGORIES = {
  Produce: ['apple', 'banana', 'orange', 'carrot', 'tomato', 'potato'],
  Dairy: ['milk', 'cheese', 'yogurt', 'butter'],
  Bakery: ['bread', 'bagel', 'muffin', 'cake'],
  Pantry: ['rice', 'pasta', 'sauce', 'cereal', 'sugar', 'flour'],
  Snacks: ['chips', 'cookie', 'nut', 'popcorn'],
  Drinks: ['water', 'juice', 'soda', 'coffee', 'tea']
};

const PAIRINGS = {
  'bread': [{ name: 'Butter', emoji: '🧈', note: 'Pairs with Bread' }, { name: 'Jam', emoji: '🍓', note: 'Pairs with Bread' }],
  'milk': [{ name: 'Cookies', emoji: '🍪', note: 'Dipping time!' }, { name: 'Cereal', emoji: '🥣', note: 'Breakfast combo' }],
  'pasta': [{ name: 'Pasta sauce', emoji: '🥫', note: 'Perfect for Pasta' }, { name: 'Cheese', emoji: '🧀', note: 'Essential topping' }],
  'chips': [{ name: 'Soda', emoji: '🥤', note: 'Movie night' }, { name: 'Salsa', emoji: '🍅', note: 'For dipping' }],
  'coffee': [{ name: 'Sugar', emoji: '🧂', note: 'Sweeten it' }, { name: 'Milk', emoji: '🥛', note: 'Add to Coffee' }],
  'tea': [{ name: 'Sugar', emoji: '🧂', note: 'Sweeten it' }, { name: 'Cookies', emoji: '🍪', note: 'Tea time!' }]
};

const DEFAULT_RECOMMENDATIONS = [
  { name: 'Milk', emoji: '🥛', note: 'Frequently Bought' },
  { name: 'Bread', emoji: '🍞', note: 'Pantry Staple' },
  { name: 'Apples', emoji: '🍎', note: 'Fresh & Healthy' }
];

const TRANSLATIONS = {
  'en-US': {
    brand: 'VOICE CART',
    tagline: 'Smart Shopping Assistant',
    listening: 'Listening...',
    tapToSpeak: 'Tap to speak',
    emptyCart: 'Your cart is empty.\nTry "Add 2 apples"',
    swapToOat: 'Swap to Oat Milk? (Save ₹20)',
    swapBtn: 'Swap',
    totalItems: 'TOTAL ITEMS',
    estTotal: 'EST. TOTAL',
    clearCart: 'Clear Cart',
    checkout: 'Checkout Now',
    suggestions: '💡 Recommended for You',
    thankYou: 'THANK YOU FOR SHOPPING',
    viewCatalog: 'View Catalog 📋',
    closeCatalog: 'Close Catalog',
    missingItemsBtn: 'Missing Items',
    catalogTitle: 'Full Catalog',
    notInCatalog: 'Not in Catalog',
    missingDesc: 'These items were requested but aren\'t in our current inventory.',
    noMissing: 'No missing items yet.',
    noItemsFound: 'No items found.',
    addBtn: '+ Add',
    orderSuccess: '🎉 Order Placed Successfully!'
  },
  'es-ES': {
    brand: 'CARRITO DE VOZ',
    tagline: 'Asistente Inteligente',
    listening: 'Escuchando...',
    tapToSpeak: 'Toca para hablar',
    emptyCart: 'Tu carrito está vacío.\nIntenta "Añadir 2 manzanas"',
    swapToOat: '¿Cambiar a Leche de Avena? (Ahorra ₹20)',
    swapBtn: 'Cambiar',
    totalItems: 'ARTÍCULOS TOTALES',
    estTotal: 'TOTAL EST.',
    clearCart: 'Vaciar Carrito',
    checkout: 'Pagar Ahora',
    suggestions: '💡 Recomendado para Ti',
    thankYou: 'GRACIAS POR SU COMPRA',
    viewCatalog: 'Ver Catálogo 📋',
    closeCatalog: 'Cerrar Catálogo',
    missingItemsBtn: 'Faltantes',
    catalogTitle: 'Catálogo Completo',
    notInCatalog: 'No en el Catálogo',
    missingDesc: 'Estos artículos fueron solicitados pero no están en nuestro inventario.',
    noMissing: 'No hay artículos faltantes aún.',
    noItemsFound: 'No se encontraron artículos.',
    addBtn: '+ Añadir',
    orderSuccess: '🎉 ¡Pedido Realizado con Éxito!'
  },
  'fr-FR': {
    brand: 'PANIER VOCAL',
    tagline: 'Assistant d\'Achat',
    listening: 'Écoute...',
    tapToSpeak: 'Appuyez pour parler',
    emptyCart: 'Votre panier est vide.\nEssayez "Ajouter 2 pommes"',
    swapToOat: 'Passer au Lait d\'Avoine ? (Éco. ₹20)',
    swapBtn: 'Changer',
    totalItems: 'TOTAL ARTICLES',
    estTotal: 'TOTAL EST.',
    clearCart: 'Vider le Panier',
    checkout: 'Payer Maintenant',
    suggestions: '💡 Recommandé pour Vous',
    thankYou: 'MERCI POUR VOTRE ACHAT',
    viewCatalog: 'Voir le Catalogue 📋',
    closeCatalog: 'Fermer le Catalogue',
    missingItemsBtn: 'Articles Manquants',
    catalogTitle: 'Catalogue Complet',
    notInCatalog: 'Pas dans le Catalogue',
    missingDesc: 'Ces articles ont été demandés mais ne sont pas dans notre inventaire.',
    noMissing: 'Aucun article manquant.',
    noItemsFound: 'Aucun article trouvé.',
    addBtn: '+ Ajouter',
    orderSuccess: '🎉 Commande Passée avec Succès !'
  },
  'hi-IN': {
    brand: 'वॉइस कार्ट',
    tagline: 'स्मार्ट शॉपिंग असिस्टेंट',
    listening: 'सुन रहा हूँ...',
    tapToSpeak: 'बोलने के लिए टैप करें',
    emptyCart: 'आपकी कार्ट खाली है।\n"2 सेब जोड़ें" बोलकर देखें',
    swapToOat: 'ओट मिल्क लें? (₹20 बचाएं)',
    swapBtn: 'बदलें',
    totalItems: 'कुल आइटम',
    estTotal: 'अनुमानित बिल',
    clearCart: 'कार्ट खाली करें',
    checkout: 'चेकआउट करें',
    suggestions: '💡 आपके लिए सुझाव',
    thankYou: 'खरीदारी के लिए धन्यवाद',
    viewCatalog: 'कैटलॉग देखें 📋',
    closeCatalog: 'कैटलॉग बंद करें',
    missingItemsBtn: 'गायब आइटम',
    catalogTitle: 'पूरा कैटलॉग',
    notInCatalog: 'कैटलॉग में नहीं है',
    missingDesc: 'ये आइटम मांगे गए थे लेकिन हमारे पास नहीं हैं।',
    noMissing: 'कोई गायब आइटम नहीं।',
    noItemsFound: 'कोई आइटम नहीं मिला।',
    addBtn: '+ जोड़ें',
    orderSuccess: '🎉 आर्डर सफलतापूर्वक हो गया!'
  },
  'mr-IN': {
    brand: 'व्हॉइस कार्ट',
    tagline: 'स्मार्ट शॉपिंग असिस्टंट',
    listening: 'ऐकत आहे...',
    tapToSpeak: 'बोलण्यासाठी टॅप करा',
    emptyCart: 'तुमची कार्ट रिकामी आहे.\n"2 सफरचंद जोडा" बोलून पहा',
    swapToOat: 'ओट मिल्क घेणार? (₹20 वाचवा)',
    swapBtn: 'बदला',
    totalItems: 'एकूण वस्तू',
    estTotal: 'अंदाजित बिल',
    clearCart: 'कार्ट रिकामी करा',
    checkout: 'चेकआउट करा',
    suggestions: '💡 तुमच्यासाठी सुचवलेले',
    thankYou: 'खरेदी केल्याबद्दल धन्यवाद',
    viewCatalog: 'कॅटलॉग पहा 📋',
    closeCatalog: 'कॅटलॉग बंद करा',
    missingItemsBtn: 'नसलेल्या वस्तू',
    catalogTitle: 'संपूर्ण कॅटलॉग',
    notInCatalog: 'कॅटलॉगमध्ये नाही',
    missingDesc: 'या वस्तू मागितल्या होत्या पण आमच्याकडे नाहीत.',
    noMissing: 'कोणतीही नसलेली वस्तू नाही.',
    noItemsFound: 'काहीही सापडले नाही.',
    addBtn: '+ जोडा',
    orderSuccess: '🎉 ऑर्डर यशस्वीरित्या दिली!'
  },
  'bho-IN': {
    brand: 'आवाज कार्ट',
    tagline: 'स्मार्ट शॉपिंग सहाई',
    listening: 'सुनत बानी...',
    tapToSpeak: 'बोले खातिर दबाईं',
    emptyCart: 'रउवा कार्ट खाली बा।\n"2 गो सेव डालीं" बोल के देखीं',
    swapToOat: 'ओट मिल्क लीहल जाई? (₹20 बचाईं)',
    swapBtn: 'बदलीं',
    totalItems: 'कुल सामान',
    estTotal: 'कुल बिल',
    clearCart: 'कार्ट खाली करीं',
    checkout: 'चेकआउट करीं',
    suggestions: '💡 रउवा खातिर सुझाव',
    thankYou: 'खरीदारी खातिर धन्यवाद',
    viewCatalog: 'कैटलॉग देखीं 📋',
    closeCatalog: 'कैटलॉग बंद करीं',
    missingItemsBtn: 'गायब सामान',
    catalogTitle: 'पूरा कैटलॉग',
    notInCatalog: 'कैटलॉग में नईखे',
    missingDesc: 'ई सामान मांगल गइल रहे बाकिर हमनी लगे नईखे।',
    noMissing: 'कवनो गायब सामान नईखे।',
    noItemsFound: 'कवनो सामान ना मिलल।',
    addBtn: '+ डालीं',
    orderSuccess: '🎉 आर्डर सफल भइल!'
  }
};

const ITEM_DICTIONARY = {
  'manzana': 'apple', 'manzanas': 'apple', 'pomme': 'apple', 'pommes': 'apple', 'सेब': 'apple', 'सफरचंद': 'apple', 'सेव': 'apple',
  'plátano': 'banana', 'bananas': 'banana', 'banane': 'banana', 'bananes': 'banana', 'केला': 'banana', 'केळी': 'banana',
  'naranja': 'orange', 'naranjas': 'orange', 'oranges': 'orange', 'संतरा': 'orange',
  'leche': 'milk', 'lait': 'milk', 'दूध': 'milk',
  'queso': 'cheese', 'fromage': 'cheese', 'पनीर': 'cheese',
  'mantequilla': 'butter', 'beurre': 'butter', 'मक्खन': 'butter', 'लोणी': 'butter',
  'pan': 'bread', 'pain': 'bread', 'ब्रेड': 'bread', 'पाव': 'bread',
  'agua': 'water', 'eau': 'water', 'पानी': 'water', 'पाणी': 'water',
  'jugo': 'juice', 'jus': 'juice', 'जूस': 'juice',
  'café': 'coffee', 'cafe': 'coffee', 'कॉफी': 'coffee',
  'té': 'tea', 'thé': 'tea', 'चाय': 'tea', 'चहा': 'tea',
  'arroz': 'rice', 'riz': 'rice', 'चावल': 'rice', 'तांदूळ': 'rice',
  'azúcar': 'sugar', 'sucre': 'sugar', 'चीनी': 'sugar', 'साखर': 'sugar',
  'cebolla': 'onion', 'oignon': 'onion', 'प्याज': 'onion', 'कांदा': 'onion',
  'papa': 'potato', 'आलू': 'potato', 'बटाटा': 'potato',
  'tomate': 'tomato', 'टमाटर': 'tomato', 'टोमॅटो': 'tomato'
};

function parseCommand(text) {
  let lower = text.toLowerCase().trim();
  const res = { action: 'unknown', item: '', quantity: 1, maxPrice: null };
  
  if (lower.includes('clear') || lower.includes('vaciar') || lower.includes('vider') || lower.includes('खाली')) {
    return { action: 'clear' };
  }
  
  const searchMatch = lower.match(/^(find|search for|look for|search|buscar|busca|trouver|cherche|खोज|शोध|दिखा)\s+(.*?)(?:\s+(under|less than|menos de|moins de|से कम|च्या खाली)\s+(?:rs\.?|₹)?(\d+(?:\.\d+)?)(?:\s+rupees?|euros?|रुपये|रुपया)?)?$/);
  if (searchMatch) {
    res.action = 'search';
    res.item = searchMatch[2].trim();
    if (searchMatch[4]) {
      res.maxPrice = parseFloat(searchMatch[4]);
    }
    return res;
  }
  
  // Extract numbers first (Devanagari or English digits/words)
  let qMatch = lower.match(/(\d+|a|an|one|two|three|four|five|un|una|dos|tres|cuatro|cinco|deux|trois|quatre|cinq|एक|दो|दोन|दू|तीन|चार|पांच|पाच)\s+/);
  if (qMatch) {
    const q = qMatch[1];
    if (['a', 'an', 'one', 'un', 'una', 'एक'].includes(q)) res.quantity = 1;
    else if (['two', 'dos', 'deux', 'दो', 'दोन', 'दू'].includes(q)) res.quantity = 2;
    else if (['three', 'tres', 'trois', 'तीन'].includes(q)) res.quantity = 3;
    else if (['four', 'cuatro', 'quatre', 'चार'].includes(q)) res.quantity = 4;
    else if (['five', 'cinco', 'cinq', 'पांच', 'पाच'].includes(q)) res.quantity = 5;
    else res.quantity = parseInt(q, 10) || 1;
  }

  // Determine action by looking for removal verbs anywhere
  if (lower.match(/(remove|quitar|enlever|हटा|काढ|निकाल)/)) {
    res.action = 'remove';
  } else {
    res.action = 'add';
  }

  // Clean item name (remove action words, quantities, filler words)
  let itemName = lower.replace(/(add|buy|get|i need|remove|añadir|comprar|agregar|quitar|ajouter|acheter|enlever|mettre|quiero|जोड़|डाल|दे|हटा|काढ|निकाल|करो|करा|करीं)/g, '');
  itemName = itemName.replace(/(\d+|a|an|one|two|three|four|five|un|una|dos|tres|cuatro|cinco|deux|trois|quatre|cinq|एक|दो|दोन|दू|तीन|चार|पांच|पाच)\s+/g, '');
  itemName = itemName.trim();
  
  // Clean price constraints (for add actions too)
  const priceMatch = itemName.match(/(.*?)(?:\s+(under|less than|menos de|moins de|से कम|च्या खाली)\s+(?:rs\.?|₹)?(\d+(?:\.\d+)?)(?:\s+rupees?|euros?|रुपये|रुपया|में)?)?$/);
  if (priceMatch && priceMatch[3]) {
    itemName = priceMatch[1].trim();
    res.maxPrice = parseFloat(priceMatch[3]);
  }
  
  res.item = ITEM_DICTIONARY[itemName] || itemName;
  return res;
}

function categorizeItem(item) {
  const lowerItem = item.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => lowerItem.includes(kw))) {
      return cat;
    }
  }
  return 'Other';
}

function App() {
  const [items, setItems] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [missingItems, setMissingItems] = useState([]);
  const [showMissing, setShowMissing] = useState(false);
  
  // Track selected language for UI translations
  const [langCode, setLangCode] = useState('en-US');
  const t = TRANSLATIONS[langCode] || TRANSLATIONS['en-US'];

  const handleCheckout = () => {
    if (items.length > 0) {
      setCheckoutSuccess(true);
      setItems([]);
      setSearchResults(null);
      setTimeout(() => setCheckoutSuccess(false), 3000);
    }
  };
  
  const handleResult = ({ finalTranscript, interimTranscript }) => {
    setInterimText(interimTranscript);
    if (finalTranscript) {
      processCommand(finalTranscript);
      setInterimText('');
    }
  };

  const { isListening, error, startListening, stopListening, setLanguage } = useSpeechRecognition(handleResult);

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLangCode(val);
    setLanguage(val);
  };

  const processCommand = (command) => {
    const { action, item, quantity, maxPrice } = parseCommand(command);
    if (!item && action !== 'clear') return;
    
    if (action === 'clear') {
      setItems([]);
      setSearchResults(null);
    } else if (action === 'search') {
      const searchTerms = item.toLowerCase().split(' ');
      const results = MOCK_CATALOG.filter(p => {
        const matchesName = searchTerms.every(term => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
        const matchesPrice = maxPrice ? p.price <= maxPrice : true;
        return matchesName && matchesPrice;
      });
      setSearchResults({ query: command, results });
    } else if (action === 'add') {
      setSearchResults(null);
      const searchTerms = item.toLowerCase().split(' ');
      const catalogItem = MOCK_CATALOG.find(p => 
        searchTerms.every(term => p.name.toLowerCase().includes(term)) && (!maxPrice || p.price <= maxPrice)
      );
      
      if (!catalogItem) {
        if (!missingItems.includes(item)) {
          setMissingItems(prev => [...prev, item]);
        }
        return;
      }
      
      const finalName = catalogItem.name;
      const finalCat = catalogItem.category;
      const finalPrice = catalogItem.price;
      
      setItems(prev => {
        const existing = prev.find(i => i.name.toLowerCase() === finalName.toLowerCase());
        if (existing) {
          return prev.map(i => i.name.toLowerCase() === finalName.toLowerCase() ? { ...i, qty: i.qty + quantity } : i);
        }
        return [...prev, { name: finalName, qty: quantity, category: finalCat, price: finalPrice }];
      });
    } else if (action === 'remove') {
      setItems(prev => prev.filter(i => !i.name.toLowerCase().includes(item.toLowerCase())));
    }
  };

  const toggleListen = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const removeItem = (name) => {
    setItems(prev => prev.filter(i => i.name !== name));
  };

  const updateQuantity = (name, delta) => {
    setItems(prev => prev.map(i => {
      if (i.name === name) {
        return { ...i, qty: i.qty + delta };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const getRecommendations = () => {
    let recs = [];
    items.forEach(item => {
      const lowerName = item.name.toLowerCase();
      Object.keys(PAIRINGS).forEach(key => {
        if (lowerName.includes(key)) {
          recs = [...recs, ...PAIRINGS[key]];
        }
      });
    });
    
    recs = recs.filter(r => !items.some(i => i.name.toLowerCase().includes(r.name.toLowerCase())));
    
    const uniqueRecs = [];
    const seen = new Set();
    recs.forEach(r => {
      if (!seen.has(r.name)) {
        seen.add(r.name);
        uniqueRecs.push(r);
      }
    });

    return uniqueRecs.length === 0 ? DEFAULT_RECOMMENDATIONS : uniqueRecs.slice(0, 4);
  };

  const currentRecs = getRecommendations();
  const categories = Array.from(new Set(items.map(i => i.category))).sort();

  return (
    <div className="app-shell">
      {/* Side Menu Overlay */}
      <div className={`side-menu-overlay ${showMenu ? 'open' : ''}`} onClick={() => setShowMenu(false)}></div>
      <div className={`side-menu ${showMenu ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setShowMenu(false)}>×</button>
        <h2 style={{marginTop:0, fontFamily:'var(--font-sans)', fontSize:'18px'}}>{t.catalogTitle}</h2>
        {Array.from(new Set(MOCK_CATALOG.map(item => item.category))).map(cat => (
          <div key={cat}>
            <div className="catalog-category">{cat}</div>
            {MOCK_CATALOG.filter(i => i.category === cat).map(res => (
              <div key={res.id} className="item-row" style={{ padding: '4px 0' }}>
                <div className="item-name">
                  <span>{res.name}</span>
                </div>
                <div style={{fontWeight:600, marginRight: '8px'}}>₹{res.price}</div>
                <button className="remove-btn" onClick={() => {
                  processCommand(`add ${res.name}`);
                  setShowMenu(false);
                }}>{t.addBtn}</button>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Missing Items Overlay */}
      <div className={`side-menu-overlay ${showMissing ? 'open' : ''}`} onClick={() => setShowMissing(false)}></div>
      <div className={`side-menu ${showMissing ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setShowMissing(false)}>×</button>
        <h2 style={{marginTop:0, fontFamily:'var(--font-sans)', fontSize:'18px', color:'var(--error)'}}>{t.notInCatalog}</h2>
        <p style={{color:'var(--muted)'}}>{t.missingDesc}</p>
        {missingItems.length === 0 ? (
          <div style={{fontStyle:'italic', color:'var(--muted)'}}>{t.noMissing}</div>
        ) : (
          missingItems.map((mi, idx) => (
            <div key={idx} className="item-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{mi}</span>
              <button className="remove-btn" onClick={() => setMissingItems(prev => prev.filter(i => i !== mi))}>×</button>
            </div>
          ))
        )}
      </div>

      <div className="receipt">
        <header className="receipt-header">
          <div className="brand">{t.brand}</div>
          <div className="tagline">{t.tagline}</div>
          <div className="meta">
            <span>#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <button 
            className="styled-btn"
            style={{marginTop:'12px', width:'100%'}} 
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? t.closeCatalog : t.viewCatalog}
          </button>
          {missingItems.length > 0 && (
            <button 
              className="styled-btn warning"
              style={{marginTop:'8px', width:'100%'}} 
              onClick={() => setShowMissing(!showMissing)}
            >
              {t.missingItemsBtn} ({missingItems.length}) ⚠️
            </button>
          )}
        </header>

        <div className="mic-section">
          <button 
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListen}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
          </button>
          
          <div className={`mic-status ${error ? 'error' : ''}`}>
            {error ? error : (isListening ? t.listening : t.tapToSpeak)}
          </div>
          <div className="transcript-line">
            {interimText && `"${interimText}"`}
          </div>
          <select className="lang-select" onChange={handleLanguageChange} value={langCode}>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
            <option value="fr-FR">Français</option>
            <option value="hi-IN">हिन्दी (Hindi)</option>
            <option value="mr-IN">मराठी (Marathi)</option>
            <option value="bho-IN">भोजपुरी (Bhojpuri)</option>
          </select>
        </div>

        <div className="list-section">
          {checkoutSuccess && (
            <div style={{textAlign:'center', color:'var(--good)', padding:'20px 0', fontWeight:'bold', border:'1px dashed var(--good)', marginBottom:'16px', background:'var(--good-soft)'}}>
              {t.orderSuccess}
            </div>
          )}
          {searchResults && (
            <div className="search-panel">
              <div className="search-title">Results for "{searchResults.query}"</div>
              {searchResults.results.length === 0 ? (
               <div style={{ color: 'var(--muted)', fontSize: '11px' }}>{t.noItemsFound}</div>
              ) : (
                searchResults.results.map(res => (
                  <div key={res.id} className="item-row" style={{ padding: '2px 0' }}>
                    <div className="item-name">
                      <span>{res.name}</span>
                    </div>
                    <div style={{fontWeight:600}}>₹{res.price}</div>
                    <button className="remove-btn" onClick={() => processCommand(`add ${res.name}`)}>{t.addBtn}</button>
                  </div>
                ))
              )}
            </div>
          )}
          {items.length === 0 ? (
            <div className="empty-state" style={{ whiteSpace: 'pre-line' }}>
              {t.emptyCart}
            </div>
          ) : (
            <>
              {items.some(i => i.name.toLowerCase() === 'milk') && (
                <div className="substitute-banner">
                  <span>{t.swapToOat}</span>
                  <button onClick={() => {
                    removeItem('milk');
                    processCommand('add oat milk');
                  }}>{t.swapBtn}</button>
                </div>
              )}
              {categories.map(cat => (
                <div key={cat} className="category-block">
                  <div className="category-title">{cat}</div>
                  {items.filter(i => i.category === cat).map((item, idx) => (
                    <div key={idx} className="item-row">
                      <div className="item-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--paper-dim)', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                          <button style={{ background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: '2px 8px', fontSize: '14px' }} onClick={() => updateQuantity(item.name, -1)}>-</button>
                          <span className="qty" style={{ minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                          <button style={{ background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: '2px 8px', fontSize: '14px' }} onClick={() => updateQuantity(item.name, 1)}>+</button>
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <button className="remove-btn" onClick={() => removeItem(item.name)}>×</button>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <>
            <div className="total-row">
              <span>{t.totalItems}</span>
              <span>{items.reduce((acc, item) => acc + item.qty, 0)}</span>
            </div>
            {items.some(i => i.price > 0) && (
              <div className="total-row" style={{ marginTop: '2px', borderTop: 'none' }}>
                <span>{t.estTotal}</span>
                <span>₹{items.reduce((acc, item) => acc + (item.price * item.qty), 0)}</span>
              </div>
            )}
            <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
              <button 
                className="styled-btn warning"
                onClick={() => processCommand('clear')}
                style={{flex:1}}>
                {t.clearCart}
              </button>
              <button 
                className="styled-btn primary"
                onClick={handleCheckout}
                style={{flex:2}}>
                {t.checkout}
              </button>
            </div>
          </>
        )}

        <div className="suggestions-section">
          <div className="suggestions-title" style={{color:'var(--good)', fontWeight:'bold'}}>{t.suggestions}</div>
          <div className="chip-row">
            {currentRecs.map((rec, idx) => (
              <button key={idx} className="chip" onClick={() => processCommand(`add ${rec.name}`)}>
                {rec.emoji} {rec.name} <span className="note">{rec.note}</span>
              </button>
            ))}
          </div>
        </div>

        <footer className="footer-barcode">
          <div className="bars">||||||| | ||||| || |||</div>
          <div className="footer-note">{t.thankYou}</div>
        </footer>
      </div>
    </div>
  );
}

export default App;

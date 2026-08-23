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

function parseCommand(text) {
  // basic NLP lite
  const lower = text.toLowerCase().trim();
  const res = { action: 'unknown', item: '', quantity: 1, maxPrice: null };
  
  if (lower.startsWith('clear')) return { action: 'clear' };
  
  // check for search
  const searchMatch = lower.match(/^(find|search for|look for|search)\s+(.*?)(?:\s+(under|less than)\s+(?:rs\.?|₹)?(\d+(?:\.\d+)?)(?:\s+rupees?)?)?$/);
  if (searchMatch) {
    res.action = 'search';
    res.item = searchMatch[2].trim();
    if (searchMatch[4]) {
      res.maxPrice = parseFloat(searchMatch[4]);
    }
    return res;
  }
  
  // match quantities like "2 bottles of water", "5 apples", "a banana"
  const qtyMatch = lower.match(/^(add\s|buy\s|get\s|i need\s|remove\s)?(?:(\d+|a|an|one|two|three|four|five)\s+)?(.*)/);
  if (qtyMatch) {
    res.action = lower.includes('remove') ? 'remove' : 'add';
    const q = qtyMatch[2];
    let itemName = qtyMatch[3].trim().replace(/(remove\s|add\s|buy\s|i need\s)/g, '');
    
    const priceMatch = itemName.match(/(.*?)(?:\s+(under|less than)\s+(?:rs\.?|₹)?(\d+(?:\.\d+)?)(?:\s+rupees?)?)?$/);
    if (priceMatch && priceMatch[3]) {
      itemName = priceMatch[1].trim();
      res.maxPrice = parseFloat(priceMatch[3]);
    }
    res.item = itemName;
    
    if (q) {
      if (['a', 'an', 'one'].includes(q)) res.quantity = 1;
      else if (q === 'two') res.quantity = 2;
      else if (q === 'three') res.quantity = 3;
      else if (q === 'four') res.quantity = 4;
      else if (q === 'five') res.quantity = 5;
      else res.quantity = parseInt(q, 10) || 1;
    }
  }
  
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
        <h2 style={{marginTop:0, fontFamily:'var(--font-sans)', fontSize:'18px'}}>Full Catalog</h2>
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
                }}>+ Add</button>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Missing Items Overlay */}
      <div className={`side-menu-overlay ${showMissing ? 'open' : ''}`} onClick={() => setShowMissing(false)}></div>
      <div className={`side-menu ${showMissing ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setShowMissing(false)}>×</button>
        <h2 style={{marginTop:0, fontFamily:'var(--font-sans)', fontSize:'18px', color:'var(--error)'}}>Not in Catalog</h2>
        <p style={{color:'var(--muted)'}}>These items were requested but aren't in our current inventory.</p>
        {missingItems.length === 0 ? (
          <div style={{fontStyle:'italic', color:'var(--muted)'}}>No missing items yet.</div>
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
          <div className="brand">VOICE CART</div>
          <div className="tagline">Smart Shopping Assistant</div>
          <div className="meta">
            <span>#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <button 
            className="styled-btn"
            style={{marginTop:'12px', width:'100%'}} 
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? 'Close Catalog' : 'View Catalog 📋'}
          </button>
          {missingItems.length > 0 && (
            <button 
              className="styled-btn warning"
              style={{marginTop:'8px', width:'100%'}} 
              onClick={() => setShowMissing(!showMissing)}
            >
              Missing Items ({missingItems.length}) ⚠️
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
            {error ? error : (isListening ? 'Listening...' : 'Tap to speak')}
          </div>
          <div className="transcript-line">
            {interimText && `"${interimText}"`}
          </div>
          <select className="lang-select" onChange={(e) => setLanguage(e.target.value)} defaultValue="en-US">
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
            <option value="fr-FR">Français</option>
          </select>
        </div>

        <div className="list-section">
          {checkoutSuccess && (
            <div style={{textAlign:'center', color:'var(--good)', padding:'20px 0', fontWeight:'bold', border:'1px dashed var(--good)', marginBottom:'16px', background:'var(--good-soft)'}}>
              🎉 Order Placed Successfully!
            </div>
          )}
          {searchResults && (
            <div className="search-panel">
              <div className="search-title">Search Results for "{searchResults.query}"</div>
              {searchResults.results.length === 0 ? (
               <div style={{ color: 'var(--muted)', fontSize: '11px' }}>No items found.</div>
              ) : (
                searchResults.results.map(res => (
                  <div key={res.id} className="item-row" style={{ padding: '2px 0' }}>
                    <div className="item-name">
                      <span>{res.name} <span style={{fontSize:'10px', color:'var(--muted)'}}>({res.brand})</span></span>
                    </div>
                    <div style={{fontWeight:600}}>₹{res.price}</div>
                    <button className="remove-btn" onClick={() => processCommand(`add ${res.name}`)}>+ Add</button>
                  </div>
                ))
              )}
            </div>
          )}
          {items.length === 0 ? (
            <div className="empty-state">
              Your cart is empty.<br/>Try "Add 2 apples"
            </div>
          ) : (
            <>
              {items.some(i => i.name.toLowerCase() === 'milk') && (
                <div className="substitute-banner">
                  <span>Swap to Oat Milk? (Save ₹20)</span>
                  <button onClick={() => {
                    removeItem('milk');
                    processCommand('add oat milk');
                  }}>Swap</button>
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
              <span>TOTAL ITEMS</span>
              <span>{items.reduce((acc, item) => acc + item.qty, 0)}</span>
            </div>
            {items.some(i => i.price > 0) && (
              <div className="total-row" style={{ marginTop: '2px', borderTop: 'none' }}>
                <span>EST. TOTAL</span>
                <span>₹{items.reduce((acc, item) => acc + (item.price * item.qty), 0)}</span>
              </div>
            )}
            <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
              <button 
                className="styled-btn warning"
                onClick={() => processCommand('clear')}
                style={{flex:1}}>
                Clear Cart
              </button>
              <button 
                className="styled-btn primary"
                onClick={handleCheckout}
                style={{flex:2}}>
                Checkout Now
              </button>
            </div>
          </>
        )}

        <div className="suggestions-section">
          <div className="suggestions-title" style={{color:'var(--good)', fontWeight:'bold'}}>💡 Recommended for You</div>
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
          <div className="footer-note">THANK YOU FOR SHOPPING</div>
        </footer>
      </div>
    </div>
  );
}

export default App;

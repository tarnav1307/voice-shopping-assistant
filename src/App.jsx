import React, { useState, useEffect } from 'react';
import useSpeechRecognition from './useSpeechRecognition';

const CATEGORIES = {
  Produce: ['apple', 'banana', 'orange', 'carrot', 'tomato', 'potato'],
  Dairy: ['milk', 'cheese', 'yogurt', 'butter'],
  Bakery: ['bread', 'bagel', 'muffin', 'cake'],
  Pantry: ['rice', 'pasta', 'sauce', 'cereal', 'sugar', 'flour'],
  Snacks: ['chips', 'cookie', 'nut', 'popcorn'],
  Drinks: ['water', 'juice', 'soda', 'coffee', 'tea']
};

function parseCommand(text) {
  // basic NLP lite
  const lower = text.toLowerCase().trim();
  const res = { action: 'unknown', item: '', quantity: 1 };
  
  if (lower.startsWith('clear')) return { action: 'clear' };
  
  // match quantities like "2 bottles of water", "5 apples", "a banana"
  const qtyMatch = lower.match(/^(add\s|buy\s|get\s|i need\s)?(?:(\d+|a|an|one|two|three|four|five)\s+)?(.*)/);
  if (qtyMatch) {
    res.action = lower.includes('remove') ? 'remove' : 'add';
    const q = qtyMatch[2];
    res.item = qtyMatch[3].trim().replace(/(remove\s|add\s|buy\s)/g, '');
    
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
  
  const handleResult = ({ finalTranscript, interimTranscript }) => {
    setInterimText(interimTranscript);
    if (finalTranscript) {
      processCommand(finalTranscript);
      setInterimText('');
    }
  };

  const { isListening, error, startListening, stopListening, setLanguage } = useSpeechRecognition(handleResult);

  const processCommand = (command) => {
    const { action, item, quantity } = parseCommand(command);
    if (!item && action !== 'clear') return;
    
    if (action === 'clear') {
      setItems([]);
    } else if (action === 'add') {
      setItems(prev => {
        const existing = prev.find(i => i.name.toLowerCase() === item.toLowerCase());
        if (existing) {
          return prev.map(i => i.name.toLowerCase() === item.toLowerCase() ? { ...i, qty: i.qty + quantity } : i);
        }
        return [...prev, { name: item, qty: quantity, category: categorizeItem(item) }];
      });
    } else if (action === 'remove') {
      setItems(prev => prev.filter(i => i.name.toLowerCase() !== item.toLowerCase()));
    }
  };

  const toggleListen = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const removeItem = (name) => {
    setItems(prev => prev.filter(i => i.name !== name));
  };

  const categories = Array.from(new Set(items.map(i => i.category))).sort();

  return (
    <div className="app-shell">
      <div className="receipt">
        <header className="receipt-header">
          <div className="brand">VOICE CART</div>
          <div className="tagline">Smart Shopping Assistant</div>
          <div className="meta">
            <span>#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
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
          {items.length === 0 ? (
            <div className="empty-state">
              Your cart is empty.<br/>Try "Add 2 apples"
            </div>
          ) : (
            <>
              {items.some(i => i.name.toLowerCase() === 'milk') && (
                <div className="substitute-banner">
                  <span>Swap to Oat Milk? (Save $0.50)</span>
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
                      <div className="item-name">
                        <span className="qty">{item.qty}x</span>
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
          <div className="total-row">
            <span>TOTAL ITEMS</span>
            <span>{items.reduce((acc, item) => acc + item.qty, 0)}</span>
          </div>
        )}

        <div className="suggestions-section">
          <div className="suggestions-title">Suggestions</div>
          <div className="chip-row">
            <button className="chip" onClick={() => processCommand('add milk')}>
              Milk <span className="note">Frequent</span>
            </button>
            <button className="chip" onClick={() => processCommand('add bread')}>
              Bread <span className="note">Bakery</span>
            </button>
            <button className="chip" onClick={() => processCommand('add eggs')}>
              Eggs <span className="note">Pantry</span>
            </button>
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

const fs = require('fs');

let content = fs.readFileSync('src/features/offers/components/offers-dashboard.tsx', 'utf8');

const newSimulate = `
  const handleSimulateBuyerResponse = () => {
    const marketRef = currentLot.referenceGovPrice || 2000;
    const buyerMaxPrice = Math.round(marketRef * 1.08);
    const buyerInitial = offer.history.length > 1 
      ? offer.history.find(h => h.role === 'Buyer')?.price || marketRef 
      : (offer.buyerPrice || Math.round(marketRef * 0.95));

    const farmerLastRequest = offer.history[offer.history.length - 1].price;
    const buyerLastOffer = [...offer.history].reverse().find(h => h.role === 'Buyer')?.price || buyerInitial;

    if (farmerLastRequest <= buyerMaxPrice && farmerLastRequest <= buyerLastOffer * 1.05) {
       updateLotStatus('Deal Confirmed');
       updateOffer({
         status: 'Accepted',
         history: [
           ...offer.history,
           { role: 'Buyer', price: farmerLastRequest, timestamp: new Date().toISOString(), note: 'Buyer accepted the counter offer.' }
         ]
       });
       return;
    }

    let nextOffer = buyerLastOffer + Math.round((farmerLastRequest - buyerLastOffer) * 0.3);
    let note = 'Buyer proposed a revised counter offer.';
    
    if (nextOffer >= buyerMaxPrice) {
       nextOffer = buyerMaxPrice;
       note = 'Buyer proposed their final maximum offer. No further increases possible.';
    }

    if (offer.history.length === 1) {
        nextOffer = buyerInitial;
        note = 'Buyer submitted initial offer based on quality and logistics.';
    } else if (buyerLastOffer >= buyerMaxPrice) {
        updateLotStatus('Deal Rejected');
        updateOffer({
          status: 'Rejected',
          history: [
             ...offer.history,
             { role: 'Buyer', price: buyerLastOffer, timestamp: new Date().toISOString(), note: 'Negotiation failed. Farmer expectation exceeds buyer maximum limits.' }
          ]
        });
        return;
    }

    updateLotStatus('Offer Received');
    updateOffer({
      buyerPrice: nextOffer,
      status: 'Countered',
      history: [
        ...offer.history,
        { role: 'Buyer', price: nextOffer, timestamp: new Date().toISOString(), note }
      ]
    });
  };
`;

content = content.replace(/const handleSimulateBuyerResponse = \(\) => \{[\s\S]*?const isAccepted = offer\.status === 'Accepted';/, newSimulate.trim() + '\n\n  const isAccepted = offer.status === \'Accepted\';');

fs.writeFileSync('src/features/offers/components/offers-dashboard.tsx', content, 'utf8');
console.log("Replaced simulate logic");

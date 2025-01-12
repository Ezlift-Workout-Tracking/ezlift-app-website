const cryptoTerms = [
  'crypto',
  'bitcoin',
  'btc',
  'ethereum',
  'eth',
  'dogecoin',
  'binance',
  'blockchain',
  'nft',
  'mining',
  'wallet',
  'coinbase',
  'altcoin',
  'defi',
  'token',
];

// Gambling terms
const gamblingTerms = [
  'casino',
  'poker',
  'betting',
  'gambling',
  'slots',
  'roulette',
  'blackjack',
  'lottery',
  'bet',
  'jackpot',
  'wagering',
  'sportsbook',
  'bingo',
];

// Financial scam terms
const financialScamTerms = [
  'millionaire',
  'bestseller',
  'bestselling',
  'billionaire',
  'cashback',
  'discount',
  'earn extra',
  'earn money',
  'earn per week',
  'easy money',
  'eliminate debt',
  'extra cash',
  'fast cash',
  'financial freedom',
  'free access',
  'free consultation',
  'free gift',
  'free hosting',
  'free info',
  'free investment',
  'free money',
  'free preview',
  'free quote',
  'free trial',
  'full refund',
  'get paid',
  'home based',
  'income',
  'investment',
  'lifetime',
  'lose weight',
  'luxury',
  'make money',
  'million dollars',
  'miracle',
  'money back',
  'no cost',
  'no fees',
  'no hidden costs',
  'no investment',
  'passive income',
  'pure profit',
  'refinance',
  'return on investment',
  'roi',
  'stock alert',
  'stock pick',
  'stock profit',
  'wealthy',
  'why pay more',
];

// Adult content/dating terms
const adultTerms = [
  'adult',
  'dating',
  'escort',
  'hookup',
  'mature',
  'dating site',
  'single',
  'hot girls',
  'hot guys',
  'meet singles',
];

// Pharmaceutical terms
const pharmaTerms = [
  'viagra',
  'cialis',
  'pharmacy',
  'prescription',
  'medicine online',
  'pills',
  'weight loss',
  'diet pill',
  'medication',
  'cheap meds',
  'online pharmacy',
  'no prescription',
];

// Spam trigger words
const spamTriggerTerms = [
  'act now',
  'action',
  'apply now',
  'buy now',
  'call now',
  'click below',
  'click here',
  'get it now',
  'don\'t delete',
  'exclusive deal',
  'expect to earn',
  'great offer',
  'guarantee',
  'guaranteed',
  'hello dear',
  'important information',
  'instant',
  'limited time',
  'new customers',
  'offer expires',
  'only',
  'order now',
  'please read',
  'special promotion',
  'urgent',
  'winner',
  'winning',
  'you have been selected',
  'your profile',
];

// Software/tech scam terms
const techScamTerms = [
  'activation key',
  'crack',
  'cracked',
  'download now',
  'free download',
  'free software',
  'hack',
  'hacked',
  'keygen',
  'license key',
  'nulled',
  'patch',
  'pirate',
  'serial key',
  'torrent',
  'warez',
];

// Combine all categories
export const spamWords = [
  ...cryptoTerms,
  ...gamblingTerms,
  ...financialScamTerms,
  ...adultTerms,
  ...pharmaTerms,
  ...spamTriggerTerms,
  ...techScamTerms,
];
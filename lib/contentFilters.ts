// Sensitive religious/political content patterns
const sensitivePatterns = {
  // Violence related
  violenceTerms: new Set([
    'bomb',
    'attack',
    'kill',
    'death',
    'murder',
    'violence',
    'terrorist',
    'genocide',
    'assassination',
    'massacre',
  ]),

  // Hate speech patterns
  hateTerms: new Set([
    'hitler',
    'nazi',
    'supremacy',
    'extremist',
    'jihad',
    'fascist',
  ]),

  // Political extremism
  extremismTerms: new Set([
    'radical',
    'extremist',
    'militant',
    'propaganda',
  ]),
};

// Enhanced content checking function
const checkSensitiveContent = (text: string): { isBlocked: boolean; reasons: string[] } => {
  const result = {
    isBlocked: false,
    reasons: [] as string[],
  };

  // Convert text to lowercase for better matching
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // Check for sensitive terms
  words.forEach(word => {
    if (sensitivePatterns.violenceTerms.has(word)) {
      result.reasons.push('Contains references to violence');
      result.isBlocked = true;
    }
    if (sensitivePatterns.hateTerms.has(word)) {
      result.reasons.push('Contains hate speech');
      result.isBlocked = true;
    }
    if (sensitivePatterns.extremismTerms.has(word)) {
      result.reasons.push('Contains extremist content');
      result.isBlocked = true;
    }
  });

  // Check for combinations of concerning patterns
  const hasViolence = words.some(word => sensitivePatterns.violenceTerms.has(word));
  const hasExtremism = words.some(word => sensitivePatterns.extremismTerms.has(word));
  
  if (hasViolence && hasExtremism) {
    result.reasons.push('Contains potentially dangerous content combinations');
    result.isBlocked = true;
  }

  return result;
};

// Enhanced file name checking
const isSuspiciousFileName = (fileName: string): boolean => {
  const suspicious = [
    /\d{8}_\d{6}/,          // Date_time pattern often used in automated attacks
    /vid_\d+/i,             // Generic video file pattern
    /[a-f0-9]{32}/i,        // MD5 hashes
    /[a-f0-9]{40}/i,        // SHA1 hashes
    /^[a-f0-9]{8,}$/i,      // Generic hash-like names
  ];

  return suspicious.some(pattern => pattern.test(fileName));
};

// URL safety check
const isSuspiciousURL = (url: string): boolean => {
  const suspicious = [
    /discord\.gg/i,         // Discord invites
    /discord\.com\/invite/i,
    /t\.me/i,               // Telegram links
    /telegram\.me/i,
    /(mega\.nz|mediafire\.com|anonfiles\.com)/i,  // File sharing sites
    /pastebin\.com/i,       // Code/text sharing sites
  ];

  return suspicious.some(pattern => pattern.test(url));
};

export {
  sensitivePatterns,
  checkSensitiveContent,
  isSuspiciousFileName,
  isSuspiciousURL,
};
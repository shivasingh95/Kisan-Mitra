// src/services/cropDoctor.js
// Plant identification via Pl@ntNet API + local Indian crop disease knowledge base
// Gemini removed — Pl@ntNet is the sole identification engine

const PLANTNET_API_KEY = import.meta.env.VITE_PLANTNET_API_KEY;

// In dev: Vite proxies /api/plantnet/* → https://my-api.plantnet.org/v2/identify/*
// This runs server-side so there are ZERO CORS issues
const PLANTNET_URL = '/api/plantnet/all';

// ── Convert ANY image → JPEG Blob via Canvas ──────────────────
// Pl@ntNet only accepts image/jpeg or image/png.
// This converts webp / heic / bmp / gif / etc. to JPEG before sending.
function toJpegBlob(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      // toBlob always produces image/jpeg — accepted by Pl@ntNet
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        0.9,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = objectUrl;
  });
}

// ── Pl@ntNet API call ─────────────────────────────────────────
async function identifyWithPlantNet(file) {
  // Always convert to JPEG — guaranteed valid format for Pl@ntNet
  const jpegBlob = await toJpegBlob(file);

  const form = new FormData();
  form.append('images', jpegBlob, 'crop.jpg'); // .jpg extension + image/jpeg MIME
  form.append('organs', 'leaf');               // 'leaf' is best for disease detection

  const res = await fetch(`${PLANTNET_URL}?api-key=${PLANTNET_API_KEY}&lang=en&nb-results=3`, {
    method: 'POST',
    body: form,
  });

  if (res.status === 404) {
    // Pl@ntNet returns 404 when it cannot identify any plant
    return null;
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pl@ntNet error ${res.status}: ${err}`);
  }

  return res.json();
}


// ── Indian Crop Disease Knowledge Base ────────────────────────
// Keyed by lowercase scientific name fragments or common name fragments
// Each entry maps to the most common disease farmers face for that crop in India
const CROP_DB = {
  // Rice
  'oryza': {
    crop: 'Rice 🌾', cropHi: 'धान',
    name: 'Rice Blast (Blast Disease)', nameHi: 'धान का ब्लास्ट रोग',
    severity: 'High', severityColor: '#D97706',
    desc: 'Caused by Magnaporthe oryzae fungus. Appears as diamond-shaped lesions with grey centers on leaves, neck, and panicle. Can cause 70-80% yield loss in severe cases.',
    treatment: [
      'Spray Tricyclazole 75% WP @ 0.6g/L water at first symptom',
      'Apply Isoprothiolane 40% EC @ 1.5ml/L as preventive spray',
      'Drain and re-irrigate fields to reduce humidity',
      'Remove and burn all infected plant material immediately',
    ],
    prevention: 'Use blast-resistant varieties like IR-64, Pusa-44. Avoid excess nitrogen. Maintain balanced fertilization with potassium.',
    hindiVoice: 'Aapki dhan ki fasal mein blast rog hai. Tricyclazole dawai spray karo. Khet se paani hatao aur beemar patte jalao.',
  },
  // Wheat
  'triticum': {
    crop: 'Wheat 🌾', cropHi: 'गेहूं',
    name: 'Wheat Stripe Rust', nameHi: 'गेहूं का पीला रस्ट',
    severity: 'High', severityColor: '#D97706',
    desc: 'Caused by Puccinia striiformis. Yellow-orange powdery stripes appear along leaf veins. Can reduce yield by up to 70% if left untreated during cool, moist weather.',
    treatment: [
      'Spray Propiconazole 25% EC @ 1ml/L water at first sign',
      'Apply Tebuconazole 250 EW @ 1ml/L as second spray after 15 days',
      'Use certified rust-resistant seed for next season',
      'Avoid excess nitrogen fertilizer after jointing stage',
    ],
    prevention: 'Sow rust-resistant varieties: HD-2781, WH-1105. Early sowing before November. Maintain 20cm row spacing for good airflow.',
    hindiVoice: 'Aapki gehun mein pila rust hai. Propiconazole spray karo aur 15 din baad dobara spray karo. Agli fasal mein rust-resistant beej lagao.',
  },
  // Cotton
  'gossypium': {
    crop: 'Cotton 🌿', cropHi: 'कपास',
    name: 'Cotton Leaf Curl Virus', nameHi: 'कपास का पत्ता मरोड़ रोग',
    severity: 'Critical', severityColor: '#DC2626',
    desc: 'Transmitted by whitefly (Bemisia tabaci). Leaves curl upward and thicken. Veins turn dark. Severely affected plants are stunted and produce no bolls.',
    treatment: [
      'Apply Imidacloprid 70% WS @ 5-7g per kg seed for seed treatment',
      'Spray Thiamethoxam 25% WG @ 0.3g/L to control whitefly vector',
      'Remove and destroy all heavily infected plants',
      'Install yellow sticky traps @ 10/acre to monitor whitefly',
    ],
    prevention: 'Plant CLCuV-tolerant varieties. Remove volunteer cotton plants. Avoid late sowing. Control whitefly population from day 1.',
    hindiVoice: 'Aapki kapas mein patta marod rog hai jo safed makhi se phailta hai. Imidacloprid spray karo, beemar paudhon ko ukhaad kar jalao.',
  },
  // Maize/Corn
  'zea': {
    crop: 'Maize 🌽', cropHi: 'मक्का',
    name: 'Maize Turcicum Blight', nameHi: 'मक्का का झुलसा रोग',
    severity: 'Medium', severityColor: '#F59E0B',
    desc: 'Caused by Exserohilum turcicum. Long, cigar-shaped tan lesions with dark borders appear on leaves. Heavy infection causes leaves to die from tip downward.',
    treatment: [
      'Spray Mancozeb 75% WP @ 2g/L water at disease onset',
      'Apply Propiconazole 25% EC @ 1ml/L for heavy infection',
      'Ensure proper plant spacing for good air circulation',
      'Avoid overhead irrigation during cool, cloudy weather',
    ],
    prevention: 'Use resistant hybrids. Rotate with non-host crops (soybean, wheat). Deep plough to bury crop residue after harvest.',
    hindiVoice: 'Aapki makka mein jhulsa rog hai. Mancozeb spray karo. Paudhon ke beech jagah rakho taki hawa chale.',
  },
  // Tomato
  'solanum lycopersicum': {
    crop: 'Tomato 🍅', cropHi: 'टमाटर',
    name: 'Tomato Early Blight', nameHi: 'टमाटर का अगेती झुलसा',
    severity: 'Medium', severityColor: '#F59E0B',
    desc: 'Caused by Alternaria solani. Dark brown spots with concentric rings (target-board pattern) on lower leaves first. Causes premature defoliation and fruit rot.',
    treatment: [
      'Spray Chlorothalonil 75% WP @ 2g/L water every 7-10 days',
      'Apply Copper Oxychloride 50% WP @ 3g/L for organic management',
      'Remove infected lower leaves and destroy them',
      'Stake plants to improve airflow and reduce humidity',
    ],
    prevention: 'Use certified disease-free seed. Maintain 60cm plant spacing. Avoid wetting foliage when irrigating. Mulch soil to reduce splash.',
    hindiVoice: 'Aapke tamatar mein ageti jhulsa rog hai. Chlorothalonil spray karo har 7-10 din mein. Neeche ke beemar patte toD kar jalao.',
  },
  // Potato
  'solanum tuberosum': {
    crop: 'Potato 🥔', cropHi: 'आलू',
    name: 'Late Blight (Phytophthora)', nameHi: 'आलू का पछेती झुलसा',
    severity: 'Critical', severityColor: '#DC2626',
    desc: 'Caused by Phytophthora infestans. Water-soaked lesions on leaves turn brown rapidly. White fungal growth on leaf undersides in humid conditions. Can destroy entire crop in 7-10 days.',
    treatment: [
      'Spray Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L immediately',
      'Apply Cymoxanil + Mancozeb @ 2g/L as alternating spray',
      'Spray every 5-7 days during cool, wet weather',
      'Destroy all infected foliage — do not compost',
    ],
    prevention: 'Plant certified blight-free tubers. Avoid excessive irrigation. Hill up soil around base. Plant resistant varieties like Kufri Jyoti.',
    hindiVoice: 'Aapke aalu mein pichheti jhulsa rog hai — yeh bahut khatarnak hai. Foran Ridomil Gold spray karo aur beemar patte jala do. Der mat karo.',
  },
  // Chickpea
  'cicer': {
    crop: 'Chickpea 🫘', cropHi: 'चना',
    name: 'Chickpea Wilt (Fusarium)', nameHi: 'चने का उकठा रोग',
    severity: 'High', severityColor: '#D97706',
    desc: 'Caused by Fusarium oxysporum. Plants wilt suddenly despite adequate moisture. Roots show internal brown discoloration. Entire plant collapses and dries up.',
    treatment: [
      'Seed treatment with Trichoderma viride @ 4g/kg seed before sowing',
      'Drench soil with Carbendazim 50% WP @ 1g/L near affected plants',
      'Remove and destroy wilted plants to stop spread',
      'Apply potash fertilizer to boost plant immunity',
    ],
    prevention: 'Use wilt-resistant varieties: JG-315, KWR-108. Avoid waterlogging. Rotate with wheat or sorghum. Treat soil with Trichoderma bio-agent.',
    hindiVoice: 'Aapke chane mein ukhta rog hai. Trichoderma dawai beej ko lagao agli baar. Abhi Carbendazim se mitti bhigo aur beemar paudhon ko ukhaad lo.',
  },
  // Sugarcane
  'saccharum': {
    crop: 'Sugarcane 🎋', cropHi: 'गन्ना',
    name: 'Red Rot of Sugarcane', nameHi: 'गन्ने का लाल सड़न रोग',
    severity: 'High', severityColor: '#D97706',
    desc: 'Caused by Colletotrichum falcatum. Internal reddening of stalk with white patches. Infected canes emit sour smell of alcohol. Leaves dry from tip downward.',
    treatment: [
      'Sett treatment with Carbendazim 50% WP @ 1g/L for 30 minutes before planting',
      'Remove and burn all infected canes immediately',
      'Avoid ratoon crop from infected fields',
      'Apply Trichoderma @ 4kg/acre in soil at planting',
    ],
    prevention: 'Plant resistant varieties: CoJ-64, CoSe-95422. Use healthy disease-free setts. Avoid waterlogging. Rogue out and burn infected plants early.',
    hindiVoice: 'Aapke ganne mein lal sadan rog hai. Beemar ganne fauran kheench kar jalao. Agli baijee Ko Carbendazim mein duboke lagao.',
  },
  // Soybean
  'glycine': {
    crop: 'Soybean 🫘', cropHi: 'सोयाबीन',
    name: 'Soybean Rust (Asian Rust)', nameHi: 'सोयाबीन का रस्ट',
    severity: 'Medium', severityColor: '#F59E0B',
    desc: 'Caused by Phakopsora pachyrhizi. Small tan/brown pustules on lower leaf surface. Causes premature defoliation and significant yield reduction of 10-40%.',
    treatment: [
      'Spray Tebuconazole 25.9% EC @ 1ml/L at first pustule appearance',
      'Apply Hexaconazole 5% SC @ 2ml/L as second spray after 15 days',
      'Avoid late sowing to reduce exposure to humid conditions',
      'Ensure good drainage to reduce canopy humidity',
    ],
    prevention: 'Sow early (June 15-30 in MP). Use certified seed. Maintain 45cm row spacing. Monitor lower leaves weekly from flowering stage.',
    hindiVoice: 'Aapki soyabean mein rust rog hai. Tebuconazole spray karo. Jaldi buwai se yeh bimari kam hoti hai.',
  },
  // Groundnut
  'arachis': {
    crop: 'Groundnut 🥜', cropHi: 'मूंगफली',
    name: 'Tikka / Leaf Spot Disease', nameHi: 'मूंगफली का टिक्का रोग',
    severity: 'Medium', severityColor: '#F59E0B',
    desc: 'Caused by Cercospora arachidicola (early) and Cercosporidium personatum (late). Circular brown spots with yellow halo on leaves. Early defoliation reduces pod fill significantly.',
    treatment: [
      'Spray Chlorothalonil 75% WP @ 2g/L at 30-35 days after sowing',
      'Repeat spray with Mancozeb 75% WP @ 2.5g/L every 10 days',
      'Apply up to 3-4 sprays during the season',
      'Avoid late-evening irrigation to keep foliage dry overnight',
    ],
    prevention: 'Use resistant varieties (TAG-24, GG-20). Maintain field sanitation. Remove crop debris after harvest. Treat seed with Thiram @ 3g/kg.',
    hindiVoice: 'Aapki mungfali mein tikka rog hai. Chlorothalonil spray karo aur 10 din mein dobara spray karo. Shaam ko sinchai mat karo.',
  },
  // Mango
  'mangifera': {
    crop: 'Mango 🥭', cropHi: 'आम',
    name: 'Mango Anthracnose', nameHi: 'आम का एन्थ्रेक्नोज',
    severity: 'Medium', severityColor: '#F59E0B',
    desc: 'Caused by Colletotrichum gloeosporioides. Dark brown/black irregular spots on leaves, flowers and fruits. Post-harvest fruit rot is a major economic loss.',
    treatment: [
      'Spray Carbendazim 50% WP @ 1g/L at pre-flowering stage',
      'Apply Copper Oxychloride 50% WP @ 3g/L during flowering',
      'Spray Mancozeb 75% WP @ 2g/L on young fruits',
      'Prune dense canopy to improve air circulation',
    ],
    prevention: 'Prune dead wood regularly. Collect and destroy fallen infected leaves. Apply preventive copper spray before monsoon.',
    hindiVoice: 'Aapke aam mein anthracnose rog hai. Carbendazim spray karo phoolon se pehle. Baarish se pehle copper spray zaroor karo.',
  },
  // Banana
  'musa': {
    crop: 'Banana 🍌', cropHi: 'केला',
    name: 'Panama Wilt (Fusarium Wilt)', nameHi: 'केले का पनामा विल्ट',
    severity: 'Critical', severityColor: '#DC2626',
    desc: 'Caused by Fusarium oxysporum f.sp. cubense. Leaves turn yellow from oldest to youngest. Internal vascular tissue shows brown discoloration. No effective chemical cure exists.',
    treatment: [
      'Remove and destroy infected plants immediately — do not replant bananas in same spot',
      'Drench soil with Trichoderma viride @ 10g/L as preventive biocontrol',
      'Disinfect tools with 10% bleach solution before moving to another plot',
      'Apply lime to raise soil pH above 6.5 to suppress pathogen',
    ],
    prevention: 'Use resistant tissue culture plants. Improve soil drainage. Avoid wounding corm. Practice crop rotation with cereals for 3-4 years.',
    hindiVoice: 'Aapke kele mein Panama wilt hai — iska koi dawai ilaj nahi. Beemar paudhon ko ukhaad kar jalao. Us jagah 3-4 saal kela mat lagao.',
  },
  // Onion
  'allium cepa': {
    crop: 'Onion 🧅', cropHi: 'प्याज',
    name: 'Purple Blotch of Onion', nameHi: 'प्याज का बैंगनी धब्बा',
    severity: 'Medium', severityColor: '#F59E0B',
    desc: 'Caused by Alternaria porri. Small white spots develop into large purple lesions with yellow borders on leaves. Severe infection causes complete leaf death and bulb rot.',
    treatment: [
      'Spray Iprodione 50% WP @ 2g/L at first symptom',
      'Apply Mancozeb 75% WP @ 2.5g/L preventively every 10 days',
      'Add sticker (Triton/Sandovit) @ 1ml/10L to improve spray coverage',
      'Reduce irrigation frequency to lower humidity inside crop canopy',
    ],
    prevention: 'Use disease-free transplants. Maintain 15cm plant spacing. Avoid overhead irrigation. Destroy crop debris after harvest.',
    hindiVoice: 'Aapki pyaaz mein baingani dhabba rog hai. Mancozeb spray karo aur 10 din mein dobara karo. Sinchai kam karo.',
  },
};

// ── Species → DB key matcher ──────────────────────────────────
function lookupCrop(scientificName, commonNames) {
  const sci = scientificName.toLowerCase();
  const common = commonNames.map(n => n.toLowerCase()).join(' ');

  // Try full scientific name match first
  for (const key of Object.keys(CROP_DB)) {
    if (sci.startsWith(key) || sci.includes(key)) {
      return CROP_DB[key];
    }
  }

  // Try common name match
  const commonNameMap = {
    rice: 'oryza', paddy: 'oryza',
    wheat: 'triticum',
    cotton: 'gossypium',
    maize: 'zea', corn: 'zea',
    tomato: 'solanum lycopersicum',
    potato: 'solanum tuberosum',
    chickpea: 'cicer', gram: 'cicer', chana: 'cicer',
    sugarcane: 'saccharum',
    soybean: 'glycine', soya: 'glycine',
    groundnut: 'arachis', peanut: 'arachis',
    mango: 'mangifera',
    banana: 'musa', plantain: 'musa',
    onion: 'allium cepa',
  };

  for (const [keyword, dbKey] of Object.entries(commonNameMap)) {
    if (common.includes(keyword) || sci.includes(keyword)) {
      return CROP_DB[dbKey];
    }
  }

  return null;
}

// ── Main export ───────────────────────────────────────────────
export async function analyzeCropImage(file) {
  if (!PLANTNET_API_KEY) {
    console.warn('VITE_PLANTNET_API_KEY not set — showing demo result.');
    return getDemoResult();
  }

  const data = await identifyWithPlantNet(file);

  // Pl@ntNet returns null or 404 when image is unrecognizable
  if (!data || !data.results || data.results.length === 0) {
    return getInvalidImageResult();
  }

  const top = data.results[0];
  const species = top.species;
  const confidence = Math.round(top.score * 100);
  const scientificName = species.scientificNameWithoutAuthor;
  const commonNames = species.commonNames || [];
  const displayName = commonNames[0] || scientificName;

  const cropInfo = lookupCrop(scientificName, commonNames);

  if (!cropInfo) {
    // Plant identified but not an Indian crop in our DB
    return {
      name: 'Plant Identified — Not a Common Crop',
      nameHi: 'पौधा पहचाना गया — सामान्य फसल नहीं',
      crop: `${displayName} 🌿`,
      scientificName,
      confidence,
      severity: 'None',
      severityColor: '#22C55E',
      desc: `Pl@ntNet identified this as "${scientificName}" (${displayName}) with ${confidence}% confidence. This species is not in our Indian crop disease database. Please consult your local Krishi Vigyan Kendra (KVK) for specific advice.`,
      treatment: [
        'Consult your nearest Krishi Vigyan Kendra (KVK)',
        'Call Kisan Call Center: 1800-180-1551 (free)',
        'Share this plant identification with a local agricultural expert',
        'Submit crop photos to the state agriculture department helpline',
      ],
      prevention: 'Maintain general crop hygiene — remove dead material, ensure proper drainage, and avoid overwatering.',
      hindiVoice: `Is paudhe ko Pl@ntNet ne ${displayName} pehchana hai. Yeh hamari fasal database mein nahi hai. Apne nazdiki KVK ya Kisan Call Center 1800-180-1551 pe call karo.`,
      remainingRequests: data.remainingIdentificationRequests,
    };
  }

  return {
    ...cropInfo,
    scientificName,
    commonName: displayName,
    confidence,
    remainingRequests: data.remainingIdentificationRequests,
  };
}

// ── Result helpers ────────────────────────────────────────────
function getInvalidImageResult() {
  return {
    name: 'Invalid Image',
    nameHi: 'अमान्य छवि',
    crop: 'Unknown 🌿',
    severity: 'None',
    severityColor: '#22C55E',
    confidence: 0,
    desc: 'Pl@ntNet could not identify any plant in this image. Please upload a clear, well-lit photo of a crop leaf, flower, or stem.',
    treatment: [
      'Use a clear, focused photo with good natural lighting',
      'Make sure the plant fills most of the frame',
      'Capture one plant organ at a time (leaf, flower, or stem)',
      'Avoid blurry, dark, or distant photos',
    ],
    prevention: 'For best results, photograph a single leaf against a plain background in daylight.',
    hindiVoice: 'Tasveer saaf nahi hai. Ek patte ki saaf tasveer lo aur dobara bhejo.',
  };
}

function getDemoResult() {
  return {
    name: 'Wheat Stripe Rust (Demo)',
    nameHi: 'गेहूं का पीला रस्ट (डेमो)',
    crop: 'Wheat 🌾',
    scientificName: 'Triticum aestivum',
    confidence: 91,
    severity: 'High',
    severityColor: '#D97706',
    desc: 'DEMO MODE: Pl@ntNet API key not set. In production, Pl@ntNet identifies the crop species, then this app looks up the most common disease and treatment for Indian farmers.',
    treatment: [
      'Add VITE_PLANTNET_API_KEY to your .env file',
      'Get your free key at: https://my.plantnet.org/settings/api-key',
      'Restart the dev server after adding the key',
      'Upload any crop photo to get a real identification',
    ],
    prevention: 'Set up your Pl@ntNet API key to enable live plant identification.',
    hindiVoice: 'Yeh demo mode hai. API key lagao aur real tasveer bhejo.',
  };
}

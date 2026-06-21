import { ExerciseType, Language, ScoreBreakdown, ScoreResult, ProductRecommendation } from '../types';
import { t } from '../constants/i18n';

// ─── Sport category grouping ──────────────────────────────────────────────────
type SportCategory = 'endurance' | 'strength' | 'court' | 'team' | 'outdoor' | 'mind_body';

function getSportCategory(sport: ExerciseType): SportCategory {
  const map: Record<ExerciseType, SportCategory> = {
    running: 'endurance', cycling: 'endurance', swimming: 'endurance', triathlon: 'endurance',
    gym: 'strength', crossfit: 'strength', boxing: 'strength', martial_arts: 'strength',
    padel: 'court', tennis: 'court', golf: 'court',
    football: 'team', basketball: 'team', rugby: 'team', volleyball: 'team', baseball: 'team',
    hiking: 'outdoor', skiing: 'outdoor', surf: 'outdoor', climbing: 'outdoor', horse_riding: 'outdoor', skateboard: 'outdoor',
    yoga: 'mind_body', pilates: 'mind_body', dance: 'mind_body',
  };
  return map[sport] ?? 'strength';
}

// ─── Product pool per category ────────────────────────────────────────────────
const PRODUCTS: Record<SportCategory, Array<{ name: string; brand: string; reason: Record<Language, string>; url: string; type: 'replace' | 'add' }>> = {
  endurance: [
    {
      name: 'Air Zoom Pegasus 41',
      brand: 'Nike',
      reason: { es: 'La zapatilla de running más versátil del mercado. Amortiguación React + placa de fibra de carbono para tu zancada.', en: 'The most versatile running shoe on the market. React cushioning + carbon fiber plate for your stride.' },
      url: 'https://www.nike.com/w/running-shoes-37v7j',
      type: 'replace',
    },
    {
      name: 'Swiftly Tech Long Sleeve 2.0',
      brand: 'Lululemon',
      reason: { es: 'La referencia en camisetas técnicas de running. Tejido sin costuras que elimina roces y gestiona el sudor de forma óptima.', en: 'The benchmark in technical running tops. Seamless fabric that eliminates chafing and manages sweat optimally.' },
      url: 'https://www.lululemon.com/c/running',
      type: 'replace',
    },
    {
      name: 'Gel-Nimbus 26',
      brand: 'ASICS',
      reason: { es: 'Máxima amortiguación para largas distancias. La tecnología FF BLAST+ proporciona un retorno de energía superior.', en: 'Maximum cushioning for long distances. FF BLAST+ technology provides superior energy return.' },
      url: 'https://www.asics.com/us/en-us/running-shoes/',
      type: 'replace',
    },
    {
      name: 'Sense Pro 3 Running Vest',
      brand: 'Salomon',
      reason: { es: 'Chaleco de hidratación de referencia para trail y media distancia. Completa cualquier look deportivo con funcionalidad real.', en: 'The reference hydration vest for trail and mid-distance running. Completes any sports look with real functionality.' },
      url: 'https://www.salomon.com/en-us/sport/trail-running',
      type: 'add',
    },
    {
      name: 'Cloudmonster 2',
      brand: 'On Running',
      reason: { es: 'Zapatilla de alto rendimiento con tecnología CloudTec. Diseño minimalista que combina con cualquier outfit de running.', en: 'High-performance shoe with CloudTec technology. Minimalist design that pairs with any running outfit.' },
      url: 'https://www.on.com/en-us/shop/running',
      type: 'replace',
    },
    {
      name: 'Adapt Lite-Show Run Jacket',
      brand: 'Adidas',
      reason: { es: 'Chaqueta reflectante ultraligera para running. Protege sin añadir peso y eleva el look con tecnología AEROREADY.', en: 'Ultralight reflective running jacket. Protects without adding weight and elevates the look with AEROREADY technology.' },
      url: 'https://www.adidas.com/us/running',
      type: 'add',
    },
  ],
  strength: [
    {
      name: 'Vital Seamless 2.0 Shorts',
      brand: 'Gymshark',
      reason: { es: 'Los shorts de entrenamiento más valorados del mercado. Sin costuras laterales, tejido que moldea y aguanta cualquier WOD.', en: 'The highest-rated training shorts on the market. No side seams, sculpting fabric that handles any WOD.' },
      url: 'https://www.gymshark.com/collections/mens-training',
      type: 'replace',
    },
    {
      name: 'Metcon 9',
      brand: 'Nike',
      reason: { es: 'La zapatilla de entrenamiento funcional por excelencia. Suela plana para levantamientos, amortiguación para HIIT.', en: 'The quintessential functional training shoe. Flat sole for lifting, cushioning for HIIT.' },
      url: 'https://www.nike.com/w/training-gym-shoes',
      type: 'replace',
    },
    {
      name: 'Metal Vent Tech Short Sleeve 2.0',
      brand: 'Lululemon',
      reason: { es: 'Tejido antimicrobiano y ultraventilado para sesiones intensas. El ajuste técnico perfecto para el box o el gimnasio.', en: 'Antimicrobial, ultra-ventilated fabric for intense sessions. The perfect technical fit for the box or gym.' },
      url: 'https://www.lululemon.com/c/mens-training',
      type: 'replace',
    },
    {
      name: 'HOVR Rise 4',
      brand: 'Under Armour',
      reason: { es: 'Zapatilla de cross-training con amortiguación HOVR. Ideal para sesiones que combinan cardio y fuerza.', en: 'Cross-training shoe with HOVR cushioning. Ideal for sessions combining cardio and strength.' },
      url: 'https://www.underarmour.com/en-us/c/gym-training',
      type: 'replace',
    },
    {
      name: 'Lifting Belt Nylon',
      brand: 'Rogue Fitness',
      reason: { es: 'Cinturón de levantamiento que añade seguridad y un look de atleta serio. Complemento esencial para cualquier outfit de gym.', en: 'Lifting belt that adds safety and a serious athlete look. Essential complement for any gym outfit.' },
      url: 'https://www.roguefitness.com/weightlifting-belts',
      type: 'add',
    },
    {
      name: 'RUSH Seamless Grid Hoodie',
      brand: 'Under Armour',
      reason: { es: 'Sudadera técnica con rejilla de ventilación estratégica. Perfecta como capa de calentamiento pre-entrenamiento.', en: 'Technical hoodie with strategic ventilation mesh. Perfect as a pre-workout warm-up layer.' },
      url: 'https://www.underarmour.com/en-us/c/gym-training',
      type: 'add',
    },
  ],
  court: [
    {
      name: 'Court Advantage Top',
      brand: 'Nike',
      reason: { es: 'Camiseta técnica diseñada específicamente para pista. Tejido Dri-FIT que mantiene la temperatura en partidos largos.', en: 'Technical shirt specifically designed for the court. Dri-FIT fabric that maintains temperature in long matches.' },
      url: 'https://www.nike.com/w/tennis-clothing',
      type: 'replace',
    },
    {
      name: 'Propulse Fury AC',
      brand: 'Babolat',
      reason: { es: 'La zapatilla de referencia en pádel y tenis. Suela herringbone específica para pista, máximo agarre lateral.', en: 'The reference shoe in padel and tennis. Specific herringbone sole for the court, maximum lateral grip.' },
      url: 'https://www.babolat.com/en/shoes',
      type: 'replace',
    },
    {
      name: 'Performance Short',
      brand: 'Bullpadel',
      reason: { es: 'Short de pádel con tejido técnico y bolsillos para pelotas. Comodidad y estilo en cada movimiento en pista.', en: 'Padel shorts with technical fabric and ball pockets. Comfort and style in every court movement.' },
      url: 'https://www.bullpadel.com/en/clothing/shorts',
      type: 'replace',
    },
    {
      name: 'Barricade 13',
      brand: 'Adidas',
      reason: { es: 'Zapatilla de tenis de alta durabilidad con sistema Barricade. Control lateral superior para movimientos explosivos.', en: 'High-durability tennis shoe with Barricade system. Superior lateral control for explosive movements.' },
      url: 'https://www.adidas.com/us/tennis-shoes',
      type: 'replace',
    },
    {
      name: 'Court Wristband & Headband Set',
      brand: 'Nike',
      reason: { es: 'Accesorios de pista que elevan el look y tienen función real: absorben el sudor sin molestar el juego.', en: 'Court accessories that elevate the look and serve a real purpose: absorb sweat without disrupting play.' },
      url: 'https://www.nike.com/w/tennis-accessories',
      type: 'add',
    },
  ],
  team: [
    {
      name: 'Dri-FIT Academy 21 Jersey',
      brand: 'Nike',
      reason: { es: 'Camiseta de juego con tejido Dri-FIT de alto rendimiento. El estándar de facto en equipaciones de fútbol y baloncesto.', en: 'Game jersey with high-performance Dri-FIT fabric. The de facto standard in football and basketball kits.' },
      url: 'https://www.nike.com/w/team-sports-clothing',
      type: 'replace',
    },
    {
      name: 'Tiro 23 League Training Pants',
      brand: 'Adidas',
      reason: { es: 'Pantalón de entrenamiento con bolsillos y ajuste slim. Ideal para sesiones de equipo con funcionalidad y estilo.', en: 'Training pants with pockets and slim fit. Ideal for team sessions with functionality and style.' },
      url: 'https://www.adidas.com/us/football-pants',
      type: 'replace',
    },
    {
      name: 'Fresh Foam X 860v14',
      brand: 'New Balance',
      reason: { es: 'Zapatilla polivalente para entrenamientos de equipo. Amortiguación Fresh Foam para largas sesiones en pista y césped.', en: 'Versatile shoe for team training. Fresh Foam cushioning for long sessions on track and turf.' },
      url: 'https://www.newbalance.com/sport/running/',
      type: 'replace',
    },
    {
      name: 'Compression Long Tight',
      brand: 'Under Armour',
      reason: { es: 'Malla de compresión para usar bajo el short de juego. Reduce la fatiga muscular y añade un look profesional.', en: 'Compression legging to wear under game shorts. Reduces muscle fatigue and adds a professional look.' },
      url: 'https://www.underarmour.com/en-us/c/compression',
      type: 'add',
    },
  ],
  outdoor: [
    {
      name: 'X Ultra 4 GTX',
      brand: 'Salomon',
      reason: { es: 'La bota de senderismo más premiada del sector. Membrana GORE-TEX y suela Contagrip para terreno exigente.', en: 'The most awarded hiking boot in the sector. GORE-TEX membrane and Contagrip sole for demanding terrain.' },
      url: 'https://www.salomon.com/en-us/sport/hiking',
      type: 'replace',
    },
    {
      name: 'Houdini Air Jacket',
      brand: 'Patagonia',
      reason: { es: 'La chaqueta cortavientos más ligera del mercado. Cabe en el bolsillo y añade una capa técnica esencial para exteriores.', en: 'The lightest windbreaker on the market. Fits in a pocket and adds an essential technical layer for outdoor activities.' },
      url: 'https://www.patagonia.com/shop/mens-jackets-vests',
      type: 'add',
    },
    {
      name: 'Gamma SL Hybrid Hoody',
      brand: "Arc'teryx",
      reason: { es: 'La referencia en softshell outdoor. Protección contra el viento y la lluvia con libertad de movimiento total.', en: 'The outdoor softshell benchmark. Wind and rain protection with total freedom of movement.' },
      url: 'https://arcteryx.com/us/en/shop/mens/softshells',
      type: 'add',
    },
    {
      name: 'Speed Cross 6',
      brand: 'Salomon',
      reason: { es: 'Zapatilla de trail iconic con grip agresivo. El calzado definitivo para senderismo técnico y trail running.', en: 'Iconic trail shoe with aggressive grip. The ultimate footwear for technical hiking and trail running.' },
      url: 'https://www.salomon.com/en-us/sport/trail-running',
      type: 'replace',
    },
    {
      name: 'Trail Glove 5',
      brand: 'Merrell',
      reason: { es: 'Zapatilla minimalista para escalada y trail. Suela Vibram que maximiza la sensación de terreno.', en: 'Minimalist shoe for climbing and trail. Vibram sole that maximizes ground feel.' },
      url: 'https://www.merrell.com/US/en/trail-running/',
      type: 'replace',
    },
  ],
  mind_body: [
    {
      name: 'Align Pant II',
      brand: 'Lululemon',
      reason: { es: 'La malla de yoga de referencia. Tejido Nulu ultraliso que se mueve contigo en cada asana sin restricciones.', en: 'The reference yoga legging. Ultra-smooth Nulu fabric that moves with you in every asana without restrictions.' },
      url: 'https://www.lululemon.com/c/yoga',
      type: 'replace',
    },
    {
      name: 'Warrior Compression Short',
      brand: 'Alo Yoga',
      reason: { es: 'Short de yoga y pilates con tejido de compresión media. Perfecto para flujos dinámicos y sesiones en suelo.', en: 'Yoga and pilates short with medium compression fabric. Perfect for dynamic flows and floor sessions.' },
      url: 'https://www.aloyoga.com/collections/mens-bottoms',
      type: 'replace',
    },
    {
      name: 'Everyday Plus Mat 6mm',
      brand: 'Lululemon',
      reason: { es: 'No es prenda, pero completa cualquier look de yoga. El accesorio visual más impactante de tu sesión.', en: 'Not a garment, but it completes any yoga look. The most visually impactful accessory of your session.' },
      url: 'https://www.lululemon.com/c/yoga-mats',
      type: 'add',
    },
    {
      name: 'ABC Jogger',
      brand: 'Lululemon',
      reason: { es: 'El jogger técnico de referencia para yoga y pilates. Tejido Warpstreme con 4 vías de elasticidad para máxima libertad.', en: 'The reference technical jogger for yoga and pilates. Warpstreme fabric with 4-way stretch for maximum freedom.' },
      url: 'https://www.lululemon.com/c/mens-training',
      type: 'replace',
    },
  ],
};

// ─── Score logic ──────────────────────────────────────────────────────────────
function weightedRandom(): number {
  const weights = [5, 15, 30, 30, 15, 5];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i + 5;
  }
  return 7;
}

function distributeScore(total: number): ScoreBreakdown {
  const values = [0, 0, 0, 0, 0];
  let remaining = total;
  for (let i = 0; i < 5; i++) {
    const maxV = Math.min(2, remaining);
    const minV = Math.max(0, remaining - (4 - i) * 2);
    const v = Math.round((minV + Math.random() * (maxV - minV)) * 2) / 2;
    values[i] = Math.min(2, Math.max(0, v));
    remaining -= values[i];
  }
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum !== total) values[0] = Math.min(2, Math.max(0, values[0] + (total - sum)));
  return {
    coordination: values[0],
    fit: values[1],
    appropriateness: values[2],
    trend: values[3],
    completeness: values[4],
  };
}

const REC_POOL: Record<SportCategory, Record<Language, string[][]>> = {
  endurance: {
    es: [
      ['La coordinación de colores es mejorable. Apuesta por un esquema bicolor: tono dominante + un acento en detalles reflectantes.', 'El calzado determina el 40% de la percepción del look deportivo. Considera una zapatilla más actual.', 'Falta una capa exterior. Un cortavientos ultraligero elevaría el outfit y añadiría funcionalidad real.'],
      ['El tejido técnico está bien elegido. Trabaja la coordinación: que las zapatillas recojan al menos un color de la camiseta.', 'Los calcetines técnicos son el detalle que separa un look bueno de uno excelente. Invierte en unos de altura media.', 'Añade un accesorio de cabeza: visera o gorra técnica ligada al color principal del outfit.'],
      ['Coordinación impecable. El siguiente nivel: accesorios funcionales que complementen sin sobrecargar.', 'El ajuste es muy bueno. Para running, la camiseta puede ser ligeramente más ceñida en el torso.', 'Outfit muy sólido. Una banda de brazo para el móvil/auriculares añadiría el toque atleta completo.'],
    ],
    en: [
      ['Color coordination needs work. Go for a two-color scheme: dominant tone + an accent in reflective details.', 'Footwear determines 40% of the perception of a sports look. Consider a more current shoe.', 'A top layer is missing. An ultralight windbreaker would elevate the outfit and add real functionality.'],
      ['The technical fabric is well chosen. Work on coordination: the shoes should echo at least one color from the shirt.', 'Technical socks are the detail that separates a good look from an excellent one. Invest in a mid-height pair.', 'Add a head accessory: a visor or technical cap tied to the outfit\'s main color.'],
      ['Impeccable coordination. Next level: functional accessories that complement without overloading.', 'The fit is very good. For running, the shirt can be slightly more fitted at the torso.', 'Very solid outfit. An arm band for phone/earphones would add the complete athlete touch.'],
    ],
  },
  strength: {
    es: [
      ['Los colores del outfit compiten entre sí. Unifica: negro base o gris oscuro con un solo acento de color.', 'El calzado de entrenamiento es determinante. Las zapatillas de calle restan mucho a este tipo de look.', 'Falta definición en el conjunto. Un short o malla que ajuste mejor marcaría la diferencia.'],
      ['El tejido técnico funciona. Mejora la coordinación entre la parte superior e inferior del outfit.', 'El calzado eleva el look. Considera añadir una muñequera o cinta de cabeza funcional.', 'Un cortavientos o sudadera técnica como capa añadiría versatilidad y estilo al conjunto.'],
      ['Outfit de entrenamiento de alto nivel. Los colores y el ajuste son excelentes.', 'La elección de calzado es perfecta para la actividad. El conjunto comunica rendimiento y estilo.', 'Solo falta un accesorio: reloj deportivo o pulsera de fitness que complete el look atlético.'],
    ],
    en: [
      ['The outfit colors compete with each other. Unify: black base or dark gray with a single color accent.', 'Training footwear is key. Street shoes detract significantly from this type of look.', 'The outfit lacks definition. Better-fitting shorts or leggings would make the difference.'],
      ['The technical fabric works. Improve coordination between the top and bottom of the outfit.', 'The footwear elevates the look. Consider adding a functional wristband or headband.', 'A windbreaker or technical hoodie as a layer would add versatility and style to the ensemble.'],
      ['High-level training outfit. Colors and fit are excellent.', 'The footwear choice is perfect for the activity. The ensemble communicates performance and style.', 'Just missing one accessory: a sports watch or fitness band to complete the athletic look.'],
    ],
  },
  court: {
    es: [
      ['El calzado de pista es el elemento más crítico: debe ser específico para la superficie. El calzado actual no lo parece.', 'El look de pista debe ser compacto y sin capas innecesarias. Simplifica la combinación de prendas.', 'Considera prendas de pista con mayor control de la humedad. Los tejidos ordinarios penalizan en partidos largos.'],
      ['El look de pista está bien orientado. Trabaja la coordinación: polo/camiseta y short en la misma gama cromática.', 'El calzado es correcto. Añade calcetines técnicos de pádel o tenis: hacen una diferencia visual real.', 'Una visera o banda de sudor añadiría el toque profesional que le falta al conjunto.'],
      ['Look de pista muy completo y coordinado. Transmite nivel técnico desde el primer vistazo.', 'El calzado específico de pista es un acierto total. La suela correcta eleva todo el conjunto.', 'Añade un accesorio de muñeca funcional para completar el look de jugador de nivel.'],
    ],
    en: [
      ['Court footwear is the most critical element: it must be surface-specific. The current shoes don\'t appear to be.', 'A court look should be compact and without unnecessary layers. Simplify the clothing combination.', 'Consider court garments with better moisture control. Regular fabrics are a disadvantage in long matches.'],
      ['The court look is well-oriented. Work on coordination: polo/shirt and shorts in the same color range.', 'The footwear is correct. Add technical padel or tennis socks: they make a real visual difference.', 'A visor or sweatband would add the professional touch the outfit is missing.'],
      ['Very complete and coordinated court look. It conveys technical level at first glance.', 'The court-specific footwear is a total success. The right sole elevates the entire ensemble.', 'Add a functional wrist accessory to complete the high-level player look.'],
    ],
  },
  team: {
    es: [
      ['El equipamiento de equipo debe ser de tejido técnico específico. Las prendas actuales no parecen ser de primera división.', 'Unifica la gama cromática del conjunto: colores que correspondan al mismo equipo o paleta.', 'Las zapatillas de entrenamiento deben ser de deporte específico. Considera calzado multideporte adecuado.'],
      ['La equipación base está bien. Añade una capa de calentamiento que complemente el conjunto.', 'El calzado funciona bien para el deporte indicado. Considera medias de compresión para mayor protección.', 'Añade protecciones o accesorios específicos del deporte que completen el look de jugador profesional.'],
      ['Equipación de competición de alto nivel. Los colores y el ajuste son los de un deportista serio.', 'El kit completo comunica profesionalismo. El calzado específico es un gran acierto.', 'Considera añadir una banda de sujeción para el pelo o un pack de accesorios de equipo.'],
    ],
    en: [
      ['Team equipment should be made of specific technical fabric. The current garments don\'t appear to be first-division quality.', 'Unify the color range of the outfit: colors that correspond to the same team or palette.', 'Training shoes should be sport-specific. Consider appropriate multi-sport footwear.'],
      ['The base kit is good. Add a warm-up layer that complements the ensemble.', 'The footwear works well for the stated sport. Consider compression socks for added protection.', 'Add sport-specific gear or accessories to complete the professional player look.'],
      ['High-level competition kit. Colors and fit are those of a serious athlete.', 'The complete kit communicates professionalism. The sport-specific footwear is a great choice.', 'Consider adding a hair support band or a team accessories pack.'],
    ],
  },
  outdoor: {
    es: [
      ['Para actividades outdoor el sistema de capas es esencial: base técnica, capa media y cortavientos. Aquí falta alguna.', 'El calzado outdoor debe ser específico para el terreno. Las zapatillas actuales podrían comprometer la seguridad.', 'Los colores outdoor deben equilibrar visibilidad (seguridad) y camuflaje. Considera tonos tierra o verde con acento visible.'],
      ['El look outdoor tiene buena base. Añade una capa de protección ante el cambio de condiciones meteorológicas.', 'El calzado funciona. Considera añadir polainas o medias técnicas de montaña para completar el look.', 'Una mochila o riñonera técnica completaría visualmente el outfit y añadiría funcionalidad real.'],
      ['Outfit outdoor muy bien construido. El sistema de capas y el calzado están perfectamente elegidos.', 'La paleta de colores funciona bien para el entorno outdoor. Estilo y funcionalidad en equilibrio.', 'El look es casi perfecto. Un gorro técnico o buff terminaría de definirlo.'],
    ],
    en: [
      ['For outdoor activities, the layering system is essential: technical base, mid-layer, and windbreaker. One is missing here.', 'Outdoor footwear must be terrain-specific. Current shoes could compromise safety.', 'Outdoor colors should balance visibility (safety) and camouflage. Consider earth tones or green with a visible accent.'],
      ['The outdoor look has a good base. Add a protective layer for changing weather conditions.', 'The footwear works. Consider adding gaiters or technical mountain socks to complete the look.', 'A technical backpack or fanny pack would visually complete the outfit and add real functionality.'],
      ['Very well-built outdoor outfit. The layering system and footwear are perfectly chosen.', 'The color palette works well for the outdoor environment. Style and functionality in balance.', 'The look is almost perfect. A technical hat or buff would finish defining it.'],
    ],
  },
  mind_body: {
    es: [
      ['Para yoga o pilates el tejido lo es todo: debe tener elasticidad en 4 sentidos y no transparentarse. Revisa el actual.', 'El color del outfit debe transmitir calma y foco. Los estampados llamativos distraen del propósito de la práctica.', 'La zapatilla no es necesaria en estas disciplinas. Considera calcetines antideslizantes que completen el look.'],
      ['El outfit de bienestar está bien orientado. Trabaja la coordinación entre top y parte inferior en la misma tonalidad.', 'Añade una capa ligera tipo kimono o sudadera cropped para los momentos de entrada y salida del estudio.', 'Los accesorios correctos completan el look: mochila de yoga y esterilla coordinadas con el outfit.'],
      ['Look de práctica mente-cuerpo de muy alto nivel. Tejido, ajuste y color en perfecta armonía.', 'La coordinación cromática transmite intención y cuidado. Este look motiva a practicar más.', 'Solo añade un accesorio de bienestar: botella de agua en color coordinado o esterilla premium.'],
    ],
    en: [
      ['For yoga or pilates, fabric is everything: it must have 4-way stretch and not be see-through. Review the current one.', 'The outfit color should convey calm and focus. Busy prints distract from the purpose of the practice.', 'Shoes are not needed in these disciplines. Consider non-slip socks that complete the look.'],
      ['The wellness outfit is well-oriented. Work on coordination between top and bottom in the same tonality.', 'Add a light layer like a kimono or cropped hoodie for entering and leaving the studio.', 'The right accessories complete the look: a yoga bag and mat coordinated with the outfit.'],
      ['Mind-body practice look of very high level. Fabric, fit, and color in perfect harmony.', 'The color coordination conveys intention and care. This look motivates more practice.', 'Just add a wellness accessory: a color-coordinated water bottle or premium mat.'],
    ],
  },
};

function pickProducts(category: SportCategory, lang: Language, count = 3): ProductRecommendation[] {
  const pool = PRODUCTS[category];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(p => ({
    name: p.name,
    brand: p.brand,
    reason: p.reason[lang],
    url: p.url,
    type: p.type,
  }));
}

function pickRecs(category: SportCategory, lang: Language, score: number): string[] {
  const pool = REC_POOL[category][lang];
  const idx = score >= 9 ? 2 : score >= 7 ? 1 : 0;
  return [...pool[idx]];
}

// ─── Basis per category ───────────────────────────────────────────────────────
const BASIS: Record<SportCategory, Record<Language, string>> = {
  endurance: {
    es: "Valorado según los criterios de Runner's World, 220 Triathlon, los blogs de ASICS y Adidas Running y las tendencias de Nike Running.",
    en: "Rated according to Runner's World, 220 Triathlon, ASICS and Adidas Running blogs, and Nike Running trends.",
  },
  strength: {
    es: "Valorado según los estándares de Men's Health, el blog de Gymshark, Nike Training Club y las tendencias de CrossFit en Instagram.",
    en: "Rated according to Men's Health standards, the Gymshark blog, Nike Training Club, and CrossFit trends on Instagram.",
  },
  court: {
    es: "Valorado según los criterios de Tennishead, World Padel Tour Style Guide, los blogs de Babolat y Wilson y las tendencias ATP/WTA.",
    en: "Rated according to Tennishead, World Padel Tour Style Guide, Babolat and Wilson blogs, and ATP/WTA trends.",
  },
  team: {
    es: "Valorado según los estándares de Marca Deporte, Nike Football Style, Adidas Training y las equipaciones de las principales ligas europeas.",
    en: "Rated according to Marca Deporte, Nike Football Style, Adidas Training, and the kits of the main European leagues.",
  },
  outdoor: {
    es: "Valorado según los criterios de Outdoor Magazine, Trail Runner Magazine, los blogs de Salomon y Patagonia y la comunidad de Strava Segments.",
    en: "Rated according to Outdoor Magazine, Trail Runner Magazine, Salomon and Patagonia blogs, and the Strava Segments community.",
  },
  mind_body: {
    es: "Valorado según los estándares de Yoga Journal, Pilates Style, los blogs de Lululemon y Alo Yoga y las tendencias de la comunidad de bienestar en Instagram.",
    en: "Rated according to Yoga Journal, Pilates Style, Lululemon and Alo Yoga blogs, and wellness community trends on Instagram.",
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────
export async function scoreOutfit(
  _imageUri: string,
  exerciseType: ExerciseType,
  lang: Language,
): Promise<ScoreResult> {
  await new Promise(resolve => setTimeout(resolve, 2200));

  const total = weightedRandom();
  const breakdown = distributeScore(total);
  const category = getSportCategory(exerciseType);

  return {
    total,
    breakdown,
    basis: BASIS[category][lang],
    recommendations: pickRecs(category, lang, total),
    products: pickProducts(category, lang, 3),
  };
}

import { elementPropertiesBySymbol } from './element-properties.mjs';

const names = [
  ['H', '수소', 'Hydrogen'], ['He', '헬륨', 'Helium'], ['Li', '리튬', 'Lithium'], ['Be', '베릴륨', 'Beryllium'], ['B', '붕소', 'Boron'], ['C', '탄소', 'Carbon'], ['N', '질소', 'Nitrogen'], ['O', '산소', 'Oxygen'], ['F', '플루오린', 'Fluorine'], ['Ne', '네온', 'Neon'],
  ['Na', '나트륨', 'Sodium'], ['Mg', '마그네슘', 'Magnesium'], ['Al', '알루미늄', 'Aluminium'], ['Si', '규소', 'Silicon'], ['P', '인', 'Phosphorus'], ['S', '황', 'Sulfur'], ['Cl', '염소', 'Chlorine'], ['Ar', '아르곤', 'Argon'],
  ['K', '칼륨', 'Potassium'], ['Ca', '칼슘', 'Calcium'], ['Sc', '스칸듐', 'Scandium'], ['Ti', '타이타늄', 'Titanium'], ['V', '바나듐', 'Vanadium'], ['Cr', '크로뮴', 'Chromium'], ['Mn', '망가니즈', 'Manganese'], ['Fe', '철', 'Iron'], ['Co', '코발트', 'Cobalt'], ['Ni', '니켈', 'Nickel'], ['Cu', '구리', 'Copper'], ['Zn', '아연', 'Zinc'], ['Ga', '갈륨', 'Gallium'], ['Ge', '저마늄', 'Germanium'], ['As', '비소', 'Arsenic'], ['Se', '셀레늄', 'Selenium'], ['Br', '브로민', 'Bromine'], ['Kr', '크립톤', 'Krypton'],
  ['Rb', '루비듐', 'Rubidium'], ['Sr', '스트론튬', 'Strontium'], ['Y', '이트륨', 'Yttrium'], ['Zr', '지르코늄', 'Zirconium'], ['Nb', '나이오븀', 'Niobium'], ['Mo', '몰리브데넘', 'Molybdenum'], ['Tc', '테크네튬', 'Technetium'], ['Ru', '루테늄', 'Ruthenium'], ['Rh', '로듐', 'Rhodium'], ['Pd', '팔라듐', 'Palladium'], ['Ag', '은', 'Silver'], ['Cd', '카드뮴', 'Cadmium'], ['In', '인듐', 'Indium'], ['Sn', '주석', 'Tin'], ['Sb', '안티모니', 'Antimony'], ['Te', '텔루륨', 'Tellurium'], ['I', '아이오딘', 'Iodine'], ['Xe', '제논', 'Xenon'],
  ['Cs', '세슘', 'Caesium'], ['Ba', '바륨', 'Barium'], ['La', '란타넘', 'Lanthanum'], ['Ce', '세륨', 'Cerium'], ['Pr', '프라세오디뮴', 'Praseodymium'], ['Nd', '네오디뮴', 'Neodymium'], ['Pm', '프로메튬', 'Promethium'], ['Sm', '사마륨', 'Samarium'], ['Eu', '유로퓸', 'Europium'], ['Gd', '가돌리늄', 'Gadolinium'], ['Tb', '터븀', 'Terbium'], ['Dy', '디스프로슘', 'Dysprosium'], ['Ho', '홀뮴', 'Holmium'], ['Er', '어븀', 'Erbium'], ['Tm', '툴륨', 'Thulium'], ['Yb', '이터븀', 'Ytterbium'], ['Lu', '루테튬', 'Lutetium'], ['Hf', '하프늄', 'Hafnium'], ['Ta', '탄탈럼', 'Tantalum'], ['W', '텅스텐', 'Tungsten'], ['Re', '레늄', 'Rhenium'], ['Os', '오스뮴', 'Osmium'], ['Ir', '이리듐', 'Iridium'], ['Pt', '백금', 'Platinum'], ['Au', '금', 'Gold'], ['Hg', '수은', 'Mercury'], ['Tl', '탈륨', 'Thallium'], ['Pb', '납', 'Lead'], ['Bi', '비스무트', 'Bismuth'], ['Po', '폴로늄', 'Polonium'], ['At', '아스타틴', 'Astatine'], ['Rn', '라돈', 'Radon'],
  ['Fr', '프랑슘', 'Francium'], ['Ra', '라듐', 'Radium'], ['Ac', '악티늄', 'Actinium'], ['Th', '토륨', 'Thorium'], ['Pa', '프로트악티늄', 'Protactinium'], ['U', '우라늄', 'Uranium'], ['Np', '넵투늄', 'Neptunium'], ['Pu', '플루토늄', 'Plutonium'], ['Am', '아메리슘', 'Americium'], ['Cm', '퀴륨', 'Curium'], ['Bk', '버클륨', 'Berkelium'], ['Cf', '캘리포늄', 'Californium'], ['Es', '아인슈타이늄', 'Einsteinium'], ['Fm', '페르뮴', 'Fermium'], ['Md', '멘델레븀', 'Mendelevium'], ['No', '노벨륨', 'Nobelium'], ['Lr', '로렌슘', 'Lawrencium'], ['Rf', '러더포듐', 'Rutherfordium'], ['Db', '더브늄', 'Dubnium'], ['Sg', '시보귬', 'Seaborgium'], ['Bh', '보륨', 'Bohrium'], ['Hs', '하슘', 'Hassium'], ['Mt', '마이트너륨', 'Meitnerium'], ['Ds', '다름슈타튬', 'Darmstadtium'], ['Rg', '뢴트게늄', 'Roentgenium'], ['Cn', '코페르니슘', 'Copernicium'], ['Nh', '니호늄', 'Nihonium'], ['Fl', '플레로븀', 'Flerovium'], ['Mc', '모스코븀', 'Moscovium'], ['Lv', '리버모륨', 'Livermorium'], ['Ts', '테네신', 'Tennessine'], ['Og', '오가네손', 'Oganesson'],
];

const positions = {
  H: [1, 1], He: [1, 18],
  Li: [2, 1], Be: [2, 2], B: [2, 13], C: [2, 14], N: [2, 15], O: [2, 16], F: [2, 17], Ne: [2, 18],
  Na: [3, 1], Mg: [3, 2], Al: [3, 13], Si: [3, 14], P: [3, 15], S: [3, 16], Cl: [3, 17], Ar: [3, 18],
  K: [4, 1], Ca: [4, 2], Sc: [4, 3], Ti: [4, 4], V: [4, 5], Cr: [4, 6], Mn: [4, 7], Fe: [4, 8], Co: [4, 9], Ni: [4, 10], Cu: [4, 11], Zn: [4, 12], Ga: [4, 13], Ge: [4, 14], As: [4, 15], Se: [4, 16], Br: [4, 17], Kr: [4, 18],
  Rb: [5, 1], Sr: [5, 2], Y: [5, 3], Zr: [5, 4], Nb: [5, 5], Mo: [5, 6], Tc: [5, 7], Ru: [5, 8], Rh: [5, 9], Pd: [5, 10], Ag: [5, 11], Cd: [5, 12], In: [5, 13], Sn: [5, 14], Sb: [5, 15], Te: [5, 16], I: [5, 17], Xe: [5, 18],
  Cs: [6, 1], Ba: [6, 2], La: [6, 3], Hf: [6, 4], Ta: [6, 5], W: [6, 6], Re: [6, 7], Os: [6, 8], Ir: [6, 9], Pt: [6, 10], Au: [6, 11], Hg: [6, 12], Tl: [6, 13], Pb: [6, 14], Bi: [6, 15], Po: [6, 16], At: [6, 17], Rn: [6, 18],
  Fr: [7, 1], Ra: [7, 2], Ac: [7, 3], Rf: [7, 4], Db: [7, 5], Sg: [7, 6], Bh: [7, 7], Hs: [7, 8], Mt: [7, 9], Ds: [7, 10], Rg: [7, 11], Cn: [7, 12], Nh: [7, 13], Fl: [7, 14], Mc: [7, 15], Lv: [7, 16], Ts: [7, 17], Og: [7, 18],
};

const lanthanides = ['Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu'];
const actinides = ['Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr'];

const detailOverrides = {
  H: { atomic_mass: 1.008, category: '비금속', state_at_room_temp: '기체', block: 's', electron_configuration: '1s1', electronegativity: 2.2, oxidation_states: ['+1', '-1'], atomic_radius: 53, first_ionization_energy: 1312, melting_point: -259.16, boiling_point: -252.87, density: 0.0000899, summary: '가장 가벼운 원소이며 별과 물의 핵심 구성 원소입니다.', chemical_characteristics: '전자 하나를 잃거나 공유해 다양한 공유 결합과 이온성 화합물을 형성합니다.' },
  C: { atomic_mass: 12.011, category: '비금속', state_at_room_temp: '고체', block: 'p', electron_configuration: '[He] 2s2 2p2', electronegativity: 2.55, oxidation_states: ['-4', '+2', '+4'], atomic_radius: 67, first_ionization_energy: 1086, melting_point: 3550, boiling_point: 4827, density: 2.26, summary: '유기화학과 생명체 분자의 중심 원소입니다.', chemical_characteristics: '네 개의 원자가 전자로 긴 사슬과 고리 구조를 만들 수 있습니다.' },
  O: { atomic_mass: 15.999, category: '비금속', state_at_room_temp: '기체', block: 'p', electron_configuration: '[He] 2s2 2p4', electronegativity: 3.44, oxidation_states: ['-2', '-1'], atomic_radius: 48, first_ionization_energy: 1314, melting_point: -218.79, boiling_point: -182.96, density: 0.001429, summary: '호흡과 산화 반응에서 핵심 역할을 하는 원소입니다.', chemical_characteristics: '전기음성도가 높아 많은 원소와 산화물을 형성합니다.' },
  Na: { atomic_mass: 22.99, category: '알칼리 금속', state_at_room_temp: '고체', block: 's', electron_configuration: '[Ne] 3s1', electronegativity: 0.93, oxidation_states: ['+1'], atomic_radius: 186, first_ionization_energy: 496, melting_point: 97.79, boiling_point: 882.94, density: 0.97, summary: '소금과 생체 전해질에서 흔히 만나는 알칼리 금속입니다.', chemical_characteristics: '최외각 전자 하나를 쉽게 잃어 +1 양이온이 됩니다.' },
  Cl: { atomic_mass: 35.45, category: '할로젠', state_at_room_temp: '기체', block: 'p', electron_configuration: '[Ne] 3s2 3p5', electronegativity: 3.16, oxidation_states: ['-1', '+1', '+3', '+5', '+7'], atomic_radius: 79, first_ionization_energy: 1251, melting_point: -101.5, boiling_point: -34.04, density: 0.0032, summary: '소독제와 염화물에서 중요한 할로젠 원소입니다.', chemical_characteristics: '전자 하나를 얻어 안정한 염화 이온을 만들기 쉽습니다.' },
  Fe: { atomic_mass: 55.845, category: '전이 금속', state_at_room_temp: '고체', block: 'd', electron_configuration: '[Ar] 3d6 4s2', electronegativity: 1.83, oxidation_states: ['+2', '+3'], atomic_radius: 156, first_ionization_energy: 762, melting_point: 1538, boiling_point: 2862, density: 7.87, summary: '강철, 구조재, 생체 헤모글로빈에 중요한 전이 금속입니다.', chemical_characteristics: '여러 산화 상태를 가지며 착화합물과 산화물을 잘 형성합니다.' },
  Cu: { atomic_mass: 63.546, category: '전이 금속', state_at_room_temp: '고체', block: 'd', electron_configuration: '[Ar] 3d10 4s1', electronegativity: 1.9, oxidation_states: ['+1', '+2'], atomic_radius: 145, first_ionization_energy: 746, melting_point: 1084.62, boiling_point: 2562, density: 8.96, summary: '전기 전도성이 좋아 전선과 회로에 널리 쓰입니다.', chemical_characteristics: '전자를 비교적 쉽게 이동시켜 전기와 열을 잘 전달합니다.' },
  Au: { atomic_mass: 196.967, category: '전이 금속', state_at_room_temp: '고체', block: 'd', electron_configuration: '[Xe] 4f14 5d10 6s1', electronegativity: 2.54, oxidation_states: ['+1', '+3'], atomic_radius: 174, first_ionization_energy: 890, melting_point: 1064.18, boiling_point: 2856, density: 19.32, summary: '부식에 강하고 연성이 뛰어난 귀금속입니다.', chemical_characteristics: '반응성이 낮아 공기와 물에서 안정하게 유지됩니다.' },
};

const categoryByGroup = (symbol, group) => {
  if (symbol === 'H') return '비금속';
  if (group === 1) return '알칼리 금속';
  if (group === 2) return '알칼리 토금속';
  if (group >= 3 && group <= 12) return '전이 금속';
  if (group === 17) return '할로젠';
  if (group === 18) return '비활성 기체';
  if (['B', 'Si', 'Ge', 'As', 'Sb', 'Te', 'Po'].includes(symbol)) return '준금속';
  if (['C', 'N', 'O', 'P', 'S', 'Se'].includes(symbol)) return '비금속';
  return '전이후 금속';
};

const examples = {
  H: [{ title: '연료전지', description: '수소는 연료전지에서 전자를 내놓아 전기 에너지를 만드는 데 쓰입니다.', context: '에너지' }],
  C: [{ title: '유기 분자', description: '탄소는 긴 사슬과 고리 구조를 만들어 생명체 분자의 골격을 이룹니다.', context: '생명과학' }],
  O: [{ title: '호흡', description: '산소는 세포 호흡에서 전자를 받아 에너지 생산을 가능하게 합니다.', context: '생명과학' }],
  Na: [{ title: '염화 나트륨', description: '나트륨 이온은 염소 이온과 결합해 식염을 형성합니다.', context: '생활 화학' }],
  Cl: [{ title: '소독', description: '염소 화합물은 물 소독과 표백에 널리 사용됩니다.', context: '생활 화학' }],
  Fe: [{ title: '강철', description: '철은 탄소와 합금화되어 건축과 기계 재료인 강철이 됩니다.', context: '재료' }],
  Cu: [{ title: '전선', description: '구리는 전기 전도성이 높아 전선과 회로 배선에 쓰입니다.', context: '전기' }],
  Au: [{ title: '전자 접점', description: '금은 부식에 강해 정밀 전자 접점에 사용됩니다.', context: '전자재료' }],
};

const defaultLearningTextByCategory = {
  '알칼리 금속': {
    summary: '최외각 전자 하나를 잃어 양이온이 되기 쉬운 반응성 큰 금속 원소입니다.',
    chemical: '같은 족 아래로 갈수록 바깥 전자가 원자핵에서 멀어져 이온화 에너지가 낮아지는 경향이 있습니다.',
    example: ['이온 화합물', '+1 이온을 만들기 쉬워 염, 전지, 유리 같은 재료와 관련됩니다.', '재료/생활 화학'],
  },
  '알칼리 토금속': {
    summary: '두 개의 최외각 전자를 잃어 +2 이온을 만들기 쉬운 금속 원소입니다.',
    chemical: '알칼리 금속보다 반응성은 낮지만 산소, 물, 할로젠과 반응해 안정한 화합물을 만들 수 있습니다.',
    example: ['무기 재료', '광물, 세라믹, 합금, 생체 무기질 학습에 자주 등장합니다.', '재료 화학'],
  },
  '전이 금속': {
    summary: 'd 오비탈 전자가 관여해 다양한 산화수와 착화합물을 만들 수 있는 금속 원소입니다.',
    chemical: '전이 금속은 전자배치 차이 때문에 색, 자성, 촉매 활성, 합금 성질이 다양하게 나타납니다.',
    example: ['합금과 촉매', '구조용 합금, 전극, 촉매, 안료 같은 분야에서 널리 활용됩니다.', '재료/촉매'],
  },
  '전이후 금속': {
    summary: '전이 금속보다 상대적으로 무르고 낮은 녹는점을 보이는 경우가 많은 p-블록 금속 원소입니다.',
    chemical: '금속성을 가지면서도 p 오비탈 전자가 결합과 산화 상태에 영향을 줍니다.',
    example: ['생활 금속 재료', '포장재, 납땜, 전자재료, 저융점 합금에서 자주 다뤄집니다.', '재료 화학'],
  },
  준금속: {
    summary: '금속과 비금속의 중간 성질을 보여 반도체와 공유 결합 학습에 중요한 원소입니다.',
    chemical: '전기 전도성과 결합 성질이 조건에 따라 달라져 주기율표 경향성을 설명하기 좋습니다.',
    example: ['반도체 재료', '반도체, 유리, 세라믹, 도핑 재료와 연결해 학습할 수 있습니다.', '전자재료'],
  },
  비금속: {
    summary: '공유 결합과 분자 형성에서 중요한 역할을 하는 비금속 원소입니다.',
    chemical: '전기음성도와 원자가 전자 수에 따라 산화물, 수소화물, 유기/무기 분자의 성질이 크게 달라집니다.',
    example: ['분자와 생명체', '물, 공기, 생체 분자, 산염기 반응을 이해할 때 핵심적으로 등장합니다.', '일반화학'],
  },
  할로젠: {
    summary: '전자 하나를 얻어 -1 이온이 되기 쉬운 반응성 큰 비금속 원소입니다.',
    chemical: '할로젠은 높은 전기음성도 때문에 금속과 이온성 염을 만들거나 유기분자의 반응성을 바꿉니다.',
    example: ['염과 소독', '소금, 소독제, 의약품, 고분자 재료에서 자주 볼 수 있습니다.', '생활 화학'],
  },
  '비활성 기체': {
    summary: '닫힌 전자껍질을 가져 일반 조건에서 반응성이 매우 낮은 기체 원소입니다.',
    chemical: '완성된 원자가 전자배치 때문에 이온화 에너지가 높고 결합 형성이 제한적입니다.',
    example: ['방전관과 보호 기체', '조명, 레이저, 용접 보호 분위기, 저온 냉각에 활용됩니다.', '응용 화학'],
  },
};

function topicParticle(word) {
  const lastChar = String(word).trim().at(-1);
  const code = lastChar?.charCodeAt(0);
  if (!code || code < 0xac00 || code > 0xd7a3) {
    return '는';
  }
  return (code - 0xac00) % 28 === 0 ? '는' : '은';
}

function defaultLearningText(name_ko, symbol, category) {
  const text = defaultLearningTextByCategory[category] ?? defaultLearningTextByCategory.비금속;
  const particle = topicParticle(name_ko);
  return {
    summary: `${name_ko}(${symbol})${particle} ${text.summary}`,
    chemical_characteristics: text.chemical,
    examples: [
      {
        title: text.example[0],
        description: `${name_ko}${particle} ${text.example[1]}`,
        context: text.example[2],
      },
    ],
  };
}

function translateState(state) {
  const states = {
    Gas: '기체',
    Liquid: '액체',
    Solid: '고체',
    'Expected to be a Gas': '기체 예상',
    'Expected to be a Solid': '고체 예상',
    'Expected to be a Liquid': '액체 예상',
  };
  return states[state] ?? state;
}

export const fallbackElements = names.map(([symbol, name_ko, name_en], index) => {
  const atomicNumber = index + 1;
  const [period, group] = positions[symbol] ?? [symbol === 'Ce' ? 6 : 7, 3];
  const series = lanthanides.includes(symbol) ? 'lanthanide' : actinides.includes(symbol) ? 'actinide' : 'main';
  const curatedDetails = detailOverrides[symbol] ?? {};
  const referenceProperties = elementPropertiesBySymbol[symbol] ?? {};
  const category = curatedDetails.category ?? categoryByGroup(symbol, group);
  const defaultText = defaultLearningText(name_ko, symbol, category);
  const base = {
    id: atomicNumber,
    atomic_number: atomicNumber,
    symbol,
    name_ko,
    name_en,
    atomic_mass: null,
    category,
    period,
    group,
    block: group <= 2 ? 's' : group >= 13 ? 'p' : 'd',
    state_at_room_temp: atomicNumber === 35 || atomicNumber === 80 ? '액체' : atomicNumber <= 18 && !['Li', 'Be', 'B', 'C', 'Na', 'Mg', 'Al', 'Si', 'P', 'S'].includes(symbol) ? '기체' : '고체',
    electron_configuration: '',
    electronegativity: null,
    oxidation_states: [],
    atomic_radius: null,
    first_ionization_energy: null,
    melting_point: null,
    boiling_point: null,
    density: null,
    summary: defaultText.summary,
    chemical_characteristics: defaultText.chemical_characteristics,
    examples: examples[symbol] ?? defaultText.examples,
    series,
    lanthanoidPosition: lanthanides.indexOf(symbol) >= 0 ? lanthanides.indexOf(symbol) + 4 : undefined,
    actinoidPosition: actinides.indexOf(symbol) >= 0 ? actinides.indexOf(symbol) + 4 : undefined,
  };

  return {
    ...base,
    ...curatedDetails,
    ...referenceProperties,
    category: curatedDetails.category ?? base.category,
    summary: curatedDetails.summary ?? base.summary,
    chemical_characteristics: curatedDetails.chemical_characteristics ?? base.chemical_characteristics,
    examples: base.examples,
    state_at_room_temp: translateState(referenceProperties.state_at_room_temp ?? curatedDetails.state_at_room_temp ?? base.state_at_room_temp),
    period,
    group,
    series,
    lanthanoidPosition: base.lanthanoidPosition,
    actinoidPosition: base.actinoidPosition,
  };
});

export const fallbackComparisonNotes = [
  {
    element_a_symbol: 'Na',
    element_b_symbol: 'Cl',
    topic: '이온 결합',
    note: '나트륨은 최외각 전자 하나를 잃어 +1 이온이 되기 쉽고, 염소는 전자 하나를 얻어 -1 이온이 되기 쉽습니다. 이 차이 때문에 두 원소는 강한 이온 결합을 형성합니다.',
  },
  {
    element_a_symbol: 'C',
    element_b_symbol: 'O',
    topic: '전기음성도',
    note: '산소는 탄소보다 전기음성도가 커서 C-O 결합에서 전자 밀도를 더 강하게 끌어당깁니다. 이 차이는 알코올, 카보닐, 이산화탄소 같은 분자의 반응성에 큰 영향을 줍니다.',
  },
];

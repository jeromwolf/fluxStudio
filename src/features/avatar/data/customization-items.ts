import { ClothingItem, Accessory, HairStyle } from '../types'

// Hair Styles
export const hairStyles: { id: HairStyle; name: string; thumbnail: string; category?: string }[] = [
  // 짧은 스타일
  { id: 'short', name: '짧은 머리', thumbnail: '/avatars/hair/short.png', category: 'short' },
  { id: 'pixie', name: '픽시컷', thumbnail: '/avatars/hair/pixie.png', category: 'short' },
  { id: 'bob', name: '단발', thumbnail: '/avatars/hair/bob.png', category: 'short' },
  { id: 'mohawk', name: '모히칸', thumbnail: '/avatars/hair/mohawk.png', category: 'short' },
  { id: 'spiky', name: '뾰족머리', thumbnail: '/avatars/hair/spiky.png', category: 'short' },
  
  // 중간 길이
  { id: 'medium', name: '중간 머리', thumbnail: '/avatars/hair/medium.png', category: 'medium' },
  { id: 'wavy', name: '웨이브', thumbnail: '/avatars/hair/wavy.png', category: 'medium' },
  { id: 'curly', name: '곱슬머리', thumbnail: '/avatars/hair/curly.png', category: 'medium' },
  { id: 'bun', name: '머리묶음', thumbnail: '/avatars/hair/bun.png', category: 'medium' },
  
  // 긴 머리 (여성스러운 스타일 추가)
  { id: 'long', name: '긴 직모', thumbnail: '/avatars/hair/long.png', category: 'long' },
  { id: 'long-wavy', name: '긴 웨이브', thumbnail: '/avatars/hair/long-wavy.png', category: 'long' },
  { id: 'long-curly', name: '긴 곱슬', thumbnail: '/avatars/hair/long-curly.png', category: 'long' },
  { id: 'ponytail', name: '포니테일', thumbnail: '/avatars/hair/ponytail.png', category: 'long' },
  { id: 'high-ponytail', name: '높은 포니테일', thumbnail: '/avatars/hair/high-ponytail.png', category: 'long' },
  { id: 'side-ponytail', name: '사이드 포니테일', thumbnail: '/avatars/hair/side-ponytail.png', category: 'long' },
  { id: 'pigtails', name: '양갈래', thumbnail: '/avatars/hair/pigtails.png', category: 'long' },
  { id: 'braids', name: '땋은머리', thumbnail: '/avatars/hair/braids.png', category: 'long' },
  { id: 'french-braid', name: '프렌치 브레이드', thumbnail: '/avatars/hair/french-braid.png', category: 'long' },
  { id: 'fishtail-braid', name: '피쉬테일 브레이드', thumbnail: '/avatars/hair/fishtail.png', category: 'long' },
  { id: 'twin-buns', name: '쌍머리', thumbnail: '/avatars/hair/twin-buns.png', category: 'long' },
  { id: 'half-up', name: '반올림', thumbnail: '/avatars/hair/half-up.png', category: 'long' },
  { id: 'loose-curls', name: '느슨한 컬', thumbnail: '/avatars/hair/loose-curls.png', category: 'long' },
  { id: 'beach-waves', name: '비치 웨이브', thumbnail: '/avatars/hair/beach-waves.png', category: 'long' },
  
  // 특별한 스타일
  { id: 'afro', name: '아프로', thumbnail: '/avatars/hair/afro.png', category: 'special' },
  { id: 'dreadlocks', name: '드레드락', thumbnail: '/avatars/hair/dreadlocks.png', category: 'special' },
  { id: 'space-buns', name: '스페이스 번', thumbnail: '/avatars/hair/space-buns.png', category: 'special' },
  { id: 'bald', name: '대머리', thumbnail: '/avatars/hair/bald.png', category: 'special' }
]

// Hair Colors
export const hairColors = [
  '#000000', '#2D1B00', '#654321', '#8B4513', '#DEB887',
  '#FFD700', '#FF6347', '#FF1493', '#9400D3', '#4169E1',
  '#00CED1', '#32CD32', '#FFFFFF', '#808080'
]

// Skin Colors
export const skinColors = [
  '#FDBCB4', '#EEA990', '#E79C96', '#C98276', '#A65E4A',
  '#8B4513', '#6B4423', '#4A2C2A', '#F5DEB3', '#DEB887',
  '#D2B48C', '#BC9A6A', '#A0522D', '#654321'
]

// Eye Colors
export const eyeColors = [
  '#8B4513', '#654321', '#4A5568', '#2D3748', '#1A202C',
  '#4169E1', '#32CD32', '#9400D3', '#FF6347', '#FF1493',
  '#00CED1', '#FFD700'
]

// Clothing Items - Tops
export const clothingTops: ClothingItem[] = [
  // Basic Tops
  { id: 'tshirt-basic', name: '기본 티셔츠', type: 'shirt', style: 'casual', color: '#FFFFFF' },
  { id: 'tshirt-v', name: 'V넥 티셔츠', type: 'shirt', style: 'casual', color: '#3182CE' },
  { id: 'tshirt-scoop', name: '스쿱넥 티셔츠', type: 'shirt', style: 'casual', color: '#F687B3' },
  { id: 'polo-shirt', name: '폴로셔츠', type: 'shirt', style: 'casual', color: '#2B6CB0' },
  { id: 'hoodie-pullover', name: '풀오버 후드티', type: 'hoodie', style: 'casual', color: '#6B46C1' },
  { id: 'hoodie-zip', name: '집업 후드티', type: 'hoodie', style: 'casual', color: '#553C9A' },
  { id: 'hoodie-crop', name: '크롭 후드티', type: 'hoodie', style: 'casual', color: '#EC4899' },
  
  // 여성스러운 상의
  { id: 'blouse-silk', name: '실크 블라우스', type: 'blouse', style: 'elegant', color: '#FED7D7' },
  { id: 'blouse-chiffon', name: '시폰 블라우스', type: 'blouse', style: 'elegant', color: '#E6FFFA' },
  { id: 'blouse-ruffled', name: '러플 블라우스', type: 'blouse', style: 'feminine', color: '#FFEAA7' },
  { id: 'off-shoulder', name: '오프숄더 탑', type: 'shirt', style: 'feminine', color: '#DDA0DD' },
  { id: 'halter-top', name: '홀터넥 탑', type: 'shirt', style: 'summer', color: '#FFB6C1' },
  { id: 'tube-top', name: '튜브탑', type: 'shirt', style: 'summer', color: '#FF69B4' },
  { id: 'wrap-top', name: '랩 탑', type: 'shirt', style: 'feminine', color: '#87CEEB' },
  { id: 'peasant-top', name: '페젠트 탑', type: 'shirt', style: 'boho', color: '#DEB887' },
  
  // 드레스 스타일 원피스
  { id: 'sundress', name: '선드레스', type: 'dress', style: 'summer', color: '#FFE4E1' },
  { id: 'little-black-dress', name: '리틀 블랙 드레스', type: 'dress', style: 'elegant', color: '#000000' },
  { id: 'maxi-dress', name: '맥시 드레스', type: 'dress', style: 'boho', color: '#8FBC8F' },
  { id: 'cocktail-dress', name: '칵테일 드레스', type: 'dress', style: 'party', color: '#4169E1' },
  { id: 'floral-dress', name: '플로럴 드레스', type: 'dress', style: 'romantic', color: '#FFB6C1' },
  { id: 'slip-dress', name: '슬립 드레스', type: 'dress', style: 'minimalist', color: '#F0E68C' },
  { id: 'wrap-dress', name: '랩 드레스', type: 'dress', style: 'classic', color: '#CD5C5C' },
  { id: 'bodycon-dress', name: '바디콘 드레스', type: 'dress', style: 'sexy', color: '#FF1493' },
  
  // Formal Tops
  { id: 'dress-shirt', name: '드레스셔츠', type: 'shirt', style: 'formal', color: '#FFFFFF' },
  { id: 'button-down', name: '버튼다운셔츠', type: 'shirt', style: 'formal', color: '#E2E8F0' },
  { id: 'blazer', name: '블레이저', type: 'jacket', style: 'formal', color: '#1A202C' },
  { id: 'blazer-pink', name: '핑크 블레이저', type: 'jacket', style: 'formal', color: '#FFB6C1' },
  { id: 'suit-jacket', name: '정장 재킷', type: 'jacket', style: 'formal', color: '#2D3748' },
  
  // Casual Tops
  { id: 'tank-top', name: '탱크톱', type: 'shirt', style: 'casual', color: '#E53E3E' },
  { id: 'crop-top', name: '크롭탑', type: 'shirt', style: 'casual', color: '#D69E2E' },
  { id: 'crop-hoodie', name: '크롭 후드티', type: 'hoodie', style: 'trendy', color: '#9F7AEA' },
  { id: 'sweater', name: '스웨터', type: 'sweater', style: 'casual', color: '#38A169' },
  { id: 'sweater-cute', name: '귀여운 스웨터', type: 'sweater', style: 'cute', color: '#FBB6CE' },
  { id: 'cardigan', name: '가디건', type: 'sweater', style: 'casual', color: '#805AD5' },
  { id: 'cardigan-long', name: '롱 가디건', type: 'sweater', style: 'cozy', color: '#B794F6' },
  
  // 귀여운/깜찍한 스타일
  { id: 'kawaii-top', name: '카와이 탑', type: 'shirt', style: 'kawaii', color: '#FFB3E6' },
  { id: 'sailor-top', name: '세일러 탑', type: 'shirt', style: 'kawaii', color: '#87CEEB' },
  { id: 'lolita-blouse', name: '롤리타 블라우스', type: 'blouse', style: 'lolita', color: '#FFF0F5' },
  { id: 'puffy-sleeve', name: '퍼프 슬리브 탑', type: 'shirt', style: 'vintage', color: '#FFEFD5' },
  
  // Special Tops
  { id: 'leather-jacket', name: '가죽 재킷', type: 'jacket', style: 'edgy', color: '#1A202C' },
  { id: 'denim-jacket', name: '데님 재킷', type: 'jacket', style: 'casual', color: '#2B6CB0' },
  { id: 'bomber-jacket', name: '봄버 재킷', type: 'jacket', style: 'casual', color: '#38A169' },
  { id: 'kimono-jacket', name: '기모노 재킷', type: 'jacket', style: 'boho', color: '#DDA0DD' },
  { id: 'fur-coat', name: '퍼 코트', type: 'coat', style: 'luxury', color: '#F5F5DC' }
]

// Clothing Items - Bottoms
export const clothingBottoms: ClothingItem[] = [
  // Pants
  { id: 'jeans-straight', name: '스트레이트 청바지', type: 'pants', style: 'casual', color: '#2B6CB0' },
  { id: 'jeans-skinny', name: '스키니 청바지', type: 'pants', style: 'casual', color: '#1A365D' },
  { id: 'jeans-high-waist', name: '하이웨스트 청바지', type: 'pants', style: 'trendy', color: '#4299E1' },
  { id: 'jeans-ripped', name: '찢어진 청바지', type: 'pants', style: 'edgy', color: '#2D3748' },
  { id: 'chinos', name: '치노 팬츠', type: 'pants', style: 'casual', color: '#744210' },
  { id: 'dress-pants', name: '드레스 팬츠', type: 'pants', style: 'formal', color: '#1A202C' },
  { id: 'cargo-pants', name: '카고 팬츠', type: 'pants', style: 'casual', color: '#68D391' },
  { id: 'leggings', name: '레깅스', type: 'pants', style: 'casual', color: '#1A202C' },
  { id: 'yoga-pants', name: '요가 팬츠', type: 'pants', style: 'athletic', color: '#805AD5' },
  { id: 'palazzo-pants', name: '팔라초 팬츠', type: 'pants', style: 'boho', color: '#F687B3' },
  
  // Shorts
  { id: 'denim-shorts', name: '데님 반바지', type: 'shorts', style: 'casual', color: '#2B6CB0' },
  { id: 'high-waist-shorts', name: '하이웨스트 반바지', type: 'shorts', style: 'vintage', color: '#ED64A6' },
  { id: 'athletic-shorts', name: '운동 반바지', type: 'shorts', style: 'athletic', color: '#1A202C' },
  { id: 'bermuda-shorts', name: '버뮤다 반바지', type: 'shorts', style: 'casual', color: '#744210' },
  { id: 'bike-shorts', name: '바이크 반바지', type: 'shorts', style: 'athletic', color: '#4A5568' },
  { id: 'flowy-shorts', name: '플로우 반바지', type: 'shorts', style: 'feminine', color: '#FBB6CE' },
  
  // 스커트 (다양한 길이와 스타일)
  { id: 'mini-skirt', name: '미니스커트', type: 'skirt', style: 'sexy', color: '#E53E3E' },
  { id: 'mini-skirt-denim', name: '데님 미니스커트', type: 'skirt', style: 'casual', color: '#2B6CB0' },
  { id: 'a-line-skirt', name: 'A라인 스커트', type: 'skirt', style: 'classic', color: '#6B46C1' },
  { id: 'pleated-skirt', name: '플리츠 스커트', type: 'skirt', style: 'preppy', color: '#38A169' },
  { id: 'tennis-skirt', name: '테니스 스커트', type: 'skirt', style: 'sporty', color: '#FFFFFF' },
  { id: 'midi-skirt', name: '미디 스커트', type: 'skirt', style: 'elegant', color: '#D69E2E' },
  { id: 'maxi-skirt', name: '맥시 스커트', type: 'skirt', style: 'boho', color: '#805AD5' },
  { id: 'pencil-skirt', name: '펜슬 스커트', type: 'skirt', style: 'formal', color: '#1A202C' },
  { id: 'tulle-skirt', name: '튤 스커트', type: 'skirt', style: 'princess', color: '#FFB6C1' },
  { id: 'circle-skirt', name: '서클 스커트', type: 'skirt', style: 'vintage', color: '#FED7D7' },
  { id: 'wrap-skirt', name: '랩 스커트', type: 'skirt', style: 'boho', color: '#B794F6' },
  { id: 'asymmetric-skirt', name: '비대칭 스커트', type: 'skirt', style: 'modern', color: '#4FD1C7' },
  
  // 특별한 스타일
  { id: 'school-uniform-skirt', name: '교복 스커트', type: 'skirt', style: 'uniform', color: '#2D3748' },
  { id: 'gothic-skirt', name: '고딕 스커트', type: 'skirt', style: 'gothic', color: '#000000' },
  { id: 'kawaii-skirt', name: '카와이 스커트', type: 'skirt', style: 'kawaii', color: '#FFB3E6' },
  { id: 'lolita-skirt', name: '롤리타 스커트', type: 'skirt', style: 'lolita', color: '#FFF0F5' }
]

// Shoes
export const shoes: ClothingItem[] = [
  // Casual Shoes
  { id: 'sneakers-classic', name: '클래식 운동화', type: 'sneakers', style: 'casual', color: '#FFFFFF' },
  { id: 'sneakers-high', name: '하이탑 운동화', type: 'sneakers', style: 'casual', color: '#1A202C' },
  { id: 'canvas-shoes', name: '캔버스화', type: 'sneakers', style: 'casual', color: '#E53E3E' },
  { id: 'loafers', name: '로퍼', type: 'dress-shoes', style: 'casual', color: '#744210' },
  
  // Formal Shoes
  { id: 'oxford-shoes', name: '옥스포드화', type: 'dress-shoes', style: 'formal', color: '#1A202C' },
  { id: 'derby-shoes', name: '더비화', type: 'dress-shoes', style: 'formal', color: '#744210' },
  { id: 'heels-low', name: '낮은 굽 구두', type: 'heels', style: 'formal', color: '#1A202C' },
  { id: 'heels-high', name: '높은 굽 구두', type: 'heels', style: 'formal', color: '#E53E3E' },
  
  // Boots
  { id: 'ankle-boots', name: '앵클부츠', type: 'boots', style: 'casual', color: '#744210' },
  { id: 'combat-boots', name: '컴뱃부츠', type: 'boots', style: 'edgy', color: '#1A202C' },
  { id: 'knee-boots', name: '니하이부츠', type: 'boots', style: 'fashion', color: '#2D3748' },
  
  // Sandals & Others
  { id: 'flip-flops', name: '플립플롭', type: 'sandals', style: 'beach', color: '#00B4D8' },
  { id: 'sandals-strappy', name: '스트랩 샌들', type: 'sandals', style: 'casual', color: '#744210' }
]

// Accessories - Head
export const headAccessories: Accessory[] = [
  { id: 'cap-baseball', name: '야구모자', type: 'cap', model: 'baseball' },
  { id: 'beanie', name: '비니', type: 'hat', model: 'beanie' },
  { id: 'fedora', name: '페도라', type: 'hat', model: 'fedora' },
  { id: 'beret', name: '베레모', type: 'hat', model: 'beret' },
  { id: 'headband', name: '헤드밴드', type: 'band', model: 'headband' },
  { id: 'crown-simple', name: '간단한 왕관', type: 'crown', model: 'simple' },
  { id: 'crown-royal', name: '왕실 왕관', type: 'crown', model: 'royal', glow: true },
  { id: 'cat-ears', name: '고양이 귀', type: 'ears', model: 'cat' },
  { id: 'bunny-ears', name: '토끼 귀', type: 'ears', model: 'bunny' }
]

// Accessories - Face
export const faceAccessories: Accessory[] = [
  { id: 'glasses-round', name: '둥근 안경', type: 'glasses', model: 'round' },
  { id: 'glasses-square', name: '사각 안경', type: 'glasses', model: 'square' },
  { id: 'sunglasses-aviator', name: '에비에이터 선글라스', type: 'sunglasses', model: 'aviator' },
  { id: 'sunglasses-wayfarer', name: '웨이페어러 선글라스', type: 'sunglasses', model: 'wayfarer' },
  { id: 'mask-face', name: '페이스 마스크', type: 'mask', model: 'face' },
  { id: 'mask-bandana', name: '반다나', type: 'mask', model: 'bandana' },
  { id: 'eyepatch', name: '안대', type: 'patch', model: 'eye' }
]

// Accessories - Ears
export const earAccessories: Accessory[] = [
  { id: 'earrings-stud', name: '스터드 귀걸이', type: 'earrings', model: 'stud' },
  { id: 'earrings-hoop', name: '후프 귀걸이', type: 'earrings', model: 'hoop' },
  { id: 'earrings-drop', name: '드롭 귀걸이', type: 'earrings', model: 'drop' },
  { id: 'headphones-over', name: '오버이어 헤드폰', type: 'headphones', model: 'over-ear' },
  { id: 'headphones-on', name: '온이어 헤드폰', type: 'headphones', model: 'on-ear' },
  { id: 'earbuds', name: '이어버드', type: 'earbuds', model: 'wireless' }
]

// Accessories - Neck
export const neckAccessories: Accessory[] = [
  { id: 'necklace-chain', name: '체인 목걸이', type: 'necklace', model: 'chain' },
  { id: 'necklace-pendant', name: '펜던트 목걸이', type: 'necklace', model: 'pendant' },
  { id: 'choker', name: '초커', type: 'choker', model: 'basic' },
  { id: 'scarf-silk', name: '실크 스카프', type: 'scarf', model: 'silk' },
  { id: 'scarf-winter', name: '겨울 스카프', type: 'scarf', model: 'wool' },
  { id: 'tie-classic', name: '클래식 넥타이', type: 'tie', model: 'classic' },
  { id: 'bowtie', name: '나비넥타이', type: 'tie', model: 'bow' }
]

// Accessories - Back
export const backAccessories: Accessory[] = [
  { id: 'backpack-school', name: '학생 백팩', type: 'backpack', model: 'school' },
  { id: 'backpack-hiking', name: '등산 백팩', type: 'backpack', model: 'hiking' },
  { id: 'bag-messenger', name: '메신저백', type: 'bag', model: 'messenger' },
  { id: 'wings-angel', name: '천사 날개', type: 'wings', model: 'angel', glow: true },
  { id: 'wings-demon', name: '악마 날개', type: 'wings', model: 'demon' },
  { id: 'wings-fairy', name: '요정 날개', type: 'wings', model: 'fairy', glow: true },
  { id: 'cape-hero', name: '영웅 망토', type: 'cape', model: 'hero', animation: 'flow' },
  { id: 'cape-vampire', name: '뱀파이어 망토', type: 'cape', model: 'vampire' }
]

// Special Effects
export const specialEffects: Accessory[] = [
  { id: 'aura-fire', name: '불꽃 오라', type: 'aura', model: 'fire', glow: true, animation: 'flicker' },
  { id: 'aura-lightning', name: '번개 오라', type: 'aura', model: 'lightning', glow: true, animation: 'spark' },
  { id: 'aura-holy', name: '신성한 오라', type: 'aura', model: 'holy', glow: true, animation: 'pulse' },
  { id: 'aura-dark', name: '어둠 오라', type: 'aura', model: 'dark', glow: true, animation: 'swirl' },
  { id: 'particles-stars', name: '별 파티클', type: 'particles', model: 'stars', glow: true, animation: 'float' },
  { id: 'particles-hearts', name: '하트 파티클', type: 'particles', model: 'hearts', animation: 'bubble' },
  { id: 'particles-sparkles', name: '반짝임 파티클', type: 'particles', model: 'sparkles', glow: true, animation: 'twinkle' }
]

// Accessories - Hands
export const handAccessories: Accessory[] = [
  { id: 'gloves-leather', name: '가죽 장갑', type: 'gloves', model: 'leather' },
  { id: 'gloves-fingerless', name: '손가락 없는 장갑', type: 'gloves', model: 'fingerless' },
  { id: 'gloves-mittens', name: '벙어리장갑', type: 'gloves', model: 'mittens' },
  { id: 'gloves-formal', name: '정장 장갑', type: 'gloves', model: 'formal' },
  { id: 'watch-digital', name: '디지털 시계', type: 'watch', model: 'digital' },
  { id: 'watch-analog', name: '아날로그 시계', type: 'watch', model: 'analog' },
  { id: 'watch-smart', name: '스마트워치', type: 'watch', model: 'smart' },
  { id: 'bracelet-leather', name: '가죽 팔찌', type: 'bracelet', model: 'leather' },
  { id: 'bracelet-beads', name: '비즈 팔찌', type: 'bracelet', model: 'beads' },
  { id: 'ring-simple', name: '심플 반지', type: 'ring', model: 'simple' },
  { id: 'ring-diamond', name: '다이아몬드 반지', type: 'ring', model: 'diamond', glow: true }
]

// Face Features
export const faceFeatures = {
  eyebrows: [
    { id: 'eyebrow-natural', name: '자연스러운 눈썹' },
    { id: 'eyebrow-arched', name: '아치형 눈썹' },
    { id: 'eyebrow-straight', name: '일자 눈썹' },
    { id: 'eyebrow-thick', name: '두꺼운 눈썹' },
    { id: 'eyebrow-thin', name: '얇은 눈썹' }
  ],
  eyeShapes: [
    { id: 'eyes-round', name: '둥근 눈' },
    { id: 'eyes-almond', name: '아몬드형 눈' },
    { id: 'eyes-cat', name: '고양이 눈' },
    { id: 'eyes-droopy', name: '처진 눈' },
    { id: 'eyes-upturned', name: '올라간 눈' }
  ],
  noseShapes: [
    { id: 'nose-button', name: '단추 코' },
    { id: 'nose-straight', name: '직선 코' },
    { id: 'nose-curved', name: '곡선 코' },
    { id: 'nose-wide', name: '넓은 코' },
    { id: 'nose-narrow', name: '좁은 코' }
  ],
  mouthShapes: [
    { id: 'mouth-full', name: '도톰한 입술' },
    { id: 'mouth-thin', name: '얇은 입술' },
    { id: 'mouth-heart', name: '하트형 입술' },
    { id: 'mouth-wide', name: '넓은 입' },
    { id: 'mouth-small', name: '작은 입' }
  ]
}

// Facial Hair
export const facialHair: Accessory[] = [
  { id: 'beard-full', name: '풀 수염', type: 'beard', model: 'full' },
  { id: 'beard-goatee', name: '고티', type: 'beard', model: 'goatee' },
  { id: 'beard-stubble', name: '무정란', type: 'beard', model: 'stubble' },
  { id: 'mustache-thin', name: '얇은 콧수염', type: 'mustache', model: 'thin' },
  { id: 'mustache-thick', name: '두꺼운 콧수염', type: 'mustache', model: 'thick' },
  { id: 'mustache-handlebar', name: '핸들바 콧수염', type: 'mustache', model: 'handlebar' }
]

// Body Types
export const bodyTypes = [
  { id: 'body-slim', name: '슬림' },
  { id: 'body-athletic', name: '운동선수' },
  { id: 'body-average', name: '평균' },
  { id: 'body-curvy', name: '글래머' },
  { id: 'body-muscular', name: '근육질' }
]

// Animation Sets
export const animationSets = [
  { 
    id: 'casual', 
    name: '캐주얼', 
    description: '자연스럽고 편안한 움직임. 일상적이고 친근한 느낌의 애니메이션 세트입니다.' 
  },
  { 
    id: 'elegant', 
    name: '우아한', 
    description: '세련되고 품격 있는 움직임. 고급스럽고 우아한 제스처가 특징입니다.' 
  },
  { 
    id: 'sporty', 
    name: '스포티', 
    description: '활동적이고 역동적인 움직임. 에너지 넘치는 스포츠 스타일 애니메이션입니다.' 
  },
  { 
    id: 'dramatic', 
    name: '드라마틱', 
    description: '강렬하고 표현력 풍부한 움직임. 감정적이고 예술적인 제스처가 돋보입니다.' 
  },
  { 
    id: 'cute', 
    name: '귀여운', 
    description: '사랑스럽고 애교 넘치는 움직임. 깜찍하고 발랄한 매력이 가득합니다.' 
  }
]
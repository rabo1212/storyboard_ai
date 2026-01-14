
export enum PanelStatus {
  IDLE = 'idle',
  GENERATING_SCRIPT = 'generating_script',
  GENERATING_IMAGES = 'generating_images',
  READY = 'ready',
  ERROR = 'error'
}

export interface StoryboardPanel {
  id: string;
  sceneNumber: number;
  shotType: string;
  description: string;
  dialogue: string;
  visualPrompt: string;
  imageUrl?: string;
  isImageLoading: boolean;
}

export interface StoryboardProject {
  id: string;
  title: string;
  originalPrompt: string;
  style: string;
  panels: StoryboardPanel[];
  status: PanelStatus;
  userId: string; // 프로젝트 소유자 식별자
}

export interface User {
  email: string;
  password?: string; // 실제 앱에서는 해싱 필요
  credits: number;
  hasReceivedWelcomeBonus: boolean;
  dailyAdCount: number;
  lastAdDate: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  credits: number;
  description: string;
  isPopular?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  { id: 'free', name: 'Free', price: '0원 (광고)', credits: 2, description: '광고 15초 시청 시 (1일 5회)' },
  { id: 'basic', name: 'Basic', price: '4,900원', credits: 20, description: '초보 창작자용' },
  { id: 'basic2', name: 'Basic 2', price: '9,900원', credits: 50, description: '중급 창작자용' },
  { id: 'pro', name: 'Pro', price: '15,900원', credits: 120, description: '전문가를 위한 선택', isPopular: true },
  { id: 'vip', name: 'VIP', price: '19,900원', credits: 200, description: '대규모 프로젝트용' },
];

export const ART_STYLES = [
  { id: 'cinematic', name: '시네마틱', description: '고대비의 전문 영화 같은 느낌' },
  { id: 'anime', name: '애니메이션 / 만화', description: '수작업 느낌의 일본 애니메이션 스타일' },
  { id: 'sketch', name: '러프 스케치', description: '빠른 개념 정립을 위한 연필 드로잉' },
  { id: 'oil-painting', name: '유화', description: '질감이 살아있는 클래식한 붓터치' },
  { id: 'concept-art', name: '컨셉 아트', description: '디테일한 디지털 환경 페인팅' },
  { id: 'noir', name: '필름 누아르', description: '드라마틱한 흑백 그림자와 분위기' },
];


import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Supabase 설정 (Vercel 환경변수에서 가져옴)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// 디버깅용 로그
console.log('Supabase URL:', SUPABASE_URL ? '설정됨' : '없음');
console.log('Supabase Key:', SUPABASE_ANON_KEY ? '설정됨' : '없음');

// Supabase 클라이언트 초기화
let supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase 환경변수 누락:', { SUPABASE_URL, SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '[설정됨]' : '[없음]' });
      throw new Error('Supabase 설정이 필요합니다. 환경변수를 확인해주세요.');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
};

// 사용자 프로필 타입
export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  daily_ad_count: number;
  last_ad_date: string;
  created_at: string;
}

// 회원가입
export const signUp = async (email: string, password: string): Promise<{ user: SupabaseUser | null; error: string | null }> => {
  try {
    console.log('회원가입 시도:', email);
    const sb = getSupabase();

    const { data, error } = await sb.auth.signUp({
      email,
      password,
    });

    console.log('회원가입 응답:', { data, error });

    if (error) {
      console.error('회원가입 오류:', error);
      return { user: null, error: error.message };
    }

    // 프로필 수동 생성 (트리거가 실패할 경우 대비)
    if (data.user) {
      console.log('사용자 생성됨:', data.user.id);

      // 프로필 직접 생성 시도
      const { error: insertError } = await sb.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email || email,
        credits: 5,
        daily_ad_count: 0,
        last_ad_date: new Date().toISOString().split('T')[0],
      });

      if (insertError) {
        console.error('프로필 생성 오류:', insertError);
      } else {
        console.log('프로필 생성 성공');
      }
    }

    return { user: data.user, error: null };
  } catch (err: any) {
    console.error('회원가입 예외:', err);
    return { user: null, error: err.message || '회원가입 중 오류 발생' };
  }
};

// 로그인
export const signIn = async (email: string, password: string): Promise<{ user: SupabaseUser | null; error: string | null }> => {
  const sb = getSupabase();

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
};

// 로그아웃
export const signOut = async (): Promise<void> => {
  const sb = getSupabase();
  await sb.auth.signOut();
};

// 현재 사용자 가져오기
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  return user;
};

// 사용자 프로필 가져오기
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const sb = getSupabase();

  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // single() 대신 maybeSingle() 사용 - 없어도 에러 안 남

  if (error) {
    console.error('프로필 조회 오류:', error);
    return null;
  }

  return data;
};

// 크레딧 업데이트
export const updateCredits = async (userId: string, credits: number): Promise<boolean> => {
  const sb = getSupabase();

  const { error } = await sb
    .from('profiles')
    .update({ credits })
    .eq('id', userId);

  if (error) {
    console.error('크레딧 업데이트 오류:', error);
    return false;
  }

  return true;
};

// 크레딧 추가
export const addCredits = async (userId: string, amount: number): Promise<number | null> => {
  const sb = getSupabase();

  // 현재 크레딧 조회
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const newCredits = profile.credits + amount;

  const { error } = await sb
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', userId);

  if (error) {
    console.error('크레딧 추가 오류:', error);
    return null;
  }

  return newCredits;
};

// 크레딧 차감
export const deductCredits = async (userId: string, amount: number): Promise<number | null> => {
  const sb = getSupabase();

  const profile = await getUserProfile(userId);
  if (!profile || profile.credits < amount) return null;

  const newCredits = profile.credits - amount;

  const { error } = await sb
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', userId);

  if (error) {
    console.error('크레딧 차감 오류:', error);
    return null;
  }

  return newCredits;
};

// 광고 시청 기록 업데이트
export const updateAdWatch = async (userId: string): Promise<{ dailyAdCount: number; credits: number } | null> => {
  const sb = getSupabase();

  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const today = new Date().toISOString().split('T')[0];
  let dailyAdCount = profile.daily_ad_count;

  // 날짜가 바뀌면 카운트 리셋
  if (profile.last_ad_date !== today) {
    dailyAdCount = 0;
  }

  // 하루 최대 5회 제한
  if (dailyAdCount >= 5) {
    return null;
  }

  const newCredits = profile.credits + 2;
  dailyAdCount += 1;

  const { error } = await sb
    .from('profiles')
    .update({
      credits: newCredits,
      daily_ad_count: dailyAdCount,
      last_ad_date: today,
    })
    .eq('id', userId);

  if (error) {
    console.error('광고 시청 기록 오류:', error);
    return null;
  }

  return { dailyAdCount, credits: newCredits };
};

// 인증 상태 변경 구독
export const onAuthStateChange = (callback: (user: SupabaseUser | null) => void) => {
  const sb = getSupabase();

  return sb.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

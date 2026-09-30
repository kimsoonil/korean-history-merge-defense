'use client';
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import type {Provider,User} from '@supabase/supabase-js';
import {getSupabaseClient,socialAuthConfigured} from '@/lib/supabase';

const GUEST_KEY='khmd-social-auth-guest-v1';
type AuthStatus='loading'|'signedOut'|'guest'|'authenticated';
type SocialProvider='google'|'apple';
type AuthValue={status:AuthStatus;configured:boolean;user:User|null;error:string|null;signIn:(provider:SocialProvider)=>Promise<void>;continueAsGuest:()=>void;showLogin:()=>void;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);

export default function AuthProvider({children}:{children:ReactNode}){
 const [status,setStatus]=useState<AuthStatus>('loading'),[user,setUser]=useState<User|null>(null),[error,setError]=useState<string|null>(null);
 useEffect(()=>{
  const supabase=getSupabaseClient(),guest=localStorage.getItem(GUEST_KEY)==='1';
  if(!supabase){setStatus(guest?'guest':'signedOut');return;}
  let active=true;
  void supabase.auth.getSession().then(({data,error:sessionError})=>{
   if(!active)return;
   if(sessionError)setError('로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
   const nextUser=data.session?.user??null;setUser(nextUser);setStatus(nextUser?'authenticated':guest?'guest':'signedOut');
  });
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
   if(!active)return;const nextUser=session?.user??null;setUser(nextUser);if(nextUser){localStorage.removeItem(GUEST_KEY);setError(null);setStatus('authenticated');}else setStatus(localStorage.getItem(GUEST_KEY)==='1'?'guest':'signedOut');
  });
  return()=>{active=false;subscription.unsubscribe();};
 },[]);
 const value=useMemo<AuthValue>(()=>({status,configured:socialAuthConfigured,user,error,
  signIn:async(provider:SocialProvider)=>{
   const supabase=getSupabaseClient();setError(null);
   if(!supabase){setError('SNS 로그인 연결 정보가 아직 설정되지 않았습니다.');return;}
   localStorage.removeItem(GUEST_KEY);
   const {error:loginError}=await supabase.auth.signInWithOAuth({provider:provider as Provider,options:{redirectTo:window.location.origin}});
   if(loginError)setError('로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  },
  continueAsGuest:()=>{localStorage.setItem(GUEST_KEY,'1');setError(null);setUser(null);setStatus('guest');},
  showLogin:()=>{localStorage.removeItem(GUEST_KEY);setError(null);setStatus('signedOut');},
  signOut:async()=>{const supabase=getSupabaseClient();if(supabase)await supabase.auth.signOut();localStorage.removeItem(GUEST_KEY);setUser(null);setStatus('signedOut');}
 }),[status,user,error]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSocialAuth(){const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider is required');return value;}

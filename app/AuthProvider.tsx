'use client';
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import type {Provider,User} from '@supabase/supabase-js';
import {getSupabaseClient,socialAuthConfigured} from '@/lib/supabase';
import {Capacitor} from '@capacitor/core';
import {App} from '@capacitor/app';
import {Browser} from '@capacitor/browser';

const GUEST_KEY='khmd-social-auth-guest-v1';
const NATIVE_CALLBACK='com.kimsoonil.koreanhistorymergedefense://auth/callback';
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
 useEffect(()=>{
  if(!Capacitor.isNativePlatform())return;
  let active=true;
  const seen=new Set<string>();
  const handle=async(raw:string)=>{
   try{
    const url=new URL(raw);
    if(url.protocol!=='com.kimsoonil.koreanhistorymergedefense:'||url.host!=='auth'||url.pathname!=='/callback')return;
    const authError=url.searchParams.get('error_description')??url.searchParams.get('error');
    if(authError){setError('Google 로그인이 취소되었거나 완료되지 않았습니다.');return;}
    const code=url.searchParams.get('code');
    if(!code||seen.has(code))return;
    seen.add(code);
    const client=getSupabaseClient();
    if(!client)return;
    const {error:exchangeError}=await client.auth.exchangeCodeForSession(code);
    if(exchangeError)setError('로그인 정보를 앱으로 가져오지 못했습니다. 다시 시도해 주세요.');
    else {setError(null);void Browser.close().catch(()=>{});}
   }catch{setError('로그인 복귀 주소를 처리하지 못했습니다.');}
  };
  let listener:{remove:()=>Promise<void>}|undefined;
  void App.addListener('appUrlOpen',({url})=>{if(active)void handle(url);}).then(value=>{listener=value;});
  void App.getLaunchUrl().then(value=>{if(active&&value?.url)void handle(value.url);});
  return()=>{active=false;void listener?.remove();};
 },[]);
 const value=useMemo<AuthValue>(()=>({status,configured:socialAuthConfigured,user,error,
  signIn:async(provider:SocialProvider)=>{
   const supabase=getSupabaseClient();setError(null);
   if(!supabase){setError('SNS 로그인 연결 정보가 아직 설정되지 않았습니다.');return;}
   localStorage.removeItem(GUEST_KEY);
   const native=Capacitor.isNativePlatform();
   const {data,error:loginError}=await supabase.auth.signInWithOAuth({provider:provider as Provider,options:{redirectTo:native?NATIVE_CALLBACK:window.location.origin,skipBrowserRedirect:native}});
   if(loginError){setError('로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');return;}
   if(native&&data.url){try{await Browser.open({url:data.url});}catch{setError('로그인 창을 열지 못했습니다. 다시 시도해 주세요.');}}
  },
  continueAsGuest:()=>{localStorage.setItem(GUEST_KEY,'1');setError(null);setUser(null);setStatus('guest');},
  showLogin:()=>{localStorage.removeItem(GUEST_KEY);setError(null);setStatus('signedOut');},
  signOut:async()=>{const supabase=getSupabaseClient();if(supabase)await supabase.auth.signOut();localStorage.removeItem(GUEST_KEY);setUser(null);setStatus('signedOut');}
 }),[status,user,error]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSocialAuth(){const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider is required');return value;}

import {createClient,type SupabaseClient} from '@supabase/supabase-js';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishableKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const socialAuthConfigured=Boolean(url&&publishableKey);
let client:SupabaseClient|null=null;

export function getSupabaseClient(){
 if(!socialAuthConfigured)return null;
 if(!client)client=createClient(url!,publishableKey!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}

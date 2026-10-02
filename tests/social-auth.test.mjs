import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('social login offers Google and guest access, with Apple limited to iOS',()=>{
 const title=readFileSync(new URL('../app/TitleScreen.tsx',import.meta.url),'utf8');
 const auth=readFileSync(new URL('../app/AuthProvider.tsx',import.meta.url),'utf8');
 assert.match(title,/Google로 계속하기/);
 assert.match(title,/Apple로 계속하기/);
 assert.match(title,/isIos&&<button className="auth-apple"/);
 assert.match(title,/준비 중입니다\./);
 assert.match(title,/게스트로 시작하기/);
 assert.doesNotMatch(title,/카카오|Kakao/i);
 assert.match(auth,/type SocialProvider='google'\|'apple'/);
 assert.doesNotMatch(auth,/kakao/i);
});

test('social auth is optional until public Supabase settings are provided',()=>{
 const client=readFileSync(new URL('../lib/supabase.ts',import.meta.url),'utf8');
 const example=readFileSync(new URL('../.env.example',import.meta.url),'utf8');
 assert.match(client,/NEXT_PUBLIC_SUPABASE_URL/);
 assert.match(client,/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
 assert.match(example,/NEXT_PUBLIC_SUPABASE_URL/);
 assert.match(example,/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
});

test('new players pass social login before the prologue',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 const authGate=page.indexOf('auth.status === "loading" || auth.status === "signedOut"');
 const prologueGate=page.indexOf('if (!player || !player.prologueComplete');
 assert.ok(authGate>0&&authGate<prologueGate);
});

test('login reaches a lobby that starts or resumes through one primary action',()=>{
 const title=readFileSync(new URL('../app/TitleScreen.tsx',import.meta.url),'utf8');
 const screen=title.slice(0,title.indexOf('export function NewGameConfirm'));
 assert.match(screen,/if\(resumable\)onContinue\(\);else onNew\(\)/);
 assert.match(screen,/sessionStorage\.setItem\(START_FLOW_KEY,'1'\)/);
 assert.doesNotMatch(screen,/sessionStorage\.removeItem\(START_FLOW_KEY\)/);
 assert.match(screen,/lobby-shell/);
 assert.match(screen,/게임하기/);
 assert.match(screen,/라운드부터 이어서 진행합니다/);
});

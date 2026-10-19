'use client';
import {useEffect,useState,useRef,type ReactNode} from 'react';
import {useSocialAuth} from './AuthProvider';
import {getSupabaseClient} from '@/lib/supabase';
import {currentLocalSaves,localSaveBackups,saveHistory,restoreCloudBackup,type SaveBackup} from '@/lib/cloud-save';

function summary(value:string|null){
 if(value===null)return '삭제된 기록';
 try{const p=JSON.parse(value);return [p.nickname,p.level!=null?`레벨 ${p.level}`:'',p.chapter!=null?`${p.chapter}장`:'',p.stage!=null?`${p.stage}스테이지 ${p.round??''}라운드`:'',p.savedAt?`게임 저장 ${new Date(p.savedAt).toLocaleString()}`:''].filter(Boolean).join(' · ')||value.slice(0,180);}catch{return value.slice(0,180);}
}
export default function CloudSaveRecovery({children}:{children:ReactNode}){
 const auth=useSocialAuth(),id=auth.status==='authenticated'?auth.user?.id:null;
 const currentId=useRef(id);currentId.current=id;
 const [open,setOpen]=useState(false),[rows,setRows]=useState<SaveBackup[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState<SaveBackup|null>(null),[hasCopies,setHasCopies]=useState(false);
 useEffect(()=>{setOpen(false);setRows([]);setConfirm(null);setError('');
  const check=()=>{setHasCopies(!!id&&localSaveBackups(localStorage,id).length>0);};check();window.addEventListener('cloud-save-change',check);return()=>window.removeEventListener('cloud-save-change',check);
 },[id]);
 async function load(){
  if(!id)return;setOpen(true);setError('');setConfirm(null);
  const local=[...currentLocalSaves(localStorage,id),...localSaveBackups(localStorage,id)];setRows(local);
  const client=getSupabaseClient();if(!client)return;
  try{const history=await saveHistory(client,id);if(currentId.current===id)setRows([...local,...history]);}catch{setError('서버 이력을 가져오지 못했습니다. 기기 백업은 확인할 수 있습니다.');}
 }
 async function restore(row:SaveBackup){
  const client=getSupabaseClient();if(!id||!client)return;
  setBusy(true);setError('');
  try{await restoreCloudBackup(client,id,localStorage,row);window.location.reload();}catch(e){setError(e instanceof Error?e.message:'복원에 실패했습니다. 기록은 보존됩니다.');setBusy(false);setConfirm(null);}
 }
 if(!id)return children;
 return <>{!open&&children}{!open&&<button style={{position:'fixed',right:12,bottom:12,zIndex:9999}} onClick={()=>void load()}>{hasCopies?'저장 충돌·백업 확인':'클라우드 저장 복원'}</button>}
 {open&&<section role="dialog" aria-modal="true" aria-label="클라우드 저장 복원" style={{position:'fixed',inset:0,zIndex:10000,background:'#181a20',color:'white',overflow:'auto',padding:24}}>
 <h2>클라우드 저장 복원</h2><p>충돌한 항목은 자동 전송을 멈춥니다. 현재 기기와 서버 기록을 비교해 복원할 기록을 선택하세요. 복원 전 기록도 보존됩니다.</p>
 <p>아래 기록은 저장 항목별 백업입니다. 전투 기록과 프로필은 서로 다른 항목이며, 전체 계정이 한 번에 복원되지는 않습니다. 시간은 참고 정보이며 진행도가 높은 기록을 자동 판단하지 않습니다.</p>
 <button disabled={busy} onClick={()=>{setOpen(false);setConfirm(null);}}>게임으로 돌아가기</button> <button disabled={busy} onClick={()=>void load()}>새로고침</button>
 {error&&<p role="alert">{error}</p>}
 {confirm&&<div role="alert"><p>{confirm.key} 항목을 선택한 기록으로 복원하고 게임을 새로고침할까요?</p><button disabled={busy} onClick={()=>void restore(confirm)}>복원 확정</button> <button disabled={busy} onClick={()=>setConfirm(null)}>취소</button></div>}
 {!rows.length&&<p>아직 보존된 백업이 없습니다.</p>}
 {rows.map(row=><article key={row.id} style={{borderBottom:'1px solid #666',padding:12}}><strong>{row.key}</strong><p>{row.source} · 버전 {row.revision} · {new Date(row.savedAt).toLocaleString()}</p><p>{summary(row.value)}</p><details><summary>원본 데이터 확인</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{row.value??'삭제'}</pre></details><button disabled={busy} onClick={()=>setConfirm(row)}>이 기록 복원</button></article>)}
 </section>}</>;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {accountScopeFor,accountStorageKey,readAccountItem,writeAccountItem} from '../lib/account-storage.ts';

const memory=entries=>{
 const data=new Map(entries);
 return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
};

test('guest and each social user receive isolated save keys',()=>{
 const guest=accountScopeFor('guest');
 const first=accountScopeFor('authenticated','google-user-a');
 const second=accountScopeFor('authenticated','google-user-b');
 assert.equal(guest,'guest');
 assert.notEqual(accountStorageKey(guest,'save'),accountStorageKey(first,'save'));
 assert.notEqual(accountStorageKey(first,'save'),accountStorageKey(second,'save'));
 assert.equal(accountScopeFor('signedOut'),null);
});

test('legacy browser data migrates only to guest and never to a social account',()=>{
 const storage=memory([['salsu-progress-v1','legacy-save']]);
 assert.equal(readAccountItem(storage,'user:google-user','salsu-progress-v1'),null);
 assert.equal(readAccountItem(storage,'guest','salsu-progress-v1'),'legacy-save');
 assert.equal(storage.getItem(accountStorageKey('guest','salsu-progress-v1')),'legacy-save');
 writeAccountItem(storage,'user:google-user','salsu-progress-v1','google-save');
 assert.equal(readAccountItem(storage,'user:google-user','salsu-progress-v1'),'google-save');
 assert.equal(readAccountItem(storage,'guest','salsu-progress-v1'),'legacy-save');
});

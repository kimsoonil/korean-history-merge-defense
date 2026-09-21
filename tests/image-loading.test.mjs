import test from 'node:test';
import assert from 'node:assert/strict';
import {createImageCache} from '../lib/image-loading.ts';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('images stay loading until decoded, share one request and reuse ready assets',async()=>{
 let done,requests=0,updates=0;
 const cache=createImageCache(()=>{requests++;return new Promise(resolve=>{done=resolve;});});
 assert.equal(cache.status('atlas'),'loading');
 const unsubscribe=cache.subscribe('atlas',()=>updates++);cache.subscribe('atlas',()=>updates++);
 await tick();assert.equal(requests,1);assert.equal(cache.status('atlas'),'loading');
 unsubscribe();done();await tick();assert.equal(updates,1);assert.equal(cache.status('atlas'),'ready');
 cache.subscribe('atlas',()=>{});await tick();assert.equal(requests,1);
 assert.equal(cache.status('other-image'),'loading');
});
test('failed images stop spinning instead of showing a substitute character',async()=>{
 const cache=createImageCache(()=>Promise.reject(new Error('404')));let updates=0;
 cache.subscribe('missing',()=>updates++);await tick();assert.equal(cache.status('missing'),'error');assert.equal(updates,1);
});

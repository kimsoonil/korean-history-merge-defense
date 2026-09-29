import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {storeUnits,deployUnits,sellStored,migrateDeployment,validBag,inventoryRecipeStatus,combineInventory} from '../lib/inventory.ts';
import {recipes,byName} from '../lib/game.ts';
import {makeGameSave,readGameSave} from '../lib/save.ts';
const field=Array.from({length:25},(_,i)=>({id:i+1,name:'창병',slot:i}));
test('auto-store checkbox is controlled, persisted and routes recruits into the bag',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 const modal=readFileSync(new URL('../app/UnitBag.tsx',import.meta.url),'utf8');
 assert.match(page,/autoStoreBasic\|\|roster.length>=DEPLOY_LIMIT/);
 assert.match(page,/if\(enabled\)changeBag\('store',1\)/);
 assert.match(page,/localStorage.setItem\('defense-auto-store-basic',String\(enabled\)\)/);
 assert.match(page,/localStorage.getItem\('defense-auto-store-basic'\)==='true'/);
 assert.match(modal,/type="checkbox" checked=\{autoStoreBasic\}/);
 assert.match(modal,/onAutoStoreBasic\(e.target.checked\)/);
});
test('every hero can combine with bag-only ingredients',()=>{
 for(const hero of recipes){
  const bag={};for(const name of hero.recipe)bag[name]=(bag[name]??0)+1;
  assert.ok(inventoryRecipeStatus(hero.recipe,[],bag).every(Boolean));
  const result=combineInventory(hero,[],bag,100);
  assert.equal(result.ok,true);assert.equal(result.stored,false);
  assert.equal(result.roster[0].name,hero.name);
  assert.equal(Object.values(result.bag).reduce((a,b)=>a+b,0),0);
 }
});
test('mixed materials consume deployed first and preserve unrelated inventory',()=>{
 const hero=recipes[0],name=hero.recipe[0],bag={};
 for(const n of hero.recipe)bag[n]=(bag[n]??0)+1;
 const result=combineInventory(hero,[{id:1,name,slot:12}],bag,100);
 assert.equal(result.ok,true);assert.equal(result.roster[0].slot,12);
 assert.equal(result.bag[name],1);
 assert.deepEqual(inventoryRecipeStatus([name,name,name],[{id:1,name,slot:0}],{[name]:1}),[true,true,false]);
});
test('full field stores lower heroes but blocks legendary without consuming materials',()=>{
 const full=field.map(u=>({...u,name:'이순신'}));
 for(const hero of [recipes[0],byName.이순신]){
  const bag={};for(const n of hero.recipe)bag[n]=(bag[n]??0)+1;
  const before=JSON.stringify(bag),result=combineInventory(hero,full,bag,100);
  assert.equal(JSON.stringify(bag),before);assert.equal(full.length,25);
  if(hero.tier===5){assert.equal(result.ok,false);assert.equal(result.reason,'capacity');}
  else{assert.equal(result.ok,true);assert.equal(result.stored,true);assert.equal(result.bag[hero.name],1);assert.equal(result.roster.length,25);}
 }
});
test('missing materials do not mutate field or bag',()=>{
 const hero=recipes[0],roster=[{id:1,name:hero.recipe[0],slot:3}],bag={};
 assert.equal(combineInventory(hero,roster,bag,100).ok,false);
 assert.equal(roster.length,1);assert.deepEqual(bag,{});
});
test('citizens replace only missing tier-one recipe ingredients',()=>{
 const hero=byName.온달;
 const bag={창병:1,시민:1,기병:1,포수:1};
 assert.deepEqual(inventoryRecipeStatus(hero.recipe,[],bag),[true,true,true,true]);
 const result=combineInventory(hero,[],bag,100);
 assert.equal(result.ok,true);assert.equal(result.roster[0].name,'온달');
 assert.equal(result.bag.시민,0);
 const tierThree=byName.선덕여왕;
 assert.equal(inventoryRecipeStatus(tierThree.recipe,[],{시민:1,허준:1,유생:1,활병:1})[0],false);
 assert.equal(combineInventory(tierThree,[],{시민:1,허준:1,유생:1,활병:1},101).ok,false);
});
test('an exact tier-one material is consumed before a citizen wildcard',()=>{
 const status=inventoryRecipeStatus(['창병','창병'],[],{창병:1,시민:1});
 assert.deepEqual(status,[true,true]);
});
test('deposit by tier preserves legends and groups copies',()=>{
 const result=storeUnits([...field,{id:30,name:'이순신',slot:30}],{},1);
 assert.equal(result.bag.창병,25);assert.equal(result.roster.length,1);
 assert.equal(storeUnits(result.roster,result.bag,5).count,0);
});
test('withdraw only fills available capacity, with unique slots and ids',()=>{
 const result=deployUnits(field.slice(0,23),{창병:5},1,100);
 assert.equal(result.roster.length,25);assert.equal(result.bag.창병,3);
 assert.equal(new Set(result.roster.map(u=>u.slot)).size,25);
 assert.equal(deployUnits(field,{창병:5},1,100).count,0);
 assert.equal(deployUnits([],{창병:5},1,100,'창병',true).count,1);
});
test('one and all sales affect only the selected stored type',()=>{
 const result=sellStored({창병:3,활병:2},'창병',false);
 assert.equal(result.gold,35);assert.equal(result.bag.창병,2);
 const all=sellStored(result.bag,'창병',true);
 assert.equal(all.gold,70);assert.equal(all.bag.활병,2);
 assert.equal(sellStored({이순신:1},'이순신',true).gold,0);
});
test('legacy overflow is preserved in bag, keeping legends deployed',()=>{
 const result=migrateDeployment([...field,...Array.from({length:15},(_,i)=>({id:30+i,name:i===14?'이순신':'활병',slot:25+i}))],{포수:2});
 assert.equal(result.roster.length,25);assert.ok(result.roster.some(u=>u.name==='이순신'));
 assert.equal(Object.values(result.bag).reduce((a,b)=>a+b,0),17);
});
test('bag saves round trip and reject invalid quantities and tier five',()=>{
 const state={roster:[],bag:{창병:7,시민:3},enemies:[],gold:400,wall:10,stage:1,round:1,phase:'ready',spawned:0,speed:1,remainingMs:30000};
 const save=makeGameSave(state,1);assert.deepEqual(readGameSave(JSON.stringify(save)),save);
 for(const bag of [{이순신:1},{창병:-1},{창병:1.5},{unknown:1}]){assert.equal(validBag(bag),false);assert.equal(readGameSave(JSON.stringify({...save,bag})),null);}
});

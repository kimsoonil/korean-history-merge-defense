import test from 'node:test';
import assert from 'node:assert/strict';
import {units,basics,byName,recipeStatus} from '../lib/game.ts';
test('upper tiers spread direct hero demand evenly without near-identical recipes',()=>{
 for(const tier of [3,4,5]){
  const heroes=units.filter(u=>u.tier===tier);
  for(let materialTier=2;materialTier<tier;materialTier++){
   const counts=units.filter(u=>u.tier===materialTier).map(u=>heroes.reduce((sum,h)=>sum+h.recipe.filter(n=>n===u.name).length,0));
   assert.ok(counts.every(n=>n>0));assert.equal(Math.max(...counts)-Math.min(...counts),0);
  }
  for(let i=0;i<heroes.length;i++){
   const recipe=heroes[i].recipe;
   assert.ok(recipe.length>=4&&recipe.length<=5);
   for(const name of recipe){assert.ok(byName[name].tier<tier);assert.ok(recipe.filter(n=>n===name).length<=2);}
   assert.ok(recipeStatus(recipe,recipe.map((name,id)=>({name,id,slot:id}))).every(Boolean));
   for(let j=i+1;j<heroes.length;j++){
    const overlap=recipeStatus(recipe,heroes[j].recipe.map((name,id)=>({name,id,slot:id}))).filter(Boolean).length;
    assert.ok(overlap<=Math.min(recipe.length,heroes[j].recipe.length)-2,`${heroes[i].name}/${heroes[j].name} overlap`);
   }
  }
 }
});
test('tier two uses four ingredients each, no more than two of one type, with balanced demand',()=>{
 const counts=Object.fromEntries(basics.map(u=>[u.name,0]));
 for(const hero of units.filter(u=>u.tier===2)){
  assert.equal(hero.recipe.length,4,hero.name);
  const perRecipe={};
  for(const name of hero.recipe){assert.equal(byName[name].tier,1);counts[name]++;perRecipe[name]=(perRecipe[name]??0)+1;}
  assert.ok(Math.max(...Object.values(perRecipe))<=2,hero.name);
 }
 assert.deepEqual(counts,{창병:5,활병:4,수병:5,포수:5,의병:4,기병:5,유생:4});
});
test('every changed recipe recognizes exactly its own materials and requires duplicates',()=>{
 for(const hero of units.filter(u=>u.tier===2)){
  const roster=hero.recipe.map((name,i)=>({name,id:i+1,slot:i}));
  assert.ok(recipeStatus(hero.recipe,roster).every(Boolean));
  assert.equal(recipeStatus(hero.recipe,roster.slice(1)).filter(Boolean).length,3);
  assert.equal(roster.length,4);
 }
});

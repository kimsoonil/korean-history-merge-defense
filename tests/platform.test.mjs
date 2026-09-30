import test from 'node:test';
import assert from 'node:assert/strict';
import {isIosDevice} from '../lib/platform.ts';

test('Apple login visibility recognizes iPhone, iPad and iPadOS desktop mode',()=>{
 assert.equal(isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)','iPhone',5),true);
 assert.equal(isIosDevice('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)','iPad',5),true);
 assert.equal(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)','MacIntel',5),true);
});

test('Apple login stays hidden on desktop and Android devices',()=>{
 assert.equal(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)','MacIntel',0),false);
 assert.equal(isIosDevice('Mozilla/5.0 (Linux; Android 15)','Linux armv8l',5),false);
 assert.equal(isIosDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Win32',0),false);
});

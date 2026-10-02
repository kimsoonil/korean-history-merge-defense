import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('profile settings separates profile and title into tabs without frames',()=>{
 const component=readFileSync(new URL('../app/ProfileSettings.tsx',import.meta.url),'utf8');
 for(const label of ['프로필','칭호'])assert.match(component,new RegExp(`>${label}<`));
 assert.doesNotMatch(component,/>테두리</);
 assert.match(component,/role="tablist"/);
 assert.match(component,/role="tabpanel"/);
 assert.doesNotMatch(component,/type="checkbox"/);
 assert.match(component,/하드 최초 클리어 보상/);
 assert.match(component,/profile-reward-list/);
 assert.doesNotMatch(component,/profile-frame-list|profile-frame-hard/);
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.ok(page.indexOf('className="reward-title player-title"')<page.indexOf('className="player-name"'));
});

test('profile avatar and title lists scroll independently inside the fixed dialog',()=>{
 const css=readFileSync(new URL('../app/profile-settings.css',import.meta.url),'utf8');
 const popupCss=readFileSync(new URL('../app/popup-scroll.css',import.meta.url),'utf8');
 assert.match(css,/\.profile-settings\{[^}]*overflow:hidden/);
 assert.match(css,/\.profile-avatar-scroll\{[^}]*overflow-y:auto/);
 assert.match(css,/\.profile-reward-list\{[^}]*min-height:0[^}]*overflow-y:auto/);
 assert.match(css,/\.profile-reward-list button\{[^}]*flex:none/);
 assert.doesNotMatch(popupCss,/profile-scroll-content/);
});

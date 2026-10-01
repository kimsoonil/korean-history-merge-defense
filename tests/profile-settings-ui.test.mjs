import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('profile settings separates profile, title and frame into tabs',()=>{
 const component=readFileSync(new URL('../app/ProfileSettings.tsx',import.meta.url),'utf8');
 for(const label of ['프로필','칭호','테두리'])assert.match(component,new RegExp(`>${label}<`));
 assert.match(component,/role="tablist"/);
 assert.match(component,/role="tabpanel"/);
});

test('only the profile avatar list owns a vertical scrollbar',()=>{
 const css=readFileSync(new URL('../app/profile-settings.css',import.meta.url),'utf8');
 const popupCss=readFileSync(new URL('../app/popup-scroll.css',import.meta.url),'utf8');
 assert.match(css,/\.profile-settings\{[^}]*overflow:hidden/);
 assert.match(css,/\.profile-avatar-scroll\{[^}]*overflow-y:auto/);
 assert.doesNotMatch(popupCss,/profile-scroll-content/);
});

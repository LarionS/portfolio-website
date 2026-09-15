import test from 'node:test';
import assert from 'node:assert/strict';
import { readChoice, cleanPageURL, classifyLink, startAnalytics } from '../src/analytics.ts';

test('analytics never loads without an explicit unexpired opt-in', () => {
  for (const choice of [null, 'denied']) assert.equal(startAnalytics({}, {}, choice, 'G-TEST123'), false);
  assert.equal(readChoice({getItem:()=>JSON.stringify({choice:'granted',expires:100})},101),null);
  assert.equal(readChoice({getItem:()=>'{broken'}),null);
  assert.equal(readChoice({getItem:()=>{throw new Error('blocked');}}),null);
  assert.equal(readChoice({getItem:()=>JSON.stringify({choice:'granted',expires:200})},100),'granted');
});
test('opt-in loads one tag and disables advertising; local previews never report', () => {
  const win={location:{hostname:'playframe.qd.je',href:'https://playframe.qd.je/templates/?email=private@example.com&utm_source=youtube'}};
  let script; const doc={referrer:'https://example.org/private?q=secret', getElementById:()=>script,createElement:()=>({}),head:{append:node=>script=node}};
  assert.equal(startAnalytics(win,doc,'granted','G-TEST123'),true);
  assert.match(script.src,/id=G-TEST123$/);
  const commands=win.dataLayer.map(args=>Array.from(args));
  assert.equal(commands[0][2].analytics_storage,'denied');
  assert.equal(commands[1][2].analytics_storage,'granted');
  assert.equal(commands[3][2].allow_google_signals,false);
  assert.equal(commands[3][2].page_location,'https://playframe.qd.je/templates/?utm_source=youtube');
  assert.equal(commands[3][2].page_referrer,'https://example.org');
  assert.equal(startAnalytics(win,doc,'granted','G-TEST123'),true);
  assert.equal(win.dataLayer.length,4);
  assert.equal(startAnalytics({location:{hostname:'localhost'}},{},'granted','G-TEST123'),false);
});
test('marketing events distinguish demos and guides and exclude contact links',()=>{
  const base='https://playframe.qd.je/templates/vr-car-template/';
  assert.equal(classifyLink('https://www.fab.com/listings/abc?utm_source=x','Buy',base).event,'fab_click');
  assert.equal(classifyLink('https://drive.google.com/file/d/abc/view','Windows demo',base).event,'demo_click');
  assert.equal(classifyLink('/guides/vr-steering-wheel-unreal/','Read',base).event,'guide_click');
  assert.equal(classifyLink('mailto:private@example.com','Contact',base),null);
  assert.equal(cleanPageURL(base+'?email=secret&utm_source=youtube#private'),base+'?utm_source=youtube');
});

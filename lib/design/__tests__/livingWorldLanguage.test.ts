import { designForWriterActivity, WRITER_WORLD_INTENTS, WORLD_DESIGN_PRINCIPLES } from '../livingWorldLanguage';

describe('One Soullab world, activities have different visual manners',()=>{
 it('has an intentional treatment for all six actual Writer rooms',()=>{
  expect(Object.keys(WRITER_WORLD_INTENTS)).toEqual(['home','write','develop','review','listen','publish']);
  expect(new Set(Object.values(WRITER_WORLD_INTENTS).map(x=>x.intent)).size).toBe(6);
 });
 it('supports specific activities, not a repeated studio skin',()=>{
  expect(designForWriterActivity('home')).toMatchObject({intent:'arrival',priority:'orientation'});
  expect(designForWriterActivity('write')).toMatchObject({intent:'composition',priority:'manuscript'});
  expect(designForWriterActivity('develop')).toMatchObject({intent:'exploration',priority:'one_question'});
  expect(designForWriterActivity('review')).toMatchObject({intent:'discernment',priority:'comparison'});
  expect(designForWriterActivity('listen')).toMatchObject({intent:'resonance',priority:'listening'});
  expect(designForWriterActivity('publish')).toMatchObject({intent:'offering',priority:'release_readiness'});
 });
 it('never reads payment, author words, skill, emotion or atmosphere to derive scene',()=>{
  expect(designForWriterActivity.length).toBe(1);
  for(const code of ['home','write','develop','review','listen','publish'] as const){
   const scene=designForWriterActivity(code);
   expect(Object.keys(scene).sort()).toEqual(['intent','maia','priority','rhythm']);
   expect(Object.values(scene).join('|')).not.toMatch(/free|pro|tier|mood|emotion|astrolog|author_identity/i);
  }
  expect(WORLD_DESIGN_PRINCIPLES).toContain('shared_world_not_matching_rooms');
  expect(WORLD_DESIGN_PRINCIPLES).toContain('reversible_presentation');
 });
});

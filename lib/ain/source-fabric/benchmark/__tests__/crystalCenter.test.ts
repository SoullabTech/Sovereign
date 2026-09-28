import { buildAetherInputFromField } from '../aetherBuilder';
import { generateAetherCandidates } from '../aetherSynthesis';
import {
  ablateCrystalMode,
  buildCrystalCenterField,
  modeInventory,
  validateModeAblations,
  validateNonCollapsingIntegration,
} from '../crystalCenter';

describe('R7 Crystal Center non-collapsing integration', () => {
  const input=buildAetherInputFromField(
    'R7-test',
    ['library-adr','source-fabric-census','source-fabric','facet-crossings','j9-adjudication','j11-reconciliation'],
    'mixed',
  );
  input.absences.push({
    absenceRef:'r7-missing-member-meaning',
    subject:'member-owned final meaning',
    reason:'no_support',
  });

  const candidates=generateAetherCandidates(input);
  const field=buildCrystalCenterField(input,candidates);

  test('holds multiple epistemic modes without collapsing them',()=>{
    const modes=modeInventory(field);
    expect(modes).toEqual([
      'absence','analytic','associative','contradiction','imaginal','temporal','uncertainty',
    ]);
    expect(validateNonCollapsingIntegration(field)).toEqual({valid:true,errors:[]});
  });

  test('contradiction remains contradiction',()=>{
    const contradiction=field.facets.find(f=>f.mode==='contradiction');
    expect(contradiction).toBeDefined();
    expect(contradiction!.standing).toBe('conflicted');
    expect(contradiction!.collapsible).toBe(false);
  });

  test('absence remains absence rather than becoming imagined completion',()=>{
    const absence=field.facets.find(f=>f.mode==='absence');
    expect(absence).toBeDefined();
    expect(absence!.standing).toBe('absent');
    expect(absence!.sourceRefs).toEqual([]);
  });

  test('imaginal synthesis remains provisional and source-bound',()=>{
    const imaginal=field.facets.filter(f=>f.mode==='imaginal');
    expect(imaginal.length).toBeGreaterThan(0);
    for(const facet of imaginal){
      expect(facet.standing).toBe('imaginal_provisional');
      expect(facet.sourceRefs.length).toBeGreaterThanOrEqual(2);
      expect(facet.collapsible).toBe(false);
    }
  });


  test('ablating one mode removes that mode without another register inheriting its standing',()=>{
    expect(validateModeAblations(field)).toEqual({valid:true,errors:[]});
    for(const mode of modeInventory(field)){
      const result=ablateCrystalMode(field,mode);
      expect(result.afterModes).not.toContain(mode);
      expect(result.substitutedByOtherMode).toBe(false);
    }
  });

  test('the center has no whole-person or persistence authority',()=>{
    expect(field.integrationPermissions.allowWholePersonConclusion).toBe(false);
    expect(field.integrationPermissions.allowPersistence).toBe(false);
    expect(field.integrationPermissions.allowModeCollapse).toBe(false);
    expect(field.integrationPermissions.allowImaginalPromotion).toBe(false);
  });
});

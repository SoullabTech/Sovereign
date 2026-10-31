import { typesetManuscriptBody } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';
import {
  mapDisplayOffsetToRaw,
  projectRawBodyToDisplay,
} from '@/app/writers-studio/full-redesign/j7SourceDisplayProjection';

function projectionOf(body: string) {
  return projectRawBodyToDisplay(body, typesetManuscriptBody(body));
}

test.each([
  '',
  'ALPHA',
  'ALPHA\n\n',
  'ALPHA\n\nBETA',
  'ALPHA\r\n\r\nBETA',
  'A\n\nA\n\n',
  '  ALPHA  \n\n\tBETA\t',
])('projection losslessly partitions canonical source: %j', (body) => {
  const projection = projectionOf(body);
  expect(projection.ok).toBe(true);
  const rebuilt = projection.segments
    .map((segment) => projection.normalizedBody.slice(segment.normalizedStart, segment.normalizedEnd))
    .join('');
  expect(rebuilt).toBe(projection.normalizedBody);
  expect(projection.normalizedBoundaryToRaw.at(-1)).toBe(body.length);
});

test('visible block boundaries map back to exact raw offsets', () => {
  const body = 'ALPHA\r\n\r\nBETA';
  const projection = projectionOf(body);
  expect(projection.ok).toBe(true);
  expect(mapDisplayOffsetToRaw(projection, 0, 0)).toBe(0);
  expect(mapDisplayOffsetToRaw(projection, 0, 5)).toBe(5);
  expect(mapDisplayOffsetToRaw(projection, 1, 0)).toBe(9);
  expect(mapDisplayOffsetToRaw(projection, 1, 4)).toBe(body.length);
});

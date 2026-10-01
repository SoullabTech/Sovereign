import { CabinArrivalVisualFixture, type CabinArrivalFixtureState } from './CabinArrivalVisualFixture';
import './cabin-arrival-visual-review.css';

const STATES: CabinArrivalFixtureState[] = ['unavailable', 'empty', 'mounted'];

export default async function CabinArrivalVisualReview({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const state = STATES.includes(params.state as CabinArrivalFixtureState)
    ? (params.state as CabinArrivalFixtureState)
    : 'mounted';

  return <CabinArrivalVisualFixture state={state} />;
}

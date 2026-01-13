import PractitionerOnboardingWizard from "@/components/onboarding/PractitionerOnboardingWizard";

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const step = Number(n || "1");
  return <PractitionerOnboardingWizard initialStep={Number.isFinite(step) ? step : 1} />;
}

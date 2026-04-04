import { Progress } from "../../../../components/ui/progress";

export default function MyProgressBar({
  currentStep,
}: {
  currentStep: number;
}) {
  const totalSteps = 3;
  const progressValue = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto space-y-3 mb-8">
      <div className="flex justify-between items-end px-1">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Configuration
          </p>
          <h2 className="text-sm font-semibold">
            {currentStep === 0 && "Identité"}
            {currentStep === 1 && "Profil détaillé"}
            {currentStep === 2 && "C'est parti !"}
          </h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      <Progress value={progressValue} className="h-2" />
    </div>
  );
}

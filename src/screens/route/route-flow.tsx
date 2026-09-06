import { Badge } from "../../components/common/badge";
import type { RouteFlowStep } from "../../types/route";

interface RouteFlowProps {
  readonly steps: readonly RouteFlowStep[];
}

export function RouteFlow({ steps }: RouteFlowProps) {
  return (
    <nav className="route-flow" aria-label="환전 계획 진행 흐름">
      <ol className="route-flow__list">
        {steps.map((step) => (
          <li className="route-flow__step" key={step.id}>
            <Badge variant={step.tone}>{step.label}</Badge>
            <span>{step.description}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

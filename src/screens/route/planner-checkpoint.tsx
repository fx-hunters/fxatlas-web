import type { CSSProperties, KeyboardEvent } from "react";
import type { PlannerCheckpointData } from "../../types/route";

interface PlannerCheckpointProps {
  readonly checkpoint: PlannerCheckpointData;
  readonly isChanged: boolean;
  readonly isHighlighted: boolean;
  readonly isSelected: boolean;
  readonly isInteractive: boolean;
  readonly highlightedStatusLabel: string;
  readonly onSelect: (checkpointId: string) => void;
}

type PlannerCheckpointStyle = CSSProperties & {
  readonly "--checkpoint-delay": string;
};

const CHECKPOINT_SYMBOLS: Readonly<
  Record<PlannerCheckpointData["status"], string>
> = {
  complete: "✓",
  next: "→",
  upcoming: "·",
  destination: "◆",
};

export function PlannerCheckpoint({
  checkpoint,
  isChanged,
  isHighlighted,
  isSelected,
  isInteractive,
  highlightedStatusLabel,
  onSelect,
}: PlannerCheckpointProps) {
  const statusLabel = isHighlighted
    ? highlightedStatusLabel
    : checkpoint.statusLabel;
  const style: PlannerCheckpointStyle = {
    "--checkpoint-delay": `${checkpoint.appearDelayMs}ms`,
  };
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(checkpoint.id);
    }
  };

  return (
    <g
      className={`planner-checkpoint planner-checkpoint--${checkpoint.status}${isChanged ? " planner-checkpoint--changed" : ""}${isHighlighted ? " planner-checkpoint--highlighted" : ""}${isSelected ? " planner-checkpoint--selected" : ""}`}
      data-checkpoint-id={checkpoint.id}
      data-status={checkpoint.status}
      transform={`translate(${checkpoint.x} ${checkpoint.y})`}
      style={style}
      role={isInteractive ? "button" : "img"}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isSelected : undefined}
      aria-label={`${checkpoint.label}, ${checkpoint.title}, ${checkpoint.detail}, ${checkpoint.amountLabel}, ${statusLabel}`}
      onClick={isInteractive ? () => onSelect(checkpoint.id) : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      <title>{`${checkpoint.title} · ${statusLabel}`}</title>
      <circle className="planner-checkpoint__pulse" r="35" aria-hidden="true" />
      {checkpoint.status === "destination" ? (
        <rect
          className="planner-checkpoint__node"
          x="-21"
          y="-21"
          width="42"
          height="42"
          rx="10"
          aria-hidden="true"
        />
      ) : (
        <circle className="planner-checkpoint__node" r="22" aria-hidden="true" />
      )}
      <text
        className="planner-checkpoint__symbol"
        y="6"
        textAnchor="middle"
        aria-hidden="true"
      >
        {CHECKPOINT_SYMBOLS[checkpoint.status]}
      </text>
      <text className="planner-checkpoint__label" y="-36" textAnchor="middle">
        {checkpoint.label}
      </text>
      <text className="planner-checkpoint__title" y="45" textAnchor="middle">
        {checkpoint.title}
      </text>
      <text className="planner-checkpoint__detail" y="65" textAnchor="middle">
        {checkpoint.detail}
      </text>
      <text className="planner-checkpoint__amount" y="84" textAnchor="middle">
        {checkpoint.amountLabel}
      </text>
      <text className="planner-checkpoint__status" y="103" textAnchor="middle">
        {statusLabel}
      </text>
    </g>
  );
}

interface PlannerCheckpointLayerProps {
  readonly checkpoints: readonly PlannerCheckpointData[];
  readonly changedCheckpointIds: readonly string[];
  readonly highlightedCheckpointId?: string;
  readonly highlightedStatusLabel?: string;
  readonly isMuted?: boolean;
  readonly selectedCheckpointId?: string | null;
  readonly onSelectCheckpoint: (checkpointId: string) => void;
}

export function PlannerCheckpointLayer({
  checkpoints,
  changedCheckpointIds,
  highlightedCheckpointId,
  highlightedStatusLabel,
  isMuted = false,
  selectedCheckpointId = null,
  onSelectCheckpoint,
}: PlannerCheckpointLayerProps) {
  return (
    <g
      className={`planner-curve__nodes${isMuted ? " planner-curve__nodes--muted" : ""}`}
      aria-hidden={isMuted}
    >
      {checkpoints.map((checkpoint) => (
        <PlannerCheckpoint
          checkpoint={checkpoint}
          isChanged={changedCheckpointIds.includes(checkpoint.id)}
          isHighlighted={highlightedCheckpointId === checkpoint.id}
          isSelected={selectedCheckpointId === checkpoint.id}
          isInteractive={!isMuted}
          highlightedStatusLabel={highlightedStatusLabel ?? checkpoint.statusLabel}
          onSelect={onSelectCheckpoint}
          key={checkpoint.id}
        />
      ))}
    </g>
  );
}

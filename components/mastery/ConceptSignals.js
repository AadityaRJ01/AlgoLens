import LearningSignalsList from "@/components/dashboard/LearningSignalsList";

// Thin wrapper reusing the dashboard's existing LearningSignalsList
// (same event shape, same status colors — see getConceptDetail in
// lib/masteryInsights.js for how these events are built) instead of
// duplicating the status-badge/list logic for this concept-scoped view.
export default function ConceptSignals({ events }) {
  return <LearningSignalsList events={events} title="Recent Signals" hideViewAll />;
}

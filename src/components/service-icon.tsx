import { Bot, BrainCircuit, ChartColumn, CodeXml, Cpu, Radar, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  agents: Bot,
  generative: BrainCircuit,
  data: ChartColumn,
  software: CodeXml,
  strategy: Cpu,
  growth: Radar,
};

export function ServiceIcon({ id }: { id: string }) {
  const Icon = icons[id] ?? Bot;
  const opportunity = id === "growth";
  return (
    <Icon
      className={`size-5 ${opportunity ? "text-orange" : "text-cyan"}`}
      aria-hidden="true"
    />
  );
}

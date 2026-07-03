import { GearIcon, StarIcon, UploadIcon } from "@/components/ui/Icons";

type TopNavbarProps = {
  activeTab: "upload" | "analyst";
  onTabChange: (tab: "upload" | "analyst") => void;
};

export function TopNavbar({ activeTab, onTabChange }: TopNavbarProps) {
  const tabs = [
    {
      id: "upload" as const,
      label: "Upload & Preview",
      icon: UploadIcon,
    },
    {
      id: "analyst" as const,
      label: "AI Analyst",
      icon: StarIcon,
    },
  ];

  return (
    <header className="relative flex h-20 items-center justify-center border-b border-violet-100/70 bg-white/55 backdrop-blur-2xl">
      <nav className="flex items-center gap-14">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex h-20 items-center gap-2 text-sm font-medium transition ${
                active ? "text-violet-700" : "text-slate-500 hover:text-violet-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>

              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-violet-600" />
              )}
            </button>
          );
        })}
      </nav>

      <button className="absolute right-7 grid h-11 w-11 place-items-center rounded-2xl border border-violet-100 bg-white/70 text-slate-600 shadow-sm backdrop-blur-xl transition hover:bg-violet-50 hover:text-violet-700">
        <GearIcon className="h-5 w-5" />
      </button>
    </header>
  );
}

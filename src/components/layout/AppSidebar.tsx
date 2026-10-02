import {
  LayoutDashboard,
  Target,
  Building2,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"
import { cn } from "@/lib/utils"

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-md px-3 text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground active:bg-sidebar-accent/80"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}

function NavGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1 text-2xs font-medium tracking-wide text-helper uppercase">
      {children}
    </div>
  )
}

export function AppSidebar() {
  const { language } = useOpportunitiesStore()
  const s = t(language)

  return (
    <aside className="hidden w-52 shrink-0 flex-col border-e border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          O
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight">OSOS</div>
          <div className="truncate text-2xs text-muted-foreground">CRM</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <NavGroupLabel>Main</NavGroupLabel>
        <div className="space-y-0.5">
          <NavItem icon={LayoutDashboard} label={s.navDashboard} />
          <NavItem icon={Target} label={s.appTitle} active />
          <NavItem icon={Building2} label={s.navAccounts} />
          <NavItem icon={Users} label={s.navContacts} />
          <NavItem icon={BarChart3} label={s.navReports} />
        </div>

        <NavGroupLabel>Settings</NavGroupLabel>
        <div className="space-y-0.5">
          <NavItem icon={Settings} label={s.navSettings} />
          <NavItem icon={HelpCircle} label={s.navHelp} />
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-2xs text-helper">
        OSOS UI/UX · E-04 · prototype
      </div>
    </aside>
  )
}

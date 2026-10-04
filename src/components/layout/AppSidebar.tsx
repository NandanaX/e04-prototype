import { useState } from "react"
import {
  LayoutDashboard,
  UserPlus,
  Building2,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"
import { cn } from "@/lib/utils"

function NavItem({
  icon: Icon,
  label,
  active,
  expanded,
  tooltipSide,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  expanded: boolean
  tooltipSide: "left" | "right"
  onClick?: () => void
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={expanded ? undefined : label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-md outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        expanded ? "h-9 w-full px-3 text-sm" : "size-10 w-10 justify-center",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground active:bg-sidebar-accent/80"
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {expanded && <span className="truncate">{label}</span>}
    </button>
  )

  if (expanded) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar() {
  const { language } = useOpportunitiesStore()
  const s = t(language)
  const [expanded, setExpanded] = useState(false)
  // Tooltips (collapsed state only) point toward the main content, whichever
  // physical side that ends up on once the sidebar mirrors for RTL.
  const tooltipSide = language === "ar" ? "left" : "right"
  const ToggleIcon = expanded ? PanelLeftClose : PanelLeftOpen

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-e border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
          expanded ? "w-52 items-stretch" : "w-14 items-center"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border",
            expanded ? "px-4" : "justify-center"
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            O
          </div>
          {expanded && (
            <div className="ms-2 min-w-0">
              <div className="truncate text-sm font-semibold leading-tight">OSOS</div>
              <div className="truncate text-2xs text-muted-foreground">HRMS</div>
            </div>
          )}
        </div>

        <nav
          className={cn(
            "flex flex-1 flex-col gap-1 overflow-y-auto py-3",
            expanded ? "items-stretch px-2" : "items-center"
          )}
        >
          {/* Toggles the rail between icon-only and a labeled sidebar. */}
          <NavItem
            icon={ToggleIcon}
            label={expanded ? s.collapseNav : s.expandNav}
            expanded={expanded}
            tooltipSide={tooltipSide}
            onClick={() => setExpanded((v) => !v)}
          />

          <div
            className={cn("my-1 h-px shrink-0 bg-sidebar-border", expanded ? "w-full" : "w-8")}
            aria-hidden="true"
          />

          <NavItem icon={LayoutDashboard} label={s.navDashboard} expanded={expanded} tooltipSide={tooltipSide} />
          <NavItem icon={UserPlus} label={s.appTitle} active expanded={expanded} tooltipSide={tooltipSide} />
          <NavItem icon={Building2} label={s.navAccounts} expanded={expanded} tooltipSide={tooltipSide} />
          <NavItem icon={Users} label={s.navContacts} expanded={expanded} tooltipSide={tooltipSide} />
          <NavItem icon={BarChart3} label={s.navReports} expanded={expanded} tooltipSide={tooltipSide} />

          <div
            className={cn("my-1 h-px shrink-0 bg-sidebar-border", expanded ? "w-full" : "w-8")}
            aria-hidden="true"
          />

          <NavItem icon={Settings} label={s.navSettings} expanded={expanded} tooltipSide={tooltipSide} />
          <NavItem icon={HelpCircle} label={s.navHelp} expanded={expanded} tooltipSide={tooltipSide} />
        </nav>
      </aside>
    </TooltipProvider>
  )
}

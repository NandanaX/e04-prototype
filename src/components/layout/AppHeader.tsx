import { Bell } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useOpportunitiesStore } from "@/store/opportunities-store"

// Current signed-in user for this prototype session. The avatar is a stable
// placeholder photo from pravatar.cc, seeded by display name only (never the
// account email) — not a real photo of this person.
const CURRENT_USER = {
  name: "Nandana Senarath",
  initials: "NS",
  avatar: "https://i.pravatar.cc/150?u=nandana-senarath-osos",
}

export function AppHeader() {
  const { language } = useOpportunitiesStore()
  const s = t(language)

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <span className="text-sm font-medium text-foreground">{s.appTitle}</span>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={s.notifications}
          className="relative"
        >
          <Bell className="size-4" />
          <span className="absolute inset-e-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
        </Button>
        <Avatar size="sm" title={CURRENT_USER.name}>
          <AvatarImage src={CURRENT_USER.avatar} alt="" />
          <AvatarFallback>{CURRENT_USER.initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

import { useState, useCallback, useEffect } from "react"
import { Layout } from "@/components/layout"
import { Landing } from "@/pages/landing"
import { Dashboard } from "@/pages/dashboard"
import { QuestView } from "@/pages/quest"
import { Profile } from "@/pages/profile"
import { NotFound } from "@/pages/not-found"
import { CreateQuest } from "@/pages/create-quest"

const VALID_PAGES = ["landing", "dashboard", "profile", "create-quest"] as const
type Page = (typeof VALID_PAGES)[number] | "workspace" | "404"

interface AppState {
  page: Page
  questId: number | null
}

function pathToPage(pathname: string): { page: Page; questId: number | null } {
  const clean = pathname === "" || pathname === "/" ? "/" : pathname

  if (clean === "/") return { page: "landing", workspaceId: null }
  if (clean === "/dashboard") return { page: "dashboard", workspaceId: null }
  if (clean === "/profile") return { page: "profile", workspaceId: null }
  if (clean === "/create-quest") return { page: "create-quest", workspaceId: null }

  const qMatch = clean.match(/^\/quest\/(\d+)$/)
  if (qMatch) return { page: "quest", questId: Number(qMatch[1]) }

  return { page: "404", questId: null }
}

function pageToPath(page: Page, questId: number | null): string {
  if (page === "landing") return "/"
  if (page === "quest" && questId !== null) return `/quest/${questId}`
  return `/${page}`
}

export default function App() {
  const [state, setState] = useState<AppState>(() => pathToPage(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => {
      setState(pathToPage(window.location.pathname))
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const navigate = useCallback((p: string) => {
    const page = (VALID_PAGES as readonly string[]).includes(p) ? (p as Page) : "404"
    const path = pageToPath(page, null)
    window.history.pushState({}, "", path)
    setState({ page, questId: null })
  }, [])

  const onSelectQuest = useCallback((id: number) => {
    const path = pageToPath("quest", id)
    window.history.pushState({}, "", path)
    setState({ page: "quest", questId: id })
  }, [])

  const renderPage = () => {
    if (state.page === "workspace" && state.workspaceId !== null) {
      return (
        <WorkspaceView
          workspaceId={state.workspaceId}
          onBack={() => handleNavigate("dashboard")}
        />
      )
    }
    switch (state.page) {
      case "landing":
        return <Landing onNavigate={handleNavigate} />
      case "dashboard":
        return (
          <Dashboard
            onSelectWorkspace={handleSelectWorkspace}
            onCreateQuest={() => handleNavigate("create-quest")}
          />
        )
      case "create-quest":
        return (
          <CreateQuest
            onBack={() => handleNavigate("dashboard")}
          />
        )
      case "profile":
        return <Profile />
      default:
        return <NotFound onNavigate={handleNavigate} />
    }
  }

  return (
    <Layout onNavigate={navigate} activePage={state.page === "quest" ? "dashboard" : state.page}>
      {state.page === "quest" && state.questId !== null ? (
        <QuestView questId={state.questId} onBack={() => navigate("dashboard")} />
      ) : state.page === "landing" ? (
        <Landing onNavigate={navigate} />
      ) : state.page === "dashboard" ? (
        <Dashboard onSelectQuest={onSelectQuest} />
      ) : state.page === "profile" ? (
        <Profile />
      ) : (
        <NotFound onNavigate={navigate} />
      )}
    </Layout>
  )
}

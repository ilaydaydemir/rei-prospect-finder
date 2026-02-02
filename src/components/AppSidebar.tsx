import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  Landmark,
  Briefcase,
  Menu,
  Search,
  Target,
  History,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "ICP Search", url: "/search", icon: Target },
  { title: "Prospects", url: "/prospects", icon: Users },
  { title: "Run History", url: "/runs", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

const icpItems = [
  { title: "Wholesalers", url: "/icp/wholesaler", icon: Briefcase },
  { title: "Flippers", url: "/icp/flipper", icon: Home },
  { title: "Buy & Hold", url: "/icp/buy_hold", icon: Building2 },
  { title: "Agents", url: "/icp/agent", icon: Users },
  { title: "Institutional", url: "/icp/institutional", icon: Landmark },
];

export function AppSidebar() {
  const { toggleSidebar, state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {!collapsed && (
            <span className="font-semibold text-lg">REI Prospects</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            {!collapsed && "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ICP Types Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-blue-500" />
            {!collapsed && "ICP Types"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {icpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            REI Prospect Finder v1.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

import { createHashRouter, createRoutesFromElements, Outlet, Route } from "react-router-dom";
import { Initial } from "./new-playlist";
import { SplashLoading } from "./splash-loading/SplashLoading";
import { MenuBar } from "@/components/menubar/MenuBar";
import { HomeDashboard } from "./home/HomeDashboard";
import { Dashboard } from "./dashboard/Dashboard";
import { LiveDashboard } from "./live/LiveDashboard";

export const router = createHashRouter(
  createRoutesFromElements(
    <>
      <Route path="/" Component={SplashLoading} />
      <Route path="/initial" Component={Initial} />
      <Route path="/dashboard" element={
        <div style={{ maxWidth: '100vw'}} className="flex">
          <MenuBar />
          <Outlet />
        </div>
        }
      >
        <Route path="/dashboard/home/:playlistName" Component={HomeDashboard} />
        <Route path="/dashboard/explore" Component={Dashboard} />
        <Route path="/dashboard/live" Component={LiveDashboard} />
      </Route>
    </>

  )
  );
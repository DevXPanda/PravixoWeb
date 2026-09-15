import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/admin-layout";
import { AdminLogin } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { UsersPage } from "./pages/users";
import { ConversationsPage } from "./pages/conversations";
import { MessagesPage } from "./pages/messages";
import { TasksPage } from "./pages/tasks";
import { PaymentsPage } from "./pages/payments";
import { SubscriptionsPage } from "./pages/subscriptions";
import { SettingsPage } from "./pages/settings";
import CreatorRequests from "@/pages/CreatorRequests";
import BrandRequests from "@/pages/BrandRequests";
import ClientReviewsPage from "./pages/client-reviews";
import BlogsPage from "./pages/blogs";
import ProTipsPage from "./pages/protips";
import { CampaignsPage } from "./pages/campaigns";
import { BookingsPage } from "./pages/bookings";
import { NotificationsPage } from "./pages/notifications";
import { OffersPage } from "./pages/offers";
import { ReferralsPage } from "./pages/referrals";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLogin />,
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/campaigns",
        element: <CampaignsPage />,
      },
      {
        path: "/bookings",
        element: <BookingsPage />,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/conversations",
        element: <ConversationsPage />,
      },
      {
        path: "/tasks",
        element: <TasksPage />,
      },
      {
        path: "/payments",
        element: <PaymentsPage />,
      },
      {
        path: "/subscriptions",
        element: <SubscriptionsPage />,
      },
      {
        path: "/messages/:id",
        element: <MessagesPage />,
      },
      {
        path: "/client-reviews",
        element: <ClientReviewsPage />,
      },
      {
        path: "/blogs",
        element: <BlogsPage />,
      },
      {
        path: "/protips",
        element: <ProTipsPage />,
      },
      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      {
        path: "/offers",
        element: <OffersPage />,
      },
      {
        path: "/referrals",
        element: <ReferralsPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/verification-requests/creators",
        element: <CreatorRequests />,
      },
      {
        path: "/verification-requests/brands",
        element: <BrandRequests />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

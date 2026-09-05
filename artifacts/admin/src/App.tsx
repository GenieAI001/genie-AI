import { Route, Switch } from "wouter";
import { useAuth } from "@/lib/auth";
import Login from "@/pages/Login";
import Scholarships from "@/pages/Scholarships";
import ScholarshipForm from "@/pages/ScholarshipForm";
import Settings from "@/pages/Settings";

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Scholarships} />
      <Route path="/scholarships/new" component={ScholarshipForm} />
      <Route path="/scholarships/:id/edit" component={ScholarshipForm} />
      <Route path="/settings" component={Settings} />
      <Route>
        <Scholarships />
      </Route>
    </Switch>
  );
}

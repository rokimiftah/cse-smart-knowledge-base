import { AnimatePresence } from "motion/react";
import { Route, Switch } from "wouter";

import { LandingPage } from "@pages/landing";
import { PageTransition } from "@shared/components";

import "./styles/global.css";

export const App = () => {
  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
    >
      <PageTransition>
        <Switch>
          <Route path="/" component={LandingPage} />
        </Switch>
      </PageTransition>
    </AnimatePresence>
  );
};

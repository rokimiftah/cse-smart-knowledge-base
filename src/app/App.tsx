import { AnimatePresence } from "motion/react";
import { Route, Switch } from "wouter";

import { SearchPage } from "@pages/search";
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
          <Route path="/" component={SearchPage} />
        </Switch>
      </PageTransition>
    </AnimatePresence>
  );
};

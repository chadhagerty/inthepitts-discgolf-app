import { Suspense } from "react";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <StatsClient />
    </Suspense>
  );
}

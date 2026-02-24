import { Suspense } from "react";
import CheckInClient from "./CheckInClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Loading check-in…</p>}>
      <CheckInClient />
    </Suspense>
  );
}

import { Suspense } from "react";
import BagClient from "./BagClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading bag…</div>}>
      <BagClient />
    </Suspense>
  );
}

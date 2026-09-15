import PeriodicTableApp from '../src/ui/PeriodicTableApp.jsx';
import { loadElementData } from '../src/lib/supabase.mjs';

export default async function Home() {
  const data = await loadElementData();

  return <PeriodicTableApp initialData={data} />;
}


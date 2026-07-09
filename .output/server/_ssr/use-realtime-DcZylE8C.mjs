import { r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CScATcR5.mjs";
function useRealtime(tables, onChange) {
  reactExports.useEffect(() => {
    const channel = supabase.channel(`rt-${tables.join("-")}-${Math.random().toString(36).slice(2, 8)}`);
    tables.forEach((t) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: t },
        () => onChange()
      );
    });
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables.join(",")]);
}
export {
  useRealtime as u
};

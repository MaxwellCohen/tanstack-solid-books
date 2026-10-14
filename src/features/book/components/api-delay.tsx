import { useNavigate, useSearch } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Range } from "@/components/ui/range";
import { API_DELAY_VALUES, formatApiDelay, getApiDelayMs } from "@/lib/url-state";

export function ApiDelay(props: { idPrefix: string }) {
  const search = useSearch({ from: "__root__" });
  const navigate = useNavigate();
  const [draft, setDraft] = createSignal<number>();
  const committed = () => getApiDelayMs(search());
  const value = () => draft() ?? committed();

  return (
    <Range
      hint={
        <>
          <span>Off</span>
          <span>3s</span>
        </>
      }
      id={`${props.idPrefix}-api-delay`}
      label="API delay"
      onCommit={(next) => {
        setDraft(undefined);
        void navigate({
          to: ".",
          search: (prev) => {
            const updated = { ...prev };
            if (next === 0) delete updated.delay;
            else updated.delay = String(next);
            return updated;
          },
          replace: true,
          resetScroll: false,
        });
      }}
      onValueChange={setDraft}
      readout={formatApiDelay(value())}
      value={value()}
      values={API_DELAY_VALUES}
    />
  );
}

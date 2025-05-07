import { useEffect, useMemo } from "react";
import { useSetAtom } from "jotai";
import { atom } from "jotai";
import debounce from "lodash.debounce";
import { useForm } from "react-hook-form";
import { REDO, UNDO, withHistory } from "jotai-history";
import { useAtom } from "jotai";

const INITIAL_VALUES = {
  a: "",
  b: "",
  c: {
    a: "",
    b: "",
  },
};

function App() {
  const { register, watch, getValues, reset } = useForm({
    defaultValues: INITIAL_VALUES,
  });

  // primitive atom to hold the formstate
  const baseAtom = useMemo(() => atom(getValues()), [getValues]);
  // derived atom to pass through the formstate to RHF
  const formValuesAtom = useMemo(
    () =>
      atom(
        (get) => get(baseAtom),
        (_get, _set, values: typeof INITIAL_VALUES) => {
          console.log("Update RHF", values);
          reset(values);
        },
      ),
    [reset, baseAtom],
  );
  const historyAtom = useMemo(
    () => withHistory(formValuesAtom, 20),
    [formValuesAtom],
  );
  baseAtom.debugLabel = "baseAtom";
  formValuesAtom.debugLabel = "formValuesAtom";

  const setBase = useSetAtom(baseAtom);
  const setFormValues = useSetAtom(formValuesAtom);
  const [history, dispatch] = useAtom(historyAtom);
  console.log("history", history);
  useEffect(() => {
    // debounce to because RHF calls for each field when bulk update
    // should we move this to atom instead?
    const debouncedSetBase = debounce(setBase, 50);
    const subscription = watch((_, { values, type, name }) => {
      console.log("Update baseAtom", values, type, name);
      if (values) debouncedSetBase(values as typeof INITIAL_VALUES);
    });
    return () => {
      subscription.unsubscribe();
      debouncedSetBase.cancel();
    };
  }, [watch, setBase]);

  return (
    <>
      <div className="w-fit mx-auto my-4">
        <button
          type="button"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
          onClick={() => {
            setFormValues({
              a: "test",
              b: "test",
              c: { a: "test", b: "test" },
            });
          }}
        >
          Set Form Values to 'test'
        </button>
      </div>
      <form className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-gray-700">Form Example</h2>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium block mb-1">Field A</span>
          <input
            {...register("a")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium block mb-1">Field B</span>
          <input
            {...register("b")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <fieldset className="border border-gray-300 rounded-md p-4 mb-4">
          <legend className="text-gray-700 font-medium px-2">Field C</legend>
          <label className="block mb-3">
            <span className="text-gray-700 block mb-1">Field C - A</span>
            <input
              {...register("c.a")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 block mb-1">Field C B</span>
            <input
              {...register("c.b")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </fieldset>
        <div className="flex justify-between gap-2">
          <button
            type="button"
            className="grow bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            disabled={!history.canUndo}
            onClick={() => dispatch(UNDO)}
          >
            undo
          </button>
          <button
            type="button"
            className="grow bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            disabled={!history.canRedo}
            onClick={() => dispatch(REDO)}
          >
            redo
          </button>
        </div>
      </form>
    </>
  );
}

export default App;

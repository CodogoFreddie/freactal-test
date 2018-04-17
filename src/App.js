import React, { Fragment } from "react";
import { provideState, injectState } from "freactal";
import isequal from "lodash.isequal";

const getTodoData = id => {
  fetch(`https://www.example.com/get-todo/${id}`);

  return new Promise(done => {
    setTimeout(done, 500 + Math.random() * 1000, {
      done: id === 2,
      text: `this is the text for todo ${id}`,
    });
  });
};

const enhanceTodo = x =>
  provideState({
    initialState: () => ({
      text: "",
      done: false,
      loading: true,
    }),

    effects: {
      initialize: (effects, { id }) =>
        getTodoData(id).then(({ text, done }) => () => ({
          id,
          loading: false,
          text,
          done,
        })),

      toggleDone: () => ({ done, ...rest }) => ({
        ...rest,

        done: !done,
      }),

      setText: (effects, text) => state => ({
        ...state,
        text,
      }),
    },

    middleware: [
      freactalCxt => ({
        ...freactalCxt,

        effects: Object.keys(freactalCxt.effects).reduce(
          (effects, effectName) => ({
            ...effects,

            [effectName]: (...args) => {
              const before = freactalCxt.state;

              return freactalCxt.effects[effectName](...args).then(change => {
                const after = {
                  ...before,
                  ...change,
                };

                if (!isequal(before, after)) {
                  console.log(`update API for todo ${after.id} `, after);
                }

                return change;
              });
            },
          }),
          {},
        ),
      }),
    ],
  })(injectState(x));

const Todo = enhanceTodo(
  ({ state: { loading, done, text }, effects: { toggleDone, setText } }) => (
    <div
      style={{
        margin: "1em",
        backgroundColor: done ? "coral" : "lightgrey",
      }}
    >
      {loading ? (
        "loading..."
      ) : (
        <Fragment>
          <div onClick={toggleDone}>{done ? "done" : "not done"}</div>
          <input onChange={e => setText(e.target.value)} value={text} />
        </Fragment>
      )}
    </div>
  ),
);

const App = () => (
  <div style={{ backgroundColor: "red", padding: "1em" }}>
    <Todo id={1} />
    <Todo id={2} />
    <Todo id={3} />
  </div>
);

export default App;

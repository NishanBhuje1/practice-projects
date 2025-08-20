import { useState } from "react";
import { useEffect } from "react";
import { getAllTodos } from "./actions/toDo.js";

function App() {
  const [todos, setTodos] = useState([]);
  console.log(-1);
  useEffect(() => {
    console.log(0);
    (async () => {
      const data = await getAllTodos();
      setTodos(data.data);
    })();
  });
  return (
    <>
      <h1>TO DO React App</h1>
      {todos?.map((todo) => (
        <div
          style={{
            textDecoration: todo.isCompleted ? "line-through" : "normal",
          }}
          key={todo.id}
        >
          {todo.title} {todo.isCompleted ? "✅" : ""}
        </div>
      ))}
    </>
  );
}

export default App;

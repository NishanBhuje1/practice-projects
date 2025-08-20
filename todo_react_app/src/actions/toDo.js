const API_URL = "https://todo-backend-seven-nu.vercel.app/v1";

export async function getAllTodos() {
  console.log(1);
  const response = await fetch(`${API_URL}/todos`, {
    method: "GET",
  });
  console.log(response);
  const data = await response.json();
  return data;
}
